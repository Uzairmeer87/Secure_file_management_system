import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FileList from '../components/FileList';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const [files, setFiles] = useState([]);
  const { logout } = useAuth();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [createError, setCreateError] = useState('');
  const navigate = useNavigate();

  const fetchFiles = async () => {
    try {
      const data = await api.get('/files');
      setFiles(data);
    } catch (e) {
      setFiles([]);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleNewFile = async e => {
    e.preventDefault();
    setCreateError('');
    try {
      await api.createFile(newName, newContent);
      setNewName(''); setNewContent(''); setCreating(false);
      fetchFiles();
      // Automatically navigate to the new file's viewer
      navigate(`/files/${encodeURIComponent(newName)}`);
    } catch(err) {
      setCreateError((err && err.error) || 'Create failed');
    }
  };

  return (
    <div style={{maxWidth: '570px', margin: '0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h1 style={{fontSize:'1.6rem',fontWeight:'bold',color:'#3b82f6'}}>Your Files</h1>
        <button className="btn btn-secondary" onClick={logout}>Logout</button>
      </div>
      <div style={{marginBottom: '1.2em'}}>
        <button className="btn btn-primary" onClick={()=>setCreating(x=>!x)}>{creating ? 'Cancel' : 'New File'}</button>
      </div>
      {creating && (
        <form onSubmit={handleNewFile} className="glass card" style={{marginBottom:16,display:'flex',flexDirection:'column',gap:10,maxWidth:430}}>
          <h2 className="form-title" style={{fontSize:'1.15em',marginTop:6,marginBottom:6}}>Create New File</h2>
          <input className="input" placeholder="File name (e.g., example.txt)" value={newName} onChange={e => setNewName(e.target.value)} required maxLength={64} />
          <textarea className="input" style={{minHeight:60,fontSize:'1em'}} placeholder="Content (optional)" value={newContent} onChange={e => setNewContent(e.target.value)} />
          {createError && <div style={{color:'#ef4444',margin:'2px 0'}}>{createError}</div>}
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      )}
      <div className="glass" style={{padding:'1.5em'}}>
        <FileUpload onSuccess={fetchFiles} />
        <FileList files={files} onRefresh={fetchFiles} />
      </div>
    </div>
  );
}
export default Dashboard;
