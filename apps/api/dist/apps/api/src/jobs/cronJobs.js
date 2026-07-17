"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startExpireLoansJob = startExpireLoansJob;
exports.startExpireGroupBuysJob = startExpireGroupBuysJob;
exports.startRecalcFlashDemandJob = startRecalcFlashDemandJob;
exports.startAllCronJobs = startAllCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const StockLoan_1 = require("../models/StockLoan");
const GroupBuyDeal_1 = require("../models/GroupBuyDeal");
const Notification_1 = require("../models/Notification");
const Shop_1 = require("../models/Shop");
const User_1 = require("../models/User");
const sockets_1 = require("../sockets");
const logger_1 = require("../utils/logger");
/**
 * Runs daily at 00:01 — marks overdue stock loans and fires notifications.
 */
function startExpireLoansJob() {
    node_cron_1.default.schedule('1 0 * * *', async () => {
        logger_1.logger.info('CRON: Checking overdue stock loans...');
        try {
            const now = new Date();
            const overdueLoans = await StockLoan_1.StockLoan.find({
                returnStatus: 'pending',
                agreedReturnDate: { $lt: now },
            }).populate('borrowingShopId', 'ownerId name').lean();
            for (const loan of overdueLoans) {
                await StockLoan_1.StockLoan.findByIdAndUpdate(loan._id, { returnStatus: 'overdue' });
                const borrowingShop = loan.borrowingShopId;
                const lendingShop = await Shop_1.Shop.findById(loan.lendingShopId).lean();
                const lendingOwner = lendingShop
                    ? await User_1.User.findById(lendingShop.ownerId).lean()
                    : null;
                // Notify lending shop owner
                if (lendingOwner) {
                    await Notification_1.Notification.create({
                        userId: lendingOwner._id,
                        type: 'loan_overdue',
                        title: '⚠️ Stock Loan Overdue',
                        body: `${borrowingShop.name} has not returned the borrowed stock yet. Agreed return date was ${loan.agreedReturnDate.toLocaleDateString()}.`,
                    });
                    (0, sockets_1.getIO)()
                        .to(`user:${lendingOwner._id.toString()}`)
                        .emit('loan:overdue', {
                        loanId: loan._id.toString(),
                        borrowingShopName: borrowingShop.name,
                    });
                }
                // Also notify borrowing shop
                await Notification_1.Notification.create({
                    userId: borrowingShop.ownerId.toString(),
                    type: 'loan_overdue',
                    title: '⚠️ Stock Loan Overdue',
                    body: `Your stock loan is overdue. Please return the borrowed items to ${lendingShop?.name ?? 'the lending shop'} immediately.`,
                });
                (0, sockets_1.getIO)()
                    .to(`user:${borrowingShop.ownerId.toString()}`)
                    .emit('loan:overdue', { loanId: loan._id.toString() });
            }
            logger_1.logger.info(`CRON: Marked ${overdueLoans.length} loans as overdue.`);
        }
        catch (err) {
            logger_1.logger.error('CRON: Error in expireLoans job', err);
        }
    });
    logger_1.logger.info('CRON: expireLoans job scheduled (daily at 00:01)');
}
/**
 * Runs every 5 minutes — expires group buys that have passed their deadline.
 */
function startExpireGroupBuysJob() {
    node_cron_1.default.schedule('*/5 * * * *', async () => {
        try {
            const expiredDeals = await GroupBuyDeal_1.GroupBuyDeal.find({
                status: 'active',
                expiresAt: { $lt: new Date() },
            }).populate('productId', 'name').lean();
            for (const deal of expiredDeals) {
                await GroupBuyDeal_1.GroupBuyDeal.findByIdAndUpdate(deal._id, { status: 'failed' });
                // Notify all participants
                for (const participant of deal.participants) {
                    const product = deal.productId;
                    await Notification_1.Notification.create({
                        userId: participant.customerId,
                        type: 'group_buy_failed',
                        title: 'Group Buy Did Not Succeed',
                        body: `The group buy for "${product.name}" did not reach its target. No charges were made.`,
                    });
                    (0, sockets_1.getIO)()
                        .to(`user:${participant.customerId.toString()}`)
                        .emit('groupbuy:progress', {
                        dealId: deal._id.toString(),
                        currentQty: deal.currentQty,
                        targetQty: deal.targetQty,
                        status: 'failed',
                    });
                }
            }
            if (expiredDeals.length > 0) {
                logger_1.logger.info(`CRON: Expired ${expiredDeals.length} group buy deals.`);
            }
        }
        catch (err) {
            logger_1.logger.error('CRON: Error in expireGroupBuys job', err);
        }
    });
    logger_1.logger.info('CRON: expireGroupBuys job scheduled (every 5 min)');
}
/**
 * Runs every 10 minutes — clears the in-memory flash demand counter
 * for categories where the window has expired (cleanup).
 */
function startRecalcFlashDemandJob() {
    node_cron_1.default.schedule('*/10 * * * *', () => {
        try {
            const { demandCounters } = require('../models/FlashDemandEvent');
            const now = Date.now();
            const WINDOW_MS = 10 * 60 * 1000;
            let cleared = 0;
            for (const [key, entry] of demandCounters.entries()) {
                if (now - entry.windowStart > WINDOW_MS) {
                    demandCounters.delete(key);
                    cleared++;
                }
            }
            if (cleared > 0)
                logger_1.logger.debug(`CRON: Cleared ${cleared} expired demand counter(s).`);
        }
        catch (err) {
            logger_1.logger.error('CRON: Error in recalcFlashDemand job', err);
        }
    });
    logger_1.logger.info('CRON: recalcFlashDemand job scheduled (every 10 min)');
}
function startAllCronJobs() {
    startExpireLoansJob();
    startExpireGroupBuysJob();
    startRecalcFlashDemandJob();
}
//# sourceMappingURL=cronJobs.js.map