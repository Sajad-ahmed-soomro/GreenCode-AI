import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


export const metadata = {
  title: "GreenCode AI",
  description: "GreenCode AI is App which helps devlopers to write sustainable code ",
};
// app/layout.jsx or pages/_app.js
if (typeof window !== 'undefined') {
  // This only runs in browser
} else {
  // Catch localStorage errors on server
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
