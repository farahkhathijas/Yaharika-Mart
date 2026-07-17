/**
 * Runs daily at 00:01 — marks overdue stock loans and fires notifications.
 */
export declare function startExpireLoansJob(): void;
/**
 * Runs every 5 minutes — expires group buys that have passed their deadline.
 */
export declare function startExpireGroupBuysJob(): void;
/**
 * Runs every 10 minutes — clears the in-memory flash demand counter
 * for categories where the window has expired (cleanup).
 */
export declare function startRecalcFlashDemandJob(): void;
export declare function startAllCronJobs(): void;
//# sourceMappingURL=cronJobs.d.ts.map