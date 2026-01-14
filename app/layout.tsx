import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "小新開發筆記本",
  description: "客戶關係管理系統 - CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
