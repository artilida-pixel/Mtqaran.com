import "../globals.css";

// /admin isn't part of the trilingual public site (no [lang] prefix), so it
// gets its own root layout rather than sharing [lang]/layout.tsx — Next.js
// treats each layout with no layout above it as an independent root, per
// "Omitting app/layout.js so layouts in subdirectories ... each become root
// layouts for their respective directories."
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
