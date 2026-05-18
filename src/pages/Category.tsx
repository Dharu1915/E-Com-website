import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function Category() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?category=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 capitalize">{id} Fashion</h1>
          <p className="text-gray-500">Explore the latest trends in {id}</p>
        </div>
        <div className="flex gap-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-pink-600">
            <option>Sort by: Recommended</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest Arrivals</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h2>
          <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
