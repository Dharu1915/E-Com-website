import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { wishlist } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <img src="https://cdn-icons-png.flaticon.com/512/833/833472.png" alt="Empty Wishlist" className="w-16 h-16 opacity-50" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Save items you love to your wishlist. Review them anytime and easily move them to your bag.
        </p>
        <Link
          to="/"
          className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-pink-600 transition-colors"
        >
          Discover Fashion
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist ({wishlist.length} items)</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
