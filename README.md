# Personal Budget

Personal Budget ITIS 4166 Final Project

Live web app: http://104.236.11.80/

You can log in with username "aaron" and password "franke" to see some test data.

## Backend setup

Run these commands in order:

```bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install npm
cd backend
npm install
```

Then to run `npm start`.

## Frontend setup

Run these commands in order:

```bash
sudo apt update && sudo apt full-upgrade -y
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update
sudo apt install -y npm yarn
cd react
yarn install
```

Then edit `window.BACKEND_URL` in `react/src/index.js` to point to the backend.
You can also set the `PORT` environment variable to the desired port.

Then run `yarn start` to start the server.

## General Architecture

The backend is built on NodeJS. It uses Express for routing, JWT and Bcrypt
for authentication/authorization, and MongoDB for the database. You can find
tests for the backend in the `backend/test` folder. The test code is built on
NodeJS, and it uses Axios to make requests to the backend.

The frontend is built using React, and uses Yarn as its package manager.
Like the test code, it uses Axios to make requests to the backend.
The charts are displayed using the Chart.js library.

You can sign up, log in, change your password, sign out from one or all
devices, delete your account, add budget items, delete budget items,
set an income, and set savings. Budget data includes a title, budget amount,
and color to use. The color can be in named format (like `red`), or
hex format, in either 3, 4, 6, or 8 digits, with or without the `#` symbol.

The Dashboard page provides visualizations of your budget data, including
a bar chart, pie chart, statistics, and a line chart for balance projection.
