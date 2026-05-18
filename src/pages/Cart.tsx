import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useStore();

  const subtotal = cart.reduce((acc, item) => {
    const discountedPrice = item.price - (item.price * item.discount) / 100;
    return acc + discountedPrice * item.quantity;
  }, 0);

  const totalDiscount = cart.reduce((acc, item) => {
    return acc + (item.price * item.discount / 100) * item.quantity;
  }, 0);

  const totalMRP = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <img src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png" alt="Empty Cart" className="w-16 h-16 opacity-50" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Bag is Empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Looks like you haven't added anything to your bag yet. Start shopping to fill it up!
        </p>
        <Link
          to="/"
          className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-pink-600 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Bag ({cart.length} items)</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        {/* Cart Items */}
        <div className="lg:col-span-8">
          <ul className="divide-y divide-gray-200 border-t border-gray-200">
            {cart.map((item) => {
              const discountedPrice = item.price - (item.price * item.discount) / 100;
              return (
                <li key={item.id} className="py-6 flex gap-6">
                  <div className="flex-shrink-0 w-24 h-32 sm:w-32 sm:h-40 bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between mb-1">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                          {item.brand}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <Link to={`/product/${item.id}`} className="text-lg font-medium text-gray-900 hover:text-pink-600 line-clamp-2 mb-2">
                        {item.name}
                      </Link>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-xl font-bold text-gray-900">₹{discountedPrice.toFixed(0)}</span>
                        {item.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">₹{item.price}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 mt-10 lg:mt-0">
          <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <dl className="space-y-4 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <dt>Total MRP</dt>
                <dd className="font-medium text-gray-900">₹{totalMRP.toFixed(0)}</dd>
              </div>
              <div className="flex justify-between text-green-600">
                <dt>Discount on MRP</dt>
                <dd className="font-medium">-₹{totalDiscount.toFixed(0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping Fee</dt>
                <dd className="font-medium text-green-600">FREE</dd>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-gray-900">
                <dt>Total Amount</dt>
                <dd>₹{subtotal.toFixed(0)}</dd>
              </div>
            </dl>

            <Link
              to="/checkout"
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shadow-lg shadow-black/20"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              Safe and Secure Payments. Easy returns. 100% Authentic products.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
