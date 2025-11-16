import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass card" style={{display:'flex',flexDirection:'column',gap:14}}>
      <h1 className="form-title">Login</h1>
      <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      {error && <div style={{color:'#ef4444',margin:'3px 0'}}> {error} </div>}
      <button type="submit" className="btn btn-primary" style={{marginTop:10}}>Login</button>
    </form>
  );
}
export default Login;
