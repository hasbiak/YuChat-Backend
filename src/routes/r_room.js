const router = require("express").Router();
const {
  getRoomByUserId,
  searchRoom,
  createRoom,
} = require("../controller/c_room");

router.get("/:id", getRoomByUserId);
router.get("/search", searchRoom);
router.post("/create", createRoom);

module.exports = router;
