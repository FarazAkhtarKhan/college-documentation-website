const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventId: { 
    type: String, 
    unique: true,
    index: true
  },
  title: { type: String, required: true },
  department: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String },
  endTime: { type: String },
  details: String,
  completed: { type: Boolean, default: false },
  location: { type: String },
  maxParticipants: { type: Number, default: 0 },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  imageUrl: { type: String },
  registrationDeadline: { type: Date },
  category: { 
    type: String, 
    required: true,
    enum: ['Workshop', 'Seminar', 'Conference', 'Competition', 'Cultural', 'Academic', 'Sports'],
    index: true // Add index for better query performance
  },
  tags: [{
    type: String,
    validate: {
      validator: function(tag) {
        // Enforce tag format: 2-20 chars, alphanumeric with hyphens
        return /^[a-zA-Z0-9-]{2,20}$/.test(tag);
      },
      message: 'Tags must be 2-20 characters long and contain only letters, numbers, and hyphens'
    }
  }]
}, { timestamps: true });

// Pre-save hook to generate event ID
eventSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const lastEvent = await this.constructor.findOne({}, {}, { sort: { 'eventId': -1 } });
      let nextNum = 1;
      
      if (lastEvent && lastEvent.eventId) {
        const lastNum = parseInt(lastEvent.eventId.slice(3)); // Remove 'EVT' prefix
        nextNum = lastNum + 1;
      }
      
      // Format: EVT001, EVT002, etc.
      this.eventId = `EVT${nextNum.toString().padStart(3, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.maxParticipants > 0 && this.participants.length >= this.maxParticipants;
});

// Virtual for getting remaining slots
eventSchema.virtual('remainingSlots').get(function() {
  if (this.maxParticipants === 0) return "Unlimited";
  return Math.max(0, this.maxParticipants - this.participants.length);
});

// Add static method to get all unique tags
eventSchema.statics.getAllTags = async function() {
  return await this.distinct('tags');
};

// Add method to check if event matches category/tag filter
eventSchema.methods.matchesFilter = function(category, tags) {
  if (category && this.category !== category) return false;
  if (tags && tags.length > 0) {
    return tags.every(tag => this.tags.includes(tag));
  }
  return true;
};

module.exports = mongoose.model('Event', eventSchema);