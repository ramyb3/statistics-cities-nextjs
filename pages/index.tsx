import MainPage from "@/lib/main";
import Head from "next/head";

export default function Index() {
  return (
    <>
      <Head>
        <title>נתונים סטטיסטיים בישראל לפי יישוב</title>
        <meta name="viewport" content="width=device-width, initial-scale=0.5" />
      </Head>
      <MainPage />
    </>
  );
}
