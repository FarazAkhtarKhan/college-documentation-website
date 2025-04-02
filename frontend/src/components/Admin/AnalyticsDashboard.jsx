import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const AnalyticsDashboard = () => {
  const [participationData, setParticipationData] = useState([]);
  const [departmentActivityData, setDepartmentActivityData] = useState([]);
  const [adminAnalyticsData, setAdminAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [participationRes, departmentRes, adminRes] = await Promise.all([
          axios.get('/api/analytics/participation'),
          axios.get('/api/analytics/department-activity'),
          axios.get('/api/analytics/admin')
        ]);

        setParticipationData(participationRes.data);
        setDepartmentActivityData(departmentRes.data);
        setAdminAnalyticsData(adminRes.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

  return (
    <div className="analytics-dashboard">
      <h1>Admin Analytics Dashboard</h1>
      {loading ? (
        <div className="loading-container">
          <p>Loading analytics...</p>
        </div>
      ) : (
        <div className="charts-container">
          {/* Event Participation Metrics */}
          <div className="chart-section">
            <h2>Event Participation Metrics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={participationData}>
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="participants" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Department Activity Comparisons */}
          <div className="chart-section">
            <h2>Department Activity Comparisons</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentActivityData}>
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="events" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Admin Analytics */}
          <div className="chart-section">
            <h2>Admin Analytics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={adminAnalyticsData}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {adminAnalyticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
