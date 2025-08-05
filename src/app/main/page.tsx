'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaPaperPlane } from 'react-icons/fa6';
import { FaUtensils } from 'react-icons/fa6';
import { FaShoppingBasket, FaClock, FaListOl, FaInfoCircle } from 'react-icons/fa';

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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(async () => {
    const message = input.trim();
    if (!message) return;

    setMessages((prev) => [...prev, { text: message, sender: 'user', time: new Date().toLocaleTimeString() }]);
    setInput('');

    // Add typing indicator
    setMessages((prev) => [...prev, { text: '', sender: 'ai', time: new Date().toLocaleTimeString() }]);

    try {
      const response = await fetch('https://abrar-junior.app.n8n.cloud/webhook/gemini-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any required API key if n8n needs it
          // 'Authorization': `Bearer ${process.env.N8N_API_KEY}` // Uncomment and set in Vercel env vars if needed
        },
        body: JSON.stringify({ input: message }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok. Status: ${response.status}, Body: ${errorText}`);
      }
      const data = await response.json();

      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages.pop(); // Remove typing indicator

        let aiResponse: Message;
        if (data.formatted_output && data.formatted_output.includes('Result: ^^Title:')) {
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
          aiResponse = { text: data.formatted_output || 'No response formatted.', sender: 'ai', time: new Date().toLocaleTimeString() };
        }

        return [...updatedMessages, aiResponse];
      });
    } catch (error) {
  console.error('Error fetching AI response:', (error as Error).message);
  
  const errorMessage =
    error instanceof Error ? error.message : 'Unknown error';

  setMessages((prev) => {
    const updatedMessages = [...prev];
    updatedMessages.pop(); // Remove typing indicator
    return [
      ...updatedMessages,
      {
        text: `Error fetching recipe: ${errorMessage}`,
        sender: 'ai',
        time: new Date().toLocaleTimeString(),
      },
    ];
  });
}

  }, [input]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="bg-red-600 text-white p-4 flex items-center space-x-2">
          <FaUtensils className="text-2xl" />
          <h1 className="text-xl font-bold">SavoryAI Chat</h1>
        </div>

        {/* Chat Container */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div className="message-content">
                <div className="message-info flex items-center justify-between mb-1 text-xs text-gray-500">
                  <span>{msg.sender === 'user' ? 'You' : 'SavoryAI'}</span>
                  <span>{msg.time}</span>
                </div>
                <div
                  className={`message-text p-3 rounded-lg shadow-md max-w-[70%] ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.recipe ? (
                    <div className="recipe-card space-y-3">
                      {msg.recipe.title && (
                        <h2 className="text-lg font-semibold border-b pb-1">{msg.recipe.title}</h2>
                      )}
                      {msg.recipe.timeToPrepare && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaClock /> <span>{msg.recipe.timeToPrepare}</span>
                        </div>
                      )}
                      {msg.recipe.ingredients && msg.recipe.ingredients.length > 0 && (
                        <div className="mt-2">
                          <h3 className="text-md font-medium flex items-center gap-2">
                            <FaShoppingBasket /> Ingredients & Quantity
                          </h3>
                          <ul className="list-disc pl-5 mt-1 text-sm">
                            {msg.recipe.ingredients.map((ing, i) => (
                              <li key={i}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {msg.recipe.steps && msg.recipe.steps.length > 0 && (
                        <div className="mt-2">
                          <h3 className="text-md font-medium flex items-center gap-2">
                            <FaListOl /> Steps to Prepare
                          </h3>
                          <ol className="list-decimal pl-5 mt-1 text-sm">
                            {msg.recipe.steps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {msg.recipe.nutritionalValue && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <h3 className="text-md font-medium flex items-center gap-2">
                            <FaInfoCircle /> Nutritional Value
                          </h3>
                          <p className="text-sm text-gray-600">{msg.recipe.nutritionalValue}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm">{msg.text.replace('Result: ', '')}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask SavoryAI for recipes..."
              className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}