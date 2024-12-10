//evaluation.js
const {
  processProportionalWithdrawals,
  processQueueWithdrawals,
  processWithdrawalsWithDynamicLiquidity,
  adjustInterestRates,
  users,
  withdrawalQueue
} = require('./withdraw');

const { performance } = require('perf_hooks');

// Helper function to calculate the Gini coefficient for fairness
function calculateGiniCoefficient(values) {
  if (values.length === 0) return 0; // Handle edge case with no values
  const sorted = values.slice().sort((a, b) => a - b);
  const n = sorted.length;
  const totalSum = sorted.reduce((acc, value) => acc + value, 0);
  let cumulativeSum = 0;
  let giniSum = 0;

  for (let i = 0; i < n; i++) {
    cumulativeSum += sorted[i];
    giniSum += cumulativeSum - sorted[i] / 2;
  }

  const gini = 1 - (2 * giniSum) / (n * totalSum);
  return Math.max(0, Math.min(gini, 1)); // Clamp between 0 and 1
}

// Function to generate mock withdrawal requests
function generateWithdrawalRequests(userCount, minAmount, maxAmount) {
  const requests = [];
  for (let i = 0; i < userCount; i++) {
    const userId = `user${i + 1}`;
    const amount = Math.floor(Math.random() * (maxAmount - minAmount) + minAmount);

    // Ensure the user exists in the `users` object
    if (!users[userId]) {
      users[userId] = { balance: 1000 }; // Default balance
    }

    requests.push({ user: userId, amount });
  }
  return requests;
}

// Function to simulate system performance
async function runEvaluation() {
  const totalLiquidity = 5000; // Total liquidity available
  const testCases = [
    { strategy: 'proportional', totalAvailable: 1000 },
    { strategy: 'proportional', totalAvailable: 500 },
    { strategy: 'queue', totalAvailable: 2000 },
    { strategy: 'dynamic', totalAvailable: 3000 }
  ];

  const metrics = {
    fairness: [],
    liquidityUtilization: [],
    transactionTime: [],
    interestRates: []
  };

  console.log('Starting Evaluation...\n');

  for (const { strategy, totalAvailable } of testCases) {
    console.log(`--- Running Test for Strategy: ${strategy} ---`);

    // Generate 10 random withdrawal requests
    const mockRequests = generateWithdrawalRequests(10, 100, 1000);
    withdrawalQueue.push(...mockRequests);

    // Debugging logs
    console.log("Withdrawal Queue Before Processing:", withdrawalQueue);
    console.log("Users Before Processing:", users);

    // Record start time
    const startTime = performance.now();

    let processedWithdrawals = [];
    try {
      if (strategy === 'proportional') {
        processedWithdrawals = processProportionalWithdrawals(totalAvailable);
      } else if (strategy === 'queue') {
        processedWithdrawals = processQueueWithdrawals(totalAvailable);
      } else if (strategy === 'dynamic') {
        processedWithdrawals = processWithdrawalsWithDynamicLiquidity(totalAvailable);
      }
    } catch (error) {
      console.error(`Error during processing: ${error.message}`);
      continue; // Skip to the next test case
    }

    // Record end time
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    metrics.transactionTime.push(elapsedTime);

    // Calculate Gini coefficient for withdrawal fairness
    const withdrawalAmounts = processedWithdrawals.map(w => w.amount);
    const giniCoefficient = calculateGiniCoefficient(withdrawalAmounts);
    metrics.fairness.push(giniCoefficient);

    // Calculate liquidity utilization
    const totalWithdrawn = processedWithdrawals.reduce((acc, w) => acc + w.amount, 0);
    const liquidityUtilization = (totalWithdrawn / totalAvailable) * 100;
    metrics.liquidityUtilization.push(liquidityUtilization);

    // Track interest rate fluctuation (for dynamic strategy only)
    if (strategy === 'dynamic') {
      const currentInterestRate = adjustInterestRates(totalLiquidity, totalWithdrawn, 0.05);
      metrics.interestRates.push(currentInterestRate);
      console.log('Adjusted Interest Rate:', (currentInterestRate * 100).toFixed(2), '%');
    }

    console.log('Processed Withdrawals:', processedWithdrawals);
    console.log('Gini Coefficient (Fairness):', giniCoefficient.toFixed(4));
    console.log('Liquidity Utilization (%):', liquidityUtilization.toFixed(2));
    console.log('Transaction Time (ms):', elapsedTime.toFixed(2));
    console.log('\n');
  }

  console.log('--- Evaluation Complete ---');
  console.log('Metrics Summary:', metrics);
}

runEvaluation().catch(console.error);  
