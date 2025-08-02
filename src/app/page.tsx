'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaUtensils, FaRobot, FaClock, FaLeaf, FaShare, FaPaperPlane } from 'react-icons/fa6';
import { FaStar, FaShoppingBasket, FaInfoCircle } from 'react-icons/fa'; // Adjusted imports for FaShoppingBasket and FaInfoCircle

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

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}) => (
  <div className="feature-card p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-2">
    <Icon className="text-yellow-500 mb-4 animate-bounce-slow" />
    <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const FAQItem = ({ index, question, answer }: { index: number, question: string, answer: string }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  return (
    <div className="faq-item mb-4 border border-gray-200 rounded-lg overflow-hidden">
      <div
        role="button"
        aria-expanded={activeFaq === index}
        className="faq-question flex justify-between items-center p-4 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setActiveFaq(activeFaq === index ? null : index)}
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <span className={`faq-toggle transition-transform ${activeFaq === index ? 'rotate-45' : ''}`}>+</span>
      </div>
      <div className={`faq-answer bg-gray-50 transition-all duration-300 ${activeFaq === index ? 'max-h-96 p-4' : 'max-h-0 p-0'}`}>
        <p className="text-gray-600">{answer}</p>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [demoUsed, setDemoUsed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

  // Check if demo was used in this session (via localStorage)
  useEffect(() => {
    const hasUsedDemo = localStorage.getItem('demoUsed');
    if (hasUsedDemo) setDemoUsed(true);
  }, []);

  const sendMessage = useCallback(async () => {
    const message = userInput.trim();
    if (!message || demoUsed) {
      if (demoUsed) {
        document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setChatMessages((prev) => [...prev, { text: message, sender: 'user', time: new Date().toLocaleTimeString() }]);
    setUserInput('');
    setDemoUsed(true);
    localStorage.setItem('demoUsed', 'true');

    // Add typing indicator
    setChatMessages((prev) => [...prev, { text: '', sender: 'ai', time: new Date().toLocaleTimeString() }]);

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

      setChatMessages((prev) => {
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
      setChatMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages.pop(); // Remove typing indicator
        return [...updatedMessages, { text: 'Error fetching recipe. Please try again later.', sender: 'ai', time: new Date().toLocaleTimeString() }];
      });
    }

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [userInput, demoUsed]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(newsletterEmail)) {
      setShowSubscriptionPopup(true);
      setNewsletterEmail('');
      setTimeout(() => setShowSubscriptionPopup(false), 3000); // Hide popup after 3 seconds
    } else {
      alert('Please enter a valid email address.');
    }
  };

  // Smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = target.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: (targetElement as HTMLElement).offsetTop - 80,
            behavior: 'smooth',
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-green-50 to-gray-100 text-gray-900 min-h-screen">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md fixed w-full z-50">
        <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-8 lg:px-12 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center text-2xl font-bold text-red-600 animate-pulse-slow">
            <FaUtensils className="mr-2" />
            <span>SavoryAI</span>
          </div>
          <ul className="flex space-x-6">
            <li><a href="#features" className="text-gray-800 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">Features</a></li>
            <li><a href="#how-it-works" className="text-gray-800 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">How It Works</a></li>
            <li><a href="#demo" className="text-gray-800 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">Try Demo</a></li>
            <li><a href="#faq" className="text-gray-800 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">FAQ</a></li>
            <li>
              <button
                onClick={() => router.push('/login')}
                className="btn border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded-full px-6 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 animate-fade-in"
                aria-label="Sign up for free"
              >
                Sign Up Free
              </button>
            </li>
          </ul>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero bg-cover bg-center h-screen flex items-center text-white relative" style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80")' }}>
        <div className="hero-content max-w-4xl mx-auto text-center px-4 md:px-8 lg:px-12 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Struggling with Meal Ideas? Let AI Cook for You!</h1>
          <p className="text-xl md:text-2xl mb-8">Generate personalized, mouth-watering recipes in seconds with SavoryAI. Perfect for any diet, any ingredients, any occasion.</p>
          <div className="hero-btns flex justify-center gap-6">
            <a href="#demo" onClick={(e) => { e.preventDefault(); document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }); }} className="btn bg-red-600 text-white hover:bg-red-700 border-2 border-red-600 rounded-full px-8 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 animate-bounce-slow" aria-label="Try now">Try It Now</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} className="btn border-2 border-white text-white hover:bg-white hover:text-gray-900 rounded-full px-8 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-white animate-fade-in-delay" aria-label="Learn more">Learn More</a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="section-title text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Smart Cooking Made Simple</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Discover how SavoryAI transforms your cooking experience with artificial intelligence</p>
          </div>
          <div className="features grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={FaRobot} title="AI-Powered Suggestions" description="Get unique recipes based on your available ingredients, cooking skills, and taste preferences." />
            <FeatureCard icon={FaClock} title="Save Time" description="No more staring at an empty fridge—AI suggests recipes from what you have in minutes!" />
            <FeatureCard icon={FaLeaf} title="Personalized Diets" description="Vegan, Keto, Gluten-Free? Customize recipes to fit your lifestyle and dietary needs." />
            <FeatureCard icon={FaShare} title="Save & Share" description="Download, print, or share your favorite recipes with friends and family with one click." />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section py-20 bg-gray-100">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="section-title text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">How SavoryAI Works</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Get delicious recipes in just three simple steps</p>
          </div>
          <div className="steps flex flex-col md:flex-row justify-center gap-8">
            <div className="step text-center">
              <div className="step-number bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-pulse-slow">1</div>
              <h3 className="text-xl font-semibold mb-2">Tell AI What You Have</h3>
              <p className="text-gray-600">Simply type the ingredients you have available in your kitchen.</p>
            </div>
            <div className="step text-center">
              <div className="step-number bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-pulse-slow delay-100">2</div>
              <h3 className="text-xl font-semibold mb-2">Choose Preferences</h3>
              <p className="text-gray-600">Select your preferred cuisine, cooking time, and any dietary restrictions.</p>
            </div>
            <div className="step text-center">
              <div className="step-number bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-pulse-slow delay-200">3</div>
              <h3 className="text-xl font-semibold mb-2">Get AI Recipes</h3>
              <p className="text-gray-600">Receive instant, step-by-step cooking instructions tailored just for you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="section py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="section-title text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Try Our AI Recipe Generator</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Experience the magic of SavoryAI right now - no signup required for a single try!</p>
          </div>
          <div className="demo bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="demo-container max-w-4xl mx-auto">
              <div className="demo-header text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2 text-gray-900">AI Recipe Assistant</h3>
                <p className="text-gray-600">Type the ingredients you have to get recipe suggestions</p>
              </div>
              <div ref={chatContainerRef} className="chat-container flex-1 overflow-y-auto p-6 max-w-4xl mx-auto">
                {chatMessages.map((msg, index) => (
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
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"> Steps to Prepare</h3>
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
                {demoUsed && !chatMessages.length && (
                  <div className="text-center text-gray-500 mt-4">You've used your demo try! <a href="#cta" onClick={(e) => { e.preventDefault(); document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-red-600 hover:underline">Sign up now</a> for more.</div>
                )}
              </div>
              <div className="input-area p-6 bg-white border-t border-gray-200">
                <div className="input-container max-w-4xl mx-auto flex gap-4">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask SavoryAI for recipes..."
                    className="message-input flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={demoUsed}
                  />
                  <button
                    onClick={sendMessage}
                    className="send-btn bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
                    disabled={demoUsed}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="section-title text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">What Our Users Say</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Join thousands of home cooks who transformed their meal planning</p>
          </div>
          <div className="testimonials flex gap-6 overflow-x-auto md:flex-row md:overflow-hidden pb-4">
            <div className="testimonial min-w-[300px] bg-white rounded-lg shadow-md p-6 flex-1">
              <div className="stars flex items-center text-yellow-400 mb-2">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <div className="testimonial-content text-gray-600 italic mb-4">
                "SavoryAI saved my dinner plans! I had random leftovers and no idea what to make. The AI suggested an amazing stir-fry that became a family favorite!"
              </div>
              <div className="testimonial-author flex items-center">
                <img src="https://randomuser.me/api/portraits/women/43.jpg" alt="Maria K." className="author-avatar w-12 h-12 rounded-full mr-4" loading="lazy" />
                <div className="author-info">
                  <h4 className="text-lg font-semibold">Maria K.</h4>
                  <p className="text-gray-500 text-sm">Home Cook</p>
                </div>
              </div>
            </div>
            <div className="testimonial min-w-[300px] bg-white rounded-lg shadow-md p-6 flex-1">
              <div className="stars flex items-center text-yellow-400 mb-2">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <div className="testimonial-content text-gray-600 italic mb-4">
                "As a vegan, I love how SavoryAI tailors recipes to my diet. It's introduced me to ingredients I never would have thought to use together!"
              </div>
              <div className="testimonial-author flex items-center">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Alex T." className="author-avatar w-12 h-12 rounded-full mr-4" loading="lazy" />
                <div className="author-info">
                  <h4 className="text-lg font-semibold">Alex T.</h4>
                  <p className="text-gray-500 text-sm">Vegan Food Blogger</p>
                </div>
              </div>
            </div>
            <div className="testimonial min-w-[300px] bg-white rounded-lg shadow-md p-6 flex-1">
              <div className="stars flex items-center text-yellow-400 mb-2">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <div className="testimonial-content text-gray-600 italic mb-4">
                "The keto recipes are spot on! I've lost 15 pounds while eating delicious meals thanks to SavoryAI's personalized suggestions."
              </div>
              <div className="testimonial-author flex items-center">
                <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Sarah J." className="author-avatar w-12 h-12 rounded-full mr-4" loading="lazy" />
                <div className="author-info">
                  <h4 className="text-lg font-semibold">Sarah J.</h4>
                  <p className="text-gray-500 text-sm">Keto Enthusiast</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="section py-20 bg-gradient-to-r from-red-600 to-teal-500 text-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="cta text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">Ready to Revolutionize Your Cooking?</h2>
            <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">Join 50,000+ home cooks who never run out of meal ideas. Sign up now and get your first 10 recipes free!</p>
            <button
              onClick={() => router.push('/login')}
              className="btn bg-yellow-300 text-gray-900 hover:bg-transparent hover:text-yellow-300 border-2 border-yellow-300 rounded-full px-8 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-300 animate-bounce-slow"
              aria-label="Get started for free"
            >
              Get Started Now - It&apos;s Free!
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="section-title text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Find answers to common questions about SavoryAI</p>
          </div>
          <div className="faq-container max-w-2xl mx-auto">
            <FAQItem index={0} question="How does the AI generate recipes?" answer="Our AI analyzes thousands of recipes and understands flavor combinations, cooking techniques, and nutritional information. When you provide your ingredients, it matches them with the most suitable recipes and can even create new combinations based on what works well together." />
            <FAQItem index={1} question="Can I use leftovers for recipes?" answer="Absolutely! SavoryAI is perfect for using up leftovers. Just tell the AI what ingredients you have (including cooked leftovers), and it will suggest recipes that incorporate them creatively." />
            <FAQItem index={2} question="What dietary restrictions can the AI accommodate?" answer="Our AI understands most common dietary needs including vegan, vegetarian, gluten-free, dairy-free, nut-free, keto, paleo, low-carb, and more. You can select multiple restrictions at once." />
            <FAQItem index={3} question="Is there a mobile app available?" answer="Currently SavoryAI is web-based and works perfectly on mobile browsers. We're developing native iOS and Android apps that will be released later this year with additional features like voice input and step-by-step cooking mode." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="footer-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="footer-column">
              <div className="flex items-center text-xl font-bold mb-2 text-red-600">
                <FaUtensils className="mr-2" />
                <span>SavoryAI</span>
              </div>
              <p className="text-gray-400 mb-4">Your smart kitchen assistant powered by artificial intelligence.</p>
              <div className="social-links flex gap-4">
                <a href="#" className="text-white hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="text-white hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                <a href="#" className="text-white hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="#" className="text-white hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Pinterest"><i className="fab fa-pinterest"></i></a>
              </div>
            </div>
            <div className="footer-column">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Quick Links</h3>
              <ul className="footer-links space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">How It Works</a></li>
                <li><a href="#demo" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">Try Demo</a></li>
                <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Company</h3>
              <ul className="footer-links space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">Contact</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Newsletter</h3>
              <p className="text-gray-400 mb-4">Get weekly recipe ideas and cooking tips delivered to your inbox.</p>
              <form onSubmit={handleNewsletterSubmit} className="newsletter space-y-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full p-3 rounded text-black focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="btn bg-red-600 text-white w-full hover:bg-red-700 rounded transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Subscribe"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="copyright text-center pt-6 border-t border-gray-800 text-gray-500">
            <p>&copy; 2023 SavoryAI. All rights reserved. | <a href="#" className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500">Privacy Policy</a> | <a href="#" className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500">Terms of Service</a></p>
          </div>
        </div>
      </footer>

      {/* Subscription Popup */}
      {showSubscriptionPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-900">Thank You for Subscribing!</h3>
            <p className="text-gray-600 mt-2">You will receive weekly recipe ideas and cooking tips in your inbox.</p>
            <button
              onClick={() => setShowSubscriptionPopup(false)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-all"
              aria-label="Close popup"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}