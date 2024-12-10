// Mock user data
const users = {
    user1: { balance: 1000 },
    user2: { balance: 500 },
    user3: { balance: 1500 }
  };
  // Withdrawal queue
  const withdrawalQueue = [
    { user: 'user1', amount: 800 },
    { user: 'user2', amount: 300 },
    { user: 'user3', amount: 900 }
  ];
  // Liquidity parameters
  let totalLiquidity = 5000; // Mock total available liquidity
  const baseInterestRate = 0.05; // 5% baseline interest rate
  let currentInterestRate = baseInterestRate;
  // Dynamic Liquidity Management Logic
  function adjustInterestRates(totalLiquidity, withdrawalDemand, baseInterestRate) {
    const demandRatio = withdrawalDemand / totalLiquidity;
    let adjustedRate = baseInterestRate * (1 + demandRatio);
    adjustedRate = Math.min(Math.max(adjustedRate, 0.02), 0.15); // Clamp within bounds
    return adjustedRate;
  }
  // Proportional Withdrawal Logic
  function processProportionalWithdrawals(totalAvailable) {
    const totalRequested = withdrawalQueue.reduce((acc, req) => acc + req.amount, 0);
    const proportion = totalAvailable / totalRequested;
    const processedWithdrawals = withdrawalQueue.map(req => {
      const payout = req.amount * proportion;
      if (users[req.user].balance >= payout) {
        users[req.user].balance -= payout;
      } else {
        throw new Error(`Insufficient balance for user ${req.user}`);
      }
      return { user: req.user, amount: payout };
    });
    withdrawalQueue.length = 0; // Clear the queue
    return processedWithdrawals;
  }
  // Queue-Based Withdrawal Logic
  function processQueueWithdrawals(totalAvailable) {
    const processedWithdrawals = [];
    while (withdrawalQueue.length > 0 && totalAvailable > 0) {
      const req = withdrawalQueue.shift();
      const payout = Math.min(req.amount, totalAvailable);
      if (users[req.user].balance >= payout) {
        users[req.user].balance -= payout;
        processedWithdrawals.push({ user: req.user, amount: payout });
        totalAvailable -= payout;
      } else {
        throw new Error(`Insufficient balance for user ${req.user}`);
      }
    }
    return processedWithdrawals;
  }
  // Integrating Dynamic Liquidity Management
  function processWithdrawalsWithDynamicLiquidity(totalAvailable) {
    const totalRequested = withdrawalQueue.reduce((acc, req) => acc + req.amount, 0);
    // Adjust interest rates dynamically
    currentInterestRate = adjustInterestRates(totalLiquidity, totalRequested, baseInterestRate);
    console.log(`Adjusted Interest Rate: ${(currentInterestRate * 100).toFixed(2)}%`);
    // Process withdrawals (choose one strategy)
    const processedWithdrawals = processProportionalWithdrawals(totalAvailable);
    // OR
    // const processedWithdrawals = processQueueWithdrawals(totalAvailable);
    // Update total liquidity after withdrawals
    totalLiquidity -= processedWithdrawals.reduce((acc, withdrawal) => acc + withdrawal.amount, 0);
    return processedWithdrawals;
  }
  // Example Usage
  try {
    console.log('Initial Total Liquidity:', totalLiquidity);
    const processedWithdrawals = processWithdrawalsWithDynamicLiquidity(2000); // Pass available liquidity
    console.log('Processed Withdrawals:', processedWithdrawals);
    console.log('Updated Total Liquidity:', totalLiquidity);
  } catch (error) {
    console.error('Error:', error.message);
  }
  module.exports = {
    processProportionalWithdrawals,
    processQueueWithdrawals,
    processWithdrawalsWithDynamicLiquidity, // Export the integrated function
    adjustInterestRates,
    users,
    withdrawalQueue
  };