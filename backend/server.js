// Express
const express = require("express");
const app = express();
const port = 4000;

const TOKEN_EXPIRATION_TIME = "1d";

// Mongo*
let url = "mongodb://localhost:27017/budget";
const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const chartModel = require("./models/chart_schema");
const userModel = require("./models/user_schema");
const connectParams = { useNewUrlParser: true, useUnifiedTopology: true };
const upsert = { upsert: true };

// JWT
const jwt = require("jsonwebtoken");
const exjwt = require("express-jwt");
const bodyParser = require("body-parser");
const secretKey = "My super secret key";

// Bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;

// This should be increased to 10 in production, but can be lower for testing.
const MIN_PASSWORD_LENGTH = 3;

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Content-type,Authorization");
	next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/signup", (req, res) => {
	const { username, password } = req.body;
	// Check the length of the username and password.
	if (username.length < 3) {
		res.json({
			ok: 0,
			error: "Error: Username too short.",
		});
		return;
	}
	if (password.length < MIN_PASSWORD_LENGTH) {
		res.json({
			ok: 0,
			error: "Error: Password too short.",
		});
		return;
	}
	// The basic checks we can do without the database are done,
	// so next we need to connect to the database.
	mongoose
		.connect(url, connectParams)
		.then(() => {
			userModel.findOne({ username: username }, function (err, user) {
				// Check if there was an error. If so, return that error.
				if (err != null) {
					mongoose.connection.close();
					res.json({
						ok: 0,
						error: err,
					});
					return;
				}
				// Check if an existing user was found.
				// If so, we can't make a new one with this username.
				if (user != null) {
					mongoose.connection.close();
					res.json({
						ok: 0,
						error: "Error: Username already in use.",
					});
					return;
				}
				// Now that we validated the username, let's create the user.
				bcrypt.genSalt(saltRounds, function (err, salt) {
					bcrypt.hash(password, salt, function (err, hash) {
						// Create a new token for the user.
						const token = jwt.sign(
							{ username: username },
							secretKey,
							{ expiresIn: TOKEN_EXPIRATION_TIME }
						);
						// Create new user document.
						const newUser = new userModel({
							username: username,
							passwordHash: hash,
							salt: salt,
							validTime: Date.now() / 1000 - 1,
							budgetData: [],
						});
						// Store new user in DB.
						userModel
							.updateOne({ username: username }, newUser, upsert)
							.then((data) => {
								mongoose.connection.close();
								// Give the new token to the client.
								data.token = token;
								res.json(data);
							})
							.catch((connectionError) => {
								console.log(connectionError);
							});
					});
				});
			});
		})
		.catch((connectionError) => {
			console.log(connectionError);
		});
});

app.post("/api/login", (req, res) => {
	const { username, password } = req.body;
	mongoose
		.connect(url, connectParams)
		.then(() => {
			userModel.findOne({ username: username }, function (err, user) {
				mongoose.connection.close();
				// Check if there was an error. If so, return that error.
				if (err != null) {
					res.json({
						ok: 0,
						error: err,
					});
					return;
				}
				// Check if an existing user was NOT found.
				// If so, we can't log in with this username.
				if (user == null) {
					res.json({
						ok: 0,
						error: "Error: Username not registered.",
					});
					return;
				}
				// Now that we validated the username, let's check the password.
				bcrypt.hash(password, user.salt, function (err, hash) {
					if (hash != user.passwordHash) {
						res.json({
							ok: 0,
							error: "Error: Password is incorrect.",
						});
						return;
					}
					// Create a new token for the user.
					let token = jwt.sign({ username: username }, secretKey, {
						expiresIn: TOKEN_EXPIRATION_TIME,
					});
					// Give the new token to the client.
					res.json({ ok: 1, token: token });
				});
			});
		})
		.catch((connectionError) => {
			console.log(connectionError);
		});
});

function validateToken(token, res, callback) {
	if (token === undefined || token === null || token.length < 5) {
		res.json({
			ok: 0,
			error: "Error: Invalid token, please log in again.",
		});
		return;
	}
	try {
		const data = jwt.verify(token, secretKey);
		mongoose
			.connect(url, connectParams)
			.then(() => {
				userModel.findOne(
					{ username: data.username },
					function (err, user) {
						if (user == null || data.iat < user.validTime) {
							mongoose.connection.close();
							res.json({
								ok: 0,
								error:
									"Error: Invalid token, please log in again.",
							});
							return;
						}
						callback(user);
					}
				);
			})
			.catch((connectionError) => {
				console.log(connectionError);
			});
	} catch (e) {
		console.log(e);
		mongoose.connection.close();
		res.json({
			ok: 0,
			error: "Error: Invalid token, please log in again.",
		});
	}
}

app.post("/api/get_budget", (req, res) => {
	validateToken(req.body.token, res, (user) => {
		mongoose.connection.close();
		res.json({
			ok: 1,
			budgetData: user.budgetData,
			income: user.income,
			savings: user.savings,
		});
	});
});

