/**
 * NothingTracker.jsx — parametric 3D framework of a fully flexible fitness band.
 * Design language: Nothing (transparent shell, exposed internals, dot-matrix display, single red accent).
 *
 * Install:  npm i three @react-three/fiber @react-three/drei
 * Usage:    import TrackerScene from "./NothingTracker";
 *           <div style={{ height: 600 }}><TrackerScene /></div>
 *           // or drop <Tracker /> inside your own <Canvas>
 *
 * All geometry is authored in MILLIMETRES and scaled by MM at the root.
 * Radial "offset" = distance outward from the skin-side (inner) surface.
 * Values marked (est.) are package-size estimates — confirm against datasheets.
 */
import React, { useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Edges, Html } from "@react-three/drei";

/* ---------- Spec (from your BOM) ---------- */
export const SPEC = {
  wrist: { a: 29, b: 22.5 },   // inner semi-axes, mm (≈163 mm loop). Adjust for sizing.
  shellThickness: 7.5,         // clear TPU/silicone encapsulation, mm
  bandWidth: 24,               // along arm axis, mm
  display: { arc: 34.1, width: 17.0, thick: 0.4 },    // 1.5" 120x240 flexible OLED (derived from 1:2 aspect)
  pcb: { width: 20, thick: 0.2, offset: 4.4 },        // flex polyimide, mid-stack
  battery: { size: [22, 15, 4] },                     // KP-401522 → 22×15×4 mm, 180 mAh
};

const MM = 0.1;
const RED = "#ff2d2d";
const { a: A, b: B } = SPEC.wrist;

/* ---------- Ellipse arc-length helpers ---------- */
const N = 720;
const TS = [], SS = [0];
for (let i = 0; i <= N; i++) {
  const t = (2 * Math.PI * i) / N;
  TS.push(t);
  if (i > 0) {
    const p = (t - Math.PI / N);
    SS.push(SS[i - 1] + Math.hypot(A * Math.cos(p), B * Math.sin(p)) * (2 * Math.PI / N));
  }
}
const C = SS[N]; // loop circumference at skin surface
export const LOOP_MM = C;

function tAt(s) {
  s = ((s % C) + C) % C;
  let lo = 0, hi = N;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (SS[m] <= s) lo = m; else hi = m; }
  const f = (s - SS[lo]) / (SS[hi] - SS[lo] || 1);
  return TS[lo] + f * (TS[hi] - TS[lo]);
}
// s = arc position in mm, clockwise from top-centre. off = radial offset outward.
function frameAt(s, off = 0) {
  const t = tAt(s), sx = Math.sin(t), cy = Math.cos(t);
  let nx = sx / A, ny = cy / B;
  const l = Math.hypot(nx, ny); nx /= l; ny /= l;
  return { x: A * sx + nx * off, y: B * cy + ny * off, rot: Math.atan2(-nx, ny), nx, ny };
}

/* ---------- Curved ribbon (display, PCB) ---------- */
function ribbon(s0, s1, w, off, seg = 160) {
  const pos = [], nor = [], uv = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const f = frameAt(s0 + ((s1 - s0) * i) / seg, off);
    for (let j = 0; j < 2; j++) {
      pos.push(f.x, f.y, (j - 0.5) * w);
      nor.push(f.nx, f.ny, 0);
      uv.push(i / seg, 1 - j);
    }
    if (i < seg) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

/* ---------- Procedural textures ---------- */
function dotMatrixTexture() {
  const W = 240, H = 120, cell = 4;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  const t = document.createElement("canvas"); t.width = W / cell; t.height = H / cell;
  const tx = t.getContext("2d", { willReadFrequently: true });
  tx.fillStyle = "#fff"; tx.textBaseline = "top";
  tx.font = "bold 19px monospace"; tx.fillText("10:42", 3, 1);
  tx.font = "bold 8px monospace"; tx.fillText("72 BPM", 3, 21);
  const d = tx.getImageData(0, 0, t.width, t.height).data;
  x.fillStyle = "#000"; x.fillRect(0, 0, W, H);
  for (let j = 0; j < t.height; j++) for (let i = 0; i < t.width; i++) {
    const on = d[(j * t.width + i) * 4 + 3] > 110;
    x.fillStyle = on ? "#fff" : "#1b1b1b";
    x.beginPath(); x.arc(i * cell + cell / 2, j * cell + cell / 2, on ? 1.55 : 0.8, 0, 6.283); x.fill();
  }
  x.fillStyle = RED; x.beginPath(); x.arc(W - 12, 12, 3.2, 0, 6.283); x.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
}

function pcbTexture() {
  const W = 2048, H = Math.round((W * SPEC.pcb.width) / C);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  x.fillStyle = "#c98a1c"; x.fillRect(0, 0, W, H);       // polyimide amber
  let seed = 7; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  x.strokeStyle = "#f2c76b"; x.lineWidth = 3; x.lineJoin = "round";
  for (let k = 0; k < 28; k++) {                           // copper traces
    let y = (k + 0.5) * (H / 28), px = 0;
    x.beginPath(); x.moveTo(0, y);
    while (px < W) {
      px += 60 + r() * 220; x.lineTo(px, y);
      if (r() > 0.55) { y += (r() - 0.5) * 28; x.lineTo(px + 14, y); }
    }
    x.stroke();
  }
  x.fillStyle = "#f2c76b";
  for (let k = 0; k < 140; k++) { x.beginPath(); x.arc(r() * W, r() * H, 3.5, 0, 6.283); x.fill(); }
  x.fillStyle = RED; x.beginPath(); x.arc(40, 40, 6, 0, 6.283); x.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
}

/* ---------- Parts ---------- */
const labelStyle = {
  font: "10px ui-monospace, 'Space Mono', monospace", color: "#fff", whiteSpace: "nowrap",
  padding: "1px 5px", border: "1px solid rgba(255,255,255,.55)", borderRadius: 99,
  background: "rgba(0,0,0,.55)", pointerEvents: "none",
};

/** Package on the PCB. dir=1 above the flex, dir=-1 below. size = [along arc, along arm, height] */
function Chip({ s, size, dir = 1, color = "#1a1a1a", label, labelY = 9, labelZ = 0, children, showLabel }) {
  const [l, w, h] = size;
  const f = frameAt(s, SPEC.pcb.offset + dir * (SPEC.pcb.thick / 2 + h / 2));
  return (
    <group position={[f.x, f.y, 0]} rotation={[0, 0, f.rot]}>
      <mesh>
        <boxGeometry args={[l, h, w]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.2} />
      </mesh>
      {children}
      {showLabel && label && (
        <Html position={[0, dir * labelY, labelZ]} center distanceFactor={9}>
          <div style={labelStyle}>{label}</div>
        </Html>
      )}
    </group>
  );
}

function Shell({ xray }) {
  const geo = useMemo(() => {
    const T = SPEC.shellThickness;
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, A + T, B + T, 0, Math.PI * 2, false, 0);
    const hole = new THREE.Path();
    hole.absellipse(0, 0, A, B, 0, Math.PI * 2, true, 0);
    shape.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(shape, { depth: SPEC.bandWidth, bevelEnabled: false, curveSegments: 160 });
    g.translate(0, 0, -SPEC.bandWidth / 2);
    return g;
  }, []);
  return (
    <mesh geometry={geo} renderOrder={2}>
      <meshPhysicalMaterial
        color="#ffffff" transparent opacity={xray ? 0.07 : 0.16} roughness={0.08}
        clearcoat={1} clearcoatRoughness={0.05} depthWrite={false} side={THREE.DoubleSide}
      />
      <Edges threshold={12} color="#ffffff" />
    </mesh>
  );
}

