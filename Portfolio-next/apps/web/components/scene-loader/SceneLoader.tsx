import { useEffect, useState, useRef } from "react";
import { LoadingManager } from "three";
import { Renderer, RendererScenes } from "../renderer/Renderer";
import { AssetManager, LoadingProgress, LoadingProgressEntry, UpdateAction } from "./AssetManager";
import {
  CablesLoader,
  DeskLoader,
  FloorLoader,
  KeyboardLoader,
  LightsLoader,
  MonitorLoader,
  MouseLoader,
  HydraLoader,
  NoopLoader,
  createRenderScenes,
  PlantLoader,
  IrisBoxLoader
} from "./AssetLoaders";
import { detectWebGL, isDebug, isMobileDevice } from "./util";
import styles from "./SceneLoader.module.css";

/* ---------- utils ---------- */

function createSpacer(source: string, length: number, fill = "\u00A0") {
  const need = Math.max(0, length - 1 - (source?.length ?? 0));
  return fill.repeat(need) + "\u00A0";
}

/* ---------- small UI parts ---------- */

function ResourceLoadingStatus(loadingProgress: LoadingProgress) {
  const { loaded, total } = loadingProgress.progress();
  const pct = total > 0 ? Math.floor((loaded / total) * 100) : 0;

  return (
    <div aria-live="polite" aria-atomic="true">
      <h3 style={{ marginBottom: 8 }}>
        {loaded === total
          ? "Finished loading resources"
          : `Loading resources (${loaded}/${total}) ${pct}%`}
      </h3>
      <div style={{ height: 6, width: 280, background: "rgba(255,255,255,0.2)", borderRadius: 3 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "white", borderRadius: 3 }} />
      </div>
    </div>
  );
}

function DisplayResource(entry: LoadingProgressEntry) {
  const totalSteps = 2; // downloaded, processed
  const state = Number(entry.downloaded) + Number(entry.processed);
  const label = `${entry.name} (${state}/${totalSteps})`;

  return (
    <li
      key={`${entry.name}-${entry.downloaded ? 1 : 0}-${entry.processed ? 1 : 0}`}
      style={{ fontFamily: "monospace" }}
      aria-label={label}
    >
      {entry.name}
      {createSpacer(entry.name, 30, ".")}
      ({state}/{totalSteps})
    </li>
  );
}

function OperatingSystemStats() {
  const name = "Hayley Bloch";
  const company = "HTMAA HAYLEY BLOCH";
  const spacer = 16;
  const year = new Date().getFullYear();

  return (
    <>
      <div>
        <span className={styles["bold"]}>{name}</span>
        {createSpacer(name, spacer)}
        <span>Released: September {year}</span>
      </div>
      <div>
        <span className={styles["bold"]}>{company}</span>
        {createSpacer(company, spacer)}
        <span>HTMAA © {year} Hayley Bloch</span>
      </div>
      <br />
    </>
  );
}

function ShowLoadingResources(loadingProgress: LoadingProgress) {
  const resources = loadingProgress.listAllEntries();
  const status = ResourceLoadingStatus(loadingProgress);
  const items = resources.map(DisplayResource);

  return (
    <div>
      {status}
      <ul>{items}</ul>
    </div>
  );
}

