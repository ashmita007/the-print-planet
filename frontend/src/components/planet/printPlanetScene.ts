import {
  AmbientLight,
  BackSide,
  BufferGeometry,
  CanvasTexture,
  CustomBlending,
  Color,
  DirectionalLight,
  DoubleSide,
  DstColorFactor,
  Float32BufferAttribute,
  FrontSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  OneFactor,
  PerspectiveCamera,
  Points,
  RepeatWrapping,
  Scene,
  Shape,
  ShapeGeometry,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  ZeroFactor,
} from "three";
import { gsap } from "@/lib/gsap";

export interface PrintPlanet {
  /** 0 is four separated plates, 1 is one registered print. */
  setProgress(value: number): void;
  setPointer(x: number, y: number): void;
  setRunning(running: boolean): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

interface PlanetOptions {
  /** Halftone dots per ink. */
  dots: number;
  /** Draws single frames on request, for reduced motion. */
  still: boolean;
  /** Family for the ribbon lettering, so it matches the page. */
  fontFamily: string;
}

const FOV = 30;
const RIBBON_RADIUS = 1.62;
const PLATE_SCALE = 0.62;
const DEG = Math.PI / 180;

/** Cover values are how much of each ink a dot lays down, as on a real separation. */
const INKS = [
  { color: "#00A0DC", screen: 15, ocean: 0.96, land: 0.04, offset: [-1.5, 0.8, -0.3] },
  { color: "#D6127E", screen: 75, ocean: 0.62, land: 0.5, offset: [1.55, 0.85, -0.5] },
  { color: "#F7D117", screen: 0, ocean: 0.02, land: 0.96, offset: [-1.45, -0.85, -0.5] },
  { color: "#0B0F14", screen: 45, ocean: 0.3, land: 0.02, offset: [1.5, -0.8, -0.3] },
] as const;

const KEY_INDEX = 3;
/** Black ink vanishes on the navy page, so the key plate reads as grey until it lands. */
const KEY_SEPARATED = new Color("#B9C3CF");

const dotVertex = /* glsl */ `
  attribute float aCover;
  uniform float uSize;
  uniform float uShade;
  uniform vec3 uLight;
  varying float vFacing;

  void main() {
    vec3 n = normalize(normalMatrix * position);
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vFacing = smoothstep(-0.02, 0.22, dot(n, normalize(-view.xyz)));

    // Shadow is printed: colour inks thin out and key builds up toward the terminator.
    float light = clamp(dot(n, uLight) * 0.55 + 0.5, 0.0, 1.0);
    float cover = uShade > 0.5
      ? clamp(aCover + (1.0 - light) * 0.42, 0.0, 1.0)
      : aCover * mix(0.5, 1.0, light);

    gl_PointSize = uSize * sqrt(cover) / -view.z;
    gl_Position = projectionMatrix * view;
  }
`;

const dotFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFacing;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = (1.0 - smoothstep(0.42, 0.5, d)) * vFacing * uOpacity;
    if (alpha < 0.01) discard;
    #ifdef OVERPRINT
      // Multiplied into the paper, so inks mix on the sheet the way real ones do.
      gl_FragColor = vec4(mix(vec3(1.0), uColor, alpha), 1.0);
    #else
      gl_FragColor = vec4(uColor, alpha);
    #endif
    #include <colorspace_fragment>
  }
