import './App.css';
import { Route, Router, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';

function App() {
  return (
    <>
    <Router>
      <Route path='/' element={<LandingPage />} />
    </Router>
    </>
  )
}

export default App;
