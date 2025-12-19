import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import './App.css';
import api from './api';

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error("Error", error);
    }
  };

  // Function to create a new blank document
  const createDocument = async () => {
    try {
      const response = await api.post('/documents', {
        title: "Untitled Doc",
        content: ""
      });
      // Immediately open the new document
      navigate(`/editor/${response.data.id}`);
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>SyncSpace 🚀</h1>
        <p>Real-time Collaborative Workspace</p>
      </header>

      <div className="document-list">
        <div className="list-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Your Documents</h2>
          <button onClick={createDocument} className="create-btn" style={{
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            + New Document
          </button>
        </div>
        
        {documents.length === 0 ? (
          <p>No documents found. Click the button above to start!</p>
        ) : (
          <div className="grid-container">
            {documents.map((doc) => (
              <Link to={`/editor/${doc.id}`} key={doc.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card">
                  <h3>{doc.title}</h3>
                  <p>{doc.content ? doc.content.replace(/<[^>]*>?/gm, '').substring(0, 50) : "Empty..."}...</p>
                  <small>Created: {new Date(doc.createdAt).toLocaleDateString()}</small>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentList;