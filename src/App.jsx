// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Plans from './pages/Plans';
import SubscriptionCheckout from './pages/SubscriptionCheckout';
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Plans />} />
          <Route path="/subscribe/:priceId" element={<SubscriptionCheckout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// pages/Plans.jsx

// pages/SubscriptionCheckout.jsx
