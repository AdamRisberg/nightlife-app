var router = require("express").Router();
var controller = require("../controllers/index");
var passport = require("passport");

router.get("/", controller.index);
router.get("/login", controller.loginForm);
router.post("/login",
  passport.authenticate("local-login"),
  controller.login);
router.get("/register", controller.registerForm);
router.post("/register",
  passport.authenticate("local-signup"),
  controller.register);
router.get("/logout", controller.logout);
router.get("/loggedin", controller.checkLoggedIn);

module.exports = router;