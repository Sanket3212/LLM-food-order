import { Clock } from 'lucide-react';
import { ChatMessage } from '@/components/types';

type Props = {
  chatHistory: ChatMessage[];
};

export default function LeftSidebar({ chatHistory }: Props) {
  return (
    <div className="w-64 bg-black/40 border-r border-white/10 flex flex-col">
      <div className="p-4 border-b border-white/10 text-lg font-bold text-white flex items-center gap-2">
        <Clock className="h-5 w-5 text-green-400" />
        Chat History
      </div>
      <div className="flex-1 overflow-y-auto">
        {chatHistory.length === 0 ? (
          <p className="p-4 text-gray-500 text-sm">No chats yet</p>
        ) : (
          chatHistory.map((chat, i) => (
            <div key={i} className="p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer">
              <p className="text-sm truncate">{chat.text}</p>
              <p className="text-xs text-gray-500">
                {chat.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
