import React from 'react';

export default function TestAuth() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Test User Authentication</h2>
      <form>
        <input type="text" placeholder="Username" style={{ display: 'block', margin: '10px auto' }} />
        <input type="password" placeholder="Password" style={{ display: 'block', margin: '10px auto' }} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}