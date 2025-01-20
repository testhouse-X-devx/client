import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Plans from './pages/Plans';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import SubscriptionCheckout from './pages/SubscriptionCheckout';
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Plans />} />
          <Route path="/subscribe/:priceId" element={<SubscriptionCheckout />} />
          <Route path="/success" element={<SubscriptionSuccess />} />
          <Route path="/cancel" element={<Plans />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;