import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Plans = () => {
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [topUpPlans, setTopUpPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("monthly");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const [subscriptionResponse, topUpResponse] = await Promise.all([
          // Fetch subscription plans
          axios.get(
            `http://127.0.0.1:5000/api/products?plan_duration=${selectedDuration}&type=subscription_plan`
          ),
          // Fetch top-up plans
          axios.get(`http://127.0.0.1:5000/api/products?type=top_up_credits`),
        ]);

        console.log("Subscription Plans:", subscriptionResponse.data);
        console.log("Top-up Plans:", topUpResponse.data);

        setSubscriptionPlans(subscriptionResponse.data.products || []);
        setTopUpPlans(topUpResponse.data.products || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPlans();
  }, [selectedDuration]);

  const handleSubscribe = (priceId) => {
    navigate(`/subscribe/${priceId}`);
  };

  if (loading) return <div className="loading-spinner">Loading plans...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="plans-page">
      <div className="plans-container">
        {/* Header Section */}
        <div className="plans-header">
          <h1>Choose Your Plan</h1>
          <p className="header-description">
            Select the perfect plan for your needs
          </p>

          <div className="duration-selector">
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="duration-dropdown"
            >
              <option value="monthly">Monthly Billing</option>
              <option value="yearly">Annual Billing</option>
            </select>
          </div>
        </div>

        {/* Subscription Plans Section */}
        <div className="section-header">
          <h2>Subscription Plans</h2>
          <p>Choose the subscription that works best for you</p>
        </div>
        <div className="plans-grid">
          {subscriptionPlans.map((plan) => (
            <div key={plan.id} className="plan-card">
              <div className="plan-card-header">
                <h2>{plan.name}</h2>
                <div className="plan-divider"></div>
              </div>

              <div className="plan-content">
                {plan.prices?.map((price) => (
                  <div key={price.price_id} className="price-content">
                    <div className="price-tag">
                      <span className="currency">{price.currency}</span>
                      <span className="amount">{price.amount}</span>
                      <span className="interval">per {price.interval}</span>
                    </div>

                    {/* Main Features */}
                    <div className="features-list">
                      <div className="main-features">
                        <div className="feature-item highlight">
                          <span className="feature-icon">👥</span>
                          <span className="feature-text">
                            <strong>{plan.metadata?.users} Team Members</strong>
                          </span>
                        </div>
                        <div className="feature-item highlight">
                          <span className="feature-icon">💎</span>
                          <span className="feature-text">
                            <strong>
                              {plan.metadata?.base_credit} Monthly Credits
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Marketing Features */}
                      {/* {plan.marketing_features?.length > 0 && (
                        <>
                          <div className="feature-divider"></div>
                          <div className="marketing-features">
                            {plan.marketing_features.map((feature, index) => (
                              <div key={index} className="feature-item">
                                <span className="feature-icon">✓</span>
                                <span className="feature-text">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )} */}
                    </div>

                    <button
                      onClick={() => handleSubscribe(price.price_id)}
                      className="subscribe-button"
                    >
                      Get Started with {plan.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Top Up Credits Section */}
        {topUpPlans.length > 0 && (
          <>
            <div className="section-header top-up-header">
              <h2>Top Up Credits</h2>
              <p>Need more credits? Purchase additional credits here</p>
            </div>
            <div className="plans-grid">
              {topUpPlans.map((plan) => (
                <div key={plan.id} className="plan-card top-up-card">
                  <div className="plan-card-header">
                    <h2>{plan.name}</h2>
                    <div className="plan-divider"></div>
                  </div>

                  <div className="plan-content">
                    {plan.prices?.map((price) => (
                      <div key={price.price_id} className="price-content">
                        <div className="credit-amount">
                          <span className="credit-value">💰{price.credits}</span>
                          <span className="credit-label">Credits</span>
                        </div>

                        <div className="price-tag">
                          <span className="currency">{price.currency}</span>
                          <span className="amount">{price.amount}</span>
                          <span className="price-label">One-time payment</span>
                        </div>

                        <div className="features-list">
                          {/* Show cost per credit if relevant */}
                        
                          {/* Marketing Features */}
                          {plan.marketing_features?.length > 0 && (
                            <>
                              <div className="feature-divider"></div>
                              <div className="marketing-features">
                                {plan.marketing_features.map(
                                  (feature, index) => (
                                    <div key={index} className="feature-item">
                                      <span className="feature-icon">✓</span>
                                      <span className="feature-text">
                                        {feature}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => handleSubscribe(price.price_id)}
                          className="subscribe-button top-up-button"
                        >
                          Purchase {price.credits} Credits
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Plans;
