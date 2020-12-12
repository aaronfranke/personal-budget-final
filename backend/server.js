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
		.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(() => {
			console.log("Connected to the database.");
			userModel.findOne({ username: username }, function (err, user) {
				// Check if there was an error. If so, return that error.
				if (err != null) {
					res.json({
						ok: 0,
						error: err,
					});
					mongoose.connection.close();
					return;
				}
				// Check if an existing user was found.
				// If so, we can't make a new one with this username.
				if (user != null) {
					res.json({
						ok: 0,
						error: "Username already in use.",
					});
					mongoose.connection.close();
					return;
				}
				// Now that we validated the username, let's create the user.
				bcrypt.genSalt(saltRounds, function (err, salt) {
					bcrypt.hash(password, salt, function (err, hash) {
						// Create a new token for the user.
						let token = jwt.sign(
							{ username: username },
							secretKey,
							{ expiresIn: "7d" }
						);
						// Create new user document.
						let newData = new userModel({
							username: username,
							passwordHash: hash,
							salt: salt,
							token: token,
						});
						// Store new user in DB.
						userModel
							.updateOne({ username: username }, newData, {
								upsert: true,
							})
							.then((data) => {
								data.token = token;
								console.log(data);
								res.json(data);
								mongoose.connection.close();
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
		.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(() => {
			console.log("Connected to the database.");
			userModel.findOne({ username: username }, function (err, user) {
				// Check if there was an error. If so, return that error.
				if (err != null) {
					res.json({
						ok: 0,
						error: err,
					});
					mongoose.connection.close();
					return;
				}
				// Check if an existing user was NOT found.
				// If so, we can't log in with this username.
				if (user == null) {
					res.json({
						ok: 0,
						error: "Username not registered.",
					});
					mongoose.connection.close();
					return;
				}
				// Now that we validated the username, let's check the password.
				bcrypt.hash(password, user.salt, function (err, hash) {
					if (hash != user.passwordHash) {
						res.json({
							ok: 0,
							error: "Password is incorrect.",
						});
						mongoose.connection.close();
						return;
					}
					// Create a new token for the user.
					let token = jwt.sign({ username: username }, secretKey, {
						expiresIn: "7d",
					});
					// Update user document with new token.
					user.token = token;
					// Store updated user in DB.
					userModel
						.updateOne({ username: username }, user, {
							upsert: true,
						})
						.then((data) => {
							data.token = token;
							console.log(data);
							res.json(data);
							mongoose.connection.close();
						})
						.catch((connectionError) => {
							console.log(connectionError);
						});
				});
			});
		})
		.catch((connectionError) => {
			console.log(connectionError);
		});
});

app.listen(port, () => {
	console.log(`Serving on port ${port}`);
});
