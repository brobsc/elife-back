const mongoose = require('mongoose');

const { Schema } = mongoose;

const Story = new Schema({
  imgUrl: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  theme: {
    type: String,
    required: true,
  },
  linkUrl: {
    type: String,
    required: true,
  },
}, {
  collection: 'stories',
});

module.exports = mongoose.model('Story', Story);
