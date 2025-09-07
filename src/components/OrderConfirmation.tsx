interface OrderConfirmationProps {
  items: string[];
  total: string;
}

export default function OrderConfirmation({ items, total }: OrderConfirmationProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-gray-50 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Order Confirmed ✅</h2>
      <p className="text-lg">Items: {items.join(", ")}</p>
      <p className="text-lg">Total: {total}</p>
    </div>
  );
}
