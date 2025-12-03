import React, { useState, useRef, useEffect } from 'react';
import { Message, MessageRole, RecommendedProduct, WebResult, CartItem, Product } from './types';
import { PRODUCT_CATALOG, INITIAL_GREETING } from './constants';
import { sendMessageToGemini } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import CartDrawer from './components/CartDrawer';
import ComparisonModal from './components/ComparisonModal';
import ProductCard from './components/ProductCard';

// Declare SpeechRecognition types for browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const MOODS = [
  { label: 'Relaxed', emoji: '🧘', prompt: 'I want something relaxing and calming.' },
  { label: 'Energetic', emoji: '⚡', prompt: 'I need energy! Something for a workout or busy day.' },
  { label: 'Party', emoji: '🎉', prompt: 'I am going to a party. Show me trendy fashion or party snacks.' },
  { label: 'Healthy', emoji: '🥗', prompt: 'I am focusing on health. Show me clean, nutritious options.' },
  { label: 'Comfort', emoji: '🛋️', prompt: 'I want comfort food or cozy clothes.' }
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: MessageRole.MODEL,
      text: INITIAL_GREETING,
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Comparison State
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Toggle Dark Mode on Body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Cart Handlers
  const addToCart = (product: RecommendedProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  // Compare Handlers
  const toggleCompare = (product: Product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 items at a time.");
        return prev;
      }
      return [...prev, product];
    });
  };

  // Image Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAttachedImage(base64); 
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAttachment = () => {
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Voice Input Handler
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue((prev) => (prev ? prev + ' ' + transcript : transcript));
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleMoodSelect = (moodPrompt: string, moodLabel: string) => {
    handleSendMessage(undefined, moodPrompt, moodLabel);
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string, moodContext?: string) => {
    e?.preventDefault();
    const textToSend = overrideText || inputValue.trim();
    
    if ((!textToSend && !attachedImage) || isLoading) return;

    const userText = textToSend;
    const userImage = attachedImage ? attachedImage.split(',')[1] : undefined; 
    const displayImage = attachedImage ? attachedImage.split(',')[1] : undefined; 

    setInputValue('');
    clearAttachment();
    
    // Add user message
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: userText,
      image: displayImage
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // Construct history for the service
      const history = messages.map(m => {
        const parts: any[] = [];
        if (m.image) {
          parts.push({ inlineData: { mimeType: 'image/jpeg', data: m.image }});
        }
        if (m.text) {
          parts.push({ text: m.text });
        }
        return {
          role: m.role,
          parts: parts
        };
      });

      // Get response from Gemini with Cart Context and Mood
      const { text: responseTextRaw, webResults } = await sendMessageToGemini(
        history, 
        userText, 
        userImage, 
        cart, 
        moodContext
      );
      
      // Parse response for JSON block (Local Catalog)
      const { cleanText, recommendations } = parseResponse(responseTextRaw);

      const newModelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: cleanText,
        recommendations: recommendations,
        webResults: webResults as WebResult[]
      };

      setMessages(prev => [...prev, newModelMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: "I'm having trouble connecting right now. Please check your internet connection and try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract JSON from the text response
  const parseResponse = (rawText: string): { cleanText: string, recommendations?: RecommendedProduct[] } => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = rawText.match(jsonRegex);

    if (match && match[1]) {
      try {
        const jsonBlock = JSON.parse(match[1]);
        const cleanText = rawText.replace(jsonRegex, '').trim();
        
        // Map the IDs back to full product objects
        const recommendations: RecommendedProduct[] = jsonBlock.map((item: any) => {
          const fullProduct = PRODUCT_CATALOG.find(p => p.id === item.id);
          if (fullProduct) {
            return {
              ...fullProduct,
              matchScore: item.matchScore,
              reason: item.reason
            };
          }
          return null;
        }).filter(Boolean);

        return { cleanText, recommendations };
      } catch (e) {
        console.error("Failed to parse JSON from model response", e);
        return { cleanText: rawText };
      }
    }
    
    return { cleanText: rawText };
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-2xl transition-colors duration-300 relative border-x border-slate-200 dark:border-slate-800">
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
      />

      {isCompareModalOpen && (
        <ComparisonModal 
          products={compareList} 
          onClose={() => setIsCompareModalOpen(false)} 
          onClear={() => { setCompareList([]); setIsCompareModalOpen(false); }}
        />
      )}

      {/* Compare Float Button */}
      {compareList.length > 0 && !isCompareModalOpen && (
        <div className="fixed bottom-24 right-4 z-40 animate-fade-in-up">
          <button 
            onClick={() => setIsCompareModalOpen(true)}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full font-bold shadow-lg shadow-slate-400/50 dark:shadow-slate-900/50 flex items-center gap-2 transform transition-transform hover:scale-105"
          >
            <span>⚖️ Compare ({compareList.length})</span>
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-rose-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-rose-200 dark:shadow-none transform hover:scale-105 transition-transform">
            S
          </div>
          <div>
            <h1 className="font-bold text-slate-800 dark:text-white text-lg tracking-tight font-heading">ShopGenie</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Online • AI Assistant</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           {/* Dark Mode Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors backdrop-blur-sm"
          >
            {darkMode ? (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          {/* Cart Toggle */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="p-2.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-bounce">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 transition-colors duration-300 scroll-smooth">
        <div className="flex flex-col min-h-full justify-end">
           
           {/* Mood Selectors (Only at top or empty) */}
           {messages.length < 3 && (
             <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Vibe Check</h3>
                <div className="flex gap-3 px-1">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.label}
                      onClick={() => handleMoodSelect(mood.prompt, mood.label)}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-sm hover:scale-105 transition-transform whitespace-nowrap"
                    >
                      <span className="text-lg">{mood.emoji}</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{mood.label}</span>
                    </button>
                  ))}
                </div>
             </div>
           )}

           {/* Intro Hint */}
           {messages.length === 1 && (
            <div className="mb-8 grid grid-cols-2 gap-3 max-w-md mx-auto opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards] animation-delay-300">
               {[
                 "Vegan snacks under ₹300", 
                 "McDonald's Burgers",
                 "Summer cotton outfits",
                 "Latest Nike shoes"
               ].map((hint, idx) => (
                 <button 
                   key={idx}
                   onClick={() => { setInputValue(hint); setTimeout(() => handleSendMessage(undefined, hint), 0); }} 
                   className="text-xs font-medium text-violet-600 dark:text-violet-300 bg-white/60 dark:bg-violet-900/20 hover:bg-white dark:hover:bg-violet-900/40 border border-violet-100 dark:border-violet-800/50 p-4 rounded-xl text-left transition-all hover:scale-[1.02] backdrop-blur-sm shadow-sm"
                 >
                   "{hint}"
                 </button>
               ))}
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              onAddToCart={addToCart}
              cartItemIds={cart.map(c => c.id)}
            >
              {/* Inject Compare Handler into Product Cards within ChatMessage */}
              {(product) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  isInCart={cart.some(c => c.id === product.id)}
                  onToggleCompare={toggleCompare}
                  isCompared={compareList.some(p => p.id === product.id)}
                />
              )}
            </ChatMessage>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-3 mb-6 animate-fade-in-up">
               <div className="px-5 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl rounded-bl-none shadow-sm">
                 <div className="flex gap-1.5">
                   <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 z-20 transition-colors duration-300 backdrop-blur-md">
        
        {/* Attachment Preview */}
        {attachedImage && (
          <div className="absolute bottom-full left-4 mb-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 animate-fade-in-up flex items-start gap-2">
            <img src={attachedImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
            <button 
              onClick={clearAttachment}
              className="p-1 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-rose-100 hover:text-rose-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}

        <form 
          onSubmit={(e) => handleSendMessage(e)}
          className="relative flex items-center gap-2"
        >
          {/* File Input (Hidden) */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
            title="Upload Image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>

          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-4 rounded-full transition-all flex-shrink-0 ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200 scale-110' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            aria-label="Voice Input"
          >
            {isListening ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
              </svg>
            )}
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask or upload image..."}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm md:text-base border border-transparent focus:border-violet-200 dark:focus:border-violet-800 font-medium"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={(!inputValue.trim() && !attachedImage) || isLoading}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 text-white p-4 rounded-full transition-all shadow-md hover:shadow-lg hover:shadow-violet-200 dark:hover:shadow-none disabled:shadow-none flex-shrink-0 transform active:scale-95"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
        <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">ShopGenie AI • Visual Search & Voice</p>
        </div>
      </footer>
    </div>
  );
};

export default App;