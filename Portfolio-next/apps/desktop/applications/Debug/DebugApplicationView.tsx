import { WindowProps } from '@/components/WindowManagement/WindowCompositor';
import { useEffect, useState } from 'react';

function getTargetUrl(time: number): string {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'local';

  if (env === 'local') {
    return `http://localhost:3001/?t=${time}`;
  } else {
    return `https://hayley-portfolio-bay.vercel.app/?t=${time}`;
  }
}

export default function DebugApplicationView(props: WindowProps) {
  const { application, windowContext } = props;

  const [time, _] = useState(Date.now());
  const url = getTargetUrl(time);
  
  function onClickButton() {
    application.apis.sound.play('/sounds/meow.mp3', 0.25);
  }

  useEffect(() => { 
    return () => { }
  }, []);

  return (
    <>
      <button onClick={onClickButton}>click me</button>
      <iframe 
        src={url}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        title="Hayley's Portfolio"
      />
    </>
  )
} 