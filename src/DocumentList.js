import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';
import api from './api';

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Function to create a new blank document
  const createDocument = async () => {
    try {
      const response = await api.post('/documents', {
        title: "Untitled Doc",
        content: ""
      });
      navigate(`/editor/${response.data.id}`);
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };

  // --- NEW: Function to Delete a Document ---
  const handleDelete = async (e, id) => {
    e.preventDefault(); // Stop Link from opening
    e.stopPropagation(); // Stop bubbling
    
    if (window.confirm("Are you sure you want to delete this document? 🗑️")) {
      try {
        await api.delete(`/documents/${id}`);
        // Remove from list instantly without refreshing page
        setDocuments(documents.filter(doc => doc.id !== id));
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete. Check console.");
      }
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>SyncSpace 🚀</h1>
        <p>Real-time Collaborative Workspace</p>
      </header>

      <div className="document-list">
        <div className="list-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2>Your Documents</h2>
          <button onClick={createDocument} className="create-btn" style={{
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            + New Document
          </button>
        </div>
        
        {documents.length === 0 ? (
          <p style={{textAlign: 'center', marginTop: '50px', color: '#666'}}>No documents found. Click the button above to start!</p>
        ) : (
          <div className="grid-container" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px'}}>
            {documents.map((doc) => (
              <Link to={`/editor/${doc.id}`} key={doc.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{
                  border: '1px solid #ddd', 
                  borderRadius: '10px', 
                  padding: '20px', 
                  backgroundColor: 'white',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  position: 'relative', // For positioning delete button
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}>
                  
                  {/* Title & Preview */}
                  <h3 style={{marginTop: 0, color: '#333'}}>{doc.title || "Untitled Doc"}</h3>
                  <p style={{color: '#666', fontSize: '0.9em'}}>
                    {doc.content ? doc.content.replace(/<[^>]*>?/gm, '').substring(0, 50) : "Empty..."}...
                  </p>
                  <small style={{color: '#999'}}>
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Just now'}
                  </small>

                  {/* --- DELETE BUTTON --- */}
                  <button 
                    onClick={(e) => handleDelete(e, doc.id)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      color: '#dc3545',
                      padding: '5px'
                    }}
                    title="Delete Document"
                  >
                    🗑️
                  </button>

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