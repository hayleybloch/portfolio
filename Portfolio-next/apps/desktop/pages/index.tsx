import Head from 'next/head'
import { useState } from 'react'

function getTargetUrl(): string {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'local';

  if (env === 'local') {
    return 'http://localhost:3001/';
  } else {
    return 'https://hayley-portfolio-bay.vercel.app/';
  }
}

export default function Home() {
  const [time] = useState(Date.now());
  const url = getTargetUrl();

  return (
    <>
      <Head>
        <title>Hayley Bloch - HTMAA Portfolio Desktop</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden' }}>
        <iframe 
          src={`${url}?t=${time}`}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            margin: 0,
            padding: 0
          }}
          title="Hayley's Portfolio"
        />
      </main>
    </>
  )
}
