const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async (req, res, next) => {
	try {
		let { username, password } = req.body;
		if (await User.authenticate(username, password)) {
			let token = jwt.sign({ username }, SECRET_KEY);
			User.updateLoginTimestamp(username);
			return res.json({ token });
		} else {
			throw new ExpressError("Invalid user/password", 400);
		}
	} catch (err) {
		return next(err);
	}
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async (req, res, next) => {
	// req.body contains, username, password, first_name, last_name, phone
	try {
		const { username } = await User.register(req.body);
		let token = jwt.sign({ username }, SECRET_KEY);
		User.updateLoginTimestamp(username);
		return res.json({ token });
	} catch (err) {
		return next(err);
	}
});

router.get("/register", (req, res, next) => {
	try {
		return res.render("register.html");
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
