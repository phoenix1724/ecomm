import React from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, onUpdateQuantity }) => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Your Cart
            <span className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 text-xs px-2 py-0.5 rounded-full">
              {cart.length} Items
            </span>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-4xl">
                🛒
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Your cart is empty</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Ask ShopGenie for recommendations!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl shadow-sm animate-fade-in-up">
                <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 leading-tight line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{item.brand}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-violet-600 dark:text-violet-400">₹{item.price * item.quantity}</span>
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-400 hover:text-rose-500"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-3 text-center">{item.quantity}</span>
                      <button 
                         onClick={() => onUpdateQuantity(item.id, 1)}
                         className="w-6 h-6 flex items-center justify-center rounded-md bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-400 hover:text-emerald-500"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total</span>
              <span className="text-2xl font-bold text-slate-800 dark:text-white">₹{total}</span>
            </div>
            <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-slate-300 dark:shadow-none hover:bg-slate-800 dark:hover:bg-slate-200 transition-all transform active:scale-[0.98]">
              Checkout Now
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;