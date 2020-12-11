import React from "react";

import {
	BrowserRouter as Router, Route, Switch
} from "react-router-dom";

import Footer from "./Footer/Footer";
import Hero from "./Hero/Hero";
import Menu from "./Menu/Menu";

import HomePage from "./HomePage/HomePage";

function App() {
	return (
		<Router>
			<Menu />
			<Hero />
			<div className="mainContainer">
				<Switch>
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
