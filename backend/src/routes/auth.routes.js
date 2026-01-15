const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const validateEmailDomain = require("../../middlewares/email.domain");

console.log("🔥 ROTAS DE AUTH CARREGADAS");

router.post(
  "/register",
  validateEmailDomain(["ipvc.pt", "ipvc.estg.pt"]),
  authController.register
);
router.post("/login", authController.login);

module.exports = router;
