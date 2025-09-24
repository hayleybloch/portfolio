import Head from "next/head";
import { OperatingSystem } from "@/components/OperatingSystem";
import { Analytics } from "@vercel/analytics/react";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Home({ }: any) {
  return (
    <>
      <Head>
        <title>Hayley Bloch - Desktop</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="Home_main__VkIEL">
        <OperatingSystem />
        <Analytics />
      </main>
    </>
  );
}

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}
