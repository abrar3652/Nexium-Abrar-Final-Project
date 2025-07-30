'use server';

import { signInWithMagicLink } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

export async function loginAction(formData: FormData) {
  await connectToDatabase(); // Ensure MongoDB is connected server-side
  const email = formData.get('email') as string;
  await signInWithMagicLink(email);
  return { message: 'Check your email for a magic link!' };
}