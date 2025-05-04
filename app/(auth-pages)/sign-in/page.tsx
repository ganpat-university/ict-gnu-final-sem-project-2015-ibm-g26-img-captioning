import { Message } from "@/components/form-message";
import { SignInForm } from "./components/sign-in-form";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-black/30 p-8 rounded-2xl backdrop-blur-xl border border-gray-800 w-full max-w-md">
        <SignInForm message={searchParams} />
      </div>
    </div>
  );
}
