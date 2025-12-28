import React, { useState, useEffect } from 'react';
import { contactAPI } from '../../lib/api';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await contactAPI.getMessages();
      setMessages(response.data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await contactAPI.markAsRead(id);
      loadMessages();
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Mesajlar</h1>

        <div className="bg-white rounded-lg shadow-md">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-600">Henüz mesaj yok</div>
          ) : (
            <div className="divide-y">
              {messages.map((message) => (
                <div key={message.id} className={`p-6 ${message.read ? 'bg-white' : 'bg-blue-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{message.name}</h3>
                      <p className="text-sm text-gray-600">{message.email} • {message.phone}</p>
                    </div>
                    {!message.read && (
                      <button onClick={() => handleMarkRead(message.id)} className="text-sm text-blue-600 hover:text-blue-800">Okundu Isaretle</button>
                    )}
                  </div>
                  <p className="text-gray-700 mt-3">{message.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(message.created_at).toLocaleString('tr-TR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
