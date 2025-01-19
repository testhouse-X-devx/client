// Plans.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countryCode, setCountryCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        const country = response.data.country_code;
        setCountryCode(country);
      } catch (err) {
        console.error('Error detecting country:', err);
        setCountryCode('US');
      }
    };

    fetchCountry();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!countryCode) return;

      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/products/${countryCode}`);
        setPlans(response.data.products);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPlans();
  }, [countryCode]);

  const handleSubscribe = (priceId) => {
    navigate(`/subscribe/${priceId}`);
  };

  if (loading) return <div className="loading-spinner">Loading plans...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="plans-page">
      <div className="plans-header">
        <h1>Choose Your Plan</h1>
        <p className="header-description">Select the perfect plan for your needs</p>
        {countryCode && (
          <div className="location-badge">
            <span className="location-icon">📍</span>
            Showing prices for {countryCode}
          </div>
        )}
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            <div className="plan-card-header">
              <h2>{plan.name}</h2>
              <div className="plan-divider"></div>
            </div>
            
            {plan.prices.map((price) => (
              <div key={price.price_id} className="plan-content">
                <div className="price-tag">
                  <span className="currency">{price.currency}</span>
                  <span className="amount">{price.amount}</span>
                  <span className="interval">per {price.interval}</span>
                </div>
                
                <p className="plan-description">{plan.description}</p>
                
                <button
                  onClick={() => handleSubscribe(price.price_id)}
                  className="subscribe-button"
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;