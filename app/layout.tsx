import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CiteDeck - Turn Lectures into Cited Flashcards",
  description: "Transform your course materials into source-cited study guides and Anki/Quizlet-ready decks with AI-powered generation and instant corrections.",
  keywords: ["flashcards", "study guide", "anki", "quizlet", "citations", "studying", "college", "exam prep"],
  openGraph: {
    title: "CiteDeck - Turn Lectures into Cited Flashcards",
    description: "Transform your course materials into source-cited study guides and flashcard decks.",
    type: "website",
    url: "https://lecture-voice-notes.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
