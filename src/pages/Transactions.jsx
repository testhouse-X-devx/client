import { useState, useEffect } from "react";
import axios from "axios";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  // Filters
  const [selectedType, setSelectedType] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedPrimary, setSelectedPrimary] = useState("");

  const filterOptions = {
    type: [
      { value: "", label: "All Types" },
      { value: "received", label: "Received" },
      { value: "used", label: "Used" },
      { value: "reset", label: "Reset" },
    ],
    source: [
      { value: "", label: "All Sources" },
      { value: "subscription", label: "Subscription" },
      { value: "top_up", label: "Top Up" },
      { value: "trial", label: "Trial" },
      { value: "cancel_subscription", label: "Cancelled" },
    ],
    primary: [
      { value: "", label: "All Categories" },
      { value: "credit", label: "Credits" },
      { value: "scan", label: "Scans" },
    ],
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        let url = `http://127.0.0.1:5000/api/transactions?user_id=2`;

        if (selectedType) url += `&type=${selectedType}`;
        if (selectedSource) url += `&source=${selectedSource}`;
        if (selectedPrimary) url += `&primary=${selectedPrimary}`;

        const response = await axios.get(url);
        setTransactions(response.data.transactions);
        setSummary(response.data.summary);
        setUserData(response.data.user);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedType, selectedSource, selectedPrimary]);

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to format transaction type
  const formatTransactionType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Helper function to format source type
  const formatSourceType = (source) => {
    console.log("sourcee>>", source);
    const sourceMap = {
      subscription: "Subscription",
      top_up: "Top Up",
      trial: "Trial",
      cancel_subscription: "Cancelled",
    };
    return source;
  };

  if (loading)
    return <div className="loading-spinner">Loading transactions...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  const UserInfoSection = ({ userData }) => {
    if (!userData) return null;

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const istDate = new Date(date.getTime() + (5 * 60 + 30) * 60 * 1000);

      // Format the IST date
      return (
        istDate.toLocaleString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }) + " IST"
      );
      if (!dateString) return "N/A";
      return (
        date.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }) + " IST"
      );
    };

    return (
      <div className="user-info-section">
        <div className="user-info-header">
          <h2>Account Information</h2>
          <span className="user-email">{userData.email}</span>
        </div>

        <div className="user-info-grid">
          <div className="info-card">
            <h3>Current Balance</h3>
            <div className="info-stat-grid">
              <div className="info-stat">
                <span className="stat-label">Test Cases</span>
                <span className="stat-value">{userData.current_test_case}</span>
              </div>
              <div className="info-stat">
                <span className="stat-label">User Stories</span>
                <span className="stat-value">
                  {userData.current_user_story}
                </span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3>Validity Status</h3>
            <div className="subscription-info">
              {userData.validity_expiration && (
                <div className="expiration-info">
                  <span className="info-label">Valid Until:</span>
                  <span className="info-value">
                    {formatDate(userData.validity_expiration)}
                  </span>
                  
                </div>
              )}
              <span className="info-label">Is Blocked</span>
                  <span className="info-value">
                    {userData.is_blocked?"Yes":"No"}
                  </span>
            </div>
          </div>

          <div className="info-card">
            <h3>Trial Status</h3>
            <div className="trial-info">
              <div className="status-badge">
                {!userData.has_used_trial ? (
                  <span className="badge available">Available</span>
                ) : userData.trial_end_date ? (
                  <span className="badge active">Active</span>
                ) : (
                  <span className="badge used">Used</span>
                )}
              </div>
              {userData.trial_end_date && (
                <div className="expiration-info">
                  <span className="info-label">Ends On:</span>
                  <span className="info-value">
                    {formatDate(userData.trial_end_date)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="transactions-page">
      <div className="transactions-container">
        <UserInfoSection userData={userData} />
        {/* Header Section */}
        <div className="transactions-header">
          <h1>Transaction History</h1>
          <p className="header-description">
            View and track your credits and scans usage
          </p>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <h3>User Story Summary</h3>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Received:</span>
                <span className="stat-value positive">
                  {summary.total_credits_received}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Used:</span>
                <span className="stat-value negative">
                  {summary.total_credits_used}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Reset:</span>
                <span className="stat-value neutral">
                  {summary.total_credits_reset}
                </span>
              </div>
            </div>
          </div>
          <div className="summary-card">
            <h3>Test Case Summary</h3>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Received:</span>
                <span className="stat-value positive">
                  {summary.total_scans_received}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Used:</span>
                <span className="stat-value negative">
                  {summary.total_scans_used}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Reset:</span>
                <span className="stat-value neutral">
                  {summary.total_scans_reset}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            {filterOptions.type.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="filter-select"
          >
            {filterOptions.source.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={selectedPrimary}
            onChange={(e) => setSelectedPrimary(e.target.value)}
            className="filter-select"
          >
            {filterOptions.primary.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Transactions Table */}
        <div className="transactions-table-container">
          {transactions.length === 0 ? (
            <div className="no-transactions">No transactions found</div>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Action</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Details</th>
                  <th>Reference ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className={`transaction-row ${transaction.transaction_type}`}
                  >
                    <td className="date-cell">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td>
                      <span
                        className={`transaction-type ${transaction.transaction_type}`}
                      >
                        {formatTransactionType(transaction.transaction_type)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`transaction-type ${transaction.transaction_type}`}
                      >
                        {formatSourceType(transaction.source_type)}
                      </span>
                    </td>{" "}
                    {/* Was empty before */}
                    <td
                      className={`transaction-type ${transaction.transaction_type}`}
                    >
                      {transaction.primary_type === "credit"
                        ? "Credits"
                        : "Scans"}{" "}
                      {/* Was empty before */}
                    </td>
                    <td
                      className={`transaction-value ${transaction.transaction_type}`}
                    >
                      {transaction.value}
                    </td>
                    <td className="description-cell" style={{ color: "black" }}>
                      {transaction.description}
                    </td>
                    <td className="id-cell">
                      {transaction.subscription_id ? (
                        <span
                          className="subscription-id"
                          title={transaction.subscription_id}
                        >
                          {transaction.subscription_id}
                        </span>
                      ) : transaction.payment_id ? (
                        <span
                          className="payment-id"
                          title={transaction.payment_id}
                        >
                          {transaction.payment_id}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
