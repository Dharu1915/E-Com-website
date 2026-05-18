import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CheckCircle2, CreditCard, Wallet, Banknote } from 'lucide-react';

export default function Checkout() {
  const { cart, clearCart, token } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const subtotal = cart.reduce((acc, item) => {
    const discountedPrice = item.price - (item.price * item.discount) / 100;
    return acc + discountedPrice * item.quantity;
  }, 0);

  const handlePlaceOrder = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          total: subtotal,
        }),
      });
      if (res.ok) {
        clearCart();
        setStep(3);
      }
    } catch (error) {
      console.error('Failed to place order', error);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Thank you for shopping with us. Your order is being processed and will be delivered soon.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-pink-600 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-12">
        <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-pink-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 ${step >= 1 ? 'bg-pink-100 text-pink-600' : 'bg-gray-100'}`}>1</div>
          <span className="text-sm font-medium">Address</span>
        </div>
        <div className={`flex-1 h-1 mx-4 rounded-full ${step >= 2 ? 'bg-pink-600' : 'bg-gray-200'}`} />
        <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-pink-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 ${step >= 2 ? 'bg-pink-100 text-pink-600' : 'bg-gray-100'}`}>2</div>
          <span className="text-sm font-medium">Payment</span>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Address</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition-all" defaultValue="John" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition-all" defaultValue="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition-all" defaultValue="123 Fashion Street" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition-all" defaultValue="Mumbai" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition-all" defaultValue="400001" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-900 transition-colors mt-8"
            >
              Continue to Payment
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
          
          <div className="space-y-4 mb-8">
            <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:border-pink-300'}`}>
              <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-pink-600 focus:ring-pink-600" />
              <div className="ml-4 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-gray-600" />
                <span className="font-medium text-gray-900">Credit / Debit Card</span>
              </div>
            </label>
            
            <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:border-pink-300'}`}>
              <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-pink-600 focus:ring-pink-600" />
              <div className="ml-4 flex items-center gap-3">
                <Wallet className="w-6 h-6 text-gray-600" />
                <span className="font-medium text-gray-900">UPI (GPay, PhonePe)</span>
              </div>
            </label>

            <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:border-pink-300'}`}>
              <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-pink-600 focus:ring-pink-600" />
              <div className="ml-4 flex items-center gap-3">
                <Banknote className="w-6 h-6 text-gray-600" />
                <span className="font-medium text-gray-900">Cash on Delivery</span>
              </div>
            </label>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-8">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Amount to Pay</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handlePlaceOrder}
              className="flex-1 bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-pink-600 transition-colors"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
