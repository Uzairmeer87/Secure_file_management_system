import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function FileViewer() {
  const { name } = useParams();
  const [content, setContent] = useState('');
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchContent = async () => {
    try {
      const data = await api.get(`/files/${name}`);
      setContent(typeof data === 'string' ? data : '');
      const metaData = await api.get(`/files/${name}/meta`);
      setMeta(metaData);
    } catch {
      setError('Failed to load file.');
    }
  };

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line
  }, [name]);

  const save = async () => {
    try {
      await api.put(`/files/${name}`, { content });
      window.alert('Saved!');
      fetchContent();
    } catch {
      window.alert('Save failed!');
    }
  };

  const del = async () => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await api.delete(`/files/${name}`);
      window.alert('File deleted');
      navigate('/');
    } catch {
      window.alert('Delete failed!');
    }
  };

  return (
    <div style={{maxWidth:'570px',margin:'2.5em auto 0 auto'}}>
      <div className="glass" style={{padding:'2em'}}>
        <h1 className="form-title" style={{marginBottom:'20px'}}>{name}</h1>
        {error && <div style={{color:'#ef4444',marginBottom:12}}>{error}</div>}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{margin:'0.6em 0 1em 0',width:'100%'}}
        />
        <div style={{display:'flex',gap:'12px',marginBottom:'6px'}}>
          <button className="btn btn-primary" onClick={save}>Save</button>
          <button className="btn btn-danger" onClick={del}>Delete</button>
        </div>
        {meta && (
          <div className="meta-box">
            <b>Metadata:</b>
            <pre style={{margin:0,background:'none',border:'none',padding:0}}>{JSON.stringify(meta, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
export default FileViewer;
