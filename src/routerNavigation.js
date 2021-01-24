const route = require("express").Router();

const routeUser = require("./routes/r_user");
const routeFriend = require("./routes/r_friend");
const routeRoom = require("./routes/r_room");
const routeMessage = require("./routes/r_message");

// middleware
route.use("/user", routeUser);
route.use("/friend", routeFriend);
route.use("/room", routeRoom);
route.use("/message", routeMessage);

module.exports = route;
