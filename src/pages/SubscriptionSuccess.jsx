import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setStatus('error');
        return;
      }

      try {
        // You might want to verify the session with your backend
        setStatus('success');
      } catch (error) {
        setStatus('error');
      }
    };

    verifySession();
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="success-page">
        <div className="success-container">
          <div className="loading-spinner">Verifying your subscription...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-card">
          {status === 'success' ? (
            <>
              <div className="success-icon">✓</div>
              <h1>Subscription Successful!</h1>
              <p>Thank you for subscribing. You will receive a confirmation email shortly.</p>
            </>
          ) : (
            <>
              <div className="error-icon">⚠️</div>
              <h1>Verification Failed</h1>
              <p>We couldn't verify your subscription. Please contact support.</p>
            </>
          )}
          
          <button onClick={() => navigate('/')} className="home-button">
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;