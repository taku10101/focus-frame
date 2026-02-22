export const metadata = {
  title: "FocusFrame",
  description: "25分集中 → ジェネラティブアート生成のポモドーロPWA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
