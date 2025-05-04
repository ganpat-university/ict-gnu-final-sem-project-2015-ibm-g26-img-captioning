"use client";
import { signUpAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import { useFormStatus } from "react-dom";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FormState {
  error?: string;
  success?: string;
}

interface FormData {
  email: string;
  password: string;
  full_name: string;
  age: string;
  gender: string;
  country: string;
  occupation: string;
  interests: string[];
  usage_purpose: string;
}

const INTERESTS = [
  "Art & Design",
  "Photography",
  "Marketing",
  "Social Media",
  "Education",
  "Research",
  "Personal Projects",
  "Business",
  "Other"
];

const OCCUPATIONS = [
  "Educator",
  "Student",
  "Hobbyist",
  "Professional",
  "Other"
];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "India",
  "Brazil",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Singapore",
  "South Korea",
  "Other"
];

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const { pending } = useFormStatus();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    full_name: "",
    age: "",
    gender: "",
    country: "",
    occupation: "",
    interests: [],
    usage_purpose: ""
  });

  // Effect to redirect and show toast on success
  useEffect(() => {
    if (formSuccess) {
      toast.success(formSuccess);
      // Redirect after 2 seconds to allow the user to see the success message
      const timeout = setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [formSuccess, router]);

  // Show error toast when there's an error
  useEffect(() => {
    if (formError) {
      toast.error(formError);
    }
  }, [formError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "interests" 
        ? Array.from((e.target as HTMLSelectElement).selectedOptions, option => option.value)
        : value
    }));
  };

  const isStepValid = () => {
    switch(step) {
      case 1:
        return formData.email && formData.password && formData.full_name;
      case 2:
        return formData.age && formData.gender && formData.country && formData.occupation;
      case 3:
        return formData.interests.length > 0 && formData.usage_purpose;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
          <div>
            <Label htmlFor="full_name" className="text-sm font-medium text-gray-300">Full Name</Label>
            <Input 
              name="full_name" 
              placeholder="John Doe" 
              required 
              value={formData.full_name}
              onChange={handleInputChange}
              className="mt-1.5 bg-black/40 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
              <Input 
                name="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1.5 bg-black/40 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="Choose a secure password"
                minLength={6}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1.5 bg-black/40 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age" className="text-sm font-medium text-gray-300">Age</Label>
                <Input 
                  name="age" 
                  type="number" 
                  min="13" 
                  max="120" 
                  required 
                  value={formData.age}
                  onChange={handleInputChange}
                  className="mt-1.5 bg-black/40 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-sm font-medium text-gray-300">Gender</Label>
                <Select 
                  name="gender" 
                  required 
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="mt-1.5 bg-black/40 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="country" className="text-sm font-medium text-gray-300">Country</Label>
              <Select 
                name="country" 
                required 
                value={formData.country}
                onChange={handleInputChange}
                className="mt-1.5 bg-black/40 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country.toLowerCase()}>{country}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="occupation" className="text-sm font-medium text-gray-300">Occupation</Label>
              <Select 
                name="occupation" 
                required 
                value={formData.occupation}
                onChange={handleInputChange}
                className="mt-1.5 bg-black/40 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="">Select occupation</option>
                {OCCUPATIONS.map((occupation) => (
                  <option key={occupation} value={occupation.toLowerCase()}>{occupation}</option>
                ))}
              </Select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div>
              <Label htmlFor="interests" className="text-sm font-medium text-gray-300">What interests you?</Label>
              <Select 
                name="interests" 
                multiple 
                required 
                value={formData.interests}
                className="mt-1.5 min-h-[120px] bg-black/40 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                onChange={handleInputChange}
              >
                {INTERESTS.map((interest) => (
                  <option key={interest} value={interest}>{interest}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="usage_purpose" className="text-sm font-medium text-gray-300">How will you use our app?</Label>
              <Textarea 
                name="usage_purpose" 
                placeholder="Brief description of your goals..."
                value={formData.usage_purpose}
                className="mt-1.5 min-h-[100px] bg-black/40 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
                onChange={handleInputChange}
              />
            </div>
          </div>
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid()) return;
    setFormError(null);
    setFormSuccess(null);

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => formDataObj.append(`${key}[]`, v));
      } else {
        formDataObj.append(key, value);
      }
    });

    try {
      const response = await signUpAction({}, formDataObj);
      if (response.error) {
        setFormError(response.error);
      } else if (response.success) {
        setFormSuccess(response.success);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setFormError("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="bg-black/30 p-8 rounded-2xl backdrop-blur-md border border-gray-800/50 shadow-2xl w-full max-w-md mx-auto">
        <form 
          className="flex flex-col w-full" 
          onSubmit={handleSubmit}
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Already have an account?{" "}
            <Link className="text-blue-400 hover:text-blue-300 transition-colors" href="/sign-in">
              Sign in
            </Link>
          </p>

          {/* Modern stepper UI */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 h-0.5 w-full bg-gray-700/30 -z-10" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step === i 
                      ? 'bg-blue-500 ring-4 ring-blue-500/20 text-white shadow-lg shadow-blue-500/20' 
                      : step > i 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                      : 'bg-gray-700/50 text-gray-400'
                  }`}
                >
                  {step > i ? '✓' : i}
                </div>
                <span className="text-xs text-gray-400 mt-2 font-medium">
                  {i === 1 ? 'Account' : i === 2 ? 'Profile' : 'Interests'}
                </span>
              </div>
            ))}
          </div>

          <div className="transition-all duration-300 transform">
            {renderStep()}
          </div>

          <div className="mt-8 flex justify-between gap-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-colors text-gray-300"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => isStepValid() && setStep(step + 1)}
                disabled={!isStepValid()}
                className={`px-4 py-2 text-sm rounded-lg ml-auto transition-all ${
                  isStepValid()
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={pending || !isStepValid()}
                className="w-full px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-blue-500/20"
              >
                {pending ? 'Creating account...' : 'Create Account'}
              </button>
            )}
          </div>
          {formError && (
            <p className="mt-4 text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              {formError}
            </p>
          )}
          {formSuccess && (
            <p className="mt-4 text-sm text-green-400 bg-green-400/10 p-3 rounded-lg border border-green-400/20">
              {formSuccess}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
