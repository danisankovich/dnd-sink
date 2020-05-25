const mongoose = require("mongoose")
const connectDB = require("../connectDB")
const database = "dndbot";
const Feedbacks = require('../Feedback');
connectDB("mongodb://localhost:27017/"+database)

async function submitFeedback(content) {
  if (content.length > 250) {
    return ('Length has exceeded the maximum of 250 characters. Message not sent.')
  }
  const insertedFeedback = new Feedbacks({
    content: content,
    dateCreated: new Date()
  });

  insertedFeedback.save(err => {
    if (err) throw err;
  })
}

module.exports = submitFeedback;
