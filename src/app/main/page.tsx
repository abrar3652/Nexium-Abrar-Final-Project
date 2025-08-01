'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaPaperPlane, FaUtensils, FaClock, FaShoppingBasket, FaListOl, FaInfoCircle } from 'react-icons/fa';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  time: string;
  recipe?: {
    title?: string;
    timeToPrepare?: string;
    ingredients?: string[];
    steps?: string[];
    nutritionalValue?: string;
  };
}

export default function MainPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(async () => {
    const message = inputMessage.trim();
    if (!message) return;

    const newUserMessage: Message = { text: message, sender: 'user', time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage('');

    // Add typing indicator
    const typingMessage: Message = { text: '', sender: 'ai', time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const response = await fetch('https://abrar-junior.app.n8n.cloud/webhook/gemini-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: message }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages.pop(); // Remove typing indicator

        let aiResponse: Message;
        if (data.formatted_output.includes('Result: ^^Title:')) {
          const lines = data.formatted_output.split('\n\n').map((line: string) => line.trim());
          const recipeData: Partial<Message['recipe']> = {};

          lines.forEach((line: string) => {
            if (line.startsWith('Result: ^^Title:')) {
              recipeData.title = line.replace('Result: ^^Title:', '').replace('^^', '').trim();
            } else if (line.startsWith('^^Time to prepare:')) {
              recipeData.timeToPrepare = line.replace('^^Time to prepare:', '').replace('^^', '').trim();
            } else if (line.startsWith('^^Ingredients & Quantity:')) {
              const ingredientsText = line.replace('^^Ingredients & Quantity:', '').replace(/\n\n/, '\n').replace('^^', '').trim();
              recipeData.ingredients = ingredientsText.split('\n* ').filter((ing: string) => ing).map((ing: string) => ing.trim());
            } else if (line.startsWith('^^Steps to prepare:')) {
              const stepsText = line.replace('^^Steps to prepare:', '').replace(/\n\n/, '\n').replace('^^', '').trim();
              recipeData.steps = stepsText.split('\n').filter((step: string) => step).map((step: string) => step.replace(/^\d+\.\s/, '').trim());
            } else if (line.startsWith('^^Nutritional Value')) {
              recipeData.nutritionalValue = line.replace('^^Nutritional Value', '').replace('^^', '').trim();
            }
          });

          aiResponse = {
            text: '',
            sender: 'ai',
            time: new Date().toLocaleTimeString(),
            recipe: recipeData as Message['recipe'],
          };
        } else {
          aiResponse = { text: data.formatted_output, sender: 'ai', time: new Date().toLocaleTimeString() };
        }

        return [...updatedMessages, aiResponse];
      });
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages.pop(); // Remove typing indicator
        return [...updatedMessages, { text: 'Error fetching recipe. Please try again.', sender: 'ai', time: new Date().toLocaleTimeString() }];
      });
    }

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [inputMessage]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Chat Container */}
      <div ref={chatContainerRef} className="chat-container flex-1 overflow-y-auto p-6 max-w-5xl mx-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`message mb-6 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div className="message-content">
              <div className="message-info flex items-center justify-between mb-1 text-sm">
                <span className="font-medium">{msg.sender === 'user' ? 'You' : 'SavoryAI'}</span>
                <span className="text-gray-500">{msg.time}</span>
              </div>
              <div className={`message-text p-4 rounded-lg shadow-md ${msg.sender === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-white text-gray-800'}`}>
                {msg.recipe ? (
                  <div className="recipe-card">
                    {msg.recipe.title && (
                      <h2 className="text-xl font-bold mb-2 border-b pb-2">{msg.recipe.title}</h2>
                    )}
                    {msg.recipe.timeToPrepare && (
                      <div className="flex items-center gap-2 mb-2 text-gray-600">
                        <FaClock /> <span>{msg.recipe.timeToPrepare}</span>
                      </div>
                    )}
                    {msg.recipe.ingredients && msg.recipe.ingredients.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><FaShoppingBasket /> Ingredients & Quantity</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {msg.recipe.ingredients.map((ing: string, i: number) => <li key={i}>{ing}</li>)}
                        </ul>
                      </div>
                    )}
                    {msg.recipe.steps && msg.recipe.steps.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><FaListOl /> Steps to Prepare</h3>
                        <ol className="list-decimal pl-5 space-y-2">
                          {msg.recipe.steps.map((step: string, i: number) => <li key={i}>{step}</li>)}
                        </ol>
                      </div>
                    )}
                    {msg.recipe.nutritionalValue && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><FaInfoCircle /> Nutritional Value</h3>
                        <p className="text-gray-600">{msg.recipe.nutritionalValue}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-lg">{msg.text.replace('Result: ', '')}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">Start a conversation by typing a message below!</div>
        )}
      </div>

      {/* Input Area */}
      <div className="input-area p-6 bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0">
        <div className="input-container max-w-5xl mx-auto flex gap-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask SavoryAI for recipes..."
            className="message-input flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="send-btn bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}