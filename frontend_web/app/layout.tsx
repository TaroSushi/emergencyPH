'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Home, User, Phone, LogOut } from 'lucide-react';
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/utils/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search Contact', href: '/search-contact', icon: Phone },
    { name: 'Profile', href: '/profile', icon: User }
];

function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Error signing out');
      console.error(error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors duration-200 ease-in-out hover:text-primary`}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center">
            {user ? (
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign out
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium ml-2"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <AuthProvider>
          <div className="flex flex-col-reverse md:flex-col md:m-4 md:rounded-full justify-between min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <Navbar />
            <main className="px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
              {children}
            </main>
            <div></div>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
