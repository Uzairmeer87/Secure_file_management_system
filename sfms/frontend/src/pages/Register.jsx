import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const res = await register(username, password);
    if (res.success) {
      window.alert('Registered! Login now.');
      navigate('/login');
    } else {
      setError(res.error || 'Register failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass card" style={{display:'flex',flexDirection:'column',gap:14}}>
      <h1 className="form-title">Register</h1>
      <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      {error && <div style={{color:'#ef4444',margin:'3px 0'}}> {error} </div>}
      <button type="submit" className="btn btn-primary" style={{marginTop:10}}>Register</button>
    </form>
  );
}
export default Register;
