import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CheckoutProvider,
  PaymentElement,
  useCheckout,
} from "@stripe/react-stripe-js";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// Initialize Stripe with beta flag for custom checkout
const stripe = loadStripe(
  "pk_test_51QfxxdEf1mVEQwuOMByqcQB0hzg7u9OEDF6CW0on4MY54yJT8vJNtVbuUJt9wqTBxNjaHjD93afc3GiUYcDhJmZK00fQ92QlsB",
  {
    betas: ["custom_checkout_beta_5"],
  }
);

const PaymentForm = ({ email, isSubscription, selectedItems }) => {
  const checkout = useCheckout();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await checkout.confirm();
      if (result.type === "error") {
        setError(result.error);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = selectedItems.reduce((sum, item) => {
    return sum + (item.selectedPrice.amount || 0);
  }, 0);
  // Example shipping cost
  const total = subtotal;

  return (
    <div className="checkout-steps">
      {/* Header with Logo */}
      <div className="steps-header">
        <div className="logo">
          <h1>Your Company</h1>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {/* Progress Steps */}

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="payment-element-container">
              <PaymentElement
                options={{
                  layout: "tabs",
                  paymentMethodOrder: ["card", "klarna", "ideal"],
                  // defaultValues: {
                  //   billingDetails: {
                  //     email: email
                  //   }
                  // }
                }}
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error.message}
              </div>
            )}

            <button type="submit" disabled={loading} className="pay-button">
              {loading ? (
                <span className="loading-text">Processing...</span>
              ) : (
                `Pay ${total.toFixed(2)}`
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="order-summary">
          <h2>Order summary</h2>

          <div className="summary-items">
            {selectedItems.map((item, index) => (
              <div key={index} className="summary-item">
                <div className="item-image">
                  <img src="/placeholder.png" alt={item.name} />
                </div>
                <div className="item-details">
                  <div className="item-name">{item.name}</div>
                  <div className="item-credits">
                    {typeof item.credits === "object" ? (
                      <>
                        <div>Test Cases: {item.credits.test_case}</div>
                        <div>User Stories: {item.credits.user_story}</div>
                      </>
                    ) : (
                      `${item.credits} Credits`
                    )}
                  </div>
                </div>
                {isSubscription && (
                  <div className="subscription-info">
                    <span className="subscription-icon">🔄</span>
                    <span className="subscription-text">
                      Renews every 3 months
                    </span>
                    <div className="subscription-detail">
                      Next renewal:{" "}
                      {new Date(
                        Date.now() + 90 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString()}
                    </div>
                  </div>
                )}
                <div className="item-price">{item.price?.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="subtotal">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            <div className="total">
              <span>Total</span>
              <span>{total.toFixed(2)}</span>
            </div>
          </div>

          {/* <div className="promo-code">
            <input type="text" placeholder="Promo code" />
            <button type="button" className="apply-button">Apply</button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

const CustomCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get email and selected items from location state
  const email = location.state?.email;
  const selectedItems = location.state?.items || [];
  const isSubscription = location.state?.isSubscription || false;

  useEffect(() => {
    if (!email || !selectedItems.length) {
      navigate("/");
      return;
    }

    const createCheckoutSession = async () => {
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/api/create-checkout-session",
          {
            email,
            countryCode: "US",
            isSubscription,
            items: selectedItems.map((item) => ({
              priceId: item.priceId,
              credits: item.credits,
            })),
          }
        );

        setClientSecret(response.data.clientSecret);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to initialize checkout");
      } finally {
        setLoading(false);
      }
    };

    createCheckoutSession();
  }, [email, selectedItems, isSubscription, navigate]);

  if (loading) {
    return <div className="loading">Initializing checkout...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate("/")} className="back-button">
          ← Back to Plans
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <div className="checkout-page">
      <CheckoutProvider stripe={stripe} options={{ clientSecret }}>
        <PaymentForm
          email={email}
          isSubscription={isSubscription}
          selectedItems={selectedItems}
        />
      </CheckoutProvider>
    </div>
  );
};

export default CustomCheckout;
