import Head from 'next/head'
import Script from 'next/script'
import styles from '@/styles/Home.module.css'
import { Analytics } from '@vercel/analytics/react';
import { OperatingSystem } from '@/components/OperatingSystem'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

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

function getWebAppUrl(): string {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'local';
  
  if (env === 'production') {
    return 'https://hayley-portfolio-bay.vercel.app/';
  }
  
  if (env === 'preview' || env === 'development') {
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL ?? window.location.host;
    return vercelUrl.includes('web') ? `https://${vercelUrl}` : `https://${vercelUrl.replace('desktop', 'web')}`;
  }
  
  return 'http://localhost:3001/';
}

export default function Home() {
  const webAppUrl = getWebAppUrl();
  
  return (
    <>
      <Head>
        <title>Hayley Bloch - HTMAA Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
          <iframe
            src={webAppUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              margin: 0,
              padding: 0
            }}
            title="Hayley Bloch Portfolio"
          />
        </div>
        <Analytics/>
      </main>
    </>
  )
}
