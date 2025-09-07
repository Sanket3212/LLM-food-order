// ChatUI.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { CartItem } from "./types";

interface ChatUIProps {
  onConfirm: (items: CartItem[], total: number) => void;
}

interface ChatMessage {
  sender: "user" | "assistant" | "system";
  text: string;
  data?: any;
  timestamp: Date;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  available: boolean;
}

const API_BASE = 'https://backend-llm-production-afb7.up.railway.app';

export default function ChatUI({ onConfirm }: ChatUIProps) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { sender: "assistant", text: "Welcome! What would you like to order today? Type 'menu' to see our options or just tell me what you'd like!", timestamp: new Date() },
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Ref for auto-scrolling to bottom
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMenu();
    fetchCart();
  }, []);

  // Auto-scroll to bottom when chat history updates
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMenu = async () => {
    try {
      const response = await fetch(`${API_BASE}/menu`);
      const data = await response.json();
      setMenu(data.menu || []);
    } catch (error) {
      addToChatHistory('system', 'Failed to load menu. Please check your connection.');
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE}/cart`);
      const data = await response.json();
      setCart(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      // Silent fail for initial cart fetch
    }
  };

  const addToChatHistory = (sender: ChatMessage["sender"], text: string, data: any = null) => {
    setChatHistory(prev => [...prev, { sender, text, data, timestamp: new Date() }]);
  };

  const processOrder = async () => {
    if (!message.trim()) return;
    setLoading(true);
    addToChatHistory('user', message);

    try {
      const response = await fetch(`${API_BASE}/process-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      if (response.ok) {
        setCart(data.items || []);
        setTotal(data.total || 0);
        
        let responseMessage = data.message || "I've updated your order!";
        
        // Handle different intents
        if (data.intent === 'ask_menu') {
          responseMessage = "Here's our menu! You can order by saying things like 'I want 2 chicken sandwiches' or 'Add a burger to my cart'";
          // Display menu items in chat
          if (menu.length > 0) {
            const menuText = menu
              .filter(item => item.available)
              .map(item => `• ${item.name} - $${item.price.toFixed(2)}`)
              .join('\n');
            responseMessage += '\n\n' + menuText;
          }
        } else if (data.intent === 'add_item') {
          responseMessage = `Great! I've added ${data.message} to your cart. Your total is now $${data.total.toFixed(2)}. Would you like anything else?`;
        } else if (data.intent === 'remove_item') {
          responseMessage = `I've removed that from your cart. Your total is now $${data.total.toFixed(2)}.`;
        } else if (data.intent === 'view_cart') {
          if (cart.length > 0) {
            const cartText = data.items.map((item: CartItem) => 
              `• ${item.qty}x ${item.name} - $${(item.price * item.qty).toFixed(2)}`
            ).join('\n');
            responseMessage = `Here's your current cart:\n${cartText}\n\nTotal: $${data.total.toFixed(2)}`;
          } else {
            responseMessage = "Your cart is empty. What would you like to order?";
          }
        } else if (data.intent === 'checkout' || message.toLowerCase().includes('confirm')) {
          if (cart.length > 0) {
            responseMessage = `Perfect! Your order total is $${data.total.toFixed(2)}. I'm confirming your order now...`;
            setTimeout(() => {
              onConfirm(cart, total);
              setOrderConfirmed(true);
            }, 1500);
          } else {
            responseMessage = "Your cart is empty. Please add some items before checking out.";
          }
        }
        
        addToChatHistory('assistant', responseMessage, data);
      } else {
        addToChatHistory('system', `Error: ${data.error || 'Failed to process your order'}`);
      }
    } catch (error) {
      addToChatHistory('system', 'Failed to process order. Please try again.');
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch(`${API_BASE}/cart/clear`, { method: 'POST' });
      if (response.ok) {
        setCart([]);
        setTotal(0);
        addToChatHistory('system', 'Cart cleared successfully!');
      }
    } catch (error) {
      addToChatHistory('system', 'Failed to clear cart.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      processOrder();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold">Food Order Chat</h2>
        {cart.length > 0 && !orderConfirmed && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Cart: {cart.length} items | Total: ${total.toFixed(2)}
            </span>
            <button
              onClick={clearCart}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
      
      {/* Chat container with proper scrolling */}
      <div className="flex-1 border rounded-lg bg-gray-50 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-xl max-w-md ${
                msg.sender === "user"
                  ? "bg-pink-600 text-white"
                  : msg.sender === "system"
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  : "bg-gray-200 text-black"
              }`}>
                <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                {msg.sender === "assistant" && loading && idx === chatHistory.length - 1 && (
                  <div className="flex gap-1 mt-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-xl bg-gray-200">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          {/* Invisible div to scroll to */}
          <div ref={chatEndRef} />
        </div>
      </div>
      
      <div className="flex mt-4 gap-2 flex-shrink-0">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
          placeholder="Type 'menu' to see options, or tell me what you'd like..."
          rows={2}
          disabled={loading || orderConfirmed}
        />
        <button
          onClick={processOrder}
          disabled={loading || !message.trim() || orderConfirmed}
          className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          ) : (
            'Send'
          )}
        </button>
      </div>
      
      {/* Quick action buttons */}
      <div className="flex gap-2 mt-2 flex-shrink-0">
        <button
          onClick={() => setMessage("Show me the menu")}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          📋 Menu
        </button>
        <button
          onClick={() => setMessage("What's in my cart?")}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          🛒 View Cart
        </button>
        {cart.length > 0 && (
          <button
            onClick={() => setMessage("I want to checkout")}
            className="px-3 py-1 text-sm bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-full transition-colors"
          >
            ✅ Checkout
          </button>
        )}
      </div>
    </div>
  );
}