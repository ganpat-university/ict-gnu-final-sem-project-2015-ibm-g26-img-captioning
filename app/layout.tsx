import { ThemeProvider } from "next-themes";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "AI Image Caption Generator",
  description: "Advanced image captioning using deep learning and PyTorch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen">
            <nav className="fixed w-full backdrop-blur-lg bg-black/30 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center">
                    <a href="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                      Vision Caption AI
                    </a>
                  </div>
                  <div className="flex items-center space-x-4">
                    <a href="/about" className="hover:text-blue-400 transition-colors">About</a>
                    <a href="/demo" className="hover:text-blue-400 transition-colors">Demo</a>
                    <a href="/team" className="hover:text-blue-400 transition-colors">Team</a>
                  </div>
                </div>
              </div>
            </nav>
            {children}
          </main>
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
