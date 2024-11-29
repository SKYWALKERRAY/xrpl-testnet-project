// index.js
const express = require('express');
const bodyParser = require('body-parser');
const xrpl = require('xrpl');
const { TESTNET_URL } = require('./config');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// In-memory storage for users and withdrawals
const users = {
  'user1': { balance: 1000 },
  'user2': { balance: 500 },
  'user3': { balance: 1500 },
};

const withdrawalQueue = [];

// Proportional Withdrawal Logic
function processProportionalWithdrawals(totalAvailable) {
  const totalRequested = Object.values(withdrawalQueue).reduce((acc, req) => acc + req.amount, 0);
  const proportion = totalAvailable / totalRequested;

  const processedWithdrawals = withdrawalQueue.map(req => {
    const payout = req.amount * proportion;
    users[req.user].balance -= payout;
    return { user: req.user, amount: payout };
  });

  // Clear the queue after processing
  withdrawalQueue.length = 0;

  return processedWithdrawals;
}

// Queue-Based Withdrawal Logic
function processQueueWithdrawals(totalAvailable) {
  const processedWithdrawals = [];
  while (withdrawalQueue.length > 0 && totalAvailable > 0) {
    const req = withdrawalQueue.shift();
    const payout = Math.min(req.amount, totalAvailable);
    users[req.user].balance -= payout;
    processedWithdrawals.push({ user: req.user, amount: payout });
    totalAvailable -= payout;
  }
  return processedWithdrawals;
}

// Endpoint to Request Withdrawal
app.post('/withdraw', (req, res) => {
  const { user, amount } = req.body;
  if (!users[user] || users[user].balance < amount) {
    return res.status(400).json({ error: 'Invalid user or insufficient balance' });
  }
  withdrawalQueue.push({ user, amount });
  res.json({ message: 'Withdrawal request queued' });
});

// Endpoint to Process Withdrawals
app.post('/process-withdrawals', (req, res) => {
  const { strategy, totalAvailable } = req.body;
  let processed;

  if (strategy === 'proportional') {
    processed = processProportionalWithdrawals(totalAvailable);
  } else if (strategy === 'queue') {
    processed = processQueueWithdrawals(totalAvailable);
  } else {
    return res.status(400).json({ error: 'Invalid strategy' });
  }

  res.json({ processed });
});

// Endpoint to Get User Balances
app.get('/balances', (req, res) => {
  res.json(users);
});

app.listen(port, () => {
  console.log(`Withdrawal service running at http://localhost:${port}`);
});
