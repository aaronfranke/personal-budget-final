import React from "react";
import axios from "axios";
import { reactLocalStorage } from "reactjs-localstorage";

function login() {
	const data = {
		username: document.getElementById("username").value,
		password: document.getElementById("password").value,
	};
	console.log(JSON.stringify(data));
	axios.post("http://localhost:4000/api/login", data).then((res) => {
		document.getElementById("password").value = "";
		if (res && res.data) {
			if (res.data.ok === 1) {
				reactLocalStorage.set("jwt", res.data.token);
				reactLocalStorage.set("username", document.getElementById("username").value);
				window.location.assign("/account");
			} else {
				document.getElementById("errorMessage").innerText =
					res.data.error;
			}
		} else {
			document.getElementById("errorMessage").innerText =
				"Error: Unknown error.";
			console.log(res);
		}
	});
}

function Login() {
	return (
		<main className="center" id="main">
			<div id="login">
				<h1 className="row">Login</h1>

				<div>
					<label htmlFor="username">Username</label>
					<input type="text" name="username" id="username" />
				</div>

				<div>
					<label htmlFor="password">Password</label>
					<input type="password" name="password" id="password" />
				</div>

				<div>
					<button onClick={login}>Login</button>
				</div>

				<div>
					<p id="errorMessage"></p>
				</div>
			</div>
		</main>
	);
}

export default Login;
