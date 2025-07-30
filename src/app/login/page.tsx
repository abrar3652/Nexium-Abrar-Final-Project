'use client';

  import { useState, useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { loginAction } from '../actions/auth';

  export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
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
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold">{isLogin ? 'Log In' : 'Sign Up'}</h1>
        <button
          className="mt-4 bg-green-500 text-white p-2 rounded"
          onClick={() => setIsLogin(!isLogin)}
          disabled={isSubmitting}
        >
          Switch to {isLogin ? 'Sign Up' : 'Log In'}
        </button>
        <form action={handleSubmit} className="mt-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded w-full"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="mt-2 bg-blue-500 text-white p-2 rounded"
            disabled={isSubmitting}
          >
            Send Magic Link
          </button>
        </form>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </div>
    );
  }