function ShowUserMessage(props: { onClick: () => void }) {
  const { onClick } = props;
  const [smallWindow, setSmallWindow] = useState(false);

  useEffect(() => {
    const update = () => setSmallWindow(isMobileDevice());
    update();

    let raf: number | null = null;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={styles["user-message"]}>
      <div className={styles["user-message-position-container"]}>
        <div className={styles["user-message-container"]}>
          <h1>Portfolio of Hayley Bloch</h1>
          {smallWindow && (
            <p className={styles["warning"]}>
              WARNING: This portfolio is best experienced on a desktop, laptop, or a tablet computer
            </p>
          )}
          

          <p>
            <span className={styles["continue-text"]}>Click continue to begin</span>
            <span className={styles["blinking-cursor"]}></span>
          </p>
          <div className={styles["button-center-container"]}>
            <button onClick={onClick} autoFocus aria-label="Continue to portfolio">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowBios() {
  const magi1 = "Melchior, Magi 1";
  const magi2 = "Balthasar, Magi 2";
  const magi3 = "Casper, Magi 3";
  const length = 30;

  return (
    <div>
      <p>Magi, Hayleysoft, bv, 1998 to 2024</p>
      <h3>Components</h3>
      <ul>
        <li>
          {magi1}
          {createSpacer(magi1, length, ".")}Linked
        </li>
        <li>
          {magi2}
          {createSpacer(magi2, length, ".")}Linked
        </li>
        <li>
          {magi3}
          {createSpacer(magi3, length, ".")}Linked
        </li>
      </ul>
    </div>
  );
}

function DisplayWebGLError() {
  return (
    <div className={styles["loading-progress"]}>
      <OperatingSystemStats />
      <div className={styles["error-container"]}>
        <h3>ERROR: No WebGL detected</h3>
        <p>WebGL is required to run this site.</p>
        <p>Please enable it or switch to a browser that supports WebGL.</p>
      </div>
    </div>
  );
}

function LoadingUnderscore() {
  return (
    <div className={styles["loading-underscore"]}>
      <span className={styles["blinking-cursor"]}></span>
    </div>
  );
}

// Provide a footer component to satisfy usage in render
function DisplayLoadingFooter() {
  return null;
}

/* ---------- main component ---------- */

export function SceneLoader() {
  const [loading, setLoading] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showMessage, setShowMessage] = useState(true);
  const [showLoadingUnderscore, setLoadingUnderscore] = useState(true);

  const scenesRef = useRef<RendererScenes>(createRenderScenes());
  const managerRef = useRef<AssetManager | null>(null);
  const actions = useRef<UpdateAction[]>([]);

  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress | null>(null);
  const [supportsWebGL, setSupportsWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    const hasWebGL = detectWebGL();
    setSupportsWebGL(hasWebGL);
    if (!hasWebGL) return;

    managerRef.current = new AssetManager(scenesRef.current, new LoadingManager());
    const manager = managerRef.current;
    manager.init(isDebug());
    manager.reset();

    const loaders = [
      ["Linked to Magi 1", NoopLoader()],
      ["Linked to Magi 2", NoopLoader()],
      ["Linked to Magi 3", NoopLoader()],
      ["Loading desk", DeskLoader()],
      ["Loading cables", CablesLoader()],
      ["Loading mouse", MouseLoader()],
      ["Loading lights", LightsLoader()],
      ["Loading floor", FloorLoader()],
      ["Loading plant", PlantLoader()],
      ["Loading Alchemical Hydra", HydraLoader()],
      ["Loading Iris Box", IrisBoxLoader()],
      ["Loading keyboard", KeyboardLoader()],
      ["Loading monitor", MonitorLoader()]
    ] as const;

    loaders.forEach(([name, loader]) => manager.add(name, loader));

    setLoadingProgress(manager.loadingProgress());

    const abortController = new AbortController();

    const fetchData = async () => {
      const { updateActions } = await manager.load(abortController.signal, () => {
        setLoadingProgress(manager.loadingProgress());
      });

      if (!abortController.signal.aborted) {
        actions.current = updateActions;
        setLoading(false);
      }
    };

    fetchData();
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    if (!loadingProgress) return;

    if (loadingProgress.isDoneLoading()) {
      if (!isDebug()) {
        setTimeout(() => setShowProgress(false), 50);
        setTimeout(() => {
          setLoadingUnderscore(false);
          if (!isMobileDevice()) setShowMessage(false);
        }, 400);
      } else {
        setShowMessage(false);
        setShowProgress(false);
        setLoadingUnderscore(false);
      }
    }
  }, [loadingProgress]);

  if (supportsWebGL === null) return <></>;
  if (supportsWebGL === false) return DisplayWebGLError();

  return (
    <>
      {showProgress && loadingProgress && (
        <div className={styles["loading-progress"]}>
          <OperatingSystemStats />
          <ShowBios />
          {ShowLoadingResources(loadingProgress)}
          <DisplayLoadingFooter />
        </div>
      )}

      {showLoadingUnderscore && <LoadingUnderscore />}

      {showMessage && <ShowUserMessage onClick={() => setShowMessage(false)} />}

      <Renderer loading={loading} showMessage={showMessage} scenes={scenesRef.current} actions={actions.current} />
    </>
  );
}
