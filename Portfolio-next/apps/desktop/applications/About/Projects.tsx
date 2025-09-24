import { SubViewNavigation, SubViewParams } from "./AboutView";
import styles from './AboutView.module.css';
import Image from 'next/image';


function ProjectImage(props: { src: string, alt: string, label?: string, labelNumber?: number }) {
  const { src, alt, label, labelNumber } = props;

  return (<>
      <div className={styles['project-image-container']}>
        <Image
          src={src}
          alt={alt}
          fill
          quality={90}
          style={{ objectFit: 'contain' }}
          sizes="400px, 800px, 1024px"
        />
      </div>
      {label && <span className={styles['project-image-label']}>{label}</span>}
    </>
  );
}

function ProjectPage(props: { title: string, params: SubViewParams, content: JSX.Element }) {
  const params = props.params;

  const backToProjects = 'Back to projects';

  return (<>
    <div data-subpage className={styles['subpage']}>
      { SubViewNavigation(params) }
      <div data-subpage-content className={styles['subpage-content']}>
        <h1>{props.title}</h1>
        <button onClick={() => params.changeParent('projects')} className={styles['button-link']}>{backToProjects}</button>
        { props.content }
        <button onClick={() => params.changeParent('projects')} className={styles['button-link']}>{backToProjects}</button>
      </div>
    </div>
  </>);
}

export function ProjectWeek1(params: SubViewParams) {
  function RenderEnglishContent() {
    return (
      <div>
        <h3>Project Goal</h3>
        <p>Create a humanoid robotic bust that blends sculpture, mechanics, and AI to express personality through movement and speech. The goal is to design a machine that feels like a character rather than just a device — bridging art and engineering.</p>

        <h3>Process Steps</h3>
        <ol>
          <li><strong>Rough Sketch</strong> – Drew a quick bust sketch to block head/neck proportions (no detail, just proportions).</li>
          <li><strong>Refined Sketch</strong> – Cleaner version with facial features + mechanical lines, consistent proportions.</li>
          <li><strong>AI Render</strong> – Generated 3D-like renders from sketch for visualization; exported best reference.</li>
          <li><strong>Convert to STL</strong> – Built a basic mesh, exported to STL for cleanup.</li>
          <li><strong>Blender Sculpt</strong> – Smoothed, fixed geometry, adjusted proportions, ensured watertight mesh.</li>
          <li><strong>3D Print</strong> – Printed 10cm bust (PLA, 0.2mm layer height) to verify proportions.</li>
        </ol>

        <h3>Documentation Photos</h3>
        <ProjectImage src="/images/Week 1/1w1-min.jpeg" alt="Week 1 – Concept sketch" label="Concept sketch of humanoid bust" labelNumber={1} />
        <ProjectImage src="/images/Week 1/3w1-min.JPG" alt="Week 1 – Blender sculpt" label="Blender sculpting to refine proportions and repair geometry" labelNumber={3} />
        <ProjectImage src="/images/Week 1/4w1-min.png" alt="Week 1 – 3D print" label="Small-scale 3D print (~7×7 in) as a physical reference for next steps" labelNumber={4} />
        <ProjectImage src="/images/Week 1/Screenshot 2025-09-23 at 3.46.48 PM-min.png" alt="Week 1 – AI to MakerWorld" label="AI-generated 3D view → MakerWorld 2D-to-3D producing STL for the bust" labelNumber={2} />

        <h3>Reflection</h3>
        <p><strong>What worked:</strong> Sketch → Render → STL → Print pipeline was successful.</p>
        <p><strong>What didn't:</strong> Render geometry was messy, required heavy cleanup.</p>
        <p><strong>Next step:</strong> Add mechanical clearances for servos and AI-driven movement.</p>
      </div>
    );
  }

  return ProjectPage({title: 'Week 1 - Introduction & CAD', content: RenderEnglishContent(), params});
}

