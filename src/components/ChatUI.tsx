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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  timestamp: Date;
}

interface MenuItem {
  name: string;
  price: number;
  description: string;
  aliases?: string[];
}

const API_BASE = 'https://backend-llm-production-afb7.up.railway.app';

export default function ChatUI({ onConfirm }: ChatUIProps) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { 
      sender: "assistant", 
      text: "Welcome! What would you like to order today? Type 'menu' to see our options or just tell me what you'd like!", 
      timestamp: new Date() 
    },
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');

  // Ref for auto-scrolling to bottom
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkBackendConnection();
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

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackendConnected(data.status === 'healthy');
        console.log('Backend health:', data);
      } else {
        setBackendConnected(false);
        console.error('Backend health check failed:', response.status);
      }
    } catch (error) {
      setBackendConnected(false);
      console.error('Backend connection failed:', error);
      addToChatHistory('system', 'Warning: Unable to connect to backend. Some features may not work.');
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await fetch(`${API_BASE}/menu`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMenu(data.menu || []);
        console.log('Menu loaded:', data.menu);
      } else {
        console.error('Failed to fetch menu:', response.status);
        throw new Error('Menu fetch failed');
      }
    } catch (error) {
      console.error('Menu fetch error:', error);
      addToChatHistory('system', 'Failed to load menu. Please check your connection.');
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE}/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCart(data.items || []);
        setTotal(data.total || 0);
        console.log('Cart loaded:', data);
      }
    } catch (error) {
      console.error('Cart fetch error:', error);
      // Silent fail for initial cart fetch
    }
  };

  // Generate order number
  const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  };

  // Create MantisBT ticket for the order using the secure API endpoint
  const createOrderTicket = async (orderNum: string, cartItems: CartItem[], orderTotal: number) => {
    try {
      // Create order items string
      const orderItems = cartItems.map(item => 
        `• ${item.qty}x ${item.name} - $${item.price.toFixed(2)} each = $${(item.qty * item.price).toFixed(2)}`
      ).join('\n');

      const orderData = {
        orderNumber: orderNum,
        items: orderItems,
        total: orderTotal,
        timestamp: new Date().toISOString()
      };

      console.log('Creating MantisBT ticket via API endpoint:', { orderNumber: orderNum, total: orderTotal });

      const response = await fetch('/api/create-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        const issueId = data.issueId;
        console.log('MantisBT ticket created successfully:', issueId);
        addToChatHistory('system', `✅ Order ticket created successfully! Ticket ID: ${issueId}`);
        return issueId;
      } else {
        const errorMessage = data.error || 'Failed to create ticket';
        console.error('Ticket creation API Error:', data);
        addToChatHistory('system', `⚠️ Failed to create order ticket: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating MantisBT ticket:', error);
      addToChatHistory('system', `❌ Error creating order ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addToChatHistory = (sender: ChatMessage["sender"], text: string, data: any = null) => {
    setChatHistory(prev => [...prev, { sender, text, data, timestamp: new Date() }]);
  };

  const processOrder = async () => {
    if (!message.trim()) return;
    
    if (!backendConnected) {
      addToChatHistory('system', 'Backend is not available. Please try again later.');
      return;
    }

    setLoading(true);
    addToChatHistory('user', message);
    
    const userMessage = message.trim();
    setMessage(''); // Clear input immediately

    try {
      console.log('Sending to backend:', userMessage);
      
      const response = await fetch(`${API_BASE}/process-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      console.log('Backend response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Backend response data:', data);

      // Update cart state from backend response
      if (data.cart) {
        setCart(data.cart);
        setTotal(data.total || 0);
      } else if (data.items) {
        setCart(data.items);
        setTotal(data.total || 0);
      }

      // Use the backend's message directly - don't override it
      let responseMessage = data.message || "I've processed your request!";
      
      // Only enhance specific intents, don't override the backend message
      if (data.intent === 'ask_menu' && data.menu) {
        const menuText = data.menu
          .map((item: MenuItem) => `• ${item.name} - $${item.price.toFixed(2)} - ${item.description}`)
          .join('\n');
        responseMessage += '\n\n' + menuText;
      } else if (data.intent === 'view_cart' && data.cart && data.cart.length > 0) {
        const cartText = data.cart.map((item: CartItem) => 
          `• ${item.qty}x ${item.name} - $${item.price.toFixed(2)}`
        ).join('\n');
        responseMessage += `\n\n${cartText}`;
      } else if (data.intent === 'finalize_order') {
        if (data.order_summary) {
          const newOrderNumber = generateOrderNumber();
          setOrderNumber(newOrderNumber);
          
          responseMessage = `Order confirmed! ${data.message}\nOrder Number: ${newOrderNumber}`;
          
          // Create MantisBT ticket asynchronously
          setTimeout(async () => {
            try {
              await createOrderTicket(newOrderNumber, cart, total);
              onConfirm(cart, total);
              setOrderConfirmed(true);
            } catch (error) {
              console.error('Failed to create ticket, but order is still confirmed');
              onConfirm(cart, total);
              setOrderConfirmed(true);
            }
          }, 1500);
        }
      }
      
      addToChatHistory('assistant', responseMessage, data);

    } catch (error) {
      console.error('Order processing error:', error);
      addToChatHistory('system', `Failed to process order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch(`${API_BASE}/cart/clear`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setCart([]);
        setTotal(0);
        addToChatHistory('system', 'Cart cleared successfully!');
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Clear cart error:', error);
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
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-black">Food Order Chat</h2>
          <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-red-500'}`} 
               title={backendConnected ? 'Connected' : 'Disconnected'} />
        </div>
        {cart.length > 0 && !orderConfirmed && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-black">
              Cart: {cart.length} items | Total: ${total.toFixed(2)}
            </span>
            
          </div>
        )}
        {orderNumber && (
          <div className="text-sm font-medium text-green-600">
            Order: {orderNumber}
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
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none text-black"
          placeholder={backendConnected ? "Type 'menu' to see options, " : "Backend disconnected..."}
          rows={2}
          disabled={loading || orderConfirmed || !backendConnected}
        />
        <button
          onClick={processOrder}
          disabled={loading || !message.trim() || orderConfirmed || !backendConnected}
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
          disabled={!backendConnected}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 rounded-full transition-colors text-black"
        >
          📋 Menu
        </button>
        <button
          onClick={() => setMessage("What's in my cart?")}
          disabled={!backendConnected}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 rounded-full transition-colors text-black"
        >
          🛒 View Cart
        </button>
        {cart.length > 0 && (
          <button
            onClick={() => setMessage("I want to finalize my order")}
            disabled={!backendConnected}
            className="px-3 py-1 text-sm bg-pink-100 hover:bg-pink-200 text-pink-700 disabled:bg-gray-300 rounded-full transition-colors"
          >
            ✅ Finalize Order
          </button>
        )}
      </div>
    </div>
  );
}