const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret';

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://myDB:node1234@cluster0.a1lir.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    initializeDepartments(); // Initialize departments after connection
    initializeAdmin(); // Create default admin user if none exists
  })
  .catch(err => console.error('MongoDB Atlas connection error:', err));

app.use(cors());
app.use(express.json());

// Import models
const Event = require('./models/Event');
const Department = require('./models/Department');
const User = require('./models/User');

// Authentication middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};

// Function to initialize default admin
async function initializeAdmin() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const adminUser = new User({
        username: 'admin',
        password: 'admin123', // This will be hashed by the pre-save hook
        role: 'admin',
        name: 'Administrator',
        email: 'admin@college.edu'
      });
      
      await adminUser.save();
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

// Function to initialize departments
async function initializeDepartments() {
  try {
    // Count existing departments
    const count = await Department.countDocuments();
    
    // Only add departments if none exist
    if (count === 0) {
      const departments = [
        { name: 'School of Science and Computer Studies', abbr: 'SSCS', description: 'Offers programs in Computer Science, Information Technology, and Natural Sciences.' },
        { name: 'School of Management', abbr: 'SOM', description: 'Specializes in Business Administration, Finance, and Management courses.' },
        { name: 'School of Humanities', abbr: 'SOH', description: 'Focuses on Languages, Literature, Philosophy, and Arts.' },
        { name: 'School of Engineering and Technology', abbr: 'SOET', description: 'Provides education in various engineering disciplines and emerging technologies.' },
        { name: 'School of Legal Studies', abbr: 'SOLS', description: 'Offers programs in Law, Legal Research, and Governance.' },
        { name: 'School of Liberal Studies', abbr: 'SLS', description: 'Interdisciplinary programs combining humanities, social sciences and natural sciences.' }
      ];
      
      await Department.insertMany(departments);
      console.log('Departments initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing departments:', error);
  }
}

// Authentication endpoints
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
      
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        username: user.username,
        name: user.name 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        department: user.department,
        studentId: user.studentId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Register student endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, name, email, department, studentId } = req.body;
    
    // Check if username or email already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }, { studentId }] 
    });
    
    if (existingUser) {
      let field = 'Username';
      if (existingUser.email === email) field = 'Email';
      if (existingUser.studentId === studentId) field = 'Student ID';
      
      return res.status(400).json({ message: `${field} already in use` });
    }
    
    // Create new student user
    const newUser = new User({
      username,
      password, // Will be hashed by pre-save hook
      role: 'student',
      name,
      email,
      department,
      studentId
    });
    
    await newUser.save();
    
    const token = jwt.sign(
      { 
        id: newUser._id, 
        role: newUser.role,
        username: newUser.username,
        name: newUser.name 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        email: newUser.email,
        department: newUser.department,
        studentId: newUser.studentId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// GET endpoint for departments
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Error fetching departments' });
  }
});

// Events API endpoints
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// Add a new endpoint for completed/past events
app.get('/api/events/completed', async (req, res) => {
  try {
    const today = new Date();
    const pastEvents = await Event.find({ endDate: { $lt: today } }).sort({ endDate: -1 });
    res.json({ events: pastEvents });
  } catch (error) {
    console.error('Error fetching completed events:', error);
    res.status(500).json({ error: 'Error fetching completed events' });
  }
});

// Add an endpoint for searching/filtering events
app.get('/api/events/search', async (req, res) => {
  try {
    const { department, dateFrom, dateTo, searchTerm } = req.query;
    let query = {};
    
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }
    
    if (dateFrom || dateTo) {
      query.startDate = {};
      if (dateFrom) {
        query.startDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.endDate = { $lte: new Date(dateTo) };
      }
    }
    
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { details: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    const events = await Event.find(query).sort({ startDate: -1 });
    res.json({ events });
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ error: 'Error searching events' });
  }
});

// Add this new endpoint for active events
app.get('/api/events/active', async (req, res) => {
  try {
    const now = new Date();
    // Set time to start of day for date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const events = await Event.find({
      $and: [
        { completed: false },
        {
          $or: [
            { endDate: { $gt: today } }, // Future events
            {
              $and: [
                { endDate: { $eq: today.toISOString().split('T')[0] } }, // Today's events
                { 
                  $or: [
                    { endTime: { $gte: now.toTimeString().slice(0, 5) } }, // Not ended yet
                    { endTime: { $exists: false } } // Events without specific end time
                  ]
                }
              ]
            }
          ]
        }
      ]
    }).sort({ startDate: 1 });

    res.json({ events });
  } catch (error) {
    console.error('Error fetching active events:', error);
    res.status(500).json({ error: 'Error fetching active events' });
  }
});

