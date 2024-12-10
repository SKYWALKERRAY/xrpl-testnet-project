const {
  processProportionalWithdrawals,
  processQueueWithdrawals,
  users,
  withdrawalQueue
} = require('./withdraw');

console.log('Starting Edge Case Simulations');

// Case 1: Total available liquidity < total requested
const totalAvailableCase1 = 500; // Less than total requested
try {
  const resultsCase1 = processProportionalWithdrawals(totalAvailableCase1);
  console.log('Case 1 - Processed Withdrawals:', resultsCase1);
  console.log('Case 1 - Updated User Balances:', users);
} catch (err) {
  console.error('Case 1 Error:', err.message);
}

// Reset user balances and withdrawal queue for the next case
users.user1.balance = 1000;
users.user2.balance = 500;
users.user3.balance = 1500;
withdrawalQueue.push(
  { user: 'user1', amount: 800 },
  { user: 'user2', amount: 300 },
  { user: 'user3', amount: 900 }
);

// Case 2: User has insufficient balance
users.user1.balance = 200; // Insufficient balance for user1
const totalAvailableCase2 = 1000; // Liquidity is sufficient overall
try {
  const resultsCase2 = processProportionalWithdrawals(totalAvailableCase2);
  console.log('Case 2 - Processed Withdrawals:', resultsCase2);
  console.log('Case 2 - Updated User Balances:', users);
} catch (err) {
  console.error('Case 2 Error:', err.message);
}

// Reset user balances and withdrawal queue for queue-based test
users.user1.balance = 1000;
users.user2.balance = 500;
users.user3.balance = 1500;
withdrawalQueue.push(
  { user: 'user1', amount: 800 },
  { user: 'user2', amount: 300 },
  { user: 'user3', amount: 900 }
);

// Case 3: Queue-Based Withdrawals
const totalAvailableCase3 = 1000; // Liquidity is sufficient for first two requests only
try {
  const resultsCase3 = processQueueWithdrawals(totalAvailableCase3);
  console.log('Case 3 - Processed Withdrawals:', resultsCase3);
  console.log('Case 3 - Updated User Balances:', users);
} catch (err) {
  console.error('Case 3 Error:', err.message);
}
