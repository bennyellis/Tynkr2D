# Tynkr2D Alpha 0.1

Tynkr2D Alpha is a Windows-first desktop motion graphics editor with a local browser preview path. This first build focuses on independent editable 2D planes in a 3D-perspective scene, direct canvas manipulation, and a small keyframe timeline.

## Run the desktop app

Install Node.js 20 or newer, then from this directory:

```powershell
npm install
npm start
```

To build a Windows installer:

```powershell
npm run dist:win
```

The installer is written to `dist/`. For a portable Windows ZIP build that can be packaged on Linux without Wine, run `npm run dist:win:portable`, extract the ZIP, and launch `Tynkr2D Alpha.exe`. To use the dependency-free browser preview instead, open `index.html` in a modern desktop browser or serve this folder with `py -m http.server 4173` and visit <http://localhost:4173>.

## Alpha features

- Starter scene with independent market background, chart, coin reflection, and coin layers.
- Select layers in the canvas, layer list, or timeline. Edit directly in the preview with Move (W), Rotate (E), and Scale (R) modes. Move mode exposes independent X, Y, and Z handles; dragging a layer body moves in X/Y, Rotate mode rotates around Z, and Scale mode scales from the layer center. Layers remain separate objects.
- Edit position, depth, 3-axis rotation, scale, opacity, color, text, shape style, visibility, protection, blend mode, and quick effects in the inspector.
- Scrub and play the composition timeline, create editable transform keyframes, click a keyframe to jump to its time, drag it to retime it, and delete the selected keyframe with Delete (or double-click its diamond). Right-click a keyframe to protect or unprotect it; protected frames cannot be changed or deleted until unprotected. Undo and redo are available.
- Autosave to local browser/app storage. Desktop open/save dialogs load and write editable `.tynkr.json` project files.
- Export the visible scene at the current playhead as a 1920 × 1080 SVG still.
- Keep the same editable scene when switching between the Motion Graphics and Video Editing workspace tabs.
- Adjust preview quality and open the isolated Directional Gravity Lab demo.

## Current limits

- Video Editing is a workspace shell. Video/audio media import, clip editing, sound, and video export are not implemented.
- SVG export is a still-frame 2D export. It does not reproduce perspective projection or output motion/video.
- Preview quality currently changes display styling only. It does not alter source media, project data, or SVG export resolution.
- The Gravity Lab is isolated from the composition timeline and layer physics.
- AI editing is not connected to a model provider. The AI Assistant shows a local preview state and does not send prompts.
- Imported images are embedded in the project file as data URLs, which can make project files large.

## Development notes

The desktop shell is Electron with context isolation, Node integration disabled in the renderer, and a narrow preload bridge for native dialogs and window controls. The editor itself remains dependency-free HTML, CSS, and JavaScript. Project state is plain JSON to keep it portable and editable.
