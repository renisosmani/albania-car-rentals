import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Albania Car Rentals – TIA Airport",
  description:
    "Find and compare car rentals at Tirana International Airport (TIA). Instant availability search across verified dealers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans antialiased">
        <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center gap-3">
          <span className="text-xl font-bold text-blue-700">🚗 AlbaniaCars</span>
          <span className="text-sm text-gray-400 hidden sm:inline">
            TIA Airport Car Rental Marketplace
          </span>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
          © {new Date().getFullYear()} AlbaniaCars · Tirana International Airport only · Demo
        </footer>
      </body>
    </html>
  );
}
