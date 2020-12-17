import React from "react";
import axios from "axios";
import { reactLocalStorage } from "reactjs-localstorage";
import { useHistory } from "react-router-dom";

function deleteAccount() {
	const data = {
		token: reactLocalStorage.get("jwt"),
	};
	console.log(JSON.stringify(data));
	axios.post("http://localhost:4000/api/delete_account", data).then((res) => {
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

function DeleteAccount() {
	const history = useHistory();

	function cancel() {
		history.push("/account");
	}

	return (
		<main className="center" id="main">
			<div id="login">
				<h1 className="row">Delete Account</h1>

				<div>
					<p>Are you sure you want to delete your account?</p>
				</div>

				<div>
					<button onClick={cancel}>Cancel</button>
					<button id="deleteButton" onClick={deleteAccount}>Confirm Deletion</button>
				</div>

				<div>
					<p id="errorMessage"></p>
				</div>
			</div>
		</main>
	);
}

export default DeleteAccount;
