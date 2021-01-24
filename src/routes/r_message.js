const router = require("express").Router();
const { getMessageByRoomId, sendMessage } = require("../controller/c_message");

router.get("/", getMessageByRoomId);
router.post("/send", sendMessage);

module.exports = router;
