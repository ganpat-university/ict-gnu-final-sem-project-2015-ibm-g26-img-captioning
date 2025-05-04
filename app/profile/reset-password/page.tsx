import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-black/30 p-8 rounded-2xl backdrop-blur-xl border border-gray-800 w-full max-w-md">
        <form className="flex flex-col w-full">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-sm text-gray-300 mb-6">
            Please enter your new password below.
          </p>
          <div className="flex flex-col gap-4">
            <Label htmlFor="password">New password</Label>
            <Input
              type="password"
              name="password"
              placeholder="New password"
              required
              minLength={6}
            />
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              required
              minLength={6}
            />
            <SubmitButton formAction={resetPasswordAction}>
              Reset Password
            </SubmitButton>
            <FormMessage message={searchParams} />
          </div>
        </form>
      </div>
    </div>
  );
}
