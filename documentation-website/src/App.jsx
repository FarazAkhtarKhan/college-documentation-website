import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Home from './components/Home/Home';
import Departments from './components/Departments/Departments';
import Events from './components/Events/Events';
import Activities from './components/Activities/Activities';

const App = () => {
  return (
    <BrowserRouter>
      <div className="watermark">2025 | © Faraz Akhtar Khan</div>
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="departments" element={<Departments />} />
          <Route path="events" element={<Events />} />
          <Route path="activities" element={<Activities />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;