`;

function hash(x: number, y: number, z: number) {
  const value = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function valueNoise(x: number, y: number, z: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fade = (t: number) => t * t * (3 - 2 * t);
  const u = fade(x - ix);
  const v = fade(y - iy);
  const w = fade(z - iz);
  const mix = (a: number, b: number, t: number) => a + (b - a) * t;
  return mix(
    mix(mix(hash(ix, iy, iz), hash(ix + 1, iy, iz), u), mix(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), u), v),
    mix(
      mix(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), u),
      mix(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), u),
      v
    ),
    w
  );
}

/** 0 on open water, rising to 1 inland. */
function landAt(x: number, y: number, z: number) {
  let total = 0;
  let amplitude = 0.55;
  let frequency = 1.5;
  for (let octave = 0; octave < 4; octave++) {
    total += valueNoise(x * frequency + 4.1, y * frequency + 1.7, z * frequency + 9.3) * amplitude;
    amplitude *= 0.5;
    frequency *= 2.1;
  }
  const edge = gsap.utils.clamp(0, 1, (total - 0.5) / 0.05);
  return edge * edge * (3 - 2 * edge);
}

/** Even dots on a sphere, turned to the ink's own screen angle so the inks form a rosette. */
function buildPlateGeometry(count: number, ink: (typeof INKS)[number]) {
  const positions = new Float32Array(count * 3);
  const covers = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const cos = Math.cos(ink.screen * DEG);
  const sin = Math.sin(ink.screen * DEG);

  for (let i = 0; i < count; i++) {
    const y0 = 1 - ((i + 0.5) / count) * 2;
    const radius = Math.sqrt(1 - y0 * y0);
    const theta = golden * i;
    const x0 = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const x = x0 * cos - y0 * sin;
    const y = x0 * sin + y0 * cos;

    positions.set([x, y, z], i * 3);
    const land = landAt(x, y, z);
    covers[i] = ink.ocean + (ink.land - ink.ocean) * land;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aCover", new Float32BufferAttribute(covers, 1));
  return geometry;
}

function canvasTexture(width: number, height: number, paint: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  paint(canvas.getContext("2d") as CanvasRenderingContext2D);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function ribbonTexture(fontFamily: string) {
  const texture = canvasTexture(2048, 128, (ctx) => {
    ctx.fillStyle = "#B9C3CF";
    ctx.fillRect(0, 0, 2048, 128);
    ctx.fillStyle = "#A9B5C3";
    ctx.fillRect(0, 0, 2048, 7);
    ctx.fillRect(0, 121, 2048, 7);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `800 58px ${fontFamily}`;
    ctx.textBaseline = "middle";
    const phrase = "THE PRINT PLANET  ·  LANYARDS  ·  ID CARDS  ·  RFID  ·  ";
    const step = ctx.measureText(phrase).width;
    for (let x = 0; x < 2048; x += step) ctx.fillText(phrase, x, 67);
  });
  texture.wrapS = RepeatWrapping;
  return texture;
}

/** A satin strip with a gentle roll along its length, so it catches the light. */
function buildRibbonGeometry(segments: number, width: number) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const roll = 0.32 + Math.sin(angle * 2) * 0.22;
    const lift = Math.sin(angle * 3) * 0.035;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (const side of [-0.5, 0.5]) {
      const across = side * width;
      const radial = RIBBON_RADIUS + across * Math.sin(roll);
      positions.push(cos * radial, lift + across * Math.cos(roll), sin * radial);
      uvs.push(-(i / segments) * 3, side + 0.5);
    }
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const CARD_WIDTH = 0.42;
const CARD_HEIGHT = 0.64;

function buildCardGeometry() {
  const w = CARD_WIDTH / 2;
  const h = CARD_HEIGHT / 2;
  const r = 0.035;
  const shape = new Shape()
    .moveTo(-w + r, -h)
    .lineTo(w - r, -h)
    .quadraticCurveTo(w, -h, w, -h + r)
    .lineTo(w, h - r)
    .quadraticCurveTo(w, h, w - r, h)
    .lineTo(-w + r, h)
    .quadraticCurveTo(-w, h, -w, h - r)
    .lineTo(-w, -h + r)
    .quadraticCurveTo(-w, -h, -w + r, -h);

  const geometry = new ShapeGeometry(shape, 6);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, position.getX(i) / CARD_WIDTH + 0.5, position.getY(i) / CARD_HEIGHT + 0.5);
  }
  return geometry;
}

function cardTexture(band: string) {
  return canvasTexture(256, 400, (ctx) => {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 256, 400);
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, 256, 104);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(98, 22, 60, 12);

    // Photo block.
    ctx.fillStyle = "#DFE6EE";
    ctx.fillRect(68, 74, 120, 136);
    ctx.fillStyle = "#5B6877";
    ctx.beginPath();
    ctx.arc(128, 126, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(128, 212, 50, 44, 0, Math.PI, 0);
    ctx.fill();

    // Name lines and barcode.
    ctx.fillStyle = "#22272E";
    ctx.fillRect(48, 234, 160, 16);
    ctx.fillStyle = "#6C7A89";
    ctx.fillRect(72, 262, 112, 10);
    ctx.fillStyle = "#363D47";
    const bars = [4, 2, 6, 3, 2, 5, 2, 4, 6, 2, 3, 5, 2, 4, 3, 6, 2, 4];
    let x = 48;
    bars.forEach((bar, i) => {
      if (i % 2 === 0) ctx.fillRect(x, 300, bar, 62);
      x += bar + 4;
    });
  });
}

export function createPrintPlanet(canvas: HTMLCanvasElement, options: PlanetOptions): PrintPlanet {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 40);
  const root = new Group();
  scene.add(root);

  scene.add(new AmbientLight("#FFFFFF", 1.5));
  const sun = new DirectionalLight("#FFFFFF", 2.1);
  sun.position.set(3, 2.2, 4);
  scene.add(sun);
  const viewLight = sun.position.clone().normalize();

  // Unprinted stock: the white of the paper the inks land on.
  const paperMaterial = new MeshStandardMaterial({ color: "#EDF1F6", roughness: 0.92, transparent: true, opacity: 0 });
  const paperGeometry = new SphereGeometry(0.985, 48, 32);
  const paper = new Mesh(paperGeometry, paperMaterial);
  paper.renderOrder = 0;
  root.add(paper);

  const plates = INKS.map((ink, index) => {
    const material = new ShaderMaterial({
      vertexShader: dotVertex,
      fragmentShader: dotFragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new Color(ink.color) },
        uOpacity: { value: 0.92 },
        uSize: { value: 1 },
        uShade: { value: index === KEY_INDEX ? 1 : 0 },
        uLight: { value: new Vector3() },
      },
    });
    const geometry = buildPlateGeometry(options.dots, ink);
    const dots = new Points(geometry, material);
    dots.renderOrder = 1 + index;

    // The same dots again, multiplied into the paper once the plate has landed.
    const printMaterial = material.clone();
    printMaterial.defines = { OVERPRINT: 1 };
    printMaterial.blending = CustomBlending;
    printMaterial.blendSrc = DstColorFactor;
    printMaterial.blendDst = ZeroFactor;
    printMaterial.blendSrcAlpha = ZeroFactor;
    printMaterial.blendDstAlpha = OneFactor;
    printMaterial.uniforms.uOpacity.value = 0;
    const printed = new Points(geometry, printMaterial);
    printed.renderOrder = 1 + index;
    printed.visible = false;

    const plate = new Group();
    plate.add(dots, printed);
    root.add(plate);
    return { ink, material, printMaterial, geometry, dots, printed, plate };
  });

  // Lanyard ribbon, tilted like the ring on the logo's planet.
  const ringGroup = new Group();
  ringGroup.rotation.set(0.32, 0, -0.3);
  root.add(ringGroup);

  const ribbonSegments = 240;
  const ribbonMap = ribbonTexture(options.fontFamily);
  const ribbonGeometry = buildRibbonGeometry(ribbonSegments, 0.17);
  // The inside of the loop gets a flipped copy, so the lettering never reads mirrored.
  const ribbonInnerMap = ribbonMap.clone();
  ribbonInnerMap.repeat.x = -1;
  const ribbonMaterial = new MeshStandardMaterial({ map: ribbonMap, roughness: 0.42, side: FrontSide });
  const ribbonInnerMaterial = new MeshStandardMaterial({ map: ribbonInnerMap, roughness: 0.42, side: BackSide });
  const ribbon = new Group();
  ribbon.add(new Mesh(ribbonGeometry, ribbonMaterial), new Mesh(ribbonGeometry, ribbonInnerMaterial));
  ribbon.children.forEach((mesh) => {
    mesh.renderOrder = 6;
  });
  ringGroup.add(ribbon);

  const cardGeometry = buildCardGeometry();
  const cards = ["#22272E", "#B9C3CF", "#00A0DC"].map((band, index) => {
    const map = cardTexture(band);
    const material = new MeshStandardMaterial({ map, roughness: 0.34, side: DoubleSide });
    const mesh = new Mesh(cardGeometry, material);
    mesh.position.y = -CARD_HEIGHT / 2 - 0.1;
    const pivot = new Group();
    pivot.add(mesh);
    ringGroup.add(pivot);
    return { map, material, mesh, pivot, angle: 0.5 + (index * Math.PI * 2) / 3 };
  });

  const easeIn = gsap.parseEase("power3.inOut");
  const easeCard = gsap.parseEase("back.out(1.6)");
  const span = (value: number, from: number, to: number) => gsap.utils.clamp(0, 1, (value - from) / (to - from));

  const keyColor = new Color(INKS[KEY_INDEX].color);
  let progress = 0;
  let spread = 1;
  let spin = 0.6;
  let width = 1;
  let height = 1;
  let running = false;

  const applyProgress = () => {
    plates.forEach(({ ink, plate }, index) => {
      const local = easeIn(span(progress, index * 0.11, index * 0.11 + 0.56));
      const away = 1 - local;
      plate.position.set(
        ink.offset[0] * away * spread,
        ink.offset[1] * away * Math.min(spread, 1),
        ink.offset[2] * away
      );
      plate.scale.setScalar(PLATE_SCALE + (1 - PLATE_SCALE) * local);
    });

    const landed = easeIn(span(progress, 0.33, 0.89));
    plates[KEY_INDEX].material.uniforms.uColor.value.copy(KEY_SEPARATED).lerp(keyColor, landed);
    plates[KEY_INDEX].printMaterial.uniforms.uColor.value.copy(keyColor);

    const stock = span(progress, 0.6, 0.86);
    paper.visible = stock > 0;
    paperMaterial.opacity = stock;
    paperMaterial.transparent = stock < 1;
    paper.scale.setScalar(PLATE_SCALE + (1 - PLATE_SCALE) * stock);

    // Crossfade from flat dots to overprinted ink, once the paper is solid under them.
    const overprint = span(progress, 0.84, 0.94);
    plates.forEach(({ material, printMaterial, dots, printed }) => {
      material.uniforms.uOpacity.value = 0.92 * (1 - overprint);
      printMaterial.uniforms.uOpacity.value = 0.94 * overprint;
      dots.visible = overprint < 1;
      printed.visible = overprint > 0;
    });

    // The ribbon feeds out around the planet, as if off a roll.
    const fed = easeIn(span(progress, 0.68, 0.98));
    ribbon.visible = fed > 0;
    ribbonGeometry.setDrawRange(0, Math.floor(fed * ribbonSegments) * 6);

    cards.forEach((card, index) => {
      const arrive = easeCard(span(progress, 0.8 + index * 0.05, 0.92 + index * 0.05));
      card.pivot.visible = arrive > 0.001;
      card.mesh.scale.setScalar(Math.max(arrive, 0.001));
    });
  };

  const applySpin = () => {
    plates.forEach(({ dots, printed }) => {
      dots.rotation.y = spin;
      printed.rotation.y = spin;
    });
    ringGroup.rotation.y = -spin * 0.35;
    ribbonMap.offset.x = spin * 0.08;
    ribbonInnerMap.offset.x = -spin * 0.08;

    cards.forEach((card) => {
      const angle = card.angle + spin * 0.5;
      card.pivot.position.set(Math.cos(angle) * RIBBON_RADIUS, 0, Math.sin(angle) * RIBBON_RADIUS);
      // Each card keeps its face toward the camera side of its orbit and sways on the ribbon.
      card.pivot.rotation.y = Math.PI / 2 - angle;
      card.pivot.rotation.z = Math.sin(spin * 1.4 + card.angle) * 0.1;
    });
  };

  const render = () => {
    camera.updateMatrixWorld();
    viewLight.copy(sun.position).normalize().transformDirection(camera.matrixWorldInverse);
    plates.forEach(({ material, printMaterial }) => {
      material.uniforms.uLight.value.copy(viewLight);
      printMaterial.uniforms.uLight.value.copy(viewLight);
    });
    renderer.render(scene, camera);
  };

  const tick = (_time: number, deltaMs: number) => {
    spin += (Math.min(deltaMs, 50) / 1000) * 0.14;
    applySpin();
    render();
  };

  const tiltX = gsap.quickTo(root.rotation, "x", { duration: 1, ease: "power3.out" });
  const tiltY = gsap.quickTo(root.rotation, "y", { duration: 1, ease: "power3.out" });

  const resize = (nextWidth: number, nextHeight: number) => {
    width = Math.max(nextWidth, 1);
    height = Math.max(nextHeight, 1);
    const aspect = width / height;
    renderer.setSize(width, height, false);
    camera.aspect = aspect;

    // Keep the ring and the swung-out cards in frame at any aspect.
    const halfFov = Math.tan((FOV / 2) * DEG);
    camera.position.z = 2.45 / (halfFov * Math.min(aspect, 1));
    camera.updateProjectionMatrix();

    spread = gsap.utils.clamp(0.55, 1.15, aspect * 0.72);
    const dotDiameter = (Math.sqrt((4 * Math.PI) / options.dots) * 1.45 * height) / (2 * halfFov);
    plates.forEach(({ material, printMaterial }) => {
      material.uniforms.uSize.value = dotDiameter * pixelRatio;
      printMaterial.uniforms.uSize.value = dotDiameter * pixelRatio;
    });
    applyProgress();
    render();
  };

  applyProgress();
  applySpin();

  return {
    setProgress(value) {
      progress = gsap.utils.clamp(0, 1, value);
      applyProgress();
      if (!running) render();
    },
    setPointer(x, y) {
      if (options.still) return;
      tiltY(x * 0.22);
      tiltX(y * 0.14);
    },
    setRunning(next) {
      if (options.still || next === running) return;
      running = next;
      if (next) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    },
    resize,
    dispose() {
      gsap.ticker.remove(tick);
      gsap.killTweensOf(root.rotation);
      plates.forEach(({ geometry, material, printMaterial }) => {
        geometry.dispose();
        material.dispose();
        printMaterial.dispose();
      });
      paperGeometry.dispose();
      paperMaterial.dispose();
      ribbonGeometry.dispose();
      ribbonMaterial.dispose();
      ribbonInnerMaterial.dispose();
      ribbonMap.dispose();
      ribbonInnerMap.dispose();
      cardGeometry.dispose();
      cards.forEach(({ map, material }) => {
        map.dispose();
        material.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
