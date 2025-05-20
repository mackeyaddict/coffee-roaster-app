import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Avatar, Spin, Result, Tooltip } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { BotMessageSquare, User, Send, ChevronDown, ChevronUp, LoaderPinwheel, Coffee, RefreshCw } from 'lucide-react';
import { getGoogleGenAIResponse } from '../../services/geminiAI';
import { renderMarkdown } from '../../utils/markdown';
dayjs.locale('id');

const { Search } = Input;

const BOT_NAME = "HomeCo";
const USER_NAME = "Kamu";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const handleSendMessage = async (value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    if (!isOpen) {
      setIsOpen(true);
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      text: trimmedValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setLoading(true);
    setError(null);

    const historyForAI = messages
      .filter(msg => msg.id !== 'initial-bot-message')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    historyForAI.push({ role: 'user', parts: [{ text: trimmedValue }] });

    try {
      const botResponseText = await getGoogleGenAIResponse(trimmedValue, historyForAI);
      const botMessage = {
        id: `bot-${Date.now()}`,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (err) {
      console.error("Error fetching bot response in handleSendMessage:", err);
      setError("Maaf, terjadi kesalahan. Silakan coba lagi.");
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: "Saya mengalami masalah yang tidak terduga. Silakan coba lagi nanti.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const toggleChatOpen = () => {
    setIsOpen(!isOpen);
  };

  const resetChat = () => {
    setMessages([]);
    setError(null);
    setInputValue('');
  };

  const renderIdleState = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
        <div className="w-16 h-16 mb-6">
          <Coffee size={64} />
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">Halo, Barista!</h3>
        <p className="text-gray-300 mb-6 max-w-md">
          Tanyakan apa saja seputar kopi, metode penyeduhan, pemanggangan,
          atau rekomendasi biji kopi favorit untuk Anda.
        </p>
        <div className="flex flex-wrap justify-center gap-3 max-w-lg">
          {[
            "Apa rekomendasi kopi untuk pemula?",
            "Bagaimana cara menyeduh kopi V60?",
            "Apa perbedaan light dan dark roast?",
            "Rekomendasi coffee grinder terbaik"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(suggestion)}
              className="dark-gradient-secondary hover-dark-gradient-secondary cursor-pointer px-3 py-2 rounded-full text-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center items-start">
      <div className="w-full shadow-xl rounded-lg bg-white overflow-hidden">
        <div
          className="dark-gradient border-b border-gray-200 p-4 flex justify-between items-center"
        >
          <div className="flex items-center cursor-pointer" onClick={toggleChatOpen}>
            <BotMessageSquare className="mr-2" />
            <h2 className="text-lg font-semibold text-white">Tanya HomeCo</h2>
          </div>

          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <Tooltip title="Reset percakapan">
                <Button
                  type="text"
                  icon={<RefreshCw size={18} color='#fff' />}
                  onClick={resetChat}
                  className="flex items-center justify-center"
                />
              </Tooltip>
            )}
            <div className="cursor-pointer" onClick={toggleChatOpen}>
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>
        </div>

        {isOpen && (
          <>
            <div className="h-[60vh] overflow-y-auto p-4 flex flex-col gap-4 dark-gradient w-full">
              {messages.length === 0 ? (
                renderIdleState()
              ) : (
                <>
                  {messages.map((item) => (
                    <div
                      key={item.id}
                      className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'} my-2`}
                    >
                      <div
                        className="p-3 rounded-xl max-w-full dark-gradient-secondary flex flex-col gap-4"
                      >
                        <div className="flex items-start justify-end gap-4 w-full">
                          {item.sender === 'bot' && (
                            <Avatar icon={<BotMessageSquare />} className="!bg-transparent flex-shrink-0" />
                          )}
                          <div className="flex flex-col">
                            <p className="font-bold text-white">
                              {item.sender === 'user' ? USER_NAME : BOT_NAME}
                            </p>
                            <p className="text-white">
                              {renderMarkdown(item.text)}
                            </p>
                            <p className="text-xs mt-1 text-gray-300">
                              {dayjs(item.timestamp).format("DD MMMM YYYY")}
                            </p>
                          </div>
                          {item.sender === 'user' && (
                            <Avatar icon={<User />} className="!bg-transparent flex-shrink-0 self-right" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {loading && (
                <div className="flex justify-center items-center p-4 animate-spin">
                  <LoaderPinwheel size={48} color='#fff'/>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className='flex justify-center items-center'>
                <Result status={500} title="Terjadi Kesalahan" subTitle="Ooops.. terjadi kesalahan pada server" />
              </div>
            )}

            <div className="p-4 border-t border-gray-200 dark-gradient">
              <Search
                enterButton={
                  <Button type="primary" icon={<Send />} className="dark-gradient hover-dark-gradient">
                    Tanyakan
                  </Button>
                }
                placeholder="Tanya seputar kopi atau pemanggangan..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onSearch={handleSendMessage}
                loading={loading}
                size="large"
                className="rounded-md"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}