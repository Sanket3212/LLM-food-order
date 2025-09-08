"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import ChatUI from "@/components/ChatUI";
import OrderConfirmation from "@/components/OrderConfirmation";
import Image from "next/image";

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
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6 min-h-0">
        {!session ? (
          // Landing page
          <div className="flex-1 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-100 via-orange-100 to-transparent">
            <div className="max-w-2xl text-center p-10">
              <div className="text-7xl mb-6 flex justify-center">
                <div className="w-50 h-50 rounded-full border-4 border-pink-600 overflow-hidden flex items-center justify-center bg-white shadow-lg">
                  <Image
                    src="/logo.png"   // 👈 use your chef logo path here
                    alt="FoodChat Logo"
                    className="object-cover w-full h-full"
                    width={200}
                    height={200}
                  />
                </div>
              </div>

              <h1 className="text-5xl font-extrabold mb-4 text-gray-800">
                Food<span className="text-pink-600">Chat</span>
              </h1>
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
          <>
            {/* Left Section */}
            <div
              className={`flex-shrink-0 transition-all duration-500 ease-in-out ${orderConfirmed ? "md:w-2/3 w-full" : "md:w-80 hidden md:flex md:items-center md:justify-center"
                }`}
            >
              {!orderConfirmed ? (
                <div className="flex items-center justify-center h-full">
                  <ProfileCard />
                </div>
              ) : (
                // Show ChatUI only on desktop when order confirmed
                !isMobile && (
                  <div className="h-full">
                    <ChatUI onConfirm={handleOrderConfirm} />
                  </div>
                )
              )}
            </div>

            {/* Right Section */}
            <div
              className={`transition-all duration-500 ease-in-out ${orderConfirmed ? "md:w-1/3 w-full flex-shrink-0" : "flex-1 min-h-0 w-full"
                }`}
            >
              {!orderConfirmed ? (
                <div className="h-full">
                  <ChatUI onConfirm={handleOrderConfirm} />
                </div>
              ) : (
                orderDetails && (
                  <div className="h-full overflow-hidden">
                    <OrderConfirmation
                      order={orderDetails}
                      onStartNewOrder={handleStartNewOrder}
                      formatPrice={formatPrice}
                    />
                  </div>
                )
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
