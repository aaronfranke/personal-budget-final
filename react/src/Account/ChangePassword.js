import React from "react";
import axios from "axios";
import { reactLocalStorage } from "reactjs-localstorage";
import { useHistory } from "react-router-dom";

function changePassword() {
	const data = {
		token: reactLocalStorage.get("jwt"),
		newPassword: document.getElementById("password").value,
	};
	axios
		.post("http://localhost:4000/api/change_password", data)
		.then((res) => {
			document.getElementById("password").value = "";
			if (res && res.data) {
				if (res.data.ok === 1) {
					reactLocalStorage.remove("jwt");
					reactLocalStorage.remove("username");
					window.location.assign("/");
				} else {
					document.getElementById("errorMessage").innerText =
						res.data.error;
				}
			} else {
				console.log(res);
			}
		});
}

function SignUp() {
	const history = useHistory();

	function cancel() {
		history.push("/account");
	}

	return (
		<main className="center" id="main">
			<div id="login">
				<h1 className="row">Change Password</h1>

				<div>
					<p>
						After changing your password, you will be logged out.
						You can log in again with your new password.
					</p>
				</div>

				<div>
					<label htmlFor="password">New Password</label>
					<input type="password" name="password" id="password" />
				</div>

				<div>
					<button onClick={cancel}>Cancel</button>
					<button onClick={changePassword}>Change</button>
				</div>

				<div>
					<p id="errorMessage"></p>
				</div>
			</div>
		</main>
	);
}

export default SignUp;
