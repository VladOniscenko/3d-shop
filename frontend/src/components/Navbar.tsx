import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in on mount and whenever the component updates
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Materials", path: "/materials" },
    { name: "Gallery", path: "/gallery" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "FAQ", path: "/faq" },
  ];

  // If logged in, add "My Orders" to the navigation
  const visibleLinks = isLoggedIn
    ? [...navLinks, { name: "My Orders", path: "/orders" }]
    : navLinks;

  return (
    <nav className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <Logo />

      {/* Desktop Links */}
      <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
        {visibleLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="hover:text-emerald-700 transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-4">
        <button
          onClick={() => navigate("/cart")}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative"
        >
          <ShoppingCart size={20} />
        </button>

        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-block"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 text-sm font-medium bg-[#133827] text-white rounded-lg hover:bg-[#1c4d37] transition-colors inline-block"
            >
              Get Started
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/quote"
              className="px-5 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              New Print
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Log Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="lg:hidden p-2 text-gray-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 p-4 flex flex-col gap-4 absolute top-full left-0 w-full z-40 shadow-lg">
          {visibleLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-700 font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-gray-100" />

          {!isLoggedIn ? (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full px-5 py-2.5 text-sm font-medium border border-gray-300 rounded-lg text-center"
            >
              Log In
            </Link>
          ) : (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Log Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
