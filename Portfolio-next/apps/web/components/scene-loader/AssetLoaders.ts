import { AmbientLight, Box3, BufferGeometry, Color, DirectionalLight, HemisphereLight, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Scene, Texture, Vector3, SRGBColorSpace } from "three";
import { AssetLoader, AssetManagerContext, OptionalUpdateAction } from "./AssetManager";
import { AssetKeys } from "./AssetKeys";
import { RendererScenes } from "../renderer/Renderer";
import { isSafari } from "../renderer/util";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";
import { degToRad } from "three/src/math/MathUtils";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

// Declare process for browser environment
declare const process: {
  env: {
    NEXT_PUBLIC_VERCEL_ENV?: string;
    NEXT_PUBLIC_VERCEL_BRANCH_URL?: string;
    NEXT_PUBLIC_TARGET_URL?: string;
  };
} | undefined;

export const DisplayParentName = "DisplayParent";
export const DisplayName = "Display";
const MonitorName = "Monitor";
const ComputerName = "Computer";
const DeskName = "Desk";
const NamePlateName = "NamePlate";
const FloorName = "Floor";

async function loadTexture(context: AssetManagerContext, asset: string): Promise<Texture> {
  const texture = await context.textureLoader.loadAsync(asset);

  texture.flipY = false;

  return texture;
}

async function loadModel(context: AssetManagerContext, asset: string): Promise<GLTF> {
  return await context.gltfLoader.loadAsync(asset);
}

function enableCameraCollision(asset: GLTF): void {
  for (const obj of asset.scene.children) {
    obj.userData[AssetKeys.CameraCollidable] = true;
  }
}

function worldBox(obj: Object3D): Box3 {
  obj.updateWorldMatrix(true, true);
  return new Box3().setFromObject(obj);
}

function placeOnTopOf(object: Object3D, support: Object3D, yPad = 0.002) {
  const sBox = worldBox(support);
  const oBox = worldBox(object);

  const oSize = oBox.getSize(new Vector3());
  const oCenter = oBox.getCenter(new Vector3());
  const targetY = sBox.max.y + (oSize.y * 0.5) + yPad;

  object.position.y += targetY - oCenter.y;
  object.updateMatrixWorld();
}

function findDesk(scene: Object3D): Object3D | null {
  let desk: Object3D | null = null;
  scene.traverse((o: Object3D) => { if (o.name === "Desk") { desk = o; } });
  return desk;
}

export function createRenderScenes(): RendererScenes {
  const sourceScene = new Scene();

  // The SAOPass doesn't work if the background is 0xFFFFFF, so we opt for 0xFEFEFE instead
  // I thought it came due to the cutout shader, but it doesn't seem to have any effect on it.
  sourceScene.background = new Color(0xFEFEFE);

  return {
    sourceScene,
    cutoutScene: new Scene(),
    cssScene: new Scene()
  };
}

function transformWebUrlToDesktop(webUrl: string): string {
  const parts = webUrl.split('-');

  const index = parts.findIndex(x => x === 'web');
  parts[index] = 'desktop';

  return 'https://' + parts.join('-');
}

function getDesktopTargetUrl(): string {
  const env = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'local' : 'local';

  if (env === 'production') {
    // Point to the desktop app deployment
    return 'https://desktop-hayley-blochs-projects.vercel.app/';
  }

  if (env === 'preview' || env === 'development') {
    const vercelUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL ?? window.location.host : window.location.host;

    return transformWebUrlToDesktop(vercelUrl);
  } else {
    // For local development, point to the desktop app running on port 3000
    const target = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_TARGET_URL ?? 'http://127.0.0.1:3000/' : 'http://127.0.0.1:3000/';

    return target;
  }
}

function getDesktopTarget(debug: boolean): string {
  const url = getDesktopTargetUrl();

  if (!debug) { return url; }

  return `${url}/?debug`;
}

export function NoopLoader(): AssetLoader {
  return {
    downloader: null,
    builder: null,
    builderProcessTime: 0
  }
}

