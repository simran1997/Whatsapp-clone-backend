const mongoose = require("mongoose");

const MesaageSchema = mongoose.Schema({
  name: String, //remove received & use name for authentication and differentiating between user message or someone elses mesage
  message: String,
  timestamp: String,
  received: Boolean,
});

// var Messages
module.exports = mongoose.model("Messages", MesaageSchema);
