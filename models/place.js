var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlaceSchema = new Schema({
  place_id: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  going: [ String ]
});

module.exports = mongoose.model("place", PlaceSchema);