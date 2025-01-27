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
  const [selectedCurrency, setSelectedCurrency] = useState("US");

  // Currency dropdown
  const currencyOptions = [
    { value: "US", label: "USD" },
    { value: "GB", label: "GBP" },
  ];

  const renderPlanFeatures = (plan, selectedDuration) => (
    <div className="features-list">
      <div className="main-features">
        {plan.type === 'trial' && (
          <div className="feature-item highlight">
            <span className="feature-icon">⏱️</span>
            <span className="feature-text">
              <strong>{plan.metadata?.expiration_in_days} Days Trial</strong>
            </span>
          </div>
        )}
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
              {plan.type === 'trial' 
                ? `${plan.metadata?.base_credits} Credits` 
                : selectedDuration === "monthly"
                ? `${plan.metadata?.base_credits_monthly} Monthly Credits`
                : `${plan.metadata?.base_credits_yearly} Yearly Credits`
              }
            </strong>
          </span>
        </div>
        <div className="feature-item highlight">
          <span className="feature-icon">💎</span>
          <span className="feature-text">
            <strong>
              {plan.type === 'trial'
                ? `${plan.metadata?.base_scans} Scans`
                : selectedDuration === "monthly"
                ? `${plan.metadata?.base_scans_monthly} Monthly Scans`
                : `${plan.metadata?.base_scans_yearly} Yearly Scans`
              }
            </strong>
          </span>
        </div>
      </div>
    </div>
  );


  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const [subscriptionResponse, topUpResponse] = await Promise.all([
          axios.get(
            `http://127.0.0.1:5000/api/products?plan_duration=${selectedDuration}&type=subscription_plan&countryCode=${selectedCurrency}`
          ),
          axios.get(
            `http://127.0.0.1:5000/api/products?type=top_up&countryCode=${selectedCurrency}`
          ),
        ]);
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
  }, [selectedDuration, selectedCurrency]); // Add selectedCurrency

  const handleSubscribe = (planType, priceId) => {
    navigate(`/subscribe/${planType}/${priceId}`);
  };

  if (loading) return <div className="loading-spinner">Loading plans...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="plans-page">
      <div className="plans-container">
        {/* Header Section */}
        <div className="plans-header">
          <h1>Choose Your Plan</h1>
          <div className="header-controls">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="currency-select"
            >
              {currencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <p className="header-description">
            Select the perfect plan for your needs
          </p>

          <div className="billing-toggle">
            <span className="toggle-label">Monthly</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={selectedDuration === "yearly"}
                onChange={() =>
                  setSelectedDuration(
                    selectedDuration === "monthly" ? "yearly" : "monthly"
                  )
                }
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">Annual</span>
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
                {/* {plan.type === "trial" && (
                  <span className="trial-badge">Trial</span>
                )} */}
                <div className="plan-divider"></div>
              </div>

              <div className="plan-content">
                {plan.prices?.map((price) => (
                  <div key={price.price_id} className="price-content">
                    <div className="price-tag">
                      <span className="currency">{price.currency}</span>
                      <span className="amount">{price.amount}</span>
                      <span className="interval">
                        {plan.type === "trial"
                          ? `Trial Period`
                          : `per ${price.interval}`}
                      </span>
                    </div>

                    {renderPlanFeatures(plan, selectedDuration)}

                    <button
                      onClick={() =>
                        handleSubscribe(plan.metadata.type, price.price_id)
                      }
                      className="subscribe-button"
                    >
                      {plan.type === "trial"
                        ? "Start Trial"
                        : `Get Started with ${plan.name}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Scanning Top Up Section */}
        <div className="section-header top-up-header">
          <h2>Top Up Scanning</h2>
          <p>Need more scans? Purchase additional scanning credits here</p>
        </div>
        <div className="plans-grid">
          {topUpPlans
            .filter((plan) => plan.metadata?.top_up_type === "scan")
            .map((plan) => (
              <div key={plan.id} className="plan-card top-up-card">
                {plan.prices?.map((price) => (
                  <div key={price.price_id} className="price-content">
                    {/* <div style={{display:"flex",justifyContent:"center"}}>
                      <span style={{textAlign:"center"}}>{price.credits} Scans</span>
                    
                    </div> */}
                    <div className="price-tag">
                      <span className="currency">
                        {price.currency.toUpperCase()}
                      </span>
                      <span className="amount">{price.amount}</span>
                      <span className="price-label">One-time payment</span>
                    </div>
                    <button
                      onClick={() =>
                        handleSubscribe(plan.metadata.type, price.price_id)
                      }
                      className="subscribe-button top-up-button"
                      style={{ marginBottom: "10px" }}
                    >
                      Purchase {price.credits} Scans
                    </button>
                  </div>
                ))}
              </div>
            ))}
        </div>

        {/* Credits Top Up Section */}
        <div className="section-header top-up-header">
          <h2>Top Up Credits</h2>
          <p>Need more credits? Purchase additional credits here</p>
        </div>
        <div className="plans-grid">
          {topUpPlans
            .filter((plan) => plan.metadata?.top_up_type === "credit")
            .map((plan) => (
              <div key={plan.id} className="plan-card top-up-card">
                {plan.prices?.map((price) => (
                  <div key={price.price_id} className="price-content">
                    <div className="price-tag">
                      <span className="currency">
                        {price.currency.toUpperCase()}
                      </span>
                      <span className="amount">{price.amount}</span>
                      <span className="price-label">One-time payment</span>
                    </div>
                    <button
                      onClick={() =>
                        handleSubscribe(plan.metadata.type, price.price_id)
                      }
                      className="subscribe-button top-up-button"
                    >
                      Purchase {price.credits} Credits
                    </button>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Plans;
