import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Plans from './pages/Plans';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import SubscriptionCheckout from './pages/SubscriptionCheckout';
import Transactions from './pages/Transactions';
import "./App.css";
import Checkout from './pages/Checkout';
import Subscriptions from './pages/Subscriptions';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Plans />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/subscribe/:planType/:priceId" element={<SubscriptionCheckout />} />
          <Route path="/success" element={<SubscriptionSuccess />} />
          <Route path="/cancel" element={<Plans />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;