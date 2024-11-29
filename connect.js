// connect.js
const xrpl = require('xrpl');
const { TESTNET_URL } = require('./config');

async function connectToTestnet() {
  const client = new xrpl.Client(TESTNET_URL);
  await client.connect();
  console.log('Connected to XRPL TestNet');
  
  const response = await client.request({
    command: 'server_info',
  });
  console.log('Server Info:', response.result.info);
  
  await client.disconnect();
  console.log('Disconnected from XRPL TestNet');
}

connectToTestnet().catch(console.error);
