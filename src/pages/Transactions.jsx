import { useState, useEffect } from "react";
import axios from "axios";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        let url = `http://127.0.0.1:5000/api/transactions?user_id=3`;

        if (selectedType) url += `&type=${selectedType}`;
        if (selectedSource) url += `&source=${selectedSource}`;
        if (selectedPrimary) url += `&primary=${selectedPrimary}`;

        const response = await axios.get(url);
        setTransactions(response.data.transactions);
        setSummary(response.data.summary);
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

  return (
    <div className="transactions-page">
      <div className="transactions-container">
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
            <h3>Credits Summary</h3>
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
            <h3>Scans Summary</h3>
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
                      <span className={`transaction-type ${transaction.transaction_type}`}>
                        {formatSourceType(transaction.source_type)}
                      </span>
                    </td>{" "}
                    {/* Was empty before */}
                    <td className={`transaction-type ${transaction.transaction_type}`}>
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
                    <td className="description-cell" style={{color:"black"}}>
                      {transaction.description}
                    </td>
                    <td className="id-cell">
                      {transaction.subscription_id ? (
                        <span
                          className="subscription-id"
                          title={transaction.subscription_id}
                        >
                          {transaction.subscription_id.slice(-8)}
                        </span>
                      ) : transaction.payment_id ? (
                        <span
                          className="payment-id"
                          title={transaction.payment_id}
                        >
                          {transaction.payment_id.slice(-8)}
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
