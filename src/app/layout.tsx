import '../styles/globals.css';
     import type { Metadata } from 'next';
     import { Navbar } from '@/components/navbar';

     export const metadata: Metadata = {
       title: 'AI Recipe Generator',
       description: 'Generate delicious recipes with AI power!',
     };

     export default function RootLayout({ children }: { children: React.ReactNode }) {
       return (
         <html lang="en">
           <body>
             <Navbar />
             {children}
           </body>
         </html>
       );
     }