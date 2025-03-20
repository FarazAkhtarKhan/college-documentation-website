const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
  registrationDeadline: { type: Date }
}, { timestamps: true });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.maxParticipants > 0 && this.participants.length >= this.maxParticipants;
});

// Virtual for getting remaining slots
eventSchema.virtual('remainingSlots').get(function() {
  if (this.maxParticipants === 0) return "Unlimited";
  return Math.max(0, this.maxParticipants - this.participants.length);
});

module.exports = mongoose.model('Event', eventSchema);