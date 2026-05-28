const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Haircut', 'Hair Color', 'Bridal', 'Nail Art', 'Spa', 'Makeover', 'Hairstyling', 'Nails']
  },
  title: {
    type: String,
    required: true
  },
  isBeforeAfter: {
    type: Boolean,
    default: false
  },
  beforeImageUrl: {
    type: String
  },
  afterImageUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gallery', gallerySchema);
