import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Trash2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_KEY = '7skiQDEg2v8ZuKYMrm1C';
const BASE_URL = 'https://ios.priyo.email/api';

function App() {
  const [domains, setDomains] = useState([]);
  const [currentEmail, setCurrentEmail] = useState(() => {
    // Lấy email từ localStorage khi khởi tạo
    const savedEmail = localStorage.getItem('tempMailCurrentEmail');
    return savedEmail ? JSON.parse(savedEmail) : null;
  });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [customUsername, setCustomUsername] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState(null);

  // Lấy danh sách domain
  const fetchDomains = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/domains/${API_KEY}`);
      setDomains(response.data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách domain');
      console.error('Error fetching domains:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lưu email vào localStorage
  const saveEmailToStorage = (email) => {
    if (email) {
      localStorage.setItem('tempMailCurrentEmail', JSON.stringify(email));
    } else {
      localStorage.removeItem('tempMailCurrentEmail');
    }
  };

  // Tạo email ngẫu nhiên
  const generateRandomEmail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/random-email/${API_KEY}`);
      setCurrentEmail(response.data);
      saveEmailToStorage(response.data); // Lưu vào localStorage
      setMessages([]);
      setError('');
      
      // Tự động lấy tin nhắn sau khi tạo email
      setTimeout(() => {
        fetchMessages(response.data.email);
      }, 1000);
    } catch (err) {
      setError('Không thể tạo email ngẫu nhiên');
      console.error('Error generating email:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tạo email tùy chỉnh
  const generateCustomEmail = async () => {
    if (!customUsername.trim()) {
      setError('Vui lòng nhập tên người dùng');
      return;
    }
    
    if (!selectedDomain) {
      setError('Vui lòng chọn domain');
      return;
    }

    // Kiểm tra tên người dùng hợp lệ
    const username = customUsername.trim();
    if (username.length < 3) {
      setError('Tên người dùng phải có ít nhất 3 ký tự');
      return;
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('Tên người dùng chỉ được chứa chữ cái, số, dấu gạch dưới và dấu gạch ngang');
      return;
    }

    // Kiểm tra môi trường
    const isProduction = window.location.hostname !== 'localhost';
    
    if (isProduction) {
      // Production: Thử gọi API Priyo Email
      try {
        setLoading(true);
        
        const response = await axios.post('https://priyo.email/vi/livewire/update', {
          _token: 'D6Ca784OeZsHrimuPdr3FtLEFL6XdYvhdDIYuCK7',
          components: [{
            calls: [{
              path: '',
              method: 'changeEmailAddress',
              params: []
            }],
            snapshot: JSON.stringify({
              data: {
                username: username,
                domain: selectedDomain,
                domains: [domains.map(domain => ({ domain, status: 'random' }))]
              }
            })
          }]
        });

        console.log('API call successful:', response.data);
      } catch (err) {
        console.log('API call failed, falling back to client-side:', err.message);
      } finally {
        setLoading(false);
      }
    }

    // Tạo email tùy chỉnh client-side (fallback)
    const customEmail = {
      email: `${username}@${selectedDomain}`,
      isCustom: true
    };

    setCurrentEmail(customEmail);
    saveEmailToStorage(customEmail);
    setMessages([]);
    setError('');
    setShowCustomForm(false);
    
    // Tự động lấy tin nhắn sau khi tạo email
    setTimeout(() => {
      fetchMessages(customEmail.email);
    }, 1000);
  };

  // Lấy tin nhắn
  const fetchMessages = async (email) => {
    if (!email) return;
    
    try {
      const response = await axios.get(`${BASE_URL}/messages/${email}/${API_KEY}`);
      setMessages(response.data);
      setError('');
    } catch (err) {
      setError('Không thể tải tin nhắn');
      console.error('Error fetching messages:', err);
    }
  };

  // Xóa tin nhắn
  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${BASE_URL}/message/${messageId}/${API_KEY}`);
      // Cập nhật danh sách tin nhắn
      setMessages(prev => prev.filter(msg => (msg.id || msg.message_id) !== messageId));
      setError('');
    } catch (err) {
      setError('Không thể xóa tin nhắn');
      console.error('Error deleting message:', err);
    }
  };

  // Xóa email
  const deleteEmail = async (email) => {
    try {
      // Priyo Email không có API xóa email, chỉ xóa khỏi local state
      setCurrentEmail(null);
      saveEmailToStorage(null); // Xóa khỏi localStorage
      setMessages([]);
      setError('');
      setExpandedMessage(null); // Đóng tin nhắn nếu đang mở
    } catch (err) {
      setError('Không thể xóa email');
      console.error('Error deleting email:', err);
    }
  };

  // Copy email vào clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  // Toggle mở/đóng tin nhắn
  const toggleMessage = (messageId) => {
    if (expandedMessage === messageId) {
      setExpandedMessage(null);
    } else {
      setExpandedMessage(messageId);
    }
  };

  // Format thời gian
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Không xác định';
    
    if (timestamp.datediff) {
      return timestamp.datediff;
    }
    
    if (timestamp.date) {
      return timestamp.date;
    }
    
    return 'Không xác định';
  };

  // Lấy tên người gửi
  const getSenderName = (message) => {
    if (message.sender_name) return message.sender_name;
    if (message.sender_email) return message.sender_email;
    if (message.from) return message.from;
    return 'Không xác định';
  };

  // Auto refresh tin nhắn mỗi 5 giây
  useEffect(() => {
    let interval;
    if (currentEmail?.email) {
      interval = setInterval(() => {
        fetchMessages(currentEmail.email);
      }, 5000); // Refresh mỗi 5 giây
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentEmail?.email]);

  // Load domains và tin nhắn khi component mount
  useEffect(() => {
    fetchDomains();
    
    // Tự động tạo email ngẫu nhiên khi vào web lần đầu
    if (!currentEmail) {
      generateRandomEmail();
    } else {
      // Nếu có email đã lưu, tự động lấy tin nhắn
      fetchMessages(currentEmail.email);
    }
  }, []); // Chỉ chạy 1 lần khi mount

  return (
    <div className="app-container">
      <div className="app-wrapper">
        {/* Header */}
        <div className="app-header">
          <h1 className="app-title">
            <Mail className="header-icon" />
            Temp Mail Asia
          </h1>
          <p className="app-subtitle">Email tạm thời an toàn và miễn phí</p>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Email Generation Section */}
          <div className="content-card">
            <h2 className="section-title">
              Email Tạm Thời
            </h2>
            <div className="email-buttons">
              <button
                onClick={generateRandomEmail}
                disabled={loading}
                className={`generate-btn random ${loading ? 'loading' : ''}`}
              >
                {loading ? 'Đang tạo...' : 'Thay đổi Email'}
              </button>
              <button
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="generate-btn custom"
              >
                {showCustomForm ? 'Ẩn Form Tùy Chỉnh' : 'Tạo Email Tùy Chỉnh'}
              </button>
            </div>

            {/* Custom Email Form */}
            {showCustomForm && (
              <div className="custom-form">
                <h3 className="form-title">Tùy chỉnh Email</h3>
                
                {/* Domains List */}
                <div className="domains-section">
                  <h4 className="domains-title">Danh sách Domain có sẵn:</h4>
                  <div className="domains-list">
                    {domains.map((domain, index) => (
                      <span
                        key={index}
                        className="domain-tag"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Tên người dùng
                    </label>
                    <input
                      type="text"
                      value={customUsername}
                      onChange={(e) => setCustomUsername(e.target.value)}
                      placeholder="Nhập tên người dùng..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Chọn Domain
                    </label>
                    <select
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                      className="form-input"
                    >
                      <option value="">Chọn domain...</option>
                      {domains.map((domain, index) => (
                        <option key={index} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={generateCustomEmail}
                  disabled={!customUsername.trim() || !selectedDomain}
                  className="custom-submit-btn"
                >
                  Tạo Email Tùy Chỉnh
                </button>
              </div>
            )}

            {currentEmail && (
              <div className="email-info">
                <div className="email-header">
                  <h3 className="email-title">Email đã tạo:</h3>
                  {currentEmail.isCustom && (
                    <span className="custom-badge">
                      Tùy chỉnh
                    </span>
                  )}
                </div>
                <div className="email-details">
                  <div className="email-row">
                    <span className="email-label">Email:</span>
                    <div className="email-value">
                      <span className="email-address">{currentEmail.email}</span>
                      <button
                        onClick={() => copyToClipboard(currentEmail.email)}
                        className="copy-btn"
                        title="Copy email"
                      >
                        {copied ? <CheckCircle className="copy-icon" /> : <Copy className="copy-icon" />}
                      </button>
                    </div>
                  </div>
                  {currentEmail.password && (
                    <div className="email-row">
                      <span className="email-label">Mật khẩu:</span>
                      <div className="email-value">
                        <span className="email-password">{currentEmail.password}</span>
                        <button
                          onClick={() => copyToClipboard(currentEmail.password)}
                          className="copy-btn"
                          title="Copy password"
                        >
                          {copied ? <CheckCircle className="copy-icon" /> : <Copy className="copy-icon" />}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="email-row">
                    <span className="email-label">Trạng thái:</span>
                    <span className="email-status">Email tạm thời đã sẵn sàng nhận tin nhắn</span>
                  </div>
                </div>
                <div className="email-actions">
                  <button
                    onClick={() => deleteEmail(currentEmail.email)}
                    className="delete-email-btn"
                  >
                    <Trash2 className="btn-icon" />
                    Xóa Email
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages Section */}
          {currentEmail && (
            <div className="messages-section">
              <div className="messages-header">
                <h2 className="messages-title">
                  Tin nhắn cho {currentEmail.email}
                </h2>
                <div className="messages-controls">
                  <button
                    onClick={() => fetchMessages(currentEmail.email)}
                    disabled={loading}
                    className={`refresh-messages-btn ${loading ? 'loading' : ''}`}
                  >
                    <RefreshCw className="btn-icon" />
                    Làm mới
                  </button>
                </div>
              </div>

              {messages.length === 0 ? (
                <div className="no-messages">
                  <Mail className="no-messages-icon" />
                  <p className="no-messages-title">Chưa có tin nhắn nào</p>
                  <p className="no-messages-subtitle">Tin nhắn sẽ xuất hiện ở đây khi có người gửi email đến</p>
                </div>
              ) : expandedMessage === null ? (
                /* Hiển thị danh sách tin nhắn */
                <div>
                  {/* Table Header */}
                  <div className="messages-table-header">
                    <div className="messages-table-row">
                      <div className="sender-column">NGƯỜI GỬI</div>
                      <div className="subject-column">TIÊU ĐỀ</div>
                      <div className="actions-column">CÀI ĐẶT</div>
                    </div>
                  </div>

                  {/* Messages List */}
                  <div className="messages-table">
                    {messages.map((message, index) => {
                      const messageId = message.id || message.message_id || index;
                      
                                            return (
                        <div key={index} className="message-row">
                          {/* Message Row */}
                          <div 
                            className="message-content"
                            onClick={() => toggleMessage(messageId)}
                          >
                            {/* Người gửi */}
                            <div className="sender-info">
                              <div className="sender-avatar">
                                <span className="sender-initials">
                                  {getSenderName(message).substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div className="sender-details">
                                <p className="sender-name">
                                  {getSenderName(message)}
                                </p>
                                <p className="sender-email">
                                  {message.sender_email || message.from || 'Không có email'}
                                </p>
                              </div>
                            </div>

                            {/* Tiêu đề */}
                            <div className="subject-info">
                              <p className="subject-text">
                                {message.subject || 'Không có chủ đề'}
                              </p>
                              <p className="subject-time">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>

                            {/* Cài đặt */}
                            <div className="message-actions">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMessage(messageId);
                                }}
                                className="delete-message-btn"
                                title="Xóa tin nhắn"
                              >
                                <Trash2 className="btn-icon" />
                              </button>
                              <div className="expand-arrow">
                                <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Hiển thị nội dung tin nhắn chi tiết */
                <div className="message-detail-container">
                  {/* Header với nút quay lại */}
                  <div className="message-detail-header">
                    <div className="message-detail-controls">
                      <button
                        onClick={() => setExpandedMessage(null)}
                        className="back-btn"
                      >
                        <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>QUAY LẠI DANH SÁCH</span>
                      </button>
                      <div className="message-detail-actions">
                        <button
                          onClick={() => deleteMessage(expandedMessage)}
                          className="delete-detail-btn"
                        >
                          Xoá
                        </button>
                        <button className="source-btn">
                          Nguồn
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nội dung email */}
                  <div className="message-detail-content">
                    {/* Thông tin người gửi */}
                    <div className="sender-detail-info">
                      <div className="sender-detail-avatar">
                        <span className="sender-detail-initials">
                          {getSenderName(messages.find(m => (m.id || m.message_id) === expandedMessage) || {})}
                        </span>
                      </div>
                      <div className="sender-detail-details">
                        <h3 className="sender-detail-name">
                          {getSenderName(messages.find(m => (m.id || m.message_id) === expandedMessage) || {})}
                        </h3>
                        <p className="sender-detail-email">
                          {messages.find(m => (m.id || m.message_id) === expandedMessage)?.sender_email || 
                           messages.find(m => (m.id || m.message_id) === expandedMessage)?.from || 'Không có email'}
                        </p>
                      </div>
                      <div className="sender-detail-date">
                        <p className="date-label">Ngày:</p>
                        <p className="date-value">
                          {formatTime(messages.find(m => (m.id || m.message_id) === expandedMessage)?.timestamp)}
                        </p>
                      </div>
                    </div>

                    {/* Tiêu đề và nội dung */}
                    <div className="message-content-section">
                      <p className="message-subject">
                        Tiêu đề: {messages.find(m => (m.id || m.message_id) === expandedMessage)?.subject || 'Không có chủ đề'}
                      </p>
                      <div className="email-content-wrapper">
                        <div 
                          className="email-content-inner"
                          dangerouslySetInnerHTML={{ 
                            __html: messages.find(m => (m.id || m.message_id) === expandedMessage)?.content || 
                                     messages.find(m => (m.id || m.message_id) === expandedMessage)?.body || 
                                     messages.find(m => (m.id || m.message_id) === expandedMessage)?.text || 'Không có nội dung' 
                          }}
                        />
                      </div>
                    </div>

                    {/* Attachments nếu có */}
                    {(() => {
                      const currentMessage = messages.find(m => (m.id || m.message_id) === expandedMessage);
                      return currentMessage?.attachments && currentMessage.attachments.length > 0 ? (
                        <div className="attachments-section">
                          <h6 className="attachments-title">Tệp đính kèm:</h6>
                          <div className="attachments-list">
                            {currentMessage.attachments.map((attachment, idx) => (
                              <div key={idx} className="attachment-item">
                                <svg className="attachment-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span className="attachment-name">{attachment.name || `Tệp ${idx + 1}`}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="error-display">
              <AlertCircle className="error-icon" />
              <span className="error-text">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="app-footer">
          <p>© 2024 Temp Mail Asia - Email tạm thời an toàn</p>
        </div>
      </div>
    </div>
  );
}

export default App; 