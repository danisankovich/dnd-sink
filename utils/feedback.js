const Feedbacks = require('../Feedback');


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
