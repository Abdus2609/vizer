import logo from './logo.svg';
import './App.css';
import React from 'react';
import SubmitForm from './pages/SubmitForm';
import Home from './pages/Home';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

function App() {
  return (
    
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<SubmitForm />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
    </div>

    // <div>
    //   <SubmitForm />
    // </div>
  );
}

export default App;
