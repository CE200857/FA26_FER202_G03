import React, { useState } from 'react';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Cập nhật giá trị khi người dùng nhập
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }
    setError('');
    console.log('Dữ liệu đăng nhập:', formData);
    alert('Đăng nhập thành công!');
  };

  return (
    <div style={{ maxWidth: '360px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Đăng Nhập</h2>
      
      {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="example@gmail.com"
          />
        </div>

        <div style={{ marginBottom: '15px', position: 'relative' }}>
          <label>Mật khẩu:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="********"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '5px', top: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            {showPassword ? '👁️' : '🙈'}
          </button>
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Đăng nhập
        </button>
      </form>
    </div>
  );
}

export default LoginPage;