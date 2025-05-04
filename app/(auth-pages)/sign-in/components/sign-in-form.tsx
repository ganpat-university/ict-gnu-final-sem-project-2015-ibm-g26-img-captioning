"use client";

import { signInAction, signInWithOTPAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SignInResponse {
  error?: string;
  success?: string;
}

export function SignInForm({ message }: { message?: Message }) {
  const [useOTP, setUseOTP] = useState(false);
  const [status, setStatus] = useState<SignInResponse>({});
  const router = useRouter();

  useEffect(() => {
    if (status.success) {
      toast.success(status.success);
      if (useOTP) {
        // Show success message for magic link
        // No redirect needed as user will click the email link
      } else {
        // Show welcome toast and redirect will happen automatically via the server action
        toast.success("Welcome back!");
      }
    }
    if (status.error) {
      toast.error(status.error);
    }
  }, [status, useOTP]);

  const handleSignIn = async (formData: FormData) => {
    try {
      if (useOTP) {
        // Magic link flow
        const response = await signInWithOTPAction(formData) as SignInResponse;
        setStatus(response);
      } else {
        // Password flow - redirect happens automatically
        try {
          await signInAction(formData);
          // If we get here without redirect, show success toast anyway
          toast.success("Welcome back!");
        } catch (err) {
          if (err && typeof err === 'object' && 'error' in err) {
            setStatus({ error: (err as any).error });
          } else {
            setStatus({ error: "Failed to sign in" });
          }
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setStatus({ error: "An unexpected error occurred" });
    }
  };

  return (
    <form className="flex flex-col w-full">
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Sign in
      </h1>
      <p className="text-sm text-gray-300 mb-6">
        Don't have an account?{" "}
        <Link className="text-blue-400 hover:text-blue-300 font-medium" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={!useOTP ? "default" : "outline"}
            onClick={() => setUseOTP(false)}
          >
            Password
          </Button>
          <Button
            type="button"
            variant={useOTP ? "default" : "outline"}
            onClick={() => setUseOTP(true)}
          >
            Magic Link
          </Button>
        </div>

        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />

        {!useOTP && (
          <>
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                className="text-xs text-foreground underline"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              required
            />
          </>
        )}

        <SubmitButton 
          pendingText={useOTP ? "Sending Magic Link..." : "Signing In..."} 
          formAction={handleSignIn}
        >
          {useOTP ? "Send Magic Link" : "Sign in"}
        </SubmitButton>
        {message && <FormMessage message={message} />}
        {status.error && (
          <p className="mt-4 text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
            {status.error}
          </p>
        )}
        {status.success && (
          <p className="mt-4 text-sm text-green-400 bg-green-400/10 p-3 rounded-lg border border-green-400/20">
            {status.success}
          </p>
        )}
      </div>
    </form>
  );
}
