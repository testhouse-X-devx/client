import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countryCode, setCountryCode] = useState('US');

  // Get selected items and subscription status from location state
  const selectedItems = location.state?.items || [];
  const isSubscription = location.state?.isSubscription || false;
  console.log("selectedItems in checkout>>",selectedItems)
  if (!selectedItems.length) {
    // Redirect back to plans if no items selected
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Instead of making API call here, navigate to custom checkout
    // with email and items information
    navigate('/custom-checkout', {
      state: {
        email,
        countryCode,
        isSubscription,
        items: selectedItems.map(item => ({
          priceId: item.priceId,
          credits: item.credits,
          ...item
        }))
      }
    });
  };

  const renderItemCredits = (item) => {
    // Check if it's a trial plan (has test_case and user_story properties)
    if (item.credits && typeof item.credits === 'object' && 'test_case' in item.credits) {
      return (
        <div className="trial-credits">
          <div>Test Cases: {item.credits.test_case}</div>
          <div>User Stories: {item.credits.user_story}</div>
        </div>
      );
    }
    // Regular plan
    return <div className="regular-credits">{item.credits} Credits</div>;
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-card">
          <div className="card-header">
            <h1>Complete Your Purchase</h1>
            <div className="header-divider"></div>
          </div>

          {/* Selected Items Summary */}
          <div className="selected-items-summary">
            <h2>Your Selection</h2>
            {isSubscription && (
              <div className="subscription-notice">
                <span className="subscription-icon">🔄</span>
                <span className="subscription-text">3-Month Auto-Renewal</span>
              </div>
            )}
            <div className="selected-items-list">
              {selectedItems.map((item, index) => (
                <div key={index} className="selected-item">
                  {item.type === 'trial' && (
                    <div className="trial-badge">Trial Plan</div>
                  )}
                  {renderItemCredits(item)}
                  {item.name && <div className="item-name">{item.name}</div>}
                  {isSubscription && !item.type === 'trial' && (
                    <div className="renewal-info">
                      Renews every 3 months
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

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
                className="email-input"
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
                  Processing your purchase
                  <span className="loading-dots"></span>
                </span>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </form>

          <button 
            onClick={() => navigate('/')} 
            className="back-button"
            disabled={loading}
          >
            ← Back to Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;