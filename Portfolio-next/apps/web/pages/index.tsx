import Head from "next/head";
import { SceneLoader } from "../components";
import { useEffect, useState } from "react";
import { NoScriptWarning } from "@/components/noscript/NoScript";
import { Analytics } from "@vercel/analytics/react"

const focusedTitle = "Hayley Bloch - Portfolio";
const blurredTitle = "Hayley Bloch - Portfolio";

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
      <NoScriptWarning />
      <SceneLoader />
      <Analytics />
    </>
  );
}
