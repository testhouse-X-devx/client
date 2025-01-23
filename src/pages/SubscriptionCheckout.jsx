import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SubscriptionCheckout = () => {
  const { planType, priceId } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countryCode, setCountryCode] = useState('GB');

  // useEffect(() => {
  //   const fetchCountry = async () => {
  //     try {
  //       const response = await axios.get('https://ipapi.co/json/');
  //       setCountryCode(response.data.country_code);
  //     } catch (err) {
  //       console.error('Error detecting country:', err);
  //     }
  //   };

  //   fetchCountry();
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log("planType",planType)
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/create-checkout-session', {
        email,
        priceId,
        countryCode,
        productType: planType
      });

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
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
                  <span className="loading-dots">Redirecting to Checkout</span>
                </span>
              ) : (
                'Proceed to Checkout'
              )}
            </button>
          </form>

          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;