app.post("/api/set_income", (req, res) => {
	validateToken(req.body.token, res, (user) => {
		const income = req.body.income;
		if (income === undefined || income === null) {
			return;
		}
		user.income = income;
		// Store updated user in DB.
		userModel
			.updateOne({ username: user.username }, user, upsert)
			.then((data) => {
				mongoose.connection.close();
				// Respond to the client.
				res.json({
					ok: 1,
					response: "Income set.",
				});
				return;
			})
			.catch((connectionError) => {
				console.log(connectionError);
			});
	});
});

app.post("/api/set_savings", (req, res) => {
	validateToken(req.body.token, res, (user) => {
		const savings = req.body.savings;
		if (savings === undefined || savings === null) {
			return;
		}
		user.savings = savings;
		// Store updated user in DB.
		userModel
			.updateOne({ username: user.username }, user, upsert)
			.then((data) => {
				mongoose.connection.close();
				// Respond to the client.
				res.json({
					ok: 1,
					response: "Savings set.",
				});
				return;
			})
			.catch((connectionError) => {
				console.log(connectionError);
			});
	});
});

app.post("/api/add_to_budget", (req, res) => {
	validateToken(req.body.token, res, (user) => {
		for (let i = 0; i < user.budgetData.length; i++) {
			if (req.body.title == user.budgetData[i].title) {
				mongoose.connection.close();
				res.json({
					ok: 0,
					error:
						"Error: There is already a budget item with the same title.",
				});
				return;
			}
		}
		// Handle more cases of colors than HTML/CSS normally does.
		let color = req.body.color;
		if (color.startsWith("#")) {
			color = color.substring(1);
		}
		if (/^[A-Fa-f0-9]*$/.test(color)) {
			if (color.length === 6 || color.length === 8) {
				color = "#" + color;
			} else if (color.length === 3 || color.length === 4) {
				color = color
					.split("")
					.map(function (v) {
						return v + v;
					})
					.join("");
				color = "#" + color;
			}
		}
		// Create new budget document.
		const newBudget = new chartModel({
			title: req.body.title,
			budget: req.body.budget,
			color: color,
		});
		user.budgetData.push(newBudget);
		// Store updated user in DB.
		userModel
			.updateOne({ username: user.username }, user, upsert)
			.then((data) => {
				mongoose.connection.close();
				// Respond to the client.
				res.json({
					ok: 1,
					response: "Budget data added.",
				});
				return;
			})
			.catch((connectionError) => {
				console.log(connectionError);
			});
	});
});

app.post("/api/delete_from_budget", (req, res) => {
	validateToken(req.body.token, res, (user) => {
		// Remove budget data from user document.
		user.budgetData = user.budgetData.filter(
			(item) => item.title != req.body.title
		);
		// Store updated user in DB.
		userModel
			.updateOne({ username: user.username }, user, upsert)
			.then((data) => {
				mongoose.connection.close();
				// Respond to the client.
				res.json({
					ok: 1,
					response: "Budget data deleted.",
				});
				return;
			})
			.catch((connectionError) => {
				console.log(connectionError);
			});
	});
});

app.post("/api/sign_out_all", (req, res) => {
	validateToken(req.body.token, res, (user) => {
		user.validTime = (Date.now() / 1000) - 1;
		// Store updated user in DB.
		userModel
			.updateOne({ username: user.username }, user, upsert)
			.then((data) => {
				mongoose.connection.close();
				// Respond to the client.
				res.json({
					ok: 1,
					response: "Signed out successfully.",
				});
				return;
			})
			.catch((connectionError) => {
				console.log(connectionError);
			});
	});
});

app.post("/api/change_password", (req, res) => {
	// Check the length of the new password.
	if (req.body.newPassword.length < MIN_PASSWORD_LENGTH) {
		res.json({
			ok: 0,
			error: "Error: Password too short.",
		});
		return;
	}
	validateToken(req.body.token, res, (user) => {
		bcrypt.hash(req.body.newPassword, user.salt, function (err, hash) {
			// Set new hash and update validTime to expire old tokens.
			user.passwordHash = hash;
			user.validTime = (Date.now() / 1000) - 1;
			// Store updated user in DB.
			userModel
				.updateOne({ username: user.username }, user, upsert)
				.then((data) => {
					mongoose.connection.close();
					// Respond to the client.
					res.json({
						ok: 1,
						response: "Password changed successfully.",
					});
					return;
				})
				.catch((connectionError) => {
					console.log(connectionError);
				});
		});
	});
});

app.post("/api/delete_account", (req, res) => {
	validateToken(req.body.token, res, (user) => {
		userModel.deleteOne(user, function (err, deletion) {
			mongoose.connection.close();
			// Respond to the client.
			res.json({
				ok: 1,
				response: "User deleted successfully. Bye!",
			});
			return;
		});
	});
});

app.listen(port, () => {
	console.log(`Serving on port ${port}`);
});
