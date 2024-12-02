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

module.exports = { processProportionalWithdrawals, users, withdrawalQueue };

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

module.exports = {
  processProportionalWithdrawals,
  processQueueWithdrawals, // Export the new function
  users,
  withdrawalQueue
};
