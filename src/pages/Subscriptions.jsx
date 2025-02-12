import React, { useState } from 'react';
import axios from 'axios';

const Subscriptions = () => {
  const [email, setEmail] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const fetchSubscription = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearchSubmitted(true);

    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/subscription?email=${encodeURIComponent(email)}`);
      setSubscription(response.data.subscription);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch subscription');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/create-portal-session', {
        email
      });
      window.location.href = response.data.url;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create portal session');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Subscription</h1>

        {/* Search Form */}
        <form onSubmit={fetchSubscription} className="mb-8">
          <div className="flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-grow px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Subscription Details */}
        {searchSubmitted && !loading && !error && (
          <div className="rounded-lg bg-gray-800 border border-gray-700">
            {subscription ? (
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Active Subscription</h2>
                    <div className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                      subscription.status === 'active' ? 'bg-green-900/50 text-green-400' : 
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold mb-1">
                      {subscription.price.currency} {subscription.price.amount}
                    </div>
                    <div className="text-sm text-gray-400">
                      per {subscription.price.interval_count} {subscription.price.interval}(s)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm text-gray-400 mb-1">Period Start</h3>
                    <p className="text-lg font-semibold">{formatDate(subscription.current_period_start)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-400 mb-1">Period End</h3>
                    <p className="text-lg font-semibold">{formatDate(subscription.current_period_end)}</p>
                  </div>
                </div>

                {subscription.status === 'active' && (
                  <div className="border-t border-gray-700 pt-6">
                    <button
                      onClick={handleManageSubscription}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Manage Subscription
                    </button>
                    {subscription.cancel_at_period_end && (
                      <div className="mt-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
                        <p className="text-sm text-center text-red-400">
                          Your subscription will end on {formatDate(subscription.current_period_end)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">No Active Subscription</h2>
                <p className="text-gray-400">This email doesn't have any active subscription.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;