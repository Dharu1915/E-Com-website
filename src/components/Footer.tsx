import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-16 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 tracking-wider uppercase">FASHIONHUB<span className="text-pink-600">.</span></h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your ultimate destination for fashion and lifestyle. Discover the latest trends and shop with confidence.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/category/men" className="hover:text-pink-600 transition-colors">Men</Link></li>
              <li><Link to="/category/women" className="hover:text-pink-600 transition-colors">Women</Link></li>
              <li><Link to="/category/kids" className="hover:text-pink-600 transition-colors">Kids</Link></li>
              <li><Link to="/category/beauty" className="hover:text-pink-600 transition-colors">Beauty</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-pink-600 transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-pink-600 transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-pink-600 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-pink-600 transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Stay Connected</h4>
            <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for updates and exclusive offers.</p>
            <div className="flex">
              <input type="email" placeholder="Enter your email" className="bg-gray-900 text-white px-4 py-2 rounded-l-lg outline-none w-full focus:ring-1 focus:ring-pink-600" />
              <button className="bg-pink-600 px-4 py-2 rounded-r-lg font-bold hover:bg-pink-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} FashionHub Clone. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
