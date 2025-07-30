'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-4">
        AI-Powered Recipe Generator
      </h1>
      <p className="text-lg text-center mb-6 max-w-md">
        Discover delicious recipes tailored to your preferences using the power of AI. Get started now and cook something amazing!
      </p>
      <button
        onClick={() => router.push('/login')}
        className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600"
      >
        Get Started
      </button>
    </div>
  );
}