export function LightsLoader(): AssetLoader {
  function builder(context: AssetManagerContext): OptionalUpdateAction {
    const ambientLight = new AmbientLight(0x404040);
    ambientLight.intensity = 5; // slightly higher fill
    context.scenes.sourceScene.add(ambientLight);

    // Add a shadow-casting key light for visible shadows
    const dir = new DirectionalLight(0xffffff, 0.55); // a touch softer
    dir.position.set(5, 10, 5);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    const cam = dir.shadow.camera as any;
    cam.near = 0.1;
    cam.far = 50;
    cam.left = -10; cam.right = 10; cam.top = 10; cam.bottom = -10;
    dir.shadow.bias = -0.0005;
    // For VSMShadowMap this adds extra smoothing
    // @ts-ignore
    dir.shadow.blurSamples = 32;
    context.scenes.sourceScene.add(dir);

    // Add a gentle sky/ground fill to soften contrast
    const hemi = new HemisphereLight(0xffffff, 0x888888, 0.4);
    context.scenes.sourceScene.add(hemi);

    return null;
  }

  return {
    downloader: null,
    builder,
    builderProcessTime: 0
  }
}

export function FloorLoader(): AssetLoader {
  let asset: GLTF | null = null;
  let texture: Texture | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const textureLoader = async () => { texture = await loadTexture(context, '/assets/SmoothFloor.jpg'); }
    const assetLoader   = async () => { asset = await loadModel(context, '/assets/SmoothFloor.glb'); }

    await Promise.all([textureLoader(), assetLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!texture) { return null; }
    if (!asset) { return null; }

    enableCameraCollision(asset);

    context.scenes.sourceScene.add(asset.scene);

    const material = new MeshBasicMaterial({ map: texture });
    asset.scene.traverse((node: Object3D) => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
    });

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function DeskLoader(): AssetLoader {
  let asset: GLTF | null = null;
  let texture: Texture | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const textureLoader = async () => { texture = await loadTexture(context, '/assets/Desk.jpg'); }
    const assetLoader   = async () => { asset = await loadModel(context, '/assets/Desk.glb'); }

    await Promise.all([textureLoader(), assetLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!texture) { return null; }
    if (!asset) { return null; }

    for (const obj of asset.scene.children) {
      obj.userData[AssetKeys.CameraCollidable] = true;
    }

    const material = new MeshStandardMaterial({ map: texture, roughness: 1.0, metalness: 0.0 });
    asset.scene.traverse((node: Object3D) => {
      if (!(node instanceof Mesh)) { return; }

      if (node.name === DeskName) {
        node.material = material;
        node.receiveShadow = true;
      }
    });

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function MonitorLoader(): AssetLoader {
  let monitorTexture: Texture | null = null;
  let computerTexture: Texture | null = null;
  let namePlateTexture: Texture | null = null;

  let asset: GLTF | null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const monitorLoader   = async () => { monitorTexture = await loadTexture(context, '/assets/Monitor.jpg'); }
    const computerLoader  = async () => { computerTexture = await loadTexture(context, '/assets/Computer.jpg'); }
    const namePlateLoader = async () => { namePlateTexture = await loadTexture(context, '/assets/NamePlate.jpg'); }
    const assetLoader     = async () => { asset = await loadModel(context, '/assets/Monitor.glb'); }

    await Promise.all([monitorLoader(), computerLoader(), namePlateLoader(), assetLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }
    if (!monitorTexture || !computerTexture) { return null; }

    asset.scene.name = DisplayParentName;

    const displayMaterial = new MeshBasicMaterial({ color: 0x000000 });
    displayMaterial.stencilWrite = true;
    displayMaterial.transparent = true;

    const monitorMaterial   = new MeshBasicMaterial({ map: monitorTexture });
    const computerMaterial  = new MeshBasicMaterial({ map: computerTexture });
    const nameplateMaterial = new MeshBasicMaterial({ map: namePlateTexture });

    asset.scene.traverse((node: Object3D) => {
      if (!(node instanceof Mesh)) { return; }

      switch (node.name) {
        case DisplayName:
          node.material = displayMaterial;
          break;
        case MonitorName:
          node.material = monitorMaterial;
          break;
        case ComputerName:
          node.material = computerMaterial;
          break;
        case NamePlateName:
          node.material = nameplateMaterial;
          break;
      }
    });

    const display = asset.scene.children.find((x: Object3D) => x.name === DisplayName) as Mesh<BufferGeometry, Material>;
    const cutoutDisplay = display.clone();
    display.visible = false;

    const box = display.geometry.boundingBox ?? new Box3();

    const pageWidth = 1280;
    const pageHeight = 980;

    // Use a slightly higher margin on Safari, as 0.1 gives white lines and 0.2 is too big for other browser to look nice.
    const margin = isSafari() ? 0.2 : 0.1;

    const width   = (box.max.x - box.min.x) + margin;
    const height  = width * (pageHeight / pageWidth);
    const depth   = (box.max.z - box.min.z);

    const planeHeight = Math.sqrt(Math.pow(depth, 2) + Math.pow(height, 2));

    const viewHeightScale = planeHeight / pageHeight;
    const viewWidthScale  = width / pageWidth;

    // TODO: Calculate the correct aspect ratio for the content
    const container = document.createElement('div');
    container.style.width = `${pageWidth}px`;
    container.style.height = `${pageHeight}px`;

    const iframe = document.createElement('iframe');
    iframe.id = 'operating-system-iframe';
    iframe.classList.add("iframe-container");
    iframe.style.width = `100%`;
    iframe.style.height = `100%`;
    iframe.style.backgroundColor = 'black';
    iframe.style.boxSizing = 'border-box';
    iframe.style.padding = '32px';

    iframe.src = getDesktopTarget(context.debug);

    container.appendChild(iframe);
    const cssPage = new CSS3DObject(container);

    const [localX, localY, localZ] = [
      (box.min.x - margin / 2) + width / 2,
      (box.min.y - margin / 2) + height / 2,
      box.min.z + depth / 2
    ];

    const [x, y, z] = [
      cutoutDisplay.position.x + localX,
      cutoutDisplay.position.y + localY,
      cutoutDisplay.position.z + localZ
    ];

    cssPage.position.set(x, y, z)

    cssPage.scale.set(viewWidthScale, viewHeightScale, 1);
    cssPage.rotateX(Math.atan(height / depth) - degToRad(90));

    context.scenes.cssScene.add(cssPage);
    context.scenes.sourceScene.add(asset.scene);
    context.scenes.cutoutScene.add(cutoutDisplay);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 250
  }
}

export function KeyboardLoader(): AssetLoader {
  let caseTexture: Texture | null = null;
  let keyCapTexture: Texture | null = null;

  let asset: GLTF | null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const caseTextureLoader   = async () => { caseTexture = await loadTexture(context, '/assets/KeyboardCase.jpg'); }
    const keyCapTextureLoader = async () => { keyCapTexture = await loadTexture(context, '/assets/KeyboardKeyCaps.jpg'); }

    const assetLoader = async () => { asset = await loadModel(context, '/assets/Keyboard.glb'); }

    await Promise.all([
      caseTextureLoader(),
      keyCapTextureLoader(),
      assetLoader()
    ]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }
    if (!caseTexture || !keyCapTexture) { return null; }

    enableCameraCollision(asset);

    const caseMaterial    = new MeshBasicMaterial({ map: caseTexture });
    const keyCapMaterial  = new MeshBasicMaterial({ map: keyCapTexture });

    asset.scene.traverse((node: Object3D) => {
      if (!(node instanceof Mesh)) { return; }

      if (node.name === "Case") {
        node.material = caseMaterial;
      } else {
        node.material = keyCapMaterial;
      }
    })

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function MouseLoader(): AssetLoader {
  let texture: Texture | null = null;
  let asset: GLTF | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const textureLoader = async () => { texture = await loadTexture(context, '/assets/Mouse.jpg'); }
    const assetLoader = async () => { asset = await loadModel(context, '/assets/Mouse.glb'); }

    await Promise.all([textureLoader(), assetLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }
    if (!texture) { return null; }

    const material = new MeshBasicMaterial({ map: texture });

    asset.scene.traverse((node: Object3D) => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
    });

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function CablesLoader(): AssetLoader {
  let asset: GLTF | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    asset = await loadModel(context, '/assets/Cables.gltf');
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }

    const material = new MeshBasicMaterial({ color: 0x303030 });

    asset.scene.traverse((node: Object3D) => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
    });

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function HydraLoader(): AssetLoader {
  let asset: GLTF | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    asset = await context.gltfLoader.loadAsync('/assets/Bust.gltf');
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }

    const root = asset.scene;

    // Apply requested transform: 90° clockwise around Y and scale to 1/5
    root.scale.setScalar(0.55);
    root.rotateY(-Math.PI /1.5);

    root.traverse((n: Object3D) => {
      // @ts-ignore – runtime check from three
      if (n.isMesh) {
        const mesh = n as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Use lit white material; add slight emissive to avoid looking grey
        const mat = new MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.9,
          metalness: 0.0,
          emissive: 0xffffff,
          emissiveIntensity: 0.2
        });
        mesh.material = mat;
        const geo: any = mesh.geometry as any;
        if (geo && typeof geo.computeVertexNormals === 'function') {
          geo.computeVertexNormals();
        }
      }
    });

    const desk = findDesk(context.scenes.sourceScene);
    if (desk) {
      placeOnTopOf(root, desk, 0.002);
      // Optional desk-plane nudge:
      root.position.x += 5.75;
      root.position.z -= 1;
      // root.position.z += 0.08;
    }

    context.scenes.sourceScene.add(root);

    // Add a subtle rim light to enhance silhouette
    const rim = new DirectionalLight(0xffffff, 0.35);
    rim.position.set(-6, 7, -4);
    rim.castShadow = false;
    context.scenes.sourceScene.add(rim);
    return null;
  }

  return { downloader, builder, builderProcessTime: 0 };
}

