'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast } from 'sonner';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useAuth } from '@/utils/context/AuthContext';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const { email, password } = data;
      const { error } = await signIn(email, password);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Logged in successfully');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 space-y-8">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-blue-500 text-2xl font-bold">
            <div className="bg-blue-500 text-white p-2 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2C15.9 2 17 3.1 17 4.5V6h1.5C19.9 6 21 7.1 21 8.5c0 1.4-1.1 2.5-2.5 2.5H17v1.5c0 1.4-1.1 2.5-2.5 2.5S12 13.9 12 12.5V11H7.5C6.1 11 5 9.9 5 8.5S6.1 5 7.5 5H12V4.5C12 3.1 13.1 2 14.5 2z"></path>
                <path d="M6 17.3V20a2 2 0 0 0 2 2h.5A2.5 2.5 0 0 0 11 19.5V18a2 2 0 0 0-2-2h-.5A2.5 2.5 0 0 0 6 18.5V19"></path>
              </svg>
            </div>
            <span>emergency.ph</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter email"
                      type="email"
                      className="rounded-md p-3 bg-white"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter password"
                        type={showPassword ? "text" : "password"}
                        className="rounded-md p-3 bg-white"
                        autoCapitalize="none"
                        autoComplete="current-password"
                        autoCorrect="off"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-md" 
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>

        <div className="pt-4 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 