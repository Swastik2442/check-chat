import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import QueryClientProvider from "@/contexts/queryClientProvider";
import ConvexClientProvider from "@/contexts/convexClientProvider";
import { ChatStoreProvider } from "@/contexts/chatStoreProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "check-chat",
  description: "A simple AI Chat App"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider>
    <ClerkProvider>
    <ConvexClientProvider>
    <ChatStoreProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}>
          {children}
        </body>
      </html>
    </ChatStoreProvider>
    </ConvexClientProvider>
    </ClerkProvider>
    </QueryClientProvider>
  );
}
