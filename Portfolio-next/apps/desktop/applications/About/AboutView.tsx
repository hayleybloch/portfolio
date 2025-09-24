import { WindowProps } from '@/components/WindowManagement/WindowCompositor';
import { useEffect, useRef, useState } from 'react';
import styles from './AboutView.module.css';
import { BaseApplicationManager } from '../ApplicationManager';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ProjectWeek1, ProjectWeek2, ProjectWeek3, ProjectWeek4 } from './Projects';
import { ScreenResolution } from '@/apis/Screen/ScreenService';

type SubView = (
  'home' |
  'about' |
  'experience' |
  'projects' |
  'project-week1' |
  'project-week2' |
  'project-week3' |
  'project-week4' |
  'contact'
);

export type SubViewParams = {
  needsMobileView: boolean,
  manager: BaseApplicationManager,
  changeParent: (view: SubView) => void,
  translate: TFunction,
  language: string
}

function Contact(props: { manager: BaseApplicationManager, language: string }) {
  function openContactApp() {
    props.manager.open('/Applications/Contact.app');
  }

  function englishContent() {
    return (<>
      <p>If you have any questions or comments, please contact me via the <a onClick={() => openContactApp()} href='#contact'>contact application</a> or shoot me an email at <a href="mailto:hayleybl@mit.edu">hayleybl@mit.edu</a></p>
    </>);
  }


  return englishContent();
}


function HomeSubView(params: SubViewParams) {
  const t = params.translate;

  const mobileClass = params.needsMobileView ? styles['mobile'] : '';

  return (<>
    <div className={styles['subpage-home']}>
      <h1 className={styles['home-title']}>Hayley Bloch</h1>
      <h3 className={styles['home-subtitle']}>HTMAA Student, Fabrication Enthusiast</h3>

      <div className={styles['home-button-container']}>
        <button className={`${styles['home-button']} system-button ${mobileClass}`} onClick={() => params.changeParent('about')}>{t("about.navigation.about")}</button>
        <button className={`${styles['home-button']} system-button ${mobileClass}`} onClick={() => params.changeParent('experience')}>{t("about.navigation.experience")}</button>
        <button className={`${styles['home-button']} ${styles['home-button-projects']} system-button ${mobileClass}`} onClick={() => params.changeParent('projects')}>{t("about.navigation.projects")}</button>
        <button className={`${styles['home-button']} system-button ${mobileClass}`} onClick={() => params.changeParent('contact')}>{t("about.navigation.contact")}</button>
      </div>
    </div>
  </>)
}

export function SubViewNavigation(params: SubViewParams) {
  const t = params.translate;

  const mobileClass = params.needsMobileView ? styles['mobile'] : '';

  return (<>
    <div className={styles['navigation']}>
      <div>
        <span className={styles['logo-part']}>Hayley</span>
        <span className={styles['logo-part']}>Bloch</span>
      </div>

      <div className={`${styles['navigation-button-container']} ${mobileClass}`}>
        <button className='system-button' onClick={() => params.changeParent('home')}>{t("about.navigation.home")}</button>
        <button className='system-button' onClick={() => params.changeParent('about')}>{t("about.navigation.about")}</button>
        <button className='system-button' onClick={() => params.changeParent('experience')}>{t("about.navigation.experience")}</button>
        <button className='system-button' onClick={() => params.changeParent('projects')}>{t("about.navigation.projects")}</button>
        <button className='system-button' onClick={() => params.changeParent('contact')}>{t("about.navigation.contact")}</button>
      </div>
    </div>
  </>)
}

