import React from "react";
import axios from "axios";
import { reactLocalStorage } from "reactjs-localstorage";

function signUp() {
	const data = {
		username: document.getElementById("username").value,
		password: document.getElementById("password").value,
	};
	axios.post(window.BACKEND_URL + "/api/signup", data).then((res) => {
		document.getElementById("password").value = "";
		if (res && res.data) {
			if (res.data.ok === 1) {
				reactLocalStorage.set("jwt", res.data.token);
				reactLocalStorage.set(
					"username",
					document.getElementById("username").value
				);
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

function SignUp() {
	return (
		<main className="center" id="main">
			<div id="login">
				<h1 className="row">Sign Up</h1>

				<div>
					<label htmlFor="username">Username</label>
					<input type="text" name="username" id="username" />
				</div>

				<div>
					<label htmlFor="password">Password</label>
					<input type="password" name="password" id="password" />
				</div>

				<div>
					<button onClick={signUp}>Sign Up</button>
				</div>

				<div>
					<p id="errorMessage"></p>
				</div>
			</div>
		</main>
	);
}

export default SignUp;
