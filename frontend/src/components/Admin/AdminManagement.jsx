import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [students, setStudents] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', name: '', email: '' });
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAdmins(response.data.users.filter(user => user.role === 'admin'));
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError('Failed to fetch admins.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForEvent = async (eventId) => {
    try {
      setLoading(true);
      // Now using eventId (EVT001 format) directly in the URL
      const response = await axios.get(`/api/events/${eventId}/participants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStudents(response.data.participants);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/api/register', { ...newAdmin, role: 'admin' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNewAdmin({ username: '', password: '', name: '', email: '' });
      fetchAdmins();
    } catch (err) {
      console.error('Error creating admin:', err);
      setError('Failed to create admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-management">
      <h1>Admin Management</h1>

      {/* Create Admin Section */}
      <section>
        <h2>Create New Admin</h2>
        <form onSubmit={handleCreateAdmin}>
          <input
            type="text"
            placeholder="Username"
            value={newAdmin.username}
            onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={newAdmin.name}
            onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newAdmin.email}
            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
            required
          />
          <button type="submit" disabled={loading}>Create Admin</button>
        </form>
      </section>

      {/* Admin List Section */}
      <section>
        <h2>Existing Admins</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ul>
            {admins.map(admin => (
              <li key={admin._id}>{admin.name} ({admin.email})</li>
            ))}
          </ul>
        )}
      </section>

      {/* View Registered Students Section */}
      <section>
        <h2>View Registered Students</h2>
        <input
          type="text"
          placeholder="Enter Event ID (e.g., EVT001)"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        />
        <button onClick={() => fetchStudentsForEvent(selectedEventId)} disabled={loading}>
          Fetch Students
        </button>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ul>
            {students.map(student => (
              <li key={student._id}>
                {student.name} ({student.email}) - {student.studentId}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminManagement;
