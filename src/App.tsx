import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import Home from './components/Home';
import './App.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!loginInput.trim()) {
      setMessage('Please enter Email or Mobile Number');
      setLoading(false);
      return;
    }

    const isEmail = loginInput.includes('@');

    let query = supabase.from('users').select('*');

    if (isEmail) {
      query = query.eq('email', loginInput.trim());
    } else {
      query = query.eq('mobile', loginInput.trim());
    }

    const { data: existingUser } = await query.maybeSingle();

    if (existingUser) {
      setUser(existingUser);
      setMessage(`Welcome back ${existingUser.name}!`);
    } else {
      const newUserData: any = {
        name: name.trim(),
        role: 'user',
      };

      if (isEmail) {
        newUserData.email = loginInput.trim();
      } else {
        newUserData.mobile = loginInput.trim();
      }

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([newUserData])
        .select()
        .single();

      if (newUser) {
        setUser(newUser);
        setMessage(`Welcome ${name.trim()}! Account created.`);
      } else {
        setMessage('Error: ' + insertError?.message);
      }
    }

    setLoading(false);
  };

  if (user) {
    return <Home user={user} onLogout={() => setUser(null)} />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <span>📰</span>
        </div>
        <h1 className="login-title">NIMACH HUB</h1>
        <p className="login-subtitle">Your daily news source</p>

        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="login-input-group">
            <label>Email or Mobile Number</label>
            <input
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Enter email or mobile number"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Continue →'}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: '16px',
              textAlign: 'center',
              fontSize: '14px',
              color: message.includes('Welcome') ? '#22c55e' : '#ef4444',
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
