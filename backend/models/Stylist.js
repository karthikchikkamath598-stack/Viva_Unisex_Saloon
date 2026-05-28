const mongoose = require('mongoose');

const stylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialty: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 5.0
  },
  imageUrl: {
    type: String,
    required: true
  },
  skills: [{
    type: String
  }],
  availability: {
    days: [{
      type: String
    }],
    slots: [{
      type: String
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Stylist', stylistSchema);
