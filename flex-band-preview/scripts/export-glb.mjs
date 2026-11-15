// Builds the band procedurally and writes assets/flex-band.glb (units: metres, 1 mm = 0.001).
// Run: npm i && npm run export:glb
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { writeFileSync } from "node:fs";

// Minimal FileReader shim so GLTFExporter works in Node
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(b => { this.result = b; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(b => { this.result = "data:application/octet-stream;base64," + Buffer.from(b).toString("base64"); this.onloadend?.(); }); }
};

const SPEC = { a: 29, b: 22.5, shellT: 7.5, bandW: 24, display: { arc: 34.1, width: 17 }, pcb: { width: 20, thick: 0.2, off: 4.4 }, battery: [22, 15, 4] };
const A = SPEC.a, B = SPEC.b, N = 720, TS = [], SS = [0];
for (let i = 0; i <= N; i++) {
  const t = 2 * Math.PI * i / N; TS.push(t);
  if (i > 0) { const p = t - Math.PI / N; SS.push(SS[i - 1] + Math.hypot(A * Math.cos(p), B * Math.sin(p)) * (2 * Math.PI / N)); }
}
const C = SS[N];
function tAt(s) { s = ((s % C) + C) % C; let lo = 0, hi = N; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (SS[m] <= s) lo = m; else hi = m; } return TS[lo] + (s - SS[lo]) / (SS[hi] - SS[lo] || 1) * (TS[hi] - TS[lo]); }
function frameAt(s, off = 0) { const t = tAt(s), sx = Math.sin(t), cy = Math.cos(t); let nx = sx / A, ny = cy / B; const l = Math.hypot(nx, ny); nx /= l; ny /= l; return { x: A * sx + nx * off, y: B * cy + ny * off, rot: Math.atan2(-nx, ny), nx, ny }; }
function ribbon(s0, s1, w, off, seg) {
  const pos = [], nor = [], uv = [], idx = [];
  for (let i = 0; i <= seg; i++) { const f = frameAt(s0 + (s1 - s0) * i / seg, off); for (let j = 0; j < 2; j++) { pos.push(f.x, f.y, (j - .5) * w); nor.push(f.nx, f.ny, 0); uv.push(i / seg, 1 - j); } if (i < seg) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
}

const root = new THREE.Group(); root.name = "FlexBand"; root.scale.setScalar(0.001);
const named = (o, n) => (o.name = n, o);

// Shell
const shape = new THREE.Shape(); shape.absellipse(0, 0, A + SPEC.shellT, B + SPEC.shellT, 0, Math.PI * 2, false, 0);
const hole = new THREE.Path(); hole.absellipse(0, 0, A, B, 0, Math.PI * 2, true, 0); shape.holes.push(hole);
const sg = new THREE.ExtrudeGeometry(shape, { depth: SPEC.bandW, bevelEnabled: false, curveSegments: 160 }); sg.translate(0, 0, -SPEC.bandW / 2);
root.add(named(new THREE.Mesh(sg, new THREE.MeshPhysicalMaterial({ name: "ClearShell", color: 0xffffff, transparent: true, opacity: 0.16, roughness: 0.08, clearcoat: 1, side: THREE.DoubleSide })), "Shell"));

// Flex PCB + display
root.add(named(new THREE.Mesh(ribbon(0, C, SPEC.pcb.width, SPEC.pcb.off, 720), new THREE.MeshStandardMaterial({ name: "Polyimide", color: 0xc98a1c, roughness: 0.5, side: THREE.DoubleSide })), "FlexPCB"));
root.add(named(new THREE.Mesh(ribbon(-SPEC.display.arc / 2, SPEC.display.arc / 2, SPEC.display.width, 5.6, 48), new THREE.MeshStandardMaterial({ name: "OLED", color: 0x000000, roughness: 0.2, side: THREE.DoubleSide })), "Display_OLED_1.5in"));

// Components
function chip(name, s, [l, w, h], dir, color) {
  const f = frameAt(s, SPEC.pcb.off + dir * (SPEC.pcb.thick / 2 + h / 2));
  const m = new THREE.Mesh(new THREE.BoxGeometry(l, h, w), new THREE.MeshStandardMaterial({ name: name + "_mat", color, roughness: 0.45, metalness: 0.2 }));
  m.name = name; m.position.set(f.x, f.y, 0); m.rotation.z = f.rot; root.add(m);
}
chip("MCU_STM32U3C5CI", 26, [7, 7, 0.7], 1, 0x1a1a1a);
chip("Charger_STBC03", 40, [3, 3, 0.9], 1, 0x1a1a1a);
chip("Flash_W25Q128JV", 54, [6, 5, 0.8], 1, 0x1a1a1a);
chip("Accel_LIS2DUX12", -26, [2, 2, 0.74], 1, 0x1a1a1a);
chip("BLE_BLUENRG-M2SA", -42, [11.5, 13.5, 2], 1, 0x222222);
chip("Battery_KP-401522", -66, SPEC.battery, -1, 0x3b3b3b);
chip("Optical_MAX86141", C / 2, [9, 7, 1.4], -1, 0x101010);

new GLTFExporter().parse(root, (glb) => {
  writeFileSync(new URL("../assets/flex-band.glb", import.meta.url), Buffer.from(glb));
  console.log("Wrote assets/flex-band.glb", glb.byteLength, "bytes");
}, (e) => { console.error(e); process.exit(1); }, { binary: true });
