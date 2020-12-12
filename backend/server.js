// Express
const express = require("express");
const app = express();
const port = 4000;

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

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", `http://localhost:${port}`);
	res.setHeader("Access-Control-Allow-Headers", "Content-type,Authorization");
	next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/signup", (req, res) => {
	const { username, password } = req.body;
	console.log(username);
	mongoose
		.connect(url, connectParams)
		.then(() => {
			console.log("Connected to the database.");
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
						error: "Username already in use.",
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
							{ expiresIn: "7d" }
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
	console.log(username);
	mongoose
		.connect(url, connectParams)
		.then(() => {
			console.log("Connected to the database.");
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
						error: "Username not registered.",
					});
					return;
				}
				// Now that we validated the username, let's check the password.
				bcrypt.hash(password, user.salt, function (err, hash) {
					if (hash != user.passwordHash) {
						res.json({
							ok: 0,
							error: "Password is incorrect.",
						});
						return;
					}
					// Create a new token for the user.
					let token = jwt.sign({ username: username }, secretKey, {
						expiresIn: "7d",
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
	try {
		const data = jwt.verify(token, secretKey);
		mongoose
			.connect(url, connectParams)
			.then(() => {
				console.log("Connected to the database.");
				userModel.findOne(
					{ username: data.username },
					function (err, user) {
						if (user == null || data.iat < user.validTime) {
							mongoose.connection.close();
							res.json({
								ok: 0,
								error: "Invalid token, please log in again.",
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
			error: "Invalid token, please log in again.",
		});
	}
}

app.post("/api/get_budget", (req, res) => {
	validateToken(req.body.token, res, (user) => {
		mongoose.connection.close();
		res.json({
			ok: 1,
			budgetData: user.budgetData,
		});
	});
});

app.post("/api/add_to_budget", (req, res) => {
	validateToken(req.body.token, res, (user) => {
		// Create new budget document.
		const newBudget = new chartModel({
			title: req.body.title,
			budget: req.body.budget,
			color: req.body.color,
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

app.post("/api/change_password", (req, res) => {
	validateToken(req.body.token, res, (user) => {
		bcrypt.hash(req.body.newPassword, user.salt, function (err, hash) {
			// Set new hash and update validTime to expire old tokens.
			user.passwordHash = hash;
			user.validTime = Date.now() / 1000;
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