/** The model. Place inside any R3F <Canvas>. */
export function Tracker({ xray = false, labels = true, ...props }) {
  const screen = useMemo(dotMatrixTexture, []);
  const pcbMap = useMemo(pcbTexture, []);
  const dispGeo = useMemo(() => ribbon(-SPEC.display.arc / 2, SPEC.display.arc / 2, SPEC.display.width, 5.6, 48), []);
  const pcbGeo = useMemo(() => ribbon(0, C, SPEC.pcb.width, SPEC.pcb.offset, 720), []);

  return (
    <group scale={MM} {...props}>
      <Shell xray={xray} />

      {/* Flexible PCB — full loop */}
      <mesh geometry={pcbGeo}>
        <meshStandardMaterial map={pcbMap} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* 1.5" flexible OLED, top */}
      <mesh geometry={dispGeo}>
        <meshBasicMaterial map={screen} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {/* Top side of PCB (outside the display footprint so the flex stays visible) */}
      <Chip s={26}  size={[7, 7, 0.7]}      label="STM32U3C5CI" showLabel={labels} />
      <Chip s={40}  size={[3, 3, 0.9]}      label="STBC03"      showLabel={labels} labelZ={5} />
      <Chip s={54}  size={[6, 5, 0.8]}      label="W25Q128JV"   showLabel={labels} />
      <Chip s={-26} size={[2, 2, 0.74]}     label="LIS2DUX12"   showLabel={labels} labelZ={-5} />
      <Chip s={-42} size={[11.5, 13.5, 2]}  label="BLUENRG-M2SA" showLabel={labels} color="#222" />

      {/* Underside: battery + optical sensor */}
      <Chip s={-66} size={SPEC.battery.size} dir={-1} color="#3b3b3b" label="KP-401522 · 180 mAh" showLabel={labels} />
      <Chip s={C / 2} size={[9, 7, 1.4]} dir={-1} color="#101010" label="MAX86141" labelY={8} showLabel={labels}>
        {[-2, 2].map((z) => (
          <mesh key={z} position={[0, -0.75, z]}>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshBasicMaterial color="#27ff7a" toneMapped={false} />
          </mesh>
        ))}
      </Chip>
    </group>
  );
}

/** Ready-to-mount scene with camera, lighting and orbit controls. */
export default function TrackerScene({ xray = false, labels = true, autoRotate = true, background = "#0b0b0c" }) {
  return (
    <Canvas camera={{ position: [0, 6, 9], fov: 35 }} dpr={[1, 2]} style={{ background }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 8, 6]} intensity={1.6} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 6, 4]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={2} position={[-6, 2, -3]} scale={[4, 6, 1]} />
      </Environment>
      <Tracker xray={xray} labels={labels} />
      <OrbitControls enablePan={false} autoRotate={autoRotate} autoRotateSpeed={0.8} minDistance={5} maxDistance={18} />
    </Canvas>
  );
}
