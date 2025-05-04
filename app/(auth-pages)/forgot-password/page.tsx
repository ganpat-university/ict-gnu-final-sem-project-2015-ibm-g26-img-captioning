"use client";
import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { toast } from "sonner";

interface FormState {
  error?: string;
  success?: string;
}

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordResponse {
  error?: string;
  success?: string;
}

export default function ForgotPassword() {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const { pending } = useFormStatus();

  // Show success toast when magic link is sent
  useEffect(() => {
    if (formSuccess) {
      toast.success(formSuccess);
    }
  }, [formSuccess]);

  // Show error toast when there's an error
  useEffect(() => {
    if (formError) {
      toast.error(formError);
    }
  }, [formError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email")?.toString();

    if (!email) {
      setFormError("Email is required");
      return;
    }

    try {
      const response = await forgotPasswordAction(formData) as unknown as ForgotPasswordResponse;
      if (response) {
        if (response.error) {
          setFormError(response.error);
        } else if (response.success) {
          setFormSuccess(response.success);
        }
      }
    } catch (error) {
      console.error("Error sending reset link:", error);
      setFormError("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="bg-black/30 p-8 rounded-2xl backdrop-blur-md border border-gray-800/50 shadow-2xl w-full max-w-md">
        <form className="flex flex-col w-full" onSubmit={handleSubmit}>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Remember your password?{" "}
            <Link className="text-blue-400 hover:text-blue-300 transition-colors" href="/sign-in">
              Sign in
            </Link>
          </p>
          <div className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
              <Input 
                name="email" 
                type="email"
                placeholder="you@example.com" 
                required 
                className="mt-1.5 bg-black/40 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-blue-500/20"
            >
              {pending ? 'Sending...' : 'Send Reset Link'}
            </button>
            {formError && (
              <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                {formError}
              </p>
            )}
            {formSuccess && (
              <p className="text-sm text-green-400 bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                {formSuccess}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
