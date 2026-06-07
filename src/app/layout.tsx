import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MCGS 多语言翻译 — HMI 中→英',
  description: '上传 MCGS 工程多语言信息.xml，自动翻译中→英，基于元器件拼接术语库',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
