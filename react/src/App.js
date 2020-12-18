import React from "react";

import {
	BrowserRouter as Router, Route, Switch
} from "react-router-dom";

import Footer from "./Footer/Footer";
import Hero from "./Hero/Hero";
import Menu from "./Menu/Menu";
import HomePage from "./HomePage/HomePage";

import Account from "./Account/Account";
import Login from "./Account/Login";
import SignUp from "./Account/SignUp";
import ChangePassword from "./Account/ChangePassword";
import DeleteAccount from "./Account/DeleteAccount";

import Dashboard from "./Budget/Dashboard";

function App() {
	return (
		<Router>
			<Menu />
			<Hero />
			<div className="mainContainer">
				<Switch>
					<Route path="/login">
						<Login />
					</Route>
					<Route path="/signup">
						<SignUp />
					</Route>
					<Route path="/account">
						<Account />
					</Route>
					<Route path="/change_password">
						<ChangePassword />
					</Route>
					<Route path="/delete_account">
						<DeleteAccount />
					</Route>
					<Route path="/dashboard">
						<Dashboard />
					</Route>
					<Route path="/">
						<HomePage />
					</Route>
				</Switch>
			</div>
			<Footer />
		</Router>
	);
}

export default App;
