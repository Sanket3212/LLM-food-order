// OrderConfirmation.tsx
"use client";
import { useEffect, useState } from "react";
import { CartItem } from "./types";

interface OrderConfirmationProps {
  order: {
    items: CartItem[];
    total: number;
  };
  onStartNewOrder: () => void;
  formatPrice: (price: number) => string;
}

export default function OrderConfirmation({ order, onStartNewOrder, formatPrice }: OrderConfirmationProps) {
  const [orderNumber] = useState(() => Math.floor(Math.random() * 10000) + 1000);
  const [estimatedTime] = useState(() => Math.floor(Math.random() * 20) + 15); // 15-35 minutes
  const [currentTime] = useState(() => new Date());

  const getEstimatedDelivery = () => {
    const delivery = new Date(currentTime.getTime() + estimatedTime * 60000);
    return delivery.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-8 text-center">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-pink-100">Thank you for your order. We&apos;re preparing your delicious meal!</p>
        </div>

        {/* Order Details */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Order Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Order Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">#{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Time:</span>
                  <span className="font-medium">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery:</span>
                  <span className="font-medium text-pink-600">{getEstimatedDelivery()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Preparation Time:</span>
                  <span className="font-medium">{estimatedTime} minutes</span>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Order Status</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-pink-600 rounded-full mr-3"></div>
                  <span className="font-medium text-pink-600">Order Received</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-gray-500">Preparing</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-gray-500">On the way</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-gray-500">Delivered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Order Summary</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center">
                    <span className="bg-pink-100 text-pink-600 text-xs font-medium px-2 py-1 rounded-full mr-3">
                      {item.qty}x
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-700">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t-2 border-pink-200">
                <span className="text-lg font-bold text-gray-800">Total:</span>
                <span className="text-xl font-bold text-pink-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onStartNewOrder}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Place Another Order
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
              Track Order
            </button>
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Need help? Contact us at <span className="font-medium text-pink-600">support@foodchat.com</span></p>
            <p className="mt-1">or call <span className="font-medium text-pink-600">(555) 123-4567</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}