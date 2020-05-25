const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema // Define Schema method

// Schema
var FeedbacksSchema = new Schema({ // Create Schema
    content: String,
    dateCreated: String,
})

// Model
var Feedbacks = mongoose.model("Feedbacks", FeedbacksSchema) // Create collection model from schema
module.exports = Feedbacks // export model
