import Head from "next/head";
import { useEffect, useState } from "react";
import { NoScriptWarning } from "@/components/noscript/NoScript";
import { Analytics } from "@vercel/analytics/react";
import { OperatingSystem } from "@/components/OperatingSystem";
import Script from 'next/script';
import styles from '@/styles/Home.module.css';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const focusedTitle = "Hayley Bloch - Portfolio";
const blurredTitle = "Hayley Bloch - Portfolio";

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(
        'en', 
        ['common'],
        null,
        []
      )),
      // Will be passed to the page component as props
    },
  }
}

export default function Web() {
  const [title, setTitle] = useState("Hayley Bloch - Portfolio");

  function onVisibilityChange() {
    const title = document.visibilityState === 'visible' ? focusedTitle : blurredTitle;

    setTitle(title);
  }

  useEffect(() => {
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }

  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>

        <meta name="description" content="Portfolio website of Hayley Bloch" />

        <meta property="og:title" content="Hayley Bloch - Portfolio" />
        <meta property="og:description" content="Portfolio website of Hayley Bloch" />
        <meta property="og:site_name" content="Hayley Bloch's portfolio"></meta>

        <link rel="icon" type="image/x-icon" href="favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Script strategy="beforeInteractive" src="/emulators/emulators.js"/>
        <Script strategy="beforeInteractive" src="/emulators-ui/emulators-ui.js"/>
        
        <OperatingSystem/>
        <Analytics />
      </main>
    </>
  );
}
