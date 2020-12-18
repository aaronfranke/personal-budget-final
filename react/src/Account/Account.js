import React from "react";
import axios from "axios";
import { reactLocalStorage } from "reactjs-localstorage";
import { useHistory } from "react-router-dom";

function signOut() {
	reactLocalStorage.remove("jwt");
	reactLocalStorage.remove("username");
	window.location.assign("/");
}

function signOutAll() {
	const data = {
		token: reactLocalStorage.get("jwt"),
	};
	axios.post("http://localhost:4000/api/sign_out_all", data).then((res) => {
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

function Account() {
	const history = useHistory();

	function goToDashboard() {
		history.push("/dashboard");
	}

	function changePassword() {
		history.push("/change_password");
	}

	function deleteAccount() {
		history.push("/delete_account");
	}

	const username = reactLocalStorage.get("username");

	return (
		<main className="center" id="main">
			<div id="account">
				<h1 className="row">Account Management</h1>

				<div>
					<p>
						Hello, <strong>{username}</strong>!
					</p>
				</div>

				<div>
					<button onClick={goToDashboard}>Go To Dashboard</button>
				</div>

				<div>
					<button onClick={signOut}>Sign Out</button>
				</div>

				<div>
					<button onClick={signOutAll}>
						Sign Out From All Devices
					</button>
				</div>

				<div>
					<button onClick={changePassword}>Change Password</button>
				</div>

				<div>
					<button id="deleteButton" onClick={deleteAccount}>
						Delete Account
					</button>
				</div>

				<div>
					<p id="errorMessage"></p>
				</div>
			</div>
		</main>
	);
}

export default Account;
