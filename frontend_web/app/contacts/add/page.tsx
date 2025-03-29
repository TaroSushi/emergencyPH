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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/utils/context/AuthContext';
import { supabase } from '@/utils/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  contact: z.string().min(7, { message: 'Contact number must be at least 7 digits' }),
  category: z.string().min(1, { message: 'Please select a category' }),
  type: z.string().min(1, { message: 'Please select a type' }),
  classification: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddServicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contact: '',
      category: '',
      type: '',
      classification: '',
      address: '',
      notes: '',
    },
  });

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      // Get user location from local storage if available
      const userLocationStr = localStorage.getItem('userLocation');
      const userLocation = userLocationStr ? JSON.parse(userLocationStr) : null;
      
      const serviceData = {
        name: data.name,
        contact: data.contact,
        category: data.category,
        type: data.type,
        classification: data.classification || null,
        address: data.address || null,
        notes: data.notes || null,
        is_verified: false, // New submissions are unverified by default
        user_id: user?.id || null,
        latitude: userLocation?.latitude || null,
        longitude: userLocation?.longitude || null,
        city: userLocation?.city || null,
        region: userLocation?.region || null,
      };

      // Insert service data into the service table
      const { data: newService, error } = await supabase
        .from('service')
        .insert(serviceData)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      // Record the submission in history
      if (newService && newService.length > 0) {
        const serviceId = newService[0].service_id;
        if (user) {
          await supabase.from('history').insert({
            service_id: serviceId,
            user_id: user?.id,
            change_type: 'created',
            date_modified: new Date().toISOString(),
          });
        }

        toast.success('Emergency contact added successfully!');
        form.reset();
        router.push('/');
      }
    } catch (error: unknown) {
      console.error('Error adding service:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add emergency contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const serviceTypes = [
    { value: 'Medical', label: 'Medical' },
    { value: 'Police', label: 'Police' },
    { value: 'Firehouse', label: 'Fire' },
    { value: 'Rescue', label: 'Rescue' },
    { value: 'Politician', label: 'Politician' },
  ];

  const categoryOptions = {
    Medical: [
      { value: 'Hospital', label: 'Hospital' },
      { value: 'Clinic', label: 'Clinic' },
      { value: 'Pharmacy', label: 'Pharmacy' },
      { value: 'Mental Health', label: 'Mental Health' },
    ],
    Police: [
      { value: 'Police Station', label: 'Police Station' },
      { value: 'Highway Patrol', label: 'Highway Patrol' },
    ],
    Firehouse: [
      { value: 'Fire Station', label: 'Fire Station' },
    ],
    Rescue: [
      { value: 'Ambulance', label: 'Ambulance' },
      { value: 'Disaster Response', label: 'Disaster Response' },
      { value: 'Search and Rescue', label: 'Search and Rescue' },
    ],
    Politician: [
      { value: 'Barangay', label: 'Barangay' },
      { value: 'City Government', label: 'City Government' },
      { value: 'Regional Government', label: 'Regional Government' },
    ],
  };

  const selectedType = form.watch('type');

  return (
    <div className="container max-w-2xl mx-auto py-6">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Add Emergency Contact</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions[selectedType as keyof typeof categoryOptions]?.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter service name"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Full name of the emergency service or contact person
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter contact number"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Primary contact number for this emergency service
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classification (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter classification"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional classification information (e.g., &quot;24/7&quot;, &quot;Public&quot;, &quot;Private&quot;)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter address"
                      className="resize-none"
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter additional notes"
                      className="resize-none"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Any other important information about this service
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                'Submit Emergency Contact'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
} 