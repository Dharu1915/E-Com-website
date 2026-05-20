import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { ParticleTerrain } from '../components/ParticleTerrain';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] bg-black overflow-hidden">
        {/* Cinematic procedural particle terrain — sits behind all content, ignores pointer events. */}
        <ParticleTerrain
          particleCount={15000}
          size={26}
          amplitude={0.95}
          turbulence={0.4}
          waveSpeed={0.07}
          pointSize={3.4}
          opacity={0.78}
        />

        {/* Atmospheric vignette for text contrast — does not block clicks. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter">
            NEW<br />ARRIVALS
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl font-light">
            Discover the latest trends in fashion. Curated collections for the modern wardrobe.
          </p>
          <button className="bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-pink-600 hover:text-white transition-all duration-300">
            Shop Collection
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center tracking-tight">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Men', 'Women', 'Kids', 'Accessories'].map((cat) => (
            <div key={cat} className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer">
              <img
                src={`https://picsum.photos/seed/${cat}fashion/600/600`}
                alt={cat}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold tracking-widest uppercase">{cat}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50 rounded-3xl mb-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Trending Now</h2>
            <p className="text-gray-500">Top picks for you</p>
          </div>
          <button className="text-pink-600 font-semibold hover:text-pink-700 transition-colors">
            View All
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
