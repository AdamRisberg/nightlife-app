var router = require("express").Router();
var controller = require("../controllers/user");

router.post("/login", controller.login);
router.post("/register", controller.register);
router.get("/logout", controller.logout);
router.get("/:id", controller.get);

module.exports = router;