app.post('/api/events', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json({ event: savedEvent });
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ error: 'Error saving event' });
  }
});

app.delete('/api/events/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const eventId = req.params.id;
    await Event.findByIdAndDelete(eventId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Error deleting event' });
  }
});

// Add a new endpoint to mark events as completed
app.patch('/api/events/:id/complete', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const { completed } = req.body;
    
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId, 
      { completed }, 
      { new: true }
    );
    
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event: updatedEvent });
  } catch (error) {
    console.error('Error completing event:', error);
    res.status(500).json({ error: 'Error updating event' });
  }
});

// Student participation endpoints
app.post('/api/events/:id/participate', authenticate, authorize(['student']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }
    
    // Check if the event is already full
    if (event.maxParticipants > 0 && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is already full' });
    }
    
    // Check if student is already participating
    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    
    // Add student to event participants
    event.participants.push(userId);
    await event.save();
    
    // Add event to student's participated events
    await User.findByIdAndUpdate(
      userId,
      { $push: { eventsParticipated: eventId } }
    );
    
    res.status(200).json({ message: 'Successfully registered for the event', event });
  } catch (error) {
    console.error('Error participating in event:', error);
    res.status(500).json({ message: 'Server error during event participation' });
  }
});

app.delete('/api/events/:id/participate', authenticate, authorize(['student']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration cancellation deadline has passed' });
    }
    
    // Check if student is participating
    if (!event.participants.includes(userId)) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }
    
    // Remove student from event participants
    event.participants = event.participants.filter(id => id.toString() !== userId);
    await event.save();
    
    // Remove event from student's participated events
    await User.findByIdAndUpdate(
      userId,
      { $pull: { eventsParticipated: eventId } }
    );
    
    res.status(200).json({ message: 'Successfully unregistered from the event', event });
  } catch (error) {
    console.error('Error canceling event participation:', error);
    res.status(500).json({ message: 'Server error during event participation cancellation' });
  }
});

// Get student's participated events
app.get('/api/student/events', authenticate, authorize(['student']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).populate({
      path: 'eventsParticipated',
      // Don't filter events here, send all participated events
      options: { sort: { startDate: -1 } }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ events: user.eventsParticipated });
  } catch (error) {
    console.error('Error fetching student events:', error);
    res.status(500).json({ message: 'Server error fetching student events' });
  }
});

// Update event endpoint
app.patch('/api/events/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const updates = req.body;
    
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Error updating event' });
  }
});

// Get event by ID with participants
app.get('/api/events/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    const event = await Event.findOne({ eventId }).populate('participants', 'name email studentId');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ event });
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ error: 'Error fetching event details' });
  }
});

// Get event participants (admin only)
app.get('/api/events/:eventId/participants', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    const event = await Event.findOne({ eventId }).populate('participants', 'name email studentId department');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ participants: event.participants });
  } catch (error) {
    console.error('Error fetching event participants:', error);
    res.status(500).json({ error: 'Error fetching event participants' });
  }
});

// User profile endpoints
app.get('/api/user/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

app.patch('/api/user/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    // Prevent updating role or other sensitive fields
    delete updates.role;
    delete updates.password;
    delete updates.username; // Username should remain unchanged
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update the stored user in localStorage through the response
    res.json({ 
      user: updatedUser,
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Error updating user profile' });
  }
});

// Change password endpoint
app.post('/api/user/change-password', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook to hash the password
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Error changing password' });
  }
});

// Admin endpoint to manage users
app.get('/api/users', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Analytics endpoints
app.get('/api/analytics/participation', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const data = await Event.aggregate([
      { $unwind: '$participants' },
      { $group: { _id: '$department', participants: { $sum: 1 } } },
      { $project: { department: '$_id', participants: 1, _id: 0 } }
    ]);
    res.json(data);
  } catch (error) {
    console.error('Error fetching participation analytics:', error);
    res.status(500).json({ error: 'Error fetching participation analytics' });
  }
});

app.get('/api/analytics/department-activity', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const data = await Event.aggregate([
      { $group: { _id: '$department', events: { $sum: 1 } } },
      { $project: { department: '$_id', events: 1, _id: 0 } }
    ]);
    res.json(data);
  } catch (error) {
    console.error('Error fetching department activity analytics:', error);
    res.status(500).json({ error: 'Error fetching department activity analytics' });
  }
});

app.get('/api/analytics/admin', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalEvents = await Event.countDocuments();
    const popularEvents = await Event.find().sort({ participants: -1 }).limit(5).select('title participants');
    const data = [
      { category: 'Total Students', value: totalStudents },
      { category: 'Total Events', value: totalEvents },
      { category: 'Popular Events', value: popularEvents.length }
    ];
    res.json(data);
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ error: 'Error fetching admin analytics' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});