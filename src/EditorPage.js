import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import api from './api';
import './EditorPage.css';

// The Toolbar Component
const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="menu-bar">
      <button 
        onClick={() => editor.chain().focus().toggleBold().run()} 
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        Bold
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleItalic().run()} 
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        Italic
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleStrike().run()} 
        className={editor.isActive('strike') ? 'is-active' : ''}
      >
        Strike
      </button>
      <button onClick={() => editor.chain().focus().setParagraph().run()}>
        Paragraph
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        H1
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
        Bullet List
      </button>
    </div>
  );
};

function EditorPage() {
  const { id } = useParams();
  const [documentTitle, setDocumentTitle] = useState("Untitled");
  
  // We use this state to trigger the Auto-Save useEffect
  const [editorContent, setEditorContent] = useState(""); 
  
  const stompClientRef = useRef(null);

  // --- 1. INITIALIZE EDITOR ---
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Loading...</p>',
    
    // This runs every time YOU type
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEditorContent(html); // Update local state to trigger auto-save
      
      // Send the update via WebSocket to other users
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
            destination: "/app/edit", 
            body: html 
        });
      }
    },
  });

  // --- 2. FETCH INITIAL DOCUMENT FROM DB ---
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await api.get(`/documents/${id}`);
        setDocumentTitle(response.data.title);
        
        if (editor) {
          // Set content silently (emitUpdate: false prevents infinite loops)
          editor.commands.setContent(response.data.content, { emitUpdate: false });
          setEditorContent(response.data.content);
        }
      } catch (error) {
        console.error("Error loading document:", error);
      }
    };
    
    fetchDocument();
  }, [id, editor]);

  // --- 3. WEBSOCKET CONNECTION ---
  useEffect(() => {
    const socket = new SockJS('https://syncspace-backend-gby5.onrender.com/ws');
    const client = Stomp.over(socket);
    
    // Disable debug logs to keep console clean
    client.debug = () => {};

    client.connect({}, () => {
      console.log('Connected to WebSocket!');
      stompClientRef.current = client;

      // Listen for updates from others
      client.subscribe('/topic/updates', (message) => {
        if (editor) {
          const newContent = message.body;
          
          // Only update if the content is actually different
          if (editor.getHTML() !== newContent) {
             editor.commands.setContent(newContent, { emitUpdate: false });
             setEditorContent(newContent); // Update state to keep everything in sync
          }
        }
      });
    }, (error) => {
      console.error("WebSocket Error:", error);
    });

    return () => {
      if (client.connected) client.disconnect();
    };
  }, [editor]);

  // --- 4. AUTO-SAVE TO DATABASE ---
  useEffect(() => {
    // Prevent saving empty or loading states
    if (!editorContent || editorContent === '<p>Loading...</p>') return;

    // Debounce: Wait 2 seconds after the user stops typing
    const saveTimer = setTimeout(async () => {
       try {
         console.log("Saving to DB...");
         await api.post('/documents', { 
           id: id, // Send ID so backend updates the existing row
           title: documentTitle,
           content: editorContent 
         });
         console.log("Auto-saved to DB ✅");
       } catch (error) {
         console.error("Auto-save failed ❌", error);
       }
    }, 2000);

    // Cleanup: If user types again before 2s, cancel the previous timer
    return () => clearTimeout(saveTimer);
    
  }, [editorContent, id, documentTitle]); 

  return (
    <div className="editor-container">
      <header className="editor-header">
        <h1>{documentTitle}</h1>
        <div className="status-indicators">
           {/* Visual feedback that saving is active */}
           <span className="indicator">🟢 Auto-Save On</span>
        </div>
      </header>
      
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
}

export default EditorPage;