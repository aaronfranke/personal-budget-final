import React from "react";
import { reactLocalStorage } from "reactjs-localstorage";

import { Link } from "react-router-dom";

let logged_in = Boolean(reactLocalStorage.get("jwt"));

function Menu() {
	let elements = [
		<li key="1">
			<Link itemProp="url" to="">
				Home
			</Link>
		</li>,
	];
	if (logged_in) {
		elements.push(
			<li key="4">
				<Link itemProp="url" to="account">
					Account
				</Link>
			</li>
		);
	} else {
		elements.push(
			<li key="2">
				<Link itemProp="url" to="login">
					Login
				</Link>
			</li>,
			<li key="3">
				<Link itemProp="url" to="signup">
					Sign Up
				</Link>
			</li>
		);
	}
	return (
		<nav
			role="navigation"
			aria-label="Main menu"
			itemScope
			itemType="https://schema.org/SiteNavigationElement"
		>
			<ul>{elements}</ul>
		</nav>
	);
}

export default Menu;
