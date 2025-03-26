const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  abbr: { 
    type: String, 
    required: true, 
    unique: true 
  },
  description: { 
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'soss.jpeg'
  }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
