// OrderConfirmation.tsx
"use client";

import { CartItem } from "./types";


interface OrderConfirmationProps {
  order: {
    items: CartItem[];
    total: number;
    timestamp?: string;
    subtotal?: number;
    tax?: number;
  };
  onStartNewOrder: () => void;
  formatPrice: (price: number) => string;
}

export default function OrderConfirmation({
  order,
  onStartNewOrder,
  formatPrice,
}: OrderConfirmationProps) {
  const calculateSubtotal = () => {
    return (
      order.subtotal ||
      order.items.reduce((sum, item) => sum + item.price * item.qty, 0)
    );
  };

  return (
    <div className="h-full bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm flex flex-col h-full max-h-[90vh]">
        
        {/* Header */}
        <div className="text-center p-6 border-b border-gray-100 flex-shrink-0">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Order Confirmed!</h2>
          <p className="text-gray-600 mt-1">Thank you for your order</p>
        </div>

        {/* Order Summary Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-semibold text-lg text-gray-800">Order Summary</h3>
        </div>

        {/* Scrollable Items */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center flex-1">
                  <span className="bg-pink-100 text-pink-600 text-sm font-medium px-2 py-0.5 rounded-full mr-3 min-w-fit">
                    {item.qty}x
                  </span>
                  <span className="font-medium text-gray-800 truncate pr-2">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-700 flex-shrink-0">
                  {formatPrice(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="p-4 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <span className="text-xl font-bold text-pink-600">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onStartNewOrder}
            className="w-full px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
          >
            Start New Order
          </button>
        </div>

        {/* Contact Info */}
        <div className="text-center text-xs text-gray-500 p-3 flex-shrink-0">
          <span>Need help? </span>
          <span className="font-medium text-pink-600">ssk.goa12@gmail.com</span>
          <div className="mt-1">
            <span className="font-medium text-pink-600">(+91) 9075456905</span>
          </div>
        </div>
      </div>
    </div>
  );
}