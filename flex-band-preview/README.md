# Flex band preview

Parametric 3D model of a fully flexible, Nothing-style fitness band: clear shell, exposed flex PCB,
1.5" flexible OLED (dot-matrix), battery and optical sensor on the skin side.

## Contents
| Path | What it is |
| --- | --- |
| `index.html` | Standalone three.js preview page (no build step) |
| `src/NothingTracker.jsx` | React Three Fiber component (`<TrackerScene />` or `<Tracker />`) |
| `assets/flex-band.glb` | Exported 3D model (metres, 1 mm = 0.001). Named nodes per component |
| `scripts/export-glb.mjs` | Regenerates the GLB from the same parametric spec |

## Preview
```bash
npm start        # serves the folder, open the printed URL
```
`index.html` loads three.js from jsDelivr, so it needs an internet connection.

## Use in React
```bash
npm i three @react-three/fiber @react-three/drei
```
```jsx
import TrackerScene from "./src/NothingTracker";
<div style={{ height: 600 }}><TrackerScene /></div>
```
To load the GLB instead: `const { scene } = useGLTF("/assets/flex-band.glb")` (drei).
The GLB has plain materials only; the dot-matrix screen and PCB traces are procedural textures
generated in the page and the React component.

## Regenerate the GLB
```bash
npm i
npm run export:glb
```

## Dimensions
Edit `SPEC` (in all three files) to resize the band. Package sizes for the STM32, BlueNRG, MAX86141,
STBC03 and W25Q128 are estimates. Check them against the datasheets.
