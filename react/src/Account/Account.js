import React from "react";
import { reactLocalStorage } from "reactjs-localstorage";
import { useHistory } from "react-router-dom";

function signOut() {
	reactLocalStorage.remove("jwt");
	reactLocalStorage.remove("username");
	window.location.assign("/");
}

function Account() {
	const history = useHistory();

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
					<button onClick={signOut}>Sign Out</button>
				</div>

				<div>
					<button onClick={changePassword}>Change Password</button>
				</div>

				<div>
					<button id="deleteButton" onClick={deleteAccount}>Delete Account</button>
				</div>
			</div>
		</main>
	);
}

export default Account;
