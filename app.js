var express = require("express");
var app = express();
var port = process.env.PORT || 3000;
var apiKey = "fdEZJHefPH08xt-EYVEsTsBnzject5mS269InVYU9jxo7CKyTMtfmo9Ky--O3YBr5ul80KD1-o42vv-27hp_tLOc_Ayn-E9xbkRcET8V7ctzcCoI2rfR6zK7Q1WzWnYx";
var axios = require("axios");
var mongoose = require("mongoose");

mongoose.Promise = global.Promise;

//mongoose.connect("mongodb://localhost/nightlife");

app.use("/users", require("./routes/user"));
app.use("/place", require("./routes/place"));

app.get("/", function(req, res) {
  res.send("Index Page");
});

app.listen(port, function() {
  console.log("Listening on port: " + port);
});