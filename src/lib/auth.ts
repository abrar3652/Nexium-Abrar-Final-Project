import { getSupabase } from './supabase';

       export async function signInWithMagicLink(email: string) {
         const supabase = await getSupabase();
         try {
           const { data, error } = await supabase.auth.signInWithOtp({
             email,
             options: {
               emailRedirectTo: 'https://ai-powered-recipe-generator-two.vercel.app/main',
             },
           });
           if (error) {
             console.error('Supabase OTP Error:', error.message, error.code);
             throw error;
           }
           console.log('Magic link sent successfully:', data);
           return data;
         } catch (error) {
           console.error('Sign-in error:', error);
           throw error;
         }
       }

       export async function signOut() {
         const supabase = await getSupabase();
         const { error } = await supabase.auth.signOut();
         if (error) {
           console.error('Sign-out error:', error);
           throw error;
         }
       }

       export async function getSession() {
         const supabase = await getSupabase();
         const { data: { session }, error } = await supabase.auth.getSession();
         if (error) {
           console.error('Session error:', error);
           return null;
         }
         return session;
       }