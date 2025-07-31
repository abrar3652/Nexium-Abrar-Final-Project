'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaUtensils, FaRobot, FaClock, FaLeaf, FaShare } from 'react-icons/fa6'; // Fixed FaShareAlt to FaShare
import { FaStar } from 'react-icons/fa6';
import {FaStarHalfAlt } from 'react-icons/fa';
interface Message {
  text: string;
  sender: 'user' | 'ai';
}

interface RecipeResponse {
  [key: string]: string[];
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
  <div className="feature-card p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-center">
    <Icon className="text-4xl text-red-500 mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
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
        className="faq-question flex justify-between items-center p-4 bg-white cursor-pointer"
        onClick={() => setActiveFaq(activeFaq === index ? null : index)}
      >
        <span className="font-semibold">{question}</span>
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
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { text: "Hi there! I'm your AI recipe assistant. Tell me what ingredients you have, and I'll suggest delicious recipes you can make!", sender: 'ai' },
    { text: "For example, try typing: 'I have chicken, rice, and tomatoes'", sender: 'ai' },
  ]);
  const [userInput, setUserInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Memoize recipe responses to prevent re-creation
  const recipeResponses = useMemo<RecipeResponse>(() => ({
    "chicken, rice, tomatoes": [
      "How about Chicken Tomato Rice? Sauté chicken with garlic, add diced tomatoes and rice, then cook with broth until tender. Garnish with parsley!",
      "Or try Stuffed Tomatoes with Chicken and Rice: Hollow out tomatoes, fill with cooked chicken and rice mixture, bake until tomatoes are tender.",
    ],
    "eggs, cheese, bread": [
      "Classic Cheese Omelette with Toast: Whisk eggs, cook with shredded cheese, serve with buttered toast.",
      "French Toast Casserole: Layer bread with eggs and cheese, bake until golden for a delicious breakfast bake!",
    ],
    "pasta, garlic, olive oil": [
      "Aglio e Olio: The perfect simple pasta! Sauté garlic in olive oil, toss with cooked pasta, add red pepper flakes if you like some heat.",
      "Garlic Butter Pasta: Cook pasta, then toss with a sauce made from melted butter, olive oil, and minced garlic. Top with parmesan if available.",
    ],
    "beef, potatoes, carrots": [
      "Hearty Beef Stew: Brown beef, add chopped potatoes and carrots, simmer in broth with herbs until tender.",
      "Beef and Potato Hash: Dice and cook everything together in a skillet for a quick, satisfying meal.",
    ],
    "default": [
      "I can suggest many recipes with those ingredients! For more personalized suggestions, sign up for a free account.",
      "Those ingredients could make several delicious dishes. Try specifying a cuisine type or cooking method you prefer!",
    ],
  }), []);

  // Debounced sendMessage
  const sendMessage = useCallback(() => {
    const message = userInput.trim();
    if (!message) return;

    setChatMessages((prev) => [...prev, { text: message, sender: 'user' }]);
    setUserInput('');

    const timer = setTimeout(() => {
      let response;
      const lowerMessage = message.toLowerCase();
      for (const [ingredients, replies] of Object.entries(recipeResponses)) {
        if (lowerMessage.includes(ingredients)) {
          response = replies[Math.floor(Math.random() * replies.length)];
          break;
        }
      }
      if (!response) {
        response = recipeResponses.default[Math.floor(Math.random() * recipeResponses.default.length)];
      }
      setChatMessages((prev) => [...prev, { text: response, sender: 'ai' }]);
    }, 1000);
    return () => clearTimeout(timer);
  }, [userInput, recipeResponses]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

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
    <div className="bg-gray-100 text-gray-900 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md fixed w-full z-50">
        <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-8 lg:px-12">
          <div className="flex items-center text-xl font-bold text-red-500">
            <FaUtensils className="mr-2" />
            <span>SavoryAI</span>
          </div>
          <ul className="flex space-x-6">
            <li><a href="#features" className="text-gray-900 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">Features</a></li>
            <li><a href="#how-it-works" className="text-gray-900 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">How It Works</a></li>
            <li><a href="#demo" className="text-gray-900 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">Try Demo</a></li>
            <li><a href="#faq" className="text-gray-900 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">FAQ</a></li>
            <li>
              <a
                href="#"
                onClick={() => router.push('/login')}
                className="btn border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full px-6 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Sign up for free"
              >
                Sign Up Free
              </a>
            </li>
          </ul>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero bg-cover bg-center h-screen flex items-center text-white relative" style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80")' }}>
        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80" alt="Delicious recipe background" className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" loading="lazy" />
        <div className="hero-content max-w-3xl mx-auto text-center px-4 md:px-8 lg:px-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-6">Struggling with Meal Ideas? Let AI Cook for You!</h1>
          <p className="text-xl mb-8">Generate personalized, mouth-watering recipes in seconds with SavoryAI. Perfect for any diet, any ingredients, any occasion.</p>
          <div className="hero-btns flex justify-center gap-4">
            <a href="#demo" className="btn bg-red-500 text-white hover:bg-transparent hover:text-red-500 border-2 border-red-500 rounded-full px-8 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Try now">Try It Now</a>
            <a href="#how-it-works" className="btn border-2 border-white text-white hover:bg-white hover:text-gray-900 rounded-full px-8 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-white" aria-label="Learn more">Learn More</a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="section-title text-center mb-12 animate-fade-in">
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
          <div className="section-title text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">How SavoryAI Works</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Get delicious recipes in just three simple steps</p>
          </div>
          <div className="steps flex flex-col md:flex-row justify-center gap-8">
            <div className="step text-center">
              <div className="step-number bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Tell AI What You Have</h3>
              <p className="text-gray-600">Simply type the ingredients you have available in your kitchen.</p>
            </div>
            <div className="step text-center">
              <div className="step-number bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Choose Preferences</h3>
              <p className="text-gray-600">Select your preferred cuisine, cooking time, and any dietary restrictions.</p>
            </div>
            <div className="step text-center">
              <div className="step-number bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Get AI Recipes</h3>
              <p className="text-gray-600">Receive instant, step-by-step cooking instructions tailored just for you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="section py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="section-title text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Try Our AI Recipe Generator</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Experience the magic of SavoryAI right now - no signup required!</p>
          </div>
          <div className="demo bg-white rounded-xl shadow-lg p-6">
            <div className="demo-container max-w-3xl mx-auto">
              <div className="demo-header text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2">AI Recipe Assistant</h3>
                <p className="text-gray-600">Type the ingredients you have to get recipe suggestions</p>
              </div>
              <div ref={chatContainerRef} className="chat-container border border-gray-200 rounded-lg h-96 overflow-y-auto p-4 bg-gray-50 mb-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'} mb-2 p-3 rounded-lg`}>
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="input-container flex gap-4">
                <input
                  type="text"
                  className="demo-input flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your ingredients here..."
                  aria-label="Enter ingredients"
                />
                <button
                  onClick={sendMessage}
                  className="demo-btn bg-red-500 text-white hover:bg-red-600 rounded-full px-6 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Send message"
                >
                  Send
                </button>
              </div>
              <div className="demo-note text-center mt-4 text-gray-500 text-sm">
                This is a demo with sample responses. Sign up for the full experience!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="section-title text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">What Our Users Say</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Join thousands of home cooks who transformed their meal planning</p>
          </div>
          <div className="testimonials flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            <div className="testimonial min-w-[300px] bg-white rounded-lg shadow-md p-6">
              <div className="stars text-yellow-400 mb-2">
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
            <div className="testimonial min-w-[300px] bg-white rounded-lg shadow-md p-6">
              <div className="stars text-yellow-400 mb-2">
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
            <div className="testimonial min-w-[300px] bg-white rounded-lg shadow-md p-6">
              <div className="stars text-yellow-400 mb-2">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStarHalfAlt />
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
      <section className="section py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="cta bg-gradient-to-r from-red-500 to-teal-400 text-white rounded-xl p-10 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Revolutionize Your Cooking?</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">Join 50,000+ home cooks who never run out of meal ideas. Sign up now and get your first 10 recipes free!</p>
            <a
              href="#"
              onClick={() => router.push('/login')}
              className="btn bg-yellow-300 text-gray-900 hover:bg-transparent hover:text-yellow-300 border-2 border-yellow-300 rounded-full px-8 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-300"
              aria-label="Get started for free"
            >
              Get Started Now - It&apos;s Free!
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="section-title text-center mb-12 animate-fade-in">
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
              <div className="flex items-center text-xl font-bold mb-2 text-red-500">
                <FaUtensils className="mr-2" />
                <span>SavoryAI</span>
              </div>
              <p className="text-gray-400 mb-4">Your smart kitchen assistant powered by artificial intelligence.</p>
              <div className="social-links flex gap-4">
                <a href="#" className="text-white hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="text-white hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                <a href="#" className="text-white hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="#" className="text-white hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Pinterest"><i className="fab fa-pinterest"></i></a>
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
              <div className="newsletter">
                <input type="email" placeholder="Your email address" className="w-full p-3 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Email address" />
                <button className="btn bg-red-500 text-white w-full hover:bg-red-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Subscribe">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="copyright text-center pt-6 border-t border-gray-800 text-gray-500">
            <p>&copy; 2023 SavoryAI. All rights reserved. | <a href="#" className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500">Privacy Policy</a> | <a href="#" className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500">Terms of Service</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}