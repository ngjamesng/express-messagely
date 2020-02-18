const Router = require("express").Router;
const Message = require("../models/message");
const { ensureLoggedIn, ensureCorrectUse } = require("../middleware/auth");

const router = new Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/


router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    let message = await Message.get(req.params.id);
    let from_user = message.from_user.username;
    let to_user = message.to_user.username;
    let current_user = req.user.username;

    if (current_user !== (from_user || to_user)) {
      throw new ExpressError("Cannot read this message", 401);
    }
    return res.json({ message });
  } catch (err) {
    return next (err);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

 router.post("/", ensureLoggedIn, async (req, res, next) => {
   try {
     let {to_username, body} = req.body;
     let { username: from_username } = req.user;
     let message = await Message.create(from_username, to_username, body);

     return res.json( {message} )
   } catch(err) {
     return next(err);
   }
 });


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

 router.post("/:id/read", ensureLoggedIn, async (req, res, next) => {
  try {
    let id = req.params.id;
    let message = await Message.get(id);
    let to_user = message.to_user.username;
    let current_user = req.user.username;

    if (current_user !==  to_user) {
      throw new ExpressError("Cannot mark this message as read", 401);
    }

    let readMessage = await Message.markRead(id);
    return res.json({readMessage});
  } catch (err) {
    return next(err);
  }
 });


 module.exports = router;