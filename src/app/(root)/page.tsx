"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import ChatUI from "@/components/ChatUI";
import OrderConfirmation from "@/components/OrderConfirmation";
import { div } from "framer-motion/client";

// Define the CartItem type to match your ChatUI component
interface CartItem {
  name: string;
  price: number;
  qty: number;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{ items: CartItem[]; total: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOrderConfirm = (items: CartItem[], total: number) => {
    setOrderDetails({ items, total });
    setOrderConfirmed(true);
  };

  const handleStartNewOrder = () => {
    setOrderConfirmed(false);
    setOrderDetails(null);
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Show loading state while mounting or checking authentication
  if (!mounted || status === "loading") {
    return (
      <div className="h-screen bg-white flex flex-col">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row p-6 gap-6 min-h-0">
        {/* ProfileCard Section - Only show when user is signed in */}
        {session && (
          <div className="flex items-center justify-center md:w-80 md:flex-shrink-0">
            <ProfileCard />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {!session ? (
            <div className="flex-1 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-100 via-orange-100 to-transparent">
  <div className="max-w-2xl text-center p-10">
    {/* Emoji Logo */}
    <div className="text-7xl mb-6">🤖🍔</div>

    {/* Title */}
    <h1 className="text-5xl font-extrabold mb-4 text-gray-800">
      Food<span className="text-pink-600">Chat</span>
    </h1>

    {/* Subtitle */}
    <p className="text-lg text-gray-600 mb-10">
      Your gateway to{" "}
      <span className="text-pink-600 font-semibold">
        AI-powered food ordering
      </span>
      . Order meals effortlessly through natural conversation.
    </p>
    
  </div>
</div>

          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Welcome Message for Logged In Users */}
              

              {/* Chat or Order Confirmation */}
              <div className="flex-1 min-h-0">
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
            </div>
          )}
        </div>
      </main>

    
    </div>
  );
}