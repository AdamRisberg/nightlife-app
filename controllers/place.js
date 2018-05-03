var axios = require("axios");
var Place = require("../models/place");

function get(req, res) {
  var location = req.query.location;
  var userId = req.user && req.user._id.toString();
  var username = req.user && req.user.username;
  
  axios.get("https://api.yelp.com/v3/businesses/search", {
    params: {
      location: location,
      categories: "nightlife"
    },
    headers: {
      Authorization: "Bearer " + process.env.API_KEY
    }
  })
    .then(filterResults)
    .then(getDatabaseResults)
    .then(function(data) {
      var places = combineData(data, userId);
      res.json({places: places, loggedIn: !!userId, username: username});
    })
    .catch(function (err) {
      res.json({places: null, loggedIn: !!userId, username: username});
    })
  .catch(function(err) {
    res.send("Error retrieving from api");
  });
}

function post(req, res) {
  if(!req.user) {
    return res.json("Not logged in");
  }
  if(req.body.placeId) {
    var query = {};
    if(req.body.going) { query.$pull = { going: req.user._id } } 
    else { query.$push = {going: req.user._id } }

    Place.findByIdAndUpdate(req.body.placeId, query, { new: true })
      .then(function(place) {
        res.json(place);
      })
      .catch(function(err) {
        res.send("Error updating place");
      });

  } else {
    var place = new Place({
      place_id: req.body.yelpId,
      going: [req.user._id]
    });

    place.save()
      .then(function(place) {
        res.json(place);
      })
      .catch(function(err) {
        res.send("Error saving place");
      });
  }
}

function removeAll(req, res) {
  if(!req.user) {
    return res.json("Not logged in");
  }
  Place.updateMany({ $pull: { going: req.user._id.toString() }})
    .then(function(places) {
      res.json(places);
    })
    .catch(function(err) {
      res.send(err);
    });
}

function filterResults(yelp) {
  var ids = [];

  var yelpData = yelp.data.businesses.map(function (place) {
    ids.push(place.id);

    return {
      id: place.id,
      name: place.name,
      image: place.image_url,
      review_count: place.review_count,
      rating: place.rating,
      url: place.url
    };
  });

  return {
    data: yelpData,
    ids: ids
  };
}

function getDatabaseResults(yelp) {
  var placeIds = yelp.ids;

  return new Promise(function(resolve, reject) {
    Place.find({ place_id: { $in: placeIds } })
      .sort({ place_id: 1 })
      .exec()
      .then(function (places) {
        resolve({
          yelp: yelp.data,
          database: places
        });
      })
      .catch(function (err) {
        reject(err);
      });
  });
}

function combineData(data, user_id) {
  var yelp = data.yelp.sort((a,b) => a.id < b.id ? -1 : 1);
  var database = data.database;
  var curIdx = 0;
  
  return yelp.map(function(place) {
    if(database[curIdx] && place.id === database[curIdx].place_id) {
      place.count = database[curIdx].going.length;
      place.going = database[curIdx].going.includes(user_id);
      place.place_id = database[curIdx]._id;
      curIdx++;
    } else {
      place.count = 0;
      place.going = false;
      place.place_id = "";
    }

    return place;
  });
}

module.exports = {
  get,
  post,
  removeAll
}