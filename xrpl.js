//xrpl.js
const { Client, Wallet } = require('xrpl');
const fs = require('fs');

async function deployHook() {
  const client = new Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  const wallet = Wallet.fromSeed('YOUR_TESTNET_SECRET'); // replace with an actual secret for the testnet
  const hookBinary = await fs.promises.readFile('./hooks/hook.wasm');
  const hookHex = hookBinary.toString('hex');

  const tx = {
    TransactionType: "HookSet",
    Account: wallet.classicAddress,
    Hooks: [
      {
        Hook: {
          CreateCode: hookHex,
          HookApiVersion: 0,
          Flags: 1,
          HookNamespace: "0000000000000000000000000000000000000000000000000000000000000000", 
          HookOn: "0000000000000000"
        }
      }
    ]
  };

  const prepared = await client.autofill(tx);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);
  console.log("Hook deployed:", result);
  await client.disconnect();
}

deployHook().catch(console.error);
