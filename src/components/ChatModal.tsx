import React, { useState } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
import { useRideStore } from '../store/useRideStore';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'CUSTOMER' | 'DRIVER';
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, userType }) => {
  const { chatMessages, sendCustomerMessage, sendDriverMessage, activeRide, brandSettings } = useRideStore();
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (userType === 'CUSTOMER') {
      sendCustomerMessage(inputText.trim());
    } else {
      sendDriverMessage(inputText.trim());
    }
    setInputText('');
  };

  const quickPhrases =
    userType === 'CUSTOMER'
      ? ["I'm at the main entrance", 'Coming down now', 'Wearing a dark jacket', 'Traffic is heavy near gate']
      : ["I've arrived outside", 'In a Pearl White Camry', 'Hazard lights are on', 'Right at the corner'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-bold"
              style={{ backgroundColor: brandSettings.primaryColorHex }}
            >
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {userType === 'CUSTOMER'
                  ? `Chat with ${activeRide?.driver?.name || 'Driver'}`
                  : `Chat with ${activeRide?.customer?.name || 'Rider'}`}
              </h4>
              <p className="text-[11px] text-emerald-400 font-medium">In-Ride Private Channel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {chatMessages.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-500">
              No messages yet. Send a message or tap a quick phrase below.
            </div>
          )}

          {chatMessages.map((msg) => {
            const isSystem = msg.sender === 'SYSTEM';
            const isMe =
              (userType === 'CUSTOMER' && msg.sender === 'CUSTOMER') ||
              (userType === 'DRIVER' && msg.sender === 'DRIVER');

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="text-[11px] px-3 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs font-medium ${
                    isMe
                      ? 'bg-emerald-500 text-black font-semibold rounded-br-none shadow-md'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                  }`}
                >
                  <p className="text-[10px] opacity-75 mb-0.5 font-bold uppercase tracking-wider">
                    {msg.sender}
                  </p>
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick phrase chips */}
        <div className="p-2 border-t border-slate-800 bg-slate-950/50 overflow-x-auto flex gap-1.5 scrollbar-none">
          {quickPhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (userType === 'CUSTOMER') sendCustomerMessage(phrase);
                else sendDriverMessage(phrase);
              }}
              className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
            >
              {phrase}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl font-bold transition-transform hover:scale-105"
            style={{ backgroundColor: brandSettings.primaryColorHex, color: '#000000' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
