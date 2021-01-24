const router = require("express").Router();
const {
  registerUser,
  getUserById,
  getUserByEmail,
  loginUser,
  sendEmailActivation,
  activationAccount,
  sendEmailForgotPassword,
  changePassword,
  patchImageUser,
  patchUser,
  patchMaps,
  patchActivity,
} = require("../controller/c_user");
const uploadFilter = require("../middleware/multer");

router.get("/id/:id", getUserById);
router.get("/search/:email", getUserByEmail);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", sendEmailForgotPassword);
router.post("/send-email-activation", sendEmailActivation);
router.patch("/activation-account", activationAccount);
router.patch("/change-password", changePassword);
router.patch("/profile/:id", patchUser);
router.patch("/image/:id", uploadFilter, patchImageUser);
router.patch("/maps/:id", patchMaps);
router.patch("/activity/:id", patchActivity);

module.exports = router;
