import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  discount: number;
  image: string;
  category: string;
  rating: number;
  stock: number;
  description: string;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const discountedPrice = product.price - (product.price * product.discount) / 100;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-sm">
            {product.discount}% OFF
          </div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-pink-600 text-pink-600' : 'text-gray-600'}`}
          />
        </button>
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-full bg-black text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Bag
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
          {product.brand}
        </div>
        <Link to={`/product/${product.id}`} className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 hover:text-pink-600 transition-colors">
          {product.name}
        </Link>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">₹{discountedPrice.toFixed(0)}</span>
          {product.discount > 0 && (
            <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
