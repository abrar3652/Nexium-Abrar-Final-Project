'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '../actions/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.hash.substring(1));
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      setMessage(`Error: ${errorDescription || 'Authentication failed'}`);
    }
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await loginAction(formData);
      setMessage(result.message);
    } catch (error) {
      setMessage('Error sending magic link. Try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath fill=\'%23D4A017\' d=\'M50 0 L60 10 L70 0 L80 10 L90 0 L100 10 L90 20 L100 30 L90 40 L100 50 L90 60 L100 70 L90 80 L100 90 L90 100 L80 90 L70 100 L60 90 L50 100 L40 90 L30 100 L20 90 L10 100 L0 90 L10 80 L0 70 L10 60 L0 50 L10 40 L0 30 L10 20 L0 10 Z\'/%3E%3C/svg%3E')]"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl transform transition-all duration-500 hover:scale-105 border border-yellow-100">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-yellow-700 animate-fade-in">SavoryAI Magic Login</h1>
          <p className="text-gray-600 mt-2 animate-fade-in-delay">Enter your email to receive a magic link and savor the experience!</p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 placeholder-gray-400 bg-white/80 shadow-inner"
              disabled={isSubmitting}
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              ✉️
            </span>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-yellow-500 text-white p-4 rounded-xl hover:from-green-600 hover:to-yellow-600 transition-all duration-300 transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-red-500 animate-fade-in-delay">{message}</p>
        )}

        {/* Decorative Elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-200/50 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-200/50 rounded-full blur-xl animate-pulse delay-300"></div>
      </div>
    </div>
  );
}