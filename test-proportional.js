const { processProportionalWithdrawals, users, withdrawalQueue } = require('./controllers/withdrawal');

const totalAvailable = 1000; // Example total liquidity

try {
  const results = processProportionalWithdrawals(totalAvailable);
  console.log('Processed Withdrawals:', results);
  console.log('Updated User Balances:', users);
} catch (err) {
  console.error('Error:', err.message);
}
