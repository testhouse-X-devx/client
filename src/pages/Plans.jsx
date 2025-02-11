import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Plans = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = useState('US');

  const currencyOptions = [
    { value: 'US', label: 'USD' },
    { value: 'GB', label: 'GBP' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/api/products?countryCode=${selectedCurrency}&include_trials=true`
        );
        const productsData = response.data.products || [];
        
        // Initialize selected options with the first option for each regular product
        const initialSelectedOptions = {};
        productsData.forEach(product => {
          if (product.type !== 'trial' && product.credit_options?.length > 0) {
            initialSelectedOptions[product.id] = product.credit_options[0].key;
          }
        });
        setSelectedOptions(initialSelectedOptions);
        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCurrency]);

  const handleProductSelect = (product) => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    const hasTrial = selectedProducts.some(p => p.type === 'trial');
    const hasRegular = selectedProducts.some(p => p.type !== 'trial');

    // If trying to select a trial plan when regular plans are selected, or vice versa
    if (!isSelected && ((product.type === 'trial' && hasRegular) || (product.type !== 'trial' && hasTrial))) {
      alert('You cannot mix trial plans with regular plans. Please deselect your current selection first.');
      return;
    }

    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      if (product.type === 'trial') {
        setSelectedProducts([...selectedProducts, {
          ...product,
          selectedPrice: product.price,
          type: 'trial'
        }]);
      } else {
        const selectedOption = selectedOptions[product.id];
        const selectedPrice = product.prices.find(price => price.option === selectedOption);
        setSelectedProducts([...selectedProducts, {
          ...product,
          selectedPrice,
          selectedCredits: product.credit_options.find(opt => opt.key === selectedOption).credits
        }]);
      }
    }
  };

  const handleCheckout = () => {
    if (selectedProducts.length > 0) {
      const items = selectedProducts.map(product => {
        if (product.type === 'trial') {
          return {
            priceId: product.price.price_id,
            credits: product.credits // This will contain both test_case and user_story
          };
        }
        return {
          priceId: product.selectedPrice.price_id,
          credits: product.selectedCredits
        };
      });
      navigate('/checkout', { state: { items } });
    }
  };

  const getTotalAmount = () => {
    return selectedProducts.reduce((total, product) => {
      if (product.type === 'trial') {
        return total + product.price.amount; // Should be 0 for trial
      }
      return total + product.selectedPrice.amount;
    }, 0);
  };

  const renderPlanCard = (product) => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    const isTrial = product.type === 'trial';
    const hasOtherSelections = selectedProducts.length > 0 && 
      !selectedProducts.some(p => p.id === product.id);
    const isDisabled = hasOtherSelections && 
      ((isTrial && selectedProducts.some(p => p.type !== 'trial')) || 
       (!isTrial && selectedProducts.some(p => p.type === 'trial')));

    return (
      <div 
        key={product.id} 
        className={`plan-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
        onClick={() => !isDisabled && handleProductSelect(product)}
      >
        <div className="plan-card-header">
          <h2>{product.name}</h2>
          {isTrial && <span className="trial-badge">Trial</span>}
          <div className="plan-divider"></div>
        </div>

        <div className="plan-content">
          <div className="price-content">
            {!isTrial ? (
              <select
                value={selectedOptions[product.id]}
                onChange={(e) => {
                  e.stopPropagation();
                  setSelectedOptions({
                    ...selectedOptions,
                    [product.id]: e.target.value
                  });
                  if (isSelected) {
                    setSelectedProducts(selectedProducts.map(p => {
                      if (p.id === product.id) {
                        const newPrice = product.prices.find(price => price.option === e.target.value);
                        const newCredits = product.credit_options.find(opt => opt.key === e.target.value).credits;
                        return {
                          ...p,
                          selectedPrice: newPrice,
                          selectedCredits: newCredits
                        };
                      }
                      return p;
                    }));
                  }
                }}
                className="credit-select"
                disabled={isDisabled}
              >
                {product.credit_options.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.credits} Credits
                  </option>
                ))}
              </select>
            ) : (
              <div className="trial-credits">
                <div>Test Cases: {product.credits.test_case}</div>
                <div>User Stories: {product.credits.user_story}</div>
              </div>
            )}

            <div className="price-tag">
              <span className="currency">{selectedCurrency === 'US' ? 'USD' : 'GBP'}</span>
              <span className="amount">
                {isTrial ? '0.00' : 
                  product.prices.find(p => p.option === selectedOptions[product.id])?.amount.toFixed(2)}
              </span>
            </div>

            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">⏱️</span>
                <span className="feature-text">
                  <strong>{product.validity_in_days} Days Validity</strong>
                </span>
              </div>
            </div>

            <div className="selection-indicator">
              {isDisabled ? 'Not Available' : (isSelected ? 'Selected' : 'Click to Select')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-spinner">Loading products...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  // Separate trial and regular products
  const trialProducts = products.filter(product => product.type === 'trial');
  const regularProducts = products.filter(product => product.type !== 'trial' && product.credit_options?.length > 0);

  return (
    <div className="plans-page">
      <div className="plans-container">
        <div className="plans-header">
          <h1>Choose Your Plans</h1>
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
            Select a trial plan or one or more regular plans
          </p>
        </div>

        {trialProducts.length > 0 && (
          <div className="trial-plans-section">
            <h2>Trial Plans</h2>
            <div className="plans-grid">
              {trialProducts.map(renderPlanCard)}
            </div>
          </div>
        )}

        <div className="regular-plans-section">
          <h2>Regular Plans</h2>
          <div className="plans-grid">
            {regularProducts.map(renderPlanCard)}
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="checkout-summary">
            <h2>Selected Plans</h2>
            <div className="selected-plans-list">
              {selectedProducts.map(product => (
                <div key={product.id} className="selected-plan-item">
                  <span>
                    {product.name}
                    {product.type === 'trial' ? 
                      ` - ${product.credits.test_case} Test Cases, ${product.credits.user_story} User Stories` :
                      ` - ${product.selectedCredits} Credits`}
                  </span>
                  <span>
                    {selectedCurrency === 'US' ? 'USD' : 'GBP'} 
                    {product.type === 'trial' ? '0.00' : product.selectedPrice.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="total-amount">
              <span>Total:</span>
              <span>{selectedCurrency === 'US' ? 'USD' : 'GBP'} {getTotalAmount().toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} className="checkout-button">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Plans;