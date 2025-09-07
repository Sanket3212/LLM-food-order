import { Send, Utensils, MessageCircle } from 'lucide-react';
import { ChatMessage } from './types';

type Props = {
  chatHistory: ChatMessage[];
  message: string;
  setMessage: (msg: string) => void;
  loading: boolean;
  processOrder: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

export default function ChatCenter({ chatHistory, message, setMessage, loading, processOrder, handleKeyPress }: Props) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-gray flex items-center justify-center gap-2">
        <Utensils className="h-6 w-6 text-blue-primary" />
        <h1 className="text-2xl font-bold text-blue-light">AI Food Ordering Assistant</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {chatHistory.length === 0 ? (
          <div className="text-center text-neutral-gray mt-20">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-blue-dark" />
            <p>Start chatting to place your order!</p>
            <p className="text-sm mt-2">Try: &quot;I want a chicken sandwich and fries&quot;</p>
          </div>
        ) : (
          chatHistory.map((chat, index) => (
            <div key={index} className={`mb-4 flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-3 rounded-xl max-w-md ${
                  chat.sender === 'user'
                    ? 'bg-blue-primary text-white'
                    : chat.sender === 'system'
                    ? 'bg-neutral-brown/20 text-neutral-brown border border-neutral-brown/40'
                    : 'bg-blue-dark/40 text-neutral-beige border border-blue-dark/30'
                }`}
              >
                <p className="text-sm">{chat.text}</p>
                <p className="text-xs opacity-70 mt-1">{chat.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neutral-gray flex gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your order here..."
          className="flex-1 p-3 border border-neutral-gray rounded-xl bg-blue-dark/20 text-white placeholder-neutral-gray focus:outline-none focus:ring-2 focus:ring-blue-primary resize-none"
          rows={2}
          disabled={loading}
        />
        <button
          onClick={processOrder}
          disabled={loading || !message.trim()}
          className="px-6 py-3 bg-blue-primary text-white rounded-xl font-semibold hover:bg-blue-light transition-all duration-300 disabled:bg-neutral-gray disabled:text-neutral-beige flex items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
