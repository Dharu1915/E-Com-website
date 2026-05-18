import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Heart, ShoppingBag, Star, Truck, ShieldCheck, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  
  const { addToCart, toggleWishlist, wishlist } = useStore();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const isWishlisted = wishlist.some((item) => item.id === product.id);
  const discountedPrice = product.price - (product.price * product.discount) / 100;
  const images = product.images || [product.image];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        
        {/* Image Gallery Column */}
        <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] scrollbar-hide py-2 lg:py-0">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === idx ? 'border-black' : 'border-transparent'
                }`}
              >
                <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Image View */}
          <div className="flex-1 relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 group">
            <div 
              ref={imgRef}
              className="w-full h-full cursor-zoom-in relative overflow-hidden"
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </AnimatePresence>

              {/* Zoom Overlay */}
              {showZoom && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 hidden lg:block pointer-events-none scale-150 origin-center"
                  style={{
                    backgroundImage: `url(${images[selectedImage]})`,
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    backgroundSize: '250%',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              )}
            </div>

            {product.discount > 0 && (
              <div className="absolute top-4 left-4 bg-pink-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-md shadow-sm z-10">
                {product.discount}% OFF
              </div>
            )}

            {/* Navigation Arrows (Mobile) */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between lg:hidden pointer-events-none">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                }}
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center pointer-events-auto"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                }}
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center pointer-events-auto"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Info Column */}
        <div className="lg:col-span-5 mt-10 lg:mt-0 px-4 sm:px-0">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 font-mono">
              {product.brand}
            </h2>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-medium">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating}</span>
              </div>
              <span className="text-sm text-gray-500 underline decoration-dotted underline-offset-4 cursor-pointer hover:text-black">
                124 Reviews
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-black text-gray-900">₹{discountedPrice.toFixed(0)}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{product.price}</span>
                  <span className="text-sm font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded">
                   SAVE ₹{(product.price - discountedPrice).toFixed(0)}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-8 border-l-2 border-gray-100 pl-4 italic">
              Inclusive of all taxes. Fast shipping enabled.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(product)}
              className="flex-1 bg-black text-white py-4 px-8 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shadow-xl shadow-black/10"
            >
              <ShoppingBag className="w-5 h-5" />
              Add to Bag
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleWishlist(product)}
              className="flex-1 bg-white border-2 border-gray-200 text-gray-900 py-4 px-8 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:border-pink-600 hover:text-pink-600 transition-all"
            >
              <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-pink-600 text-pink-600' : 'text-gray-400'}`} />
              {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </motion.button>
          </div>

          {/* Info Sections */}
          <div className="space-y-8">
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-black rounded-full" />
                Product Details
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</dt>
                  <dd className="text-sm text-gray-900 mt-1">{product.category}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest">Availability</dt>
                  <dd className={`text-sm mt-1 font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
                  </dd>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-6 rounded-3xl">
              {[
                { icon: Truck, label: 'Free Delivery' },
                { icon: RefreshCcw, label: '15 Days Return' },
                { icon: ShieldCheck, label: 'Secure Pay' }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-sm">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tighter">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
