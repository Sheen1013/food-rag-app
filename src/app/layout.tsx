import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Food RAG System",
  description: "AI-powered food knowledge system using RAG",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
