var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var passport = require("passport");
require("./auth/passport")(passport);

if(process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_STRING);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));

app.use("/", require("./routes/index"));
app.use("/places", require("./routes/place"));

app.set("view engine", "ejs");

app.listen(process.env.PORT, function() {
  console.log("Listening on port: " + process.env.PORT);
});