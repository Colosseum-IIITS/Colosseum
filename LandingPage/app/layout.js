import localFont from "next/font/local";
import "./globals.css";

export const metadata = {
  title: "Colosseum - Redefine E-Sports",
  description: "Enter the Colosseum, Unleash your skills",
};

// This value is used to enable React's concurrent features
export const dynamic = 'force-dynamic';

// This helps suppress hydration errors
export const suppressHydrationWarning = true;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}

import localFont from "next/font/local";
import "./globals.css";

export const metadata = {
  title: "Colosseum - Redefine E-Sports",
  description: "Enter the Colosseum, Unleash your skills",
};

// This value is used to enable React's concurrent features
export const dynamic = 'force-dynamic';

// This helps suppress hydration errors
export const suppressHydrationWarning = true;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
