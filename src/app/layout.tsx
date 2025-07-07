import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RoleMenu from '@/components/RoleMenu';
import SessionProvider from '@/components/SessionProvider';
import AuthDebug from '@/components/AuthDebug';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Airbnb Lite",
  description: "Encontre acomodações incríveis para sua próxima viagem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <RoleMenu />
          {children}
          <AuthDebug />
        </SessionProvider>
      </body>
    </html>
  );
}
