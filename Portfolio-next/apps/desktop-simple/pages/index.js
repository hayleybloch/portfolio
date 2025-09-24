import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Hayley Bloch - Desktop</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        margin: 0,
        padding: 0
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          padding: '2rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            Hayley Bloch
          </h1>
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            Software Developer & Designer
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '1rem',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}>
              <h3>About</h3>
              <p>Learn more about my background and experience</p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '1rem',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}>
              <h3>Projects</h3>
              <p>Explore my portfolio of work</p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '1rem',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}>
              <h3>Contact</h3>
              <p>Get in touch with me</p>
            </div>
          </div>
          <p style={{
            marginTop: '2rem',
            opacity: 0.8,
            fontSize: '0.9rem'
          }}>
            Welcome to my desktop interface! This is a simplified version of my portfolio.
          </p>
        </div>
      </main>
    </>
  )
}
