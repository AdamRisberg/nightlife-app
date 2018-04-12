var axios = require("axios");

function get(req, res) {
  axios.get("https://api.yelp.com/v3/businesses/search", {
    params: {
      location: "76522",
      categories: "nightlife"
    },
    headers: {
      Authorization: "Bearer " + apiKey
    }
  })
    .then(function (response) {
      res.json(response.data.businesses);
    })
    .catch(function (err) {
      res.send("ERROR");
    });
}

function combineResults(yelp, database, user) {

}

module.exports = {
  get
}