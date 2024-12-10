#include <stdint.h>
#include "hookapi.h"

/**
 * This is the main hook function. It executes automatically whenever the conditions
 * specified by the hook are met (e.g., on certain transactions). The 'reserved' parameter
 * is currently not used, but is part of the required signature.
 */
int64_t hook(uint32_t reserved) {
    // Variables to store on-ledger state values
    uint64_t totalLiquidity;
    uint64_t withdrawalDemand;

    // Fetch total liquidity from the ledger state
    // The state_foreign function reads a value associated with a certain key.
    // If it returns <0, it means fetching failed, so we roll back.
    if (state_foreign(&totalLiquidity, sizeof(totalLiquidity),
                      SBUF("System:TotalLiquidity"), SBUF("self")) < 0) {
        rollback(SBUF("Failed to fetch total liquidity"), __LINE__);
    }

    // Fetch total withdrawal request from the ledger state
    if (state_foreign(&withdrawalDemand, sizeof(withdrawalDemand),
                      SBUF("Queue:TotalRequest"), SBUF("self")) < 0) {
        rollback(SBUF("Failed to fetch withdrawal demand"), __LINE__);
    }

    // If no liquidity or no demand, rollback - no action needed
    if (totalLiquidity == 0 || withdrawalDemand == 0) {
        rollback(SBUF("No liquidity or withdrawal demand available"), __LINE__);
    }

    // Calculate the ratio of withdrawal demand to total liquidity
    double demandRatio = (double)withdrawalDemand / (double)totalLiquidity;

    // Set a base interest rate and adjust based on demand
    double baseInterestRate = 0.05; // 5%
    double adjustedRate = baseInterestRate * (1.0 + demandRatio);

    // Ensure the adjusted rate is within given bounds (2% to 15%)
    if (adjustedRate > 0.15) adjustedRate = 0.15;
    if (adjustedRate < 0.02) adjustedRate = 0.02;

    // Save the adjusted interest rate back to the ledger state
    if (state_set(&adjustedRate, sizeof(adjustedRate), SBUF("System:InterestRate")) < 0) {
        rollback(SBUF("Failed to set adjusted interest rate"), __LINE__);
    }

    // Count how many withdrawal requests are in the queue
    // This is a hypothetical function (not standard Hooks API),
    // You need to implement such logic or adapt to how Hooks actually stores queues.
    uint32_t queueCount = state_foreign_count(SBUF("Queue"));
    if (queueCount == 0) {
        rollback(SBUF("No withdrawal requests in the queue"), __LINE__);
    }

    // Iterate through each request and process it proportionally
    for (uint32_t i = 0; i < queueCount; i++) {
        uint64_t userRequest;
        // Fetch user’s requested amount
        if (state_foreign(&userRequest, sizeof(userRequest),
                          SBUF("Queue:Request"), i) < 0) {
            rollback(SBUF("Failed to fetch user request from queue"), __LINE__);
        }

        // Calculate what proportion of totalLiquidity the user gets
        uint64_t userProportion = (userRequest * totalLiquidity) / withdrawalDemand;

        uint64_t userBalance;
        // Fetch user’s current balance
        if (state_foreign(&userBalance, sizeof(userBalance),
                          SBUF("User:Balance"), i) < 0) {
            rollback(SBUF("Failed to fetch user balance"), __LINE__);
        }

        // If the user has enough balance, deduct their proportion
        if (userBalance >= userProportion) {
            uint64_t updatedBalance = userBalance - userProportion;
            if (state_set(&updatedBalance, sizeof(updatedBalance),
                          SBUF("User:Balance"), i) < 0) {
                rollback(SBUF("Failed to update user balance"), __LINE__);
            }
        } else {
            // Not enough balance to fulfill this request
            rollback(SBUF("Insufficient balance for user"), __LINE__);
        }
    }

    // Clear the withdrawal queue after processing
    if (state_set(NULL, 0, SBUF("Queue")) < 0) {
        rollback(SBUF("Failed to clear withdrawal queue"), __LINE__);
    }

    return 0; // Indicate success
}
