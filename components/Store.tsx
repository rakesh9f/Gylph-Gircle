
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDb } from '../hooks/useDb';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import Card from './shared/Card';
import Button from './shared/Button';
import Modal from './shared/Modal';

interface CartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const Store: React.FC = () => {
  const { db, toggleStatus } = useDb();
  const { user } = useAuth();
  const { t, getRegionalPrice } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sortOption, setSortOption] = useState('default');

  const isAdmin = user?.role === 'admin';

  // --- DERIVED STATE ---
  const categories = ['All', ...Array.from(new Set(db.store_items.map((i: any) => i.category || 'General')))];

  const filteredItems = useMemo(() => {
    let items = db.store_items;

    // 1. Admin Filter (Show inactive to admins, hide for users)
    if (!isAdmin) {
      items = items.filter((i: any) => i.status === 'active');
    }

    // 2. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((i: any) => i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q));
    }

    // 3. Category Filter
    if (selectedCategory !== 'All') {
      items = items.filter((i: any) => i.category === selectedCategory);
    }

    // 4. Sort
    if (sortOption === 'price_asc') {
      items = [...items].sort((a: any, b: any) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      items = [...items].sort((a: any, b: any) => b.price - a.price);
    }

    return items;
  }, [db.store_items, isAdmin, searchQuery, selectedCategory, sortOption]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // --- ACTIONS ---
  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      // Mock Image if missing
      const img = item.image_url || `https://source.unsplash.com/random/200x200/?${item.category},spiritual`;
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: img }];
    });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const removeFromCart = (itemId: number | string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: number | string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const getItemDescription = (item: any) => {
    if (item.description && item.description.trim() !== '') {
      return item.description;
    }
    return `Authentic ${item.name} enhances intuition and spiritual connection. Recommended for Sagittarius.`;
  };

  // Generate a consistent placeholder image based on ID if real one missing
  const getImageUrl = (item: any) => {
      if (item.image_url) return item.image_url;
      // Static keywords based on category for Unsplash source (using updated Unsplash API format logic or static placeholder)
      // Since source.unsplash is deprecated/unreliable in some contexts, let's use a robust placeholder or hardcoded logic
      const seed = item.id;
      return `https://images.unsplash.com/photo-1600609842388-3e4b489d71c6?auto=format&fit=crop&w=400&q=80`; // Generic crystal fallback
  };

  return (
    <div className="min-h-screen pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {t('backToHome')}
            </Link>
            <h2 className="text-3xl font-cinzel font-bold text-amber-300">Vedic Inventory</h2>
            <p className="text-amber-200/60 font-lora text-sm">Sacred tools for your journey.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-grow md:flex-grow-0">
                <input 
                    type="text" 
                    placeholder="Search Rudraksha..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-64 bg-black/40 border border-amber-500/30 rounded-full py-2 px-4 text-amber-100 focus:outline-none focus:border-amber-400"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500/50 absolute right-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Cart Trigger */}
            <button 
                onClick={() => setIsCartOpen(true)}
                className="relative bg-amber-600 hover:bg-amber-500 p-2 rounded-full text-white shadow-lg transition-transform hover:scale-110"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                        {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                )}
            </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1 rounded-full text-xs font-bold border transition-colors ${selectedCategory === cat ? 'bg-amber-500 border-amber-500 text-black' : 'bg-transparent border-amber-500/30 text-amber-200 hover:border-amber-400'}`}
              >
                  {cat}
              </button>
          ))}
          <div className="ml-auto">
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-black/40 border border-amber-500/30 rounded px-2 py-1 text-xs text-amber-200 focus:outline-none"
              >
                  <option value="default">Sort by: Default</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
              </select>
          </div>
      </div>

      {/* PRODUCT GRID */}
      {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-amber-200/40">
              <p>The stars show no items matching your search.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item: any) => (
                  <div key={item.id} className={`group relative bg-gray-900 border ${item.status === 'active' ? 'border-amber-500/20' : 'border-red-900/50 opacity-70'} rounded-xl overflow-hidden hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all duration-300 flex flex-col`}>
                      
                      {/* Image Area */}
                      <div className="h-48 overflow-hidden relative">
                          <img 
                            src={getImageUrl(item)} 
                            alt={item.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                          
                          {/* Admin Toggle */}
                          {isAdmin && (
                              <button 
                                onClick={() => toggleStatus('store_items', item.id)}
                                className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded border ${item.status === 'active' ? 'bg-green-900/80 text-green-300 border-green-500' : 'bg-red-900/80 text-red-300 border-red-500'}`}
                              >
                                  {item.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                              </button>
                          )}
                      </div>

                      {/* Content Area */}
                      <div className="p-4 flex flex-col flex-grow">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <h3 className="font-cinzel font-bold text-amber-100 truncate pr-2" title={item.name}>{item.name}</h3>
                                  <span className="text-[10px] text-amber-500 uppercase tracking-widest">{item.category || 'Relic'}</span>
                              </div>
                              <div className="font-mono font-bold text-amber-300">
                                  {getRegionalPrice(item.price).display}
                              </div>
                          </div>
                          
                          <p className="text-xs text-amber-200/60 font-lora mb-4 line-clamp-2 flex-grow">
                              {getItemDescription(item)}
                          </p>

                          <Button 
                            onClick={() => addToCart(item)}
                            disabled={item.status !== 'active'}
                            className="w-full py-2 text-sm bg-gradient-to-r from-amber-700 to-amber-900 border-none shadow-md hover:from-amber-600 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              {item.status === 'active' ? 'Add to Cart' : 'Out of Stock'}
                          </Button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* CART MODAL */}
      <Modal isVisible={isCartOpen} onClose={() => setIsCartOpen(false)}>
          <div className="p-6 bg-gray-900 max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-amber-500/30 pb-4">
                  <h3 className="text-2xl font-cinzel font-bold text-amber-300">Your Cart</h3>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
              </div>

              <div className="flex-grow overflow-y-auto mb-6 pr-2 custom-scrollbar">
                  {cart.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Your spiritual vessel is empty.</p>
                  ) : (
                      <div className="space-y-4">
                          {cart.map(item => (
                              <div key={item.id} className="flex gap-4 items-center bg-black/30 p-3 rounded border border-gray-800">
                                  <div className="flex-grow">
                                      <h4 className="font-bold text-amber-100">{item.name}</h4>
                                      <p className="text-xs text-amber-500">{getRegionalPrice(item.price).display}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                      <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center">-</button>
                                      <span className="text-sm font-mono w-4 text-center">{item.quantity}</span>
                                      <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center">+</button>
                                  </div>
                                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 ml-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              <div className="border-t border-amber-500/30 pt-4">
                  <div className="flex justify-between items-center mb-4 text-lg font-bold text-amber-100">
                      <span>Total</span>
                      <span>{getRegionalPrice(cartTotal).display}</span>
                  </div>
                  <Button className="w-full" disabled={cart.length === 0} onClick={() => alert("Checkout integration pending.")}>
                      Proceed to Checkout
                  </Button>
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default Store;
