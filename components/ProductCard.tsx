import React, { useState } from 'react';
import { RecommendedProduct } from '../types';

interface ProductCardProps {
  product: RecommendedProduct;
  onAddToCart: (product: RecommendedProduct) => void;
  isInCart: boolean;
  onToggleCompare: (product: RecommendedProduct) => void;
  isCompared: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isInCart, onToggleCompare, isCompared }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (isInCart) return;
    setIsAdding(true);
    onAddToCart(product);
    setTimeout(() => setIsAdding(false), 1000);
  };

  // Generate fake rating based on match score
  const rating = Math.min(5, Math.max(3.5, product.matchScore / 20));
  const renderStars = () => {
    return Array(5).fill(0).map((_, i) => (
      <svg key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className={`flex flex-col w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden border flex-shrink-0 snap-center transition-all hover:scale-[1.03] duration-300 group hover:shadow-xl hover:shadow-violet-200/50 dark:hover:shadow-violet-900/20 relative
      ${isCompared ? 'border-violet-500 ring-2 ring-violet-500/30' : 'border-slate-100 dark:border-slate-700'}`}>
      
      {/* Compare Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <button 
          onClick={() => onToggleCompare(product)}
          className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all shadow-sm ${
            isCompared 
              ? 'bg-violet-600 border-violet-600 text-white' 
              : 'bg-white/90 border-slate-300 text-transparent hover:border-violet-400'
          }`}
          title="Compare Product"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-slate-700">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Match Score Badge */}
        <div className="absolute top-2 right-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-rose-500 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-900/30 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          {product.matchScore}% Match
        </div>

        {/* Best Seller / Trending Badge (Fake based on score) */}
        {product.matchScore > 90 && (
          <div className="absolute bottom-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm">
            Best Seller
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{product.brand}</span>
          <div className="flex items-center gap-0.5">
             {renderStars()}
             <span className="text-[10px] text-slate-400 ml-1">({Math.floor(Math.random() * 500) + 50})</span>
          </div>
        </div>
        
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2 line-clamp-2 min-h-[2.5em] group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {product.name}
        </h3>

        <div className="mb-3">
          <span className="text-lg font-bold text-slate-900 dark:text-white">₹{product.price}</span>
          <span className="text-xs text-slate-400 line-through ml-2">₹{Math.floor(product.price * 1.2)}</span>
          <span className="text-xs text-green-500 ml-2 font-medium">20% OFF</span>
        </div>
        
        <div className="mt-auto">
          <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg mb-3 border border-slate-100 dark:border-slate-700">
            <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-snug">
              <span className="mr-1 text-violet-500">💡</span> 
              {product.reason}
            </p>
          </div>
          
          <button 
            onClick={handleAdd}
            disabled={isInCart}
            className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md duration-300 flex items-center justify-center gap-2 relative overflow-hidden group/btn
              ${isInCart 
                ? 'bg-emerald-500 text-white cursor-default' 
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-200 dark:shadow-none'
              }`}
          >
            {isInCart ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 animate-bounce">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                </svg>
                In Cart
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;