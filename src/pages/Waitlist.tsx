
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, SendIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { InvitationBanner } from '@/components/ui/invitation-banner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Form schema validation
const waitlistFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  reason: z.string().min(10, { message: "Please tell us why you're interested (min 10 characters)." }).max(500, { message: "Please keep your message under 500 characters." }),
  company: z.string().optional(),
  updates: z.boolean().default(true),
  inviteCode: z.string().optional(),
});

type WaitlistFormValues = z.infer<typeof waitlistFormSchema>;

const WaitlistPage = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = React.useState(false);
  
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      reason: "",
      company: "",
      updates: true,
      inviteCode: "",
    },
  });

  const onSubmit = async (data: WaitlistFormValues) => {
    try {
      // Submit to Supabase waitlist table
      const { error } = await supabase
        .from('waitlist')
        .insert([
          {
            full_name: data.fullName,
            email: data.email,
            reason: data.reason,
            company: data.company || null,
            receive_updates: data.updates,
            invite_code: data.inviteCode || null,
            status: 'pending'
          }
        ]);
      
      if (error) throw error;
      
      // Show success message and update UI
      toast.success("Your request has been submitted!");
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting waitlist request:", error);
      toast.error("There was a problem submitting your request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <InvitationBanner />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Button>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Join our Waitlist</CardTitle>
              <CardDescription>
                Request access to our private beta. We'll notify you when your spot is ready.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {submitted ? (
                <div className="py-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium">Thanks for joining our waitlist!</h3>
                  <p className="mt-2 text-muted-foreground">
                    We've received your request and will notify you when you're granted access.
                  </p>
                  <Button
                    className="mt-6"
                    onClick={() => navigate('/')}
                  >
                    Return to Home
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your organization" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Why are you interested?</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us how you plan to use Bra3n..." 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="inviteCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invitation Code (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Have an invite code? Enter it here" {...field} />
                          </FormControl>
                          <FormDescription>
                            If you received an invitation code, enter it for priority access.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="updates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Receive product updates via email
                            </FormLabel>
                            <FormDescription>
                              You can unsubscribe at any time.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">
                      <SendIcon className="mr-2 h-4 w-4" />
                      Submit Request
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
            
            <CardFooter className="text-xs text-muted-foreground">
              We respect your privacy and will never share your information with third parties.
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WaitlistPage;
