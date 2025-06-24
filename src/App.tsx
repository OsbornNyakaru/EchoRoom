import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Welcome from './pages/Welcome';
import Room from './pages/Room';
import Dashboard from './pages/Dashboard';
import { SocketProvider } from './context/SocketContext';

function App() {
  const location = useLocation();
  // This allows us to render the dashboard as a modal over the home page
  const state = location.state as { backgroundLocation?: Location };

  return (

      <SocketProvider>
        <Routes location={state?.backgroundLocation || location}>
          <Route path="/" element={<Home />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/room" element={<Room />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        {/* Show dashboard as overlay if on /dashboard */}
        {location.pathname === "/dashboard" && <Dashboard />}
      </SocketProvider>
  );
}

export default App;