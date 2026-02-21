import "./globals.css";

export const metadata = {
  title: "Vibe Studio",
  description: "Where ideas become reality",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