function AboutSubView(params: SubViewParams) {
  function openContactApp() {
    params.manager.open('/Applications/Contact.app');
  }

  function ImageOfMyself(props: { language: string }) {
    const text = 'Me, Fall';

    return (<>
      <div className={styles['image-container']}>
        <img draggable={false} src="/images/photo-of-me-min.jpg" alt="Image of myself" />
        <span>{text}</span>
      </div>
    </>);
  }



  function RenderEnglishContent() {
    return (
      <div>
        <h1 className={styles['page-h1']}>Welcome</h1>

        <p>
          I'm Hayley Bloch, an HTMAA student at MIT exploring digital fabrication, creative engineering, and interactive art.
        </p>

        <p>Thanks for taking the time to explore my portfolio. I hope you enjoy it as much I did enjoy developing it. If you have any questions or comments, please contact me via the <a onClick={() => openContactApp()} href='#contact'>contact application</a> or shoot me an email at <a href="mailto:hayleybl@mit.edu">hayleybl@mit.edu</a></p>


        <h2>About me</h2>

        <ImageOfMyself language='en'/>

        <p>Before HTMAA, my background has been a mix of creative engineering projects, maker-space work, and entrepreneurship at Harvard. I've worked on wearable devices, robotic systems, and interactive art concepts, while also managing a university makerspace and organizing programs that connect students with innovation and design.</p>

        <p>My experience combines hands-on building, CAD/CAM, electronics, and community-building around creative technology. This foundation has prepared me perfectly for MIT's "How to Make (Almost) Anything" program, where I'm now exploring the intersection of digital fabrication and artistic expression.</p>

        <p>Through HTMAA, I'm learning to bridge the gap between traditional engineering and creative expression. Each week brings new challenges in fabrication, electronics, and design, pushing me to think beyond conventional boundaries and create meaningful, interactive experiences.</p>

        <p>My final project vision is to create a humanoid robotic bust that blends sculpture, mechanics, and AI. The bust will be expressive both in movement and speech, designed to embody personality as an art-engineering project that explores how machines can convey humanlike presence and emotion.</p>

        <h2>What I'm doing now</h2>
        <p>I'm a Maker Studio Teaching Assistant at Harvard Innovation Labs, where I help manage the i‑Lab Maker Studio, train students, and build infrastructure for creative prototyping. I also support the Harvard LPCE program as a Fellow and Program Coordinator—working on courses, mentorship, and events like FounderCrush.</p>

        <p>Beyond that, I build independent projects that combine AI, electronics, and design—from a health‑tracking wearable PCB and an AI record player to a robotic hand and a motion‑triggered flame glove. My work blends fabrication, embedded systems, and expressive interaction.</p>

        <h2>Interests</h2>
        <p>I’m passionate about creative practices that balance and inspire my engineering work. I love working with ceramics and sculpture, where the slow, tactile process offers a contrast to digital design. I also find rhythm and focus in spin classes, where music and movement come together in a meditative way.</p>

        <p>When I’m not in the studio, I enjoy immersing myself in techno, exploring how sound and atmosphere create collective energy. Fashion and performance, especially through projects like Eleganza, give me another way to explore identity and expression. Travel and cultural exchange are also central to my interests, helping me connect with new communities and perspectives.</p>
      </div>
    );
  }

  return (<>
    <div data-subpage className={styles['subpage']}>
      { SubViewNavigation(params) }
      <div data-subpage-content className={styles['subpage-content']}>
        { RenderEnglishContent() }
      </div>
    </div>
  </>);
}

function ExperienceSubView(params: SubViewParams) {
  const t = params.translate;

  function englishContent() {

    const makerStudio = (<>
      <p>In Summer 2025 I joined the i-Lab Maker Studio team as a Teaching Assistant. My role is to help manage the space, train students, and build out the infrastructure to support creative prototyping and entrepreneurship projects. This has involved building supply and equipment tracking systems, streamlining training workflows, and introducing new tools such as a Formlabs Form 4 resin printer and updated soldering setups.</p>

      <p>I also collaborate with students and teams directly on projects, providing guidance on CAD, PCB design, electronics, 3D printing, and fabrication methods. This role combines teaching, community-building, and hands-on technical expertise.</p>

      <h3>Technologies and tools</h3>
      <p>Fusion 360, KiCad, SLA printers, FDM printers, soldering work, PCB prototyping, inventory management systems</p>
    </>);

    const lpce = (<>
      <p>As a Fellow with the Lemann Program on Creativity and Entrepreneurship (LPCE), I have helped support courses (CE10, CE11), coordinate mentorship programs, and organize high-profile events like FounderCrush. My work spans social media design, mentor outreach, student advising, and creative storytelling (scripts, videos, newsletters).</p>

      <h3>Technologies and tools</h3>
      <p>Figma, Canva, Google Workspace, Mailchimp, HTML/CSS for newsletters</p>
    </>);

    const projects = (<>
      <p>Alongside my Harvard work, I have developed personal engineering projects that combine AI, electronics, and design. These include:</p>

      <div>
        - <b>Wearable Health-Tracking Disk:</b> a custom under-watch PCB integrating MAX30101 PPG, accelerometer, and nRF52832 BLE MCU.<br/>
        - <b>AI Record Player:</b> a Raspberry Pi–based system that uses RFID-tagged wooden records to trigger Spotify playback with a servo-driven tonearm.<br/>
        - <b>Rock-Paper-Scissors Robotic Hand:</b> Arduino-controlled servos and computer vision to play against humans with expressive gestures.<br/>
        - <b>Flame Thrower Glove:</b> a wearable system combining a Savox SB-2290SG servo motor, MMA8452Q motion sensor, and an arc lighter ignition circuit. Designed to ignite and release butane on a punching gesture, the glove integrates Arduino Nano control, motion detection, and high-power actuation for a dramatic responsive effect.
      </div>

      <p>Each project required integrating CAD modeling, PCB design, embedded programming, and prototyping methods, bridging art, engineering, and AI.</p>

      <h3>Technologies and tools</h3>
      <p>Arduino, Raspberry Pi, Python, C/C++, Fusion 360, KiCad, OpenCV, Spotify API, motion sensors, high-torque servos, laser cutting, 3D printing</p>
    </>);

    return { makerStudio, lpce, projects }
  }

  const content = englishContent();

  return (<>
    <div data-subpage className={styles['subpage']}>
      { SubViewNavigation(params) }
      <div data-subpage-content className={styles['subpage-content']}>
        <h1 className={styles['page-h1']}>{t("about.navigation.experience")}</h1>

        <h2>2025 - Current - Maker Studio TA, Harvard Innovation Labs</h2>
        { content.makerStudio }
        
        <h2>2023 - 2025 - Fellow & Program Coordinator, Harvard LPCE</h2>
        { content.lpce }
        
        <h2>2022 - 2025 - Independent Maker & Engineer</h2>
        { content.projects }
        

        <Contact manager={params.manager} language={params.language} />
      </div>
    </div>
  </>);
}

