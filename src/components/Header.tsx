import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, LogOut, LogIn } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Header() {
  const cart = useStore((state) => state.cart);
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const navigate = useNavigate();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button className="p-2 -ml-2 mr-2 md:hidden text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="text-2xl font-bold tracking-tighter text-black">
              FASHIONHUB<span className="text-pink-600">.</span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            {['Men', 'Women', 'Kids', 'Beauty', 'Home'].map((item) => (
              <Link
                key={item}
                to={`/category/${item.toLowerCase()}`}
                className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search FashionHub"
                className="bg-transparent border-none outline-none text-sm ml-2 w-48"
              />
            </div>
            <button className="p-2 text-gray-600 hover:text-black transition-colors md:hidden">
              <Search className="w-5 h-5" />
            </button>
            {user ? (
              <div className="hidden sm:flex items-center space-x-2">
                <Link to="/profile" className="p-2 text-gray-600 hover:text-black transition-colors">
                  <User className="w-5 h-5" />
                </Link>
                <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-black transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
            <Link to="/wishlist" className="p-2 text-gray-600 hover:text-black transition-colors hidden sm:block">
              <Heart className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="p-2 text-gray-600 hover:text-black transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-pink-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
