import cron from 'node-cron';
import { StockLoan } from '../models/StockLoan';
import { GroupBuyDeal } from '../models/GroupBuyDeal';
import { Notification } from '../models/Notification';
import { Shop } from '../models/Shop';
import { User } from '../models/User';
import { getIO } from '../sockets';
import { logger } from '../utils/logger';

/**
 * Runs daily at 00:01 — marks overdue stock loans and fires notifications.
 */
export function startExpireLoansJob(): void {
  cron.schedule('1 0 * * *', async () => {
    logger.info('CRON: Checking overdue stock loans...');
    try {
      const now = new Date();
      const overdueLoans = await StockLoan.find({
        returnStatus: 'pending',
        agreedReturnDate: { $lt: now },
      }).populate('borrowingShopId', 'ownerId name').lean();

      for (const loan of overdueLoans) {
        await StockLoan.findByIdAndUpdate(loan._id, { returnStatus: 'overdue' });

        const borrowingShop = loan.borrowingShopId as unknown as { ownerId: string; name: string };
        const lendingShop = await Shop.findById(loan.lendingShopId).lean();
        const lendingOwner = lendingShop
          ? await User.findById(lendingShop.ownerId).lean()
          : null;

        // Notify lending shop owner
        if (lendingOwner) {
          await Notification.create({
            userId: lendingOwner._id,
            type: 'loan_overdue',
            title: '⚠️ Stock Loan Overdue',
            body: `${borrowingShop.name} has not returned the borrowed stock yet. Agreed return date was ${loan.agreedReturnDate.toLocaleDateString()}.`,
          });

          getIO()
            .to(`user:${lendingOwner._id.toString()}`)
            .emit('loan:overdue', {
              loanId: loan._id.toString(),
              borrowingShopName: borrowingShop.name,
            });
        }

        // Also notify borrowing shop
        await Notification.create({
          userId: borrowingShop.ownerId.toString(),
          type: 'loan_overdue',
          title: '⚠️ Stock Loan Overdue',
          body: `Your stock loan is overdue. Please return the borrowed items to ${lendingShop?.name ?? 'the lending shop'} immediately.`,
        });

        getIO()
          .to(`user:${borrowingShop.ownerId.toString()}`)
          .emit('loan:overdue', { loanId: loan._id.toString() });
      }

      logger.info(`CRON: Marked ${overdueLoans.length} loans as overdue.`);
    } catch (err) {
      logger.error('CRON: Error in expireLoans job', err);
    }
  });
  logger.info('CRON: expireLoans job scheduled (daily at 00:01)');
}

/**
 * Runs every 5 minutes — expires group buys that have passed their deadline.
 */
export function startExpireGroupBuysJob(): void {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const expiredDeals = await GroupBuyDeal.find({
        status: 'active',
        expiresAt: { $lt: new Date() },
      }).populate('productId', 'name').lean();

      for (const deal of expiredDeals) {
        await GroupBuyDeal.findByIdAndUpdate(deal._id, { status: 'failed' });

        // Notify all participants
        for (const participant of deal.participants) {
          const product = deal.productId as unknown as { name: string };
          await Notification.create({
            userId: participant.customerId,
            type: 'group_buy_failed',
            title: 'Group Buy Did Not Succeed',
            body: `The group buy for "${product.name}" did not reach its target. No charges were made.`,
          });

          getIO()
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
        logger.info(`CRON: Expired ${expiredDeals.length} group buy deals.`);
      }
    } catch (err) {
      logger.error('CRON: Error in expireGroupBuys job', err);
    }
  });
  logger.info('CRON: expireGroupBuys job scheduled (every 5 min)');
}

/**
 * Runs every 10 minutes — clears the in-memory flash demand counter
 * for categories where the window has expired (cleanup).
 */
export function startRecalcFlashDemandJob(): void {
  cron.schedule('*/10 * * * *', () => {
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
      if (cleared > 0) logger.debug(`CRON: Cleared ${cleared} expired demand counter(s).`);
    } catch (err) {
      logger.error('CRON: Error in recalcFlashDemand job', err);
    }
  });
  logger.info('CRON: recalcFlashDemand job scheduled (every 10 min)');
}

export function startAllCronJobs(): void {
  startExpireLoansJob();
  startExpireGroupBuysJob();
  startRecalcFlashDemandJob();
}