function ProjectsSubView(params: SubViewParams) {
  const t = params.translate;

  function ProjectButton(name: string, target: SubView, imageUrl: string) {
    return (<>
      <button className={styles['project-button']} onClick={() => params.changeParent(target) }>
        <div>
          <img src={imageUrl} alt={`${target} thumbnail`} width={25} height={25} />
        </div>
        <span>{name}</span>
      </button>
    </>);
  }

  return (<>
    <div data-subpage className={styles['subpage']}>
      { SubViewNavigation(params) }
      <div data-subpage-content className={styles['subpage-content']}>
        <h1 className={styles['page-h1']}>{t("about.navigation.projects")}</h1>

        <ul>
          <li>{ProjectButton('Week 1 - Computer-Aided Design', 'project-week1', '/icons/project-portfolio-2024.png')}</li>
          <li>{ProjectButton('Week 2 - Computer-Controlled Cutting', 'project-week2', '/icons/project-pcparts.png')}</li>
          <li>{ProjectButton('Week 3 - Electronics Production', 'project-week3', '/icons/project-redis.png')}</li>
          <li>{ProjectButton('Week 4 - 3D Printing & Scanning', 'project-week4', '/icons/project-t-bot.png')}</li>
        </ul>
      </div>
    </div>
  </>);
}

function RenderSubView(view: SubView, params: SubViewParams): JSX.Element {
  switch (view) {
    case 'home': return HomeSubView(params);
    case 'about': return AboutSubView(params);
    case 'experience': return ExperienceSubView(params);
    case 'projects': return ProjectsSubView(params);
    case 'project-week1': return ProjectWeek1(params);
    case 'project-week2': return ProjectWeek2(params);
    case 'project-week3': return ProjectWeek3(params);
    case 'project-week4': return ProjectWeek4(params);
  }
  
  return <></>;
}

export default function AboutApplicationView(props: WindowProps) {
  const { application, windowContext } = props;

  const [subView, setSubView] = useState<SubView>('home');
  const [needsMobileView, setNeedsMobileView] = useState<boolean>(false);
  const { t, i18n } = useTranslation("common");

  const apis = application.apis;

  const contentParent = useRef<HTMLDivElement>(null);

  function resetSubPageScroll() {
    if (!contentParent.current) { return; }

    const subViewParent = contentParent.current;
    const subViewParentChildren = Array.from(subViewParent.children);

    const subView = subViewParentChildren.find(x => x.hasAttribute('data-subpage'));
    if (!subView) { return; }

    const subViewChildren = Array.from(subView.children);

    const contentView = subViewChildren.find(x => x.hasAttribute('data-subpage-content'));

    if (!contentView) { return; }
    contentView.scrollTop = 0;
  }

  function onScreenChangeListener(resolution: ScreenResolution): void {
    setNeedsMobileView(resolution.isMobileDevice());
  }

  useEffect(() => {
    const unsubscribe = apis.screen.subscribe(onScreenChangeListener);

    const resolution = apis.screen.getResolution();
    if (resolution) { onScreenChangeListener(resolution); }

    return () => {
      unsubscribe();
    }
  }, []);

  useEffect(() => {
    resetSubPageScroll();
  }, [subView]);

  function changeParent(view: SubView) {
    if (view === 'contact') {
      application.on({ kind: 'about-open-contact-event' }, windowContext);
      return;
    }

    setSubView(view);
  }

  return (
    <div className="content-outer">
      <div className="content">
        <div className='content-inner' ref={contentParent}>
          { RenderSubView(subView,
            {
              needsMobileView,
              manager: application.manager,
              changeParent,
              translate: t,
              language: i18n.language
            }
          ) }
        </div>
      </div>
    </div>
  )
}