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
import { EyeIcon, EyeOffIcon, Camera, Upload } from 'lucide-react';
import { useAuth } from '@/utils/context/AuthContext';
import Image from 'next/image';

const signupSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, { 
    message: 'Please enter a valid phone number (10-15 digits, optionally starting with +)' 
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signUp, signIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [govId, setGovId] = useState<File | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
    },
  });

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    try {
      const { email, password, name, phone } = data;
      const { error } = await signUp(email, password, phone, name);

      if (error) {
        throw new Error(error.message);
      }

      // After successful signup, auto-login the user
      const { error: loginError } = await signIn(email, password);
      
      if (loginError) {
        // If auto-login fails, show success but still redirect to home
        console.warn('Auto-login failed after signup:', loginError);
      }

      toast.success('Account created successfully!');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setGovId(event.target.files[0]);
      toast.success(`File "${event.target.files[0].name}" uploaded successfully`);
    }
  };

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter phone number"
                      type="tel"
                      className="rounded-md p-3 bg-white"
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
                        autoComplete="new-password"
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name"
                      className="rounded-md p-3 bg-white"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-500 text-sm">
                <span>+ Add government ID</span>
                <div className="flex gap-2">
                  <label htmlFor="camera-upload" className="cursor-pointer">
                    <Camera size={20} className="text-gray-400" />
                    <input 
                      id="camera-upload"
                      type="file" 
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isLoading}
                    />
                  </label>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload size={20} className="text-gray-400" />
                    <input 
                      id="file-upload"
                      type="file" 
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isLoading}
                    />
                  </label>
                </div>
              </label>
              {govId && (
                <p className="text-xs text-green-600">
                  File uploaded: {govId.name}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-md mt-6" 
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </Form>

        <div className="pt-4 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 