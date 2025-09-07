// types.ts
export type ChatMessage = {
  sender: 'user' | 'assistant' | 'system';
  text: string;
  data?: any;
  timestamp: Date;
};

export type CartItem = {
  name: string;
  qty: number;
  price: number;
};

export type MenuItem = {
  name: string;
  price: number;
};