export function IrisBoxLoader(): AssetLoader {
  let asset: Object3D | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader');
    const loader = new OBJLoader((context as any).gltfLoader?.manager);
    asset = await loader.loadAsync('/assets/iris-box.obj');
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }

    const root = asset;

    // Reasonable size/orientation on the desk
    root.scale.setScalar(0.15);
    root.rotateY(Math.PI / 6);
    root.rotateX(Math.PI / 2);

    root.traverse((n: Object3D) => {
      // @ts-ignore
      if (n.isMesh) {
        const mesh = n as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Wooden look using warm brown albedo and matte finish
        mesh.material = new MeshStandardMaterial({ color: 0xC19A6B, roughness: 0.85, metalness: 0.05 });
      }
    });

    const desk = findDesk(context.scenes.sourceScene);
    if (desk) {
      placeOnTopOf(root, desk, 0.002);
      // Place on the other side of the desk from the bust
      root.position.x -= 7.0;
      root.position.z -= 0;
    }

    context.scenes.sourceScene.add(root);
    return null;
  }

  return { downloader, builder, builderProcessTime: 0 };
}

export function PlantLoader(): AssetLoader {
  let asset: GLTF | null = null;
  let texture: Texture | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const assetLoader = async () => { asset = await loadModel(context, '/assets/Plant.glb'); }
    const textureLoader = async () => { texture = await loadTexture(context, '/assets/Plant.jpg'); }

    await Promise.all([assetLoader(), textureLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }

    let material = new MeshBasicMaterial({ map: texture });

    asset.scene.traverse((node: Object3D) => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
    });

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}
