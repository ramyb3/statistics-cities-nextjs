import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html dir="rtl" lang="he">
      <Head />
      <header className="text-center text-[#8b0000] font-bold">
        *המידע מתעדכן אחת לשבוע ע"י המדינה*
      </header>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
