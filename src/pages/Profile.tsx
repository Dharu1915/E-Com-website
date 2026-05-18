import { User, Package, MapPin, CreditCard, LogOut, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Profile() {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        {/* Sidebar */}
        <div className="lg:col-span-3 mb-8 lg:mb-0">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-2xl">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-pink-50 text-pink-600 font-medium transition-colors">
                <User className="w-5 h-5" />
                Profile Info
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
                <Package className="w-5 h-5" />
                Orders
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
                <MapPin className="w-5 h-5" />
                Addresses
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
                <CreditCard className="w-5 h-5" />
                Payment Methods
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
                <Settings className="w-5 h-5" />
                Settings
              </a>
              <div className="h-px bg-gray-200 my-4" />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors">
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-9">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Profile Information</h2>
            
            <form className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition-all" defaultValue={user.name} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition-all" defaultValue={user.email} disabled />
                <p className="mt-2 text-xs text-gray-500">Email address cannot be changed.</p>
              </div>

              <div className="pt-6">
                <button type="button" className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-900 transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