export function ProjectWeek2(params: SubViewParams) {
  function RenderEnglishContent() {
    return (
      <div>
        <h3>Project Goal</h3>
        <p>Design and fabricate a parametric construction kit that accounts for kerf, can be assembled in multiple ways, and explore both laser cutting and vinyl cutting techniques.</p>

        <h3>Process</h3>
      <div>
          - <strong>Parametric Design in Fusion 360</strong>: Defined parameters for diameter, thickness, kerf, clearance, slot width, and pivot spacing. Exported DXFs of rings, iris leaves, and side panels for cutting.<br/>
          - <strong>Cardboard Prototype</strong>: Cut first version in cardboard to test fit and function. The iris worked mechanically, but cardboard was too weak to hold its shape and tore at the pivots.<br/>
          - <strong>Transition to Wood</strong>: Recut parts in 3 mm plywood with kerf compensation. Measured tolerances with calipers and iterated until the iris leaves moved smoothly. Fully assembled the wooden iris box with screws and bolts.<br/>
          - <strong>Vinyl Cutting</strong>: After assembly, used a Cricut vinyl cutter to make a thin white vinyl overlay. The vinyl hid top-surface assembly holes and added visual contrast to the wood.
      </div>

        <h3>Documentation Photos</h3>
        <h4>Design Stage</h4>
        <ProjectImage src="/images/Week 2/Screenshot 2025-09-17 at 12.06.19 AM.png" alt="Fusion 360 parameters" label="Fusion 360 parameters setup (user parameters for kerf, thickness, diameter, etc.)" />
        <div style={{ margin: '10px 0' }}>
          <video src="/images/Week 2/screen-recording-2025-09-18-at-33250-pm-online-video-cuttercom_XqhTQL3G (1).mp4" controls className={styles['project-video']}></video>
          <span className={styles['project-image-label']}>Screen recording walkthrough of Fusion 360 parametric design setup (showing parameters + sketch updates).</span>
      </div>
        <div style={{ margin: '10px 0' }}>
          <video src="/images/Week 2/Screen Recording 2025-09-24 at 12.48.46 AM.mp4" controls className={styles['project-video']}></video>
          <span className={styles['project-image-label']}>Screen recording of the final iris box in action — showing smooth open/close motion.</span>
      </div>
        <ProjectImage src="/images/Week 2/drawing_file.png" alt="Inkscape layout" label="Inkscape layout of laser cut parts" />

        <h4>Cardboard Prototype</h4>
        <ProjectImage src="/images/Week 2/IMG_0157.jpg" alt="Cardboard freshly cut" label="Floral engravings design" />
        <ProjectImage src="/images/Week 2/IMG_0161.jpg" alt="Cardboard test fit" label="First test fitting cardboard pieces" />
        <ProjectImage src="/images/Week 2/IMG_0162.jpg" alt="Cardboard assembly" label="Cardboard assembly in progress" />
        <ProjectImage src="/images/Week 2/IMG_0163.jpg" alt="Cardboard iris top view" label="Carboard cross section (not strong enough)" />
        <ProjectImage src="/images/Week 2/IMG_0164.jpg" alt="Cardboard iris partially open" label="Cardboard engraving" />

        <h4>Wood Prototype</h4>
        <ProjectImage src="/images/Week 2/IMG_0039.jpg" alt="Wood parts after cut" label="Caliper measuring wood thickness for kerf test of a 10mm x 10mm piece" />
        <ProjectImage src="/images/Week 2/IMG_0040.jpg" alt="Kerf measurement" label="Finished wooden laser cut parts" />
        <ProjectImage src="/images/Week 2/IMG_0043.jpg" alt="Wood leaves and rings" label="Wooden leaves and rings connected with bolts" />
        <div style={{ margin: '10px 0' }}>
          <video
            src="/images/Week 2/demonstration_video.mp4"
            controls
            className={styles['project-video']}
            style={{ width: '100%', maxWidth: 560, height: 480, objectFit: 'contain', borderRadius: 6 }}
          ></video>
          <span className={styles['project-image-label']}><b>Video:</b> testing the wooden iris mechanism</span>
    </div>

        <h4>Vinyl Cutting & Application</h4>
        <ProjectImage src="/images/Week 2/IMG_0166.jpg" alt="Vinyl peeling" label="Vinyl after being cut on Cricut" />
        <ProjectImage src="/images/Week 2/IMG_0168.jpg" alt="Vinyl applied" label="Vinyl overlay applied to wooden iris box top (holes hidden)" />

        <h4>Final Result</h4>
        <ProjectImage src="/images/Week 2/IMG_0168.jpg" alt="Final iris closed" label="Final iris box closed, wood + vinyl finish" />

        <h3>Results</h3>
      <div>
          - A fully functional iris box made from parametric, laser-cut parts.<br/>
          - Cardboard prototype → wooden final assembly.<br/>
          - Decorative and functional vinyl overlay applied to the top surface.<br/>
          - Engraved floral patterns added as extra credit.
      </div>

        <h3>Learnings</h3>
      <div>
          - Parametric design made it easy to swap materials and adjust for kerf.<br/>
          - Prototyping in cardboard revealed weaknesses early and saved material before moving to wood.<br/>
          - Vinyl cutting can be used not just decoratively, but also as a finishing technique to mask fasteners.
      </div>
      </div>
    );
  }

  return ProjectPage({title: 'Week 2 - Computer-Controlled Cutting', content: RenderEnglishContent(), params});
}

export function ProjectWeek3(params: SubViewParams) {
  function RenderEnglishContent() {
    return (
      <div>
        <h3>Project Goal</h3>
        <p>Mill, stuff, and test a basic PCB to learn electronics production.</p>

        <h3>Process Steps</h3>
      <div>
          - <strong>Load design file</strong> into Mods.<br/>
          - <strong>Mill traces and outline</strong> on PCB mill.<br/>
          - <strong>Collect and organize components.</strong><br/>
          - <strong>Solder board.</strong><br/>
          - <strong>Test connectivity</strong> with multimeter.<br/>
          - <strong>Program and verify functionality.</strong>
      </div>

        <h3>Documentation Photos</h3>
        <ProjectImage src="/images/Week 3/3w1.JPG" alt="Week 3 Project Documentation" label="Mods screenshot, PCB on milling bed, soldering process, finished board" />

        <h3>Reflection</h3>
        <p><strong>What worked:</strong> Successful milling and solder joints.</p>
        <p><strong>What didn't:</strong> First trace cut too shallow.</p>
        <p><strong>Next step:</strong> Design custom boards with sensors.</p>
      </div>
    );
  }

  return ProjectPage({title: 'Week 3 - Electronics Production', content: RenderEnglishContent(), params});
}

export function ProjectWeek4(params: SubViewParams) {
  function RenderEnglishContent() {
    return (
      <div>
        <h3>Project Goal</h3>
        <p>Learn additive manufacturing by printing and scanning 3D objects.</p>

        <h3>Process Steps</h3>
      <div>
          
      </div>

        <h3>Documentation Photos</h3>

        <h3>Reflection</h3>
        
      </div>
    );
  }

  return ProjectPage({title: 'Week 4 - 3D Printing & Scanning', content: RenderEnglishContent(), params});
}
