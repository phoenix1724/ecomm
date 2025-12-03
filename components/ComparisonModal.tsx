import React from 'react';
import { Product } from '../types';

interface ComparisonModalProps {
  products: Product[];
  onClose: () => void;
  onClear: () => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ products, onClose, onClear }) => {
  if (products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in-up border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-heading font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="text-2xl">⚖️</span> Product Comparison
          </h2>
          <div className="flex gap-2">
            <button onClick={onClear} className="text-xs font-medium text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
              Clear All
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto p-6 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {products.map((product) => (
              <div key={product.id} className="w-64 flex flex-col gap-4">
                {/* Image */}
                <div className="h-48 w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 relative group">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                {/* Title & Price */}
                <div className="text-center">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight h-14 flex items-center justify-center">
                    {product.name}
                  </h3>
                  <p className="text-violet-600 dark:text-violet-400 font-bold text-xl mt-1">₹{product.price}</p>
                </div>

                {/* Attributes */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-400">Brand</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{product.brand}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-400">Category</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{product.category}</span>
                  </div>
                  <div className="flex flex-col gap-1 pb-2">
                    <span className="text-slate-400">Tags</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {product.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 text-slate-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Description</span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-4">
                      {product.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;