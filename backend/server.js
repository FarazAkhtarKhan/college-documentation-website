const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Sample data for departments and events
const departments = [
  { id: 1, name: 'School of Science and Computer Studies', abbr: 'SSCS' },
  { id: 2, name: 'School of Management', abbr: 'SOM' },
  { id: 3, name: 'School of Humanities', abbr: 'SOH' }
];

let events = [];

// GET endpoint for departments
app.get('/api/departments', (req, res) => {
  res.json({ departments });
});

// GET endpoint for events
app.get('/api/events', (req, res) => {
  res.json({ events });
});

// POST endpoint to add an event
app.post('/api/events', (req, res) => {
  const newEvent = { id: Date.now(), ...req.body };
  events.push(newEvent);
  res.status(201).json({ event: newEvent });
});

// DELETE endpoint to delete an event
app.delete('/api/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  events = events.filter(event => event.id !== eventId);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});