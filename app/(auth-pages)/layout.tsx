export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-gray-800" />
      <div className="relative z-10 w-full max-w-lg mx-auto">
        {children}
      </div>
    </div>
  );
}
