import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DocumentList from './DocumentList'; // We import the file we just made
import EditorPage from './EditorPage';     // We import the editor we made earlier
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* If path is "/", show the list */}
        <Route path="/" element={<DocumentList />} />
        
        {/* If path is "/editor/1", show the editor */}
        <Route path="/editor/:id" element={<EditorPage />} />
      </Routes>
    </Router>
  );
}

export default App;