import React, { useRef } from 'react';
import api from '../services/api';

function FileUpload({ onSuccess }) {
  const fileRef = useRef();

  const upload = async e => {
    e.preventDefault();
    const file = fileRef.current.files[0];
    if (!file) return alert('Pick a file');
    const form = new FormData();
    form.append('file', file);
    try {
      await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: form
      });
      fileRef.current.value = '';
      alert('Uploaded!');
      onSuccess();
    } catch {
      alert('Upload failed');
    }
  };

  return (
    <form onSubmit={upload} className="glass" style={{marginBottom:18,display:'flex',alignItems:'center',gap:'1em',padding:'0.8em 1em'}}>
      <input type="file" ref={fileRef} className="input" style={{maxWidth:220}} />
      <button type="submit" className="btn btn-primary">Upload</button>
    </form>
  );
}
export default FileUpload;
