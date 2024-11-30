# xrpl-testnet-project

# Getting Started: 
**1. Open Terminal/CLI and run:**

`git clone "https://github.com/SKYWALKERRAY/xrpl-testnet-project.git"`

If you get an error that: "Support for password authentication was removed," then try:

`git clone git@github.com:SKYWALKERRAY/xrpl-testnet-project.git`

**2. Install [node.js/npm](https://radixweb.com/blog/installing-npm-and-nodejs-on-windows-and-mac)**

Make sure node.js is installed by running the following (it should output the version you are running):

`node -v`

**3. Go into the project directory using:**

`cd xrpl-testnet-project/`

**4. Install the required dependencies by running:**

`npm install`

**5. Once the dependencies are finished downloading, you can start the program by running:**

`npm start`

You should see that the withdrawl service is running at http://localhost:3000. 

**6. You can test that the program is running by using:**

`curl -X POST http://localhost:3000/withdraw`

- It should give an error saying invalid user or insufficient balance. 

- Running the following command should provide useful outputs to help you understand how the program is working in the background:

- `curl -X POST http://localhost:3000/withdraw \
-H "Content-Type: application/json" \
-d '{"user": "user1", "amount": 300}'
curl -X POST http://localhost:3000/withdraw \
-H "Content-Type: application/json" \
-d '{"user": "user2", "amount": 200}'
curl -X POST http://localhost:3000/withdraw \
-H "Content-Type: application/json" \
-d '{"user": "user3", "amount": 500}'
curl -X POST http://localhost:3000/process-withdrawals \
-H "Content-Type: application/json" \
-d '{"strategy": "proportional", "totalAvailable": 700}'`
