# Node URL Parser Project

# Prerequisites

- Nodejs
- Git
- Hosts File Setup:
  - **On Windows** Edit `C:\Windows\System32\drivers\etc\hosts` (as Administrator) and add
  - `127.0.0.1   www.somepage.com`
  - **On macOS/Linux:** Edit `/etc/hosts` (with sudo) and add
  - `127.0.0.1   www.somepage.com`

Hosts file is used so that certain domain names resolve to your local machine (127.0.0.1).
Inside data/testdata.txt we're making requests towards www.somepage.com and this redirects it to our machine.
This was mainly used for testing purposes because this way it was possible to get consistently same expected results and easy to change them.
For that to work we had to create a small express server that runs on port 80 - seemed easier than doing port forwarding.

## Steps to run the script

- Git Clone the project
- npm install - to install the dependencies
- npm build - to build the project
- npm run server - to run the small express server
- npm run test - to run unit and integration tests
- npm start - to run the script with data/testdata.txt test file
- node dist/index.js - to run the script that waits for input
