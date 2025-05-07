import React, { useState, useEffect } from 'react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'in_progress', label: 'Đang thực hiện' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'rejected', label: 'Đã từ chối' },
];

interface Request {
  id: string;
  roomNumber: string;
  guestName: string;
  content: string;
  createdAt: string;
  status: string;
}

const FAKE_TOKEN = 'staff-demo-token';
const API_BASE = 'https://minhonhotel1.onrender.com';

const StaffRequestManager: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState<string>("");

  // Đăng nhập staff và lấy token từ backend
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(`${API_BASE}/api/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
      } else {
        setLoginError(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setLoginError('Lỗi kết nối server');
    }
  };

  // Lấy danh sách yêu cầu từ API
  useEffect(() => {
    if (!token) return;
    const fetchRequests = async () => {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/staff/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      let orders: any[] = [];
      if (Array.isArray(data)) {
        orders = data;
      } else if (Array.isArray(data.orders)) {
        orders = data.orders;
      } else if (Array.isArray(data.data)) {
        orders = data.data;
      }
      setRequests(orders);
      setLoading(false);
    };
    fetchRequests();
  }, [token]);

  // Hàm cập nhật trạng thái
  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!token) return;
    await fetch(`${API_BASE}/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    setRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: newStatus } : req
      )
    );
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 320, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
        <h2>Đăng nhập nhân viên</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 12 }}>
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: 8 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 8 }} />
          </div>
          {loginError && <div style={{ color: 'red', marginBottom: 8 }}>{loginError}</div>}
          <button type="submit" style={{ width: '100%', padding: 10, background: '#1e40af', color: '#fff', border: 'none', borderRadius: 4 }}>Đăng nhập</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Quản lý yêu cầu khách hàng</h2>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 500, marginRight: 8 }}>Token đăng nhập (JWT):</label>
        <input
          type="text"
          value={token}
          readOnly
          style={{ width: 350, padding: 6, borderRadius: 6, border: '1px solid #ccc', background: '#f3f3f3' }}
        />
      </div>
      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Số phòng</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Khách</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Nội dung</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Thời gian</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Trạng thái</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center' }}>{req.roomNumber}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{req.guestName}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{req.content}</td>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center' }}>{new Date(req.createdAt).toLocaleString()}</td>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center', fontWeight: 600 }}>
                  {STATUS_OPTIONS.find(opt => opt.value === req.status)?.label || req.status}
                </td>
                <td style={{ padding: 8, border: '1px solid #eee', textAlign: 'center' }}>
                  <select
                    value={req.status}
                    onChange={e => handleStatusChange(req.id, e.target.value)}
                    style={{ padding: 4, borderRadius: 6 }}
                    disabled={!token}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StaffRequestManager; 