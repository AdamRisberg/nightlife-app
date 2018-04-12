var router = require("express").Router();
var controller = require("../controllers/place");

router.get("/", controller.get);

module.exports = router;