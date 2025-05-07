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

const StaffRequestManager: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách yêu cầu từ API
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const res = await fetch('/api/requests');
      const data = await res.json();
      setRequests(data);
      setLoading(false);
    };
    fetchRequests();
  }, []);

  // Hàm cập nhật trạng thái
  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch(`/api/requests/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: newStatus } : req
      )
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Quản lý yêu cầu khách hàng</h2>
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