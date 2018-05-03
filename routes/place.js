var router = require("express").Router();
var controller = require("../controllers/place");

router.get("/", controller.get);
router.post("/", controller.post);
router.delete("/", controller.removeAll);

module.exports = router;