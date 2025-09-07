// 'use client';
// import { useState, useEffect } from 'react';
// import LeftSidebar from '@/components/LeftSidebar';
// import ChatCenter from '@/components/ChatCenter';
// import RightSidebar from '@/components/RightSidebar';
// import { ChatMessage, CartItem, MenuItem } from '@/components/types';

// const API_BASE = 'https://backend-llm-production-afb7.up.railway.app';

// export default function App() {
//   const [message, setMessage] = useState('');
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [menu, setMenu] = useState<MenuItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
//   const [total, setTotal] = useState(0);

//   useEffect(() => {
//     fetchMenu();
//     fetchCart();
//   }, []);

//   const fetchMenu = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/menu`);
//       const data = await response.json();
//       setMenu(data.menu || []);
//     } catch {
//       addToChatHistory('system', 'Failed to load menu. Please check your connection.');
//     }
//   };

//   const fetchCart = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/cart`);
//       const data = await response.json();
//       setCart(data.items || []);
//       setTotal(data.total || 0);
//     } catch {}
//   };

//   const addToChatHistory = (sender: 'user' | 'assistant' | 'system', text: string, data: any = null) => {
//     setChatHistory(prev => [...prev, { sender, text, data, timestamp: new Date() }]);
//   };

//   const processOrder = async () => {
//     if (!message.trim()) return;
//     setLoading(true);
//     addToChatHistory('user', message);

//     try {
//       const response = await fetch(`${API_BASE}/process-order`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message }),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setCart(data.items || []);
//         setTotal(data.total || 0);
//         let responseMessage = `Great! ${data.message}`;
//         if (data.intent === 'ask_menu') {
//           responseMessage = "Here's our menu! You can order by typing 'I want 2 chicken sandwiches'";
//         }
//         addToChatHistory('assistant', responseMessage, data);
//       } else {
//         addToChatHistory('system', `Error: ${data.error}`);
//       }
//     } catch {
//       addToChatHistory('system', 'Failed to process order. Please try again.');
//     } finally {
//       setLoading(false);
//       setMessage('');
//     }
//   };

//   const clearCart = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/cart/clear`, { method: 'POST' });
//       if (response.ok) {
//         setCart([]);
//         setTotal(0);
//         addToChatHistory('system', 'Cart cleared successfully!');
//       }
//     } catch {}
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       processOrder();
//     }
//   };

//   const formatPrice = (price: number) => `$${price.toFixed(2)}`;

//   return (
//     <div className="min-h-screen bg-gray-950 text-gray-400 flex">
//       <LeftSidebar chatHistory={chatHistory} />
//       <ChatCenter
//         chatHistory={chatHistory}
//         message={message}
//         setMessage={setMessage}
//         loading={loading}
//         processOrder={processOrder}
//         handleKeyPress={handleKeyPress}
//       />
//       <RightSidebar cart={cart} total={total} clearCart={clearCart} formatPrice={formatPrice} />
//     </div>
//   );
// }
"use client";
import { useState } from "react";
import ProfileCard from "@/components/ProfileCard";
import ChatUI from "@/components/ChatUI";
import OrderConfirmation from "@/components/OrderConfirmation";

// Define the CartItem type to match your ChatUI component
interface CartItem {
  name: string;
  price: number;
  qty: number;
}

export default function Home() {
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{ items: CartItem[]; total: number } | null>(null);

  const handleOrderConfirm = (items: CartItem[], total: number) => {
    setOrderDetails({ items, total });
    setOrderConfirmed(true);
  };

  const handleStartNewOrder = () => {
    setOrderConfirmed(false);
    setOrderDetails(null);
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <main className="flex flex-col md:flex-row min-h-screen bg-white text-black p-8 gap-6">
      {/* ProfileCard centered vertically and horizontally */}
      <div className="flex items-center justify-center w-full md:w-auto">
        <ProfileCard />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {!orderConfirmed ? (
          <ChatUI onConfirm={handleOrderConfirm} />
        ) : (
          orderDetails && (
            <OrderConfirmation 
              order={orderDetails}
              onStartNewOrder={handleStartNewOrder}
              formatPrice={formatPrice}
            />
          )
        )}
      </div>
    </main>
  );
}