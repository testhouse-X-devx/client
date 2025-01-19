// SubscriptionCheckout.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SubscriptionCheckout = () => {
  const { priceId } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/create-subscription-invoice', {
        email,
        priceId,
        countryCode: 'IN'
      });
      setInvoiceDetails(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-card">
          <div className="card-header">
            <h1>Complete Your Subscription</h1>
            <div className="header-divider"></div>
          </div>

          {!invoiceDetails ? (
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? (
                  <span className="loading-text">
                    <span className="loading-dots">Generating Invoice</span>
                  </span>
                ) : (
                  'Generate Invoice'
                )}
              </button>
            </form>
          ) : (
            <div className="invoice-success">
              <div className="success-icon">✓</div>
              <h2>Invoice Generated Successfully</h2>
              
              <div className="invoice-details">
                <div className="detail-row">
                  <span className="detail-label">Amount Due:</span>
                  <span className="detail-value">${invoiceDetails.amount_due}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Due Date:</span>
                  <span className="detail-value">
                    {new Date(invoiceDetails.due_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="action-buttons">
                <a
                  href={invoiceDetails.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-button"
                >
                  View & Pay Invoice
                </a>
                <a
                  href={invoiceDetails.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="secondary-button"
                >
                  Download PDF
                </a>
              </div>
            </div>
          )}

          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;