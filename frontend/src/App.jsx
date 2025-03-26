import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login/Login';
import Register from './components/Auth/Register';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import StudentDashboardLayout from './components/Student/StudentDashboardLayout';
import Home from './components/Home/Home';
import StudentHome from './components/Student/StudentHome';
import Departments from './components/Departments/Departments';
import Events from './components/Events/Events';
import Records from './components/Records/Records';
import StudentEvents from './components/Student/StudentEvents';
import StudentMyActivities from './components/Student/StudentMyActivities';
import StudentCalendar from './components/Student/StudentCalendar';
import UserProfile from './components/Profile/UserProfile';
import ChangePassword from './components/Profile/ChangePassword';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div className="loading">Loading...</div>;
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={currentUser.role === 'admin' ? '/dashboard' : '/student-dashboard'} replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="watermark">2025 | © Faraz Akhtar Khan</div>
        
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="departments" element={<Departments />} />
            <Route path="events" element={<Events />} />
            <Route path="records" element={<Records />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
          
          {/* Student Routes */}
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentHome />} />
            <Route path="events" element={<StudentEvents />} />
            <Route path="calendar" element={<StudentCalendar />} />
            <Route path="my-activities" element={<StudentMyActivities />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;