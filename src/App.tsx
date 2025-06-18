import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Welcome from './pages/Welcome';
import Room from './pages/Room';
import Dashboard from './pages/Dashboard';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <Router>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/room" element={<Room />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </SocketProvider>
    </Router>
  );
}

export default App;