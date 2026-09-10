import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Предварительная диагностика к МГТ / ЗГТ",
  description: "Чек-лист перед приёмом гинеколога-эндокринолога. Не заменяет очную консультацию.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
