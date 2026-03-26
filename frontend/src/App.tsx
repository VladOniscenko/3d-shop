import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Quote from "./components/Quote";
import Signup from "./components/Signup";
import Materials from "./components/Materials";
import Gallery from "./components/Gallery";
import HowItWorksPage from "./components/HowItWorksPage";
import FAQ from "./components/FAQ";
import Orders from "./components/Orders";
import OrderDetail from "./components/OrderDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
