(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const STORAGE_KEY = 'tynkr2d-alpha-project-v1';
  const W = 1920, H = 1080;
  const palette = ['#be8cf1', '#7fd5ba', '#f1a36b', '#79a9f4', '#f1879d', '#e3ce75'];
  let uid = 1, toastTimer, state, history = [], historyIndex = -1, suppressHistory = false, activeInspectorTab = 'properties';
  const defaults = () => ({
    name: 'Untitled composition', duration: 10, currentTime: 0, workspace: 'motion', quality: 'preview', camera: true, transformMode: 'move',
    layers: [], selectedId: null, selectedKeyframeId: null, gravity: { running: true, forceX: 0, forceY: 16, relationship: 52, a: { x: 36, y: 33 }, b: { x: 56, y: 33 }, last: 0 }
  });
  const clone = v => JSON.parse(JSON.stringify(v));
  const id = () => `layer-${Date.now().toString(36)}-${(uid++).toString(36)}`;
  const keyframeId = () => `keyframe-${Date.now().toString(36)}-${(uid++).toString(36)}`;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, Number(n) || 0));
  const svgUrl = svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  function sampleBackgroundSvg() { return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="b" x2=".2" y2="1"><stop stop-color="#061b37"/><stop offset=".55" stop-color="#123f80"/><stop offset="1" stop-color="#06182e"/></linearGradient><radialGradient id="g"><stop stop-color="#2ea9ff" stop-opacity=".45"/><stop offset="1" stop-color="#087cff" stop-opacity="0"/></radialGradient><filter id="blur"><feGaussianBlur stdDeviation="30"/></filter></defs><rect width="1920" height="1080" fill="url(#b)"/><ellipse cx="920" cy="500" rx="700" ry="260" fill="url(#g)"/><path d="M0 240L1920 660M0 620L1920 120" stroke="#4c9be8" stroke-opacity=".2" stroke-width="10" filter="url(#blur)"/><g stroke="#a5c8e9" stroke-opacity=".13" stroke-width="2">${Array.from({length:16},(_,i)=>`<path d="M${i*130} 0L${i*130} 1080"/>`).join('')}${Array.from({length:10},(_,i)=>`<path d="M0 ${i*120}H1920"/>`).join('')}</g><path d="M0 750 C170 710 230 690 340 720 S500 790 610 640 S780 630 870 585 S1040 640 1160 470 S1330 490 1430 420 S1620 460 1710 270 S1840 320 1920 205" fill="none" stroke="#30aaff" stroke-opacity=".35" stroke-width="30" filter="url(#blur)"/><path d="M0 750 C170 710 230 690 340 720 S500 790 610 640 S780 630 870 585 S1040 640 1160 470 S1330 490 1430 420 S1620 460 1710 270 S1840 320 1920 205" fill="none" stroke="#35baff" stroke-width="5"/></svg>`; }
  function sampleGraphSvg() { return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="800" viewBox="0 0 1920 800"><g fill="none" stroke="#5dbdff" stroke-opacity=".34" stroke-width="2">${Array.from({length:11},(_,i)=>`<path d="M0 ${i*80}H1920"/>`).join('')}${Array.from({length:17},(_,i)=>`<path d="M${i*120} 0V800"/>`).join('')}</g><path d="M0 650L80 600 160 615 245 500 320 535 405 420 490 470 570 355 655 390 740 270 825 320 910 245 1000 290 1085 175 1170 230 1260 130 1350 190 1430 100 1510 155 1595 45 1680 92 1770 18 1840 55 1920 8" fill="none" stroke="#27bcff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M0 650L80 600 160 615 245 500 320 535 405 420 490 470 570 355 655 390 740 270 825 320 910 245 1000 290 1085 175 1170 230 1260 130 1350 190 1430 100 1510 155 1595 45 1680 92 1770 18 1840 55 1920 8V800H0Z" fill="#37b9ff" fill-opacity=".12"/></svg>`; }
  function sampleCoinSvg() { return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><radialGradient id="gold" cx="32%" cy="25%"><stop stop-color="#fff2a0"/><stop offset=".28" stop-color="#ffbd38"/><stop offset=".68" stop-color="#d8770e"/><stop offset="1" stop-color="#784009"/></radialGradient><linearGradient id="rim" x2="1" y2="1"><stop stop-color="#fff0a1"/><stop offset=".28" stop-color="#f69b1b"/><stop offset=".52" stop-color="#fff0ac"/><stop offset=".77" stop-color="#b85b08"/><stop offset="1" stop-color="#ffe787"/></linearGradient><filter id="shadow"><feGaussianBlur stdDeviation="13"/></filter></defs><ellipse cx="263" cy="274" rx="209" ry="218" fill="#000" opacity=".45" filter="url(#shadow)"/><circle cx="250" cy="248" r="215" fill="#5b3009"/><circle cx="250" cy="248" r="207" fill="url(#rim)"/><circle cx="250" cy="248" r="187" fill="url(#gold)" stroke="#ffe690" stroke-width="5"/><circle cx="250" cy="248" r="162" fill="none" stroke="#8c480b" stroke-width="6"/><circle cx="250" cy="248" r="151" fill="none" stroke="#ffe27c" stroke-width="3"/><circle cx="250" cy="248" r="136" fill="none" stroke="#9d570e" stroke-width="4" stroke-dasharray="3 8"/><path d="M178 118h145M170 378h159M105 248h290" stroke="#ffe790" stroke-width="3" opacity=".7"/><text x="250" y="316" fill="#4d2807" stroke="#ffd760" stroke-width="4" paint-order="stroke" font-family="Arial,sans-serif" font-weight="900" font-size="232" text-anchor="middle">₿</text><text x="250" y="316" fill="#ffdf67" font-family="Arial,sans-serif" font-weight="900" font-size="232" text-anchor="middle">₿</text><path d="M130 110C205 58 305 58 365 122" fill="none" stroke="#fff3bd" stroke-width="7" opacity=".68" stroke-linecap="round"/><path d="M79 215a173 173 0 0 0 18 108M421 215a173 173 0 0 1-17 108" fill="none" stroke="#fff1a0" stroke-width="5" opacity=".72"/></svg>`; }
  function sampleParticlesSvg() { const dots=Array.from({length:90},(_,i)=>{const x=(i*137.5)%1920,y=(i*263.7)%1080,r=1+(i%4)*.65,o=.18+(i%6)*.1;return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#a8e7ff" opacity="${o.toFixed(2)}"/>`;}).join('');return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">${dots}</svg>`; }
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2100); }
  function cleanLayer(l) { return { id: l.id || id(), name: String(l.name || 'Layer'), type: l.type || 'text', x: +l.x || 0, y: +l.y || 0, z: +l.z || 0, rotation: +l.rotation || 0, rotateX: +l.rotateX || 0, rotateY: +l.rotateY || 0, scale: Number.isFinite(+l.scale) ? +l.scale : 1, opacity: Number.isFinite(+l.opacity) ? +l.opacity : 1, width: +l.width || 400, height: +l.height || 120, color: l.color || '#d8c4ec', text: l.text || '', shape: l.shape || 'rounded', visible: l.visible !== false, locked: !!l.locked, shadow: l.shadow !== false, glow: !!l.glow, blendMode: l.blendMode || 'normal', blur: +l.blur || 0, dataUrl: l.dataUrl || '', fontSize: +l.fontSize || 76, keyframes: Array.isArray(l.keyframes) ? l.keyframes.map(k => ({ id: k.id || keyframeId(), t: clamp(k.t,0,120), protected: !!k.protected, values: { ...k.values } })).sort((a,b)=>a.t-b.t) : [] }; }
  function setup() {
    let hasSavedProject = false;
    try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); hasSavedProject = !!saved; state = saved ? { ...defaults(), ...saved, layers: (saved.layers || []).map(cleanLayer), gravity: { ...defaults().gravity, ...(saved.gravity || {}) } } : defaults(); }
    catch { state = defaults(); }
    if (!hasSavedProject && !state.layers.length) {
      const background = cleanLayer({id:id(),name:'Market background',type:'image',x:960,y:540,z:-80,width:1920,height:1080,dataUrl:svgUrl(sampleBackgroundSvg()),color:'#146bc2'});
      const graph = cleanLayer({id:id(),name:'Market graph',type:'image',x:960,y:680,z:-15,width:1920,height:800,dataUrl:svgUrl(sampleGraphSvg()),color:'#29baff',opacity:.78});
      const reflection = cleanLayer({id:id(),name:'Coin reflection',type:'image',x:960,y:800,z:40,rotateX:175,rotateY:-28,width:390,height:390,dataUrl:svgUrl(sampleCoinSvg()),color:'#efab31',opacity:.27,shadow:false});
      const coin = cleanLayer({id:id(),name:'Bitcoin Coin',type:'image',x:960,y:450,z:250,rotateX:12,rotateY:-28,width:440,height:440,dataUrl:svgUrl(sampleCoinSvg()),color:'#f2a527',shadow:true});
      coin.keyframes=[{t:0,values:{x:960,y:450,z:250,rotateX:12,rotateY:-28,rotation:0,scale:1,opacity:1}},{t:2.5,values:{x:1040,y:430,z:250,rotateX:12,rotateY:-28,rotation:16,scale:1.05,opacity:1}},{t:5.5,values:{x:1080,y:460,z:220,rotateX:12,rotateY:-28,rotation:0,scale:1,opacity:1}}].map(k=>({...k,id:keyframeId(),protected:false}));
      state.layers=[background,graph,reflection,coin];state.selectedId=coin.id;state.name='Crypto market opener';
    }
    $('#projectName').value = state.name; $('#quality').value = state.quality; updateUI(); pushHistory(true); attachEvents(); requestAnimationFrame(tick);
  }
  function saveLocal(silent = false) {
    try { state.name = $('#projectName').value.trim() || 'Untitled composition'; localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); $('#savedLabel').textContent = 'Saved locally'; if (!silent) toast('Project saved on this device'); return true; }
    catch (e) { toast('Could not save locally — storage may be full'); return false; }
  }
  let saveDebounce;
  function autosave() { $('#savedLabel').textContent = 'Saving…'; clearTimeout(saveDebounce); saveDebounce = setTimeout(() => saveLocal(true), 260); }
  function pushHistory(initial = false) {
    if (suppressHistory) return;
    const snap = JSON.stringify(state);
    if (history[historyIndex] === snap) return;
    history = history.slice(0, historyIndex + 1); history.push(snap); if (history.length > 50) history.shift(); historyIndex = history.length - 1;
    if (!initial) autosave(); updateHistoryButtons();
  }
  function restore(index) { if (index < 0 || index >= history.length) return; historyIndex = index; state = JSON.parse(history[historyIndex]); $('#projectName').value = state.name; $('#quality').value = state.quality; updateUI(); autosave(); updateHistoryButtons(); }
  function undo() { if (historyIndex > 0) restore(historyIndex - 1); }
  function redo() { if (historyIndex < history.length - 1) restore(historyIndex + 1); }
  function updateHistoryButtons() { $('#undoBtn').disabled = historyIndex <= 0; $('#redoBtn').disabled = historyIndex >= history.length - 1; }
  const selected = () => state.layers.find(l => l.id === state.selectedId) || null;
  function makeLayer(type, props = {}) {
    const n = state.layers.length + 1, base = { id: id(), name: type === 'text' ? `Text ${n}` : type === 'shape' ? `Shape ${n}` : `Image ${n}`, type, x: W / 2, y: H / 2, z: 0, rotation: 0, rotateX: 0, rotateY: 0, scale: 1, opacity: 1, width: type === 'text' ? 660 : 290, height: type === 'text' ? 140 : 210, color: type === 'text' ? '#e8d9f6' : palette[(n - 1) % palette.length], text: type === 'text' ? 'Make something\nmove.' : '', shape: type === 'shape' ? 'rounded' : '', visible: true, locked: false, dataUrl: '', fontSize: 92, keyframes: [] };
    const layer = cleanLayer({ ...base, ...props }); state.layers.push(layer); state.selectedId = layer.id; state.selectedKeyframeId = null; pushHistory(); updateUI(); return layer;
  }
  function addBuiltinAsset(key) {
    if(key==='title')return makeLayer('text',{name:'Market title',text:'Digital assets\nin motion',fontSize:92,width:900,height:240,x:960,y:190,color:'#eef7ff'});
    const defs={bitcoin:{name:'Bitcoin coin',data:sampleCoinSvg(),x:960,y:450,z:180,width:420,height:420,color:'#f2a527'},graph:{name:'Market chart',data:sampleGraphSvg(),x:960,y:650,z:0,width:1500,height:625,color:'#29baff'},background:{name:'Market background',data:sampleBackgroundSvg(),x:960,y:540,z:-80,width:1920,height:1080,color:'#146bc2'},particles:{name:'Particle field',data:sampleParticlesSvg(),x:960,y:540,z:30,width:1920,height:1080,color:'#bdeaff'},logo:{name:'Bitcoin mark',data:sampleCoinSvg(),x:960,y:540,z:150,width:250,height:250,color:'#f2a527'}};
    const d=defs[key];if(!d)return;makeLayer('image',{name:d.name,dataUrl:svgUrl(d.data),x:d.x,y:d.y,z:d.z,width:d.width,height:d.height,color:d.color});
  }
  function renderObjects() {
    const scene = $('#scene'); scene.replaceChildren(); scene.classList.toggle('camera-on', state.camera);
    for (const l of state.layers) {
      if (!l.visible) continue;
      const v = getStateAt(l,state.currentTime);
      const el = document.createElement('div'); el.className = `layer-object ${l.type === 'shape' ? `shape ${l.shape}` : ''} ${l.type === 'image' ? 'image-object' : ''} ${l.id === state.selectedId ? 'selected' : ''}`; el.dataset.id = l.id;
      el.style.left = `${v.x/W*100}%`; el.style.top = `${v.y/H*100}%`; el.style.width = `${l.width/W*100}%`; el.style.height = `${l.height/H*100}%`; el.style.opacity = v.opacity;
      el.style.transform = `translate(-50%,-50%) translateZ(${v.z}px) rotateX(${v.rotateX}deg) rotateY(${v.rotateY}deg) rotateZ(${v.rotation}deg) scale(${v.scale})`;
      el.style.zIndex = String(Math.round(v.z + 100 + state.layers.indexOf(l))); el.style.mixBlendMode = l.blendMode; el.style.filter = `${l.blur ? `blur(${l.blur}px)` : ''}${l.glow ? ` drop-shadow(0 0 22px ${l.color}aa)` : ''}`.trim(); el.style.boxShadow = l.shadow ? '0 10px 28px #020c1880' : 'none';
      if (l.type === 'text') { el.textContent = l.text; el.style.color = l.color; el.style.fontSize = `clamp(12px, ${l.fontSize/W*100}cqw, 90px)`; el.style.fontWeight = '800'; el.style.lineHeight = '1.08'; el.style.letterSpacing = '-.045em'; el.style.textShadow = '0 5px 28px #0008'; el.style.fontFamily = 'Manrope, sans-serif'; }
      else if (l.type === 'shape') { el.style.background = l.color; el.style.boxShadow = '0 15px 45px #0004'; }
      else if (l.type === 'image') { if (l.dataUrl) { const im = document.createElement('img'); im.src = l.dataUrl; im.alt = l.name; el.append(im); } else { el.textContent = 'Choose an image'; el.style.color = '#aaa'; } }
      if (l.id === state.selectedId && !l.locked) {
        const gizmo = document.createElement('div'); gizmo.className = 'transform-gizmo';
        if (state.transformMode === 'move') {
          [['move-x','X'],['move-y','Y'],['move-z','Z']].forEach(([axis,label]) => {
            const h = document.createElement('button'); h.type = 'button'; h.className = `axis-handle ${axis}`; h.dataset.gizmo = axis; h.title = `Move on ${label} axis`; h.setAttribute('aria-label', `Move on ${label} axis`); h.textContent = label; gizmo.append(h);
          });
        } else if (state.transformMode === 'rotate') {
          const rotate = document.createElement('button'); rotate.type = 'button'; rotate.className = 'gizmo-handle rotate'; rotate.dataset.gizmo = 'rotate'; rotate.title = 'Rotate layer'; rotate.textContent = '↻'; gizmo.append(rotate);
        } else {
          [['nw','↖'],['ne','↗'],['sw','↙'],['se','↘']].forEach(([handle, glyph]) => {
            const h = document.createElement('button'); h.type = 'button'; h.className = `gizmo-handle ${handle}`; h.dataset.gizmo = 'resize'; h.dataset.handle = handle; h.title = 'Scale layer'; h.textContent = glyph; gizmo.append(h);
          });
        }
        el.append(gizmo);
      }
      scene.append(el);
    }
    $('#emptyState').classList.toggle('visible', state.layers.length === 0);
    const l = selected(); $('#selectionHud').hidden = !l; if (l) { const current=getStateAt(l,state.currentTime); $('#hudName').textContent = l.name; $('#hudPosition').textContent = `${Math.round(current.x)}, ${Math.round(current.y)}, ${Math.round(current.z)} px`; }
  }
  function renderLayers() {
    const wrap = $('#layerList'); wrap.replaceChildren();
    [...state.layers].reverse().forEach(l => {
      const row = document.createElement('div'); row.className = `layer-row ${l.id === state.selectedId ? 'selected' : ''} ${l.visible ? '' : 'hidden-layer'}`; row.dataset.id = l.id;
      const eye = document.createElement('button'); eye.className = 'layer-eye'; eye.title = l.visible ? 'Hide layer' : 'Show layer'; eye.textContent = l.visible ? '◉' : '◌'; eye.addEventListener('click', e => { e.stopPropagation(); l.visible = !l.visible; pushHistory(); updateUI(); });
      const color = document.createElement('span'); color.className = 'layer-color'; color.style.background = l.type==='image'?'#183d59':l.color; color.textContent = l.type==='image'?'▧':l.type==='text'?'T':'◇';
      const title = document.createElement('span'); title.className = 'layer-title'; title.textContent = l.name; title.title = l.name; title.addEventListener('dblclick', e => { e.stopPropagation(); renameLayer(l); });
      const type = document.createElement('span'); type.className = 'layer-type'; type.textContent = l.type === 'image' ? 'IMG' : l.type === 'shape' ? 'SHP' : 'TXT';
      row.append(eye, color, title, type); row.addEventListener('click', () => { state.selectedId = l.id; state.selectedKeyframeId = null; updateUI(); });
      row.addEventListener('contextmenu', e => { e.preventDefault(); state.selectedId = l.id; state.selectedKeyframeId = null; updateUI(); renameLayer(l); }); wrap.append(row);
    });
  }
  function renderInspector() {
    const box=$('#inspectorContent'),l=selected();box.replaceChildren();
    if(activeInspectorTab==='assistant'){box.innerHTML=`<div class="assistant-view"><h3>AI Assistant</h3><p>Describe an edit for the selected layer or the whole composition.</p><textarea id="assistantPrompt" placeholder="Try: Make the coin rotate slowly toward camera…"></textarea><button class="button primary" id="assistantApply">Prepare edit</button><p class="assistant-note">AI provider connection is not configured yet. Your prompt stays on this device and will not be sent.</p></div>`;$('#assistantApply').onclick=()=>toast('AI editing is planned; no provider is connected yet');return;}
    if(activeInspectorTab==='effects'){box.innerHTML=`<div class="effect-list"><div class="section-heading">QUICK EFFECTS</div><button data-effect="shadow"><span>Cast shadow</span><small>${l?.shadow?'ON':'OFF'}</small></button><button data-effect="blur"><span>Soft focus</span><small>${l?.blur?`${l.blur}px`:'OFF'}</small></button><button data-effect="glow"><span>Glow accent</span><small>${l?.glow?'ON':'OFF'}</small></button><p class="assistant-note">Effects apply to the selected editable layer. More effect controls will be added as the renderer grows.</p></div>`;$$('[data-effect]',box).forEach(b=>b.onclick=()=>{if(!l)return toast('Select a layer first');const key=b.dataset.effect;if(key==='shadow')l.shadow=!l.shadow;if(key==='blur')l.blur=l.blur?0:4;if(key==='glow')l.glow=!l.glow;pushHistory();updateUI();});return;}
    if(!l){box.innerHTML='<div class="inspector-empty"><b>Nothing selected</b><span>Select a layer in the canvas or timeline.</span></div>';return;}
    const v=getStateAt(l,state.currentTime);const sec=document.createElement('div');sec.className='inspector-section';sec.innerHTML=`<div class="selected-summary"><div class="summary-icon">${l.type==='image'?'₿':l.type==='text'?'T':'◇'}</div><div class="summary-text"><b>${escapeHtml(l.name)}</b><span>Layer · ${l.type==='image'?'Image':l.type==='text'?'Text':'Shape'} ${l.z||l.rotateX||l.rotateY?'(3D)':''}</span></div><div class="summary-tools"><button id="eyeLayer" title="Toggle visibility">◉</button><button id="layerLock" title="Protect layer">${l.locked?'▣':'♙'}</button><button id="renameInspector" title="Rename layer">•••</button></div></div><div class="section-heading">⌄ <span style="margin-right:auto;margin-left:7px">Transform</span></div><div class="row-fields">${field('X','x',v.x)}${field('Y','y',v.y)}${field('Z','z',v.z,'px')}</div><div class="row-fields" style="margin-top:8px">${field('X','rotateX',v.rotateX,'°')}${field('Y','rotateY',v.rotateY,'°')}${field('Z','rotation',v.rotation,'°')}</div><div class="section-heading" style="margin:14px 0 7px">Scale <span>100%</span></div><div class="row-fields">${field('X','scaleX',v.scale,'%')}${field('Y','scaleY',v.scale,'%')}${field('Z','scaleZ',v.scale,'%')}</div><div class="slider-label"><span>Opacity</span><output id="opacityOut">${Math.round(v.opacity*100)}%</output></div><div class="slider-row"><input type="range" min="0" max="1" step=".01" value="${v.opacity}" data-prop="opacity"></div><label class="inspector-toggle"><span>3D Layer</span><input class="switch" id="layer3d" type="checkbox" ${l.z||l.rotateX||l.rotateY?'checked':''}></label><label class="inspector-toggle"><span>Cast Shadow</span><input class="switch" id="castShadow" type="checkbox" ${l.shadow?'checked':''}></label><div class="field"><label>BLEND MODE</label><select class="inspector-select" id="blendMode"><option value="normal" ${l.blendMode==='normal'?'selected':''}>Normal</option><option value="multiply" ${l.blendMode==='multiply'?'selected':''}>Multiply</option><option value="screen" ${l.blendMode==='screen'?'selected':''}>Screen</option><option value="overlay" ${l.blendMode==='overlay'?'selected':''}>Overlay</option></select></div>${l.type==='image'?'':`<div class="color-row"><span>Color</span><input class="color-input" type="color" id="layerColor" value="${l.color}"></div>`}`;
    box.append(sec);
    const details=[['Material','Material controls for this editable plane.'],['Physics',`Directional forces can be explored in the Gravity Lab. Scene physics are not connected yet.`],['Keyframes',`${l.keyframes.length} keyframe${l.keyframes.length===1?'':'s'} · animate position, rotation, scale, and opacity.`],['Motion / AI','AI motion suggestions will appear here when a provider is connected.'],['Mask','Layer masks and alpha mattes are planned.']];
    details.forEach(([name,copy])=>{const d=document.createElement('details');d.className='inspector-accordion';d.innerHTML=`<summary>${name}</summary><div class="accordion-content">${copy}${name==='Keyframes'?'<button class="button secondary" id="inspectorAddKey" style="display:block;margin-top:9px">Add keyframe at playhead</button>':''}</div>`;box.append(d);});
    if(l.type==='text'){const text=document.createElement('div');text.className='inspector-section';text.innerHTML=`<div class="section-heading">Text content</div><textarea id="textContent" rows="3" style="width:100%;resize:vertical;background:#111c25;border:1px solid #354752;border-radius:4px;color:#e3ebf0;padding:8px;font-size:10px">${escapeHtml(l.text)}</textarea><div class="row-fields" style="margin-top:9px">${field('Font size','fontSize',l.fontSize,'px')}${field('Width','width',l.width,'px')}</div>`;box.append(text);}
    if(l.type==='shape'){const shape=document.createElement('div');shape.className='inspector-section';shape.innerHTML=`<div class="row-fields"><div class="field"><label>SHAPE</label><select class="inspector-select" id="shapeStyle"><option value="rounded" ${l.shape==='rounded'?'selected':''}>Rounded</option><option value="rectangle" ${l.shape==='rectangle'?'selected':''}>Rectangle</option><option value="circle" ${l.shape==='circle'?'selected':''}>Circle</option></select></div>${field('Height','height',l.height,'px')}</div>`;box.append(shape);}
    const del=document.createElement('div');del.className='inspector-section';del.innerHTML='<button class="button secondary" id="deleteLayer" style="width:100%;color:#ff9ca8">Delete selected layer</button>';box.append(del);
    $$('[data-prop]',box).forEach(input=>{input.addEventListener('input',()=>{if(l.locked)return;const changed=editLayerAtTime(l,{opacity:Number(input.value)});if(!changed)return toast('This keyframe is protected');$('#opacityOut').textContent=`${Math.round(Number(input.value)*100)}%`;renderObjects();});input.addEventListener('change',pushHistory);});
    $$('input[type=number]',box).forEach(input=>input.addEventListener('change',()=>{if(l.locked)return toast('Unlock this layer before editing');const key=input.dataset.key,values=key.startsWith('scale')?{scale:(Number(input.value)||100)/100}:{[key]:Number(input.value)||0};if(!editLayerAtTime(l,values))return toast('This keyframe is protected');pushHistory();updateUI();}));
    $('#layer3d',box).addEventListener('change',e=>{if(!e.target.checked){l.z=0;l.rotateX=0;l.rotateY=0;}else{l.z=250;l.rotateX=12;l.rotateY=-28;}pushHistory();updateUI();});
    $('#castShadow',box).addEventListener('change',e=>{l.shadow=e.target.checked;pushHistory();renderObjects();});$('#blendMode',box).addEventListener('change',e=>{l.blendMode=e.target.value;pushHistory();renderObjects();});
    const color=$('#layerColor',box);if(color){color.addEventListener('input',e=>{l.color=e.target.value;renderObjects();});color.addEventListener('change',()=>{pushHistory();renderLayers();});}
    const textArea=$('#textContent',box);if(textArea){textArea.addEventListener('input',()=>{if(!l.locked){l.text=textArea.value;renderObjects();}});textArea.addEventListener('change',pushHistory);}
    const shapeStyle=$('#shapeStyle',box);if(shapeStyle)shapeStyle.addEventListener('change',()=>{l.shape=shapeStyle.value;pushHistory();updateUI();});
    $('#layerLock',box).onclick=()=>{l.locked=!l.locked;pushHistory();updateUI();};$('#eyeLayer',box).onclick=()=>{l.visible=!l.visible;pushHistory();updateUI();};$('#renameInspector',box).onclick=()=>renameLayer(l);$('#deleteLayer',box).onclick=()=>deleteLayer(l);
    const key=$('#inspectorAddKey',box);if(key)key.onclick=addKeyframe;
  }
  function field(label,key,value,unit='') { const v=key.startsWith('scale')?Number(value)*100:Number(value);return `<div class="field"><label>${label.toUpperCase()}</label><div class="field-control"><input type="number" step="1" data-key="${key}" value="${Number(v).toFixed(0)}"><span>${unit}</span></div></div>`; }
  function escapeHtml(str) { return String(str).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function renderTimeline() {
    const ruler=$('#ruler'), lane=$('#trackLane'); ruler.replaceChildren(); lane.replaceChildren();
    const laneWidth=Math.max(700,$('#trackScroll').clientWidth||700); ruler.style.width=`${laneWidth}px`; lane.style.width=`${laneWidth}px`;
    for(let i=0;i<=10;i++){const t=document.createElement('span');t.className='ruler-tick';t.style.left=`${i*10}%`;t.textContent=`${(state.duration*i/10).toFixed(i===0?0:1)}s`;ruler.append(t);}
    [...state.layers].reverse().forEach(layer=>{
      const row=document.createElement('div');row.className='timeline-layer-lane';row.dataset.id=layer.id;row.style.opacity=layer.visible?'1':'.46';
      const clip=document.createElement('div');clip.className=`timeline-clip ${layer.type}`;clip.style.left='0';clip.style.width='100%';clip.textContent=layer.name;clip.title=`${layer.name} · select to edit`;clip.addEventListener('click',e=>{e.stopPropagation();state.selectedId=layer.id;state.selectedKeyframeId=null;updateUI();});row.append(clip);
      layer.keyframes.forEach((k,index)=>{
        const mark=document.createElement('button');mark.type='button';mark.dataset.keyframeId=k.id;mark.className=`timeline-kf ${k.id===state.selectedKeyframeId?'selected':''} ${k.protected?'protected':''}`;mark.title=`${k.t.toFixed(2)}s · ${layer.name} · ${k.protected?'protected':'right-click to protect'}`;mark.style.left=`${clamp(k.t/state.duration*100,0,100)}%`;
        mark.addEventListener('pointerdown',e=>{
          e.preventDefault();e.stopPropagation();
          if(layer.locked)return toast('Unlock this layer before editing its keyframes');
          state.selectedId=layer.id;state.selectedKeyframeId=k.id;$$('.timeline-kf.selected').forEach(node=>node.classList.remove('selected'));mark.classList.add('selected');renderLayers();renderObjects();renderInspector();applyTime(k.t);
          if(k.protected)return;
          const track=$('#trackScroll'),rect=track.getBoundingClientRect();
          const timeAt=clientX=>clamp((clientX-rect.left+track.scrollLeft)/Math.max(lane.scrollWidth,track.clientWidth,1)*state.duration,0,state.duration);
          const move=ev=>{
            let t=timeAt(ev.clientX);const others=layer.keyframes.filter(frame=>frame!==k).slice().sort((a,b)=>a.t-b.t);let min=0,max=state.duration;
            for(const other of others){if(other.t<t)min=other.t+.025;else{max=other.t-.025;break;}}
            k.t=clamp(t,min,max);mark.style.left=`${clamp(k.t/state.duration*100,0,100)}%`;applyTime(k.t);
          };
          const done=()=>{window.removeEventListener('pointermove',move);layer.keyframes.sort((a,b)=>a.t-b.t);pushHistory();renderTimeline();renderInspector();};
          window.addEventListener('pointermove',move);window.addEventListener('pointerup',done,{once:true});
        });
        mark.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();if(layer.locked)return toast('Unlock this layer before changing keyframe protection');k.protected=!k.protected;state.selectedId=layer.id;state.selectedKeyframeId=k.id;pushHistory();renderTimeline();renderInspector();toast(k.protected?'Keyframe protected':'Keyframe unprotected');});
        mark.addEventListener('dblclick',e=>{e.preventDefault();e.stopPropagation();removeKeyframe(layer,k);});row.append(mark);
      });
      lane.append(row);
    });
    updatePlayhead();
  }
  function updatePlayhead() { const p=clamp(state.currentTime/state.duration*100,0,100); $('#playhead').style.left=`${p}%`;const tc=`00:${String(Math.floor(state.currentTime/60)).padStart(2,'0')}:${(state.currentTime%60).toFixed(2).padStart(5,'0')}`;$('#timecode').textContent=tc;$('#timelineTime').textContent=tc; }
  function updateUI() { renderLayers(); renderObjects(); renderInspector(); renderTimeline(); $('#durationLabel').textContent=`${state.duration.toFixed(1)}s`; $$('.workspace-tab').forEach(b=>b.classList.toggle('active',b.dataset.workspace===state.workspace)); $$('.transform-mode').forEach(b=>b.classList.toggle('active',b.dataset.transformMode===state.transformMode)); $('#scene').classList.toggle('camera-on',state.camera); }
  function getStateAt(layer,t) {
    if(!layer.keyframes.length) return {x:layer.x,y:layer.y,z:layer.z,rotation:layer.rotation,rotateX:layer.rotateX,rotateY:layer.rotateY,scale:layer.scale,opacity:layer.opacity};
    const frames=layer.keyframes; if(t<=frames[0].t)return {...layer,...frames[0].values}; if(t>=frames.at(-1).t)return {...layer,...frames.at(-1).values};
    let i=0;while(i<frames.length-1&&frames[i+1].t<t)i++;const a=frames[i],b=frames[i+1],p=(t-a.t)/(b.t-a.t),smooth=p*p*(3-2*p),out={};const keys=new Set([...Object.keys(a.values),...Object.keys(b.values)]);keys.forEach(k=>{const av=Number(a.values[k]??layer[k]),bv=Number(b.values[k]??layer[k]);out[k]=Number.isFinite(av)&&Number.isFinite(bv)?av+(bv-av)*smooth:(p<.5?a.values[k]:b.values[k]);});return {...layer,...out};
  }
  function applyTime(t) { state.currentTime=clamp(t,0,state.duration); renderObjects(); updatePlayhead(); }
  function editLayerAtTime(layer, values) {
    if (!layer.keyframes.length) { Object.assign(layer, values); return true; }
    let frame=layer.keyframes.find(k=>Math.abs(k.t-state.currentTime)<.025);
    if (frame?.protected) return false;
    if (!frame) { const current=getStateAt(layer,state.currentTime); frame={id:keyframeId(),t:state.currentTime,protected:false,values:Object.fromEntries(['x','y','z','rotation','rotateX','rotateY','scale','opacity'].map(k=>[k,current[k]]))}; layer.keyframes.push(frame); }
    Object.assign(frame.values,values); state.selectedKeyframeId=frame.id; layer.keyframes.sort((a,b)=>a.t-b.t); return true;
  }
  function addKeyframe() { const l=selected();if(!l)return toast('Select a layer first');if(l.locked)return toast('Unlock this layer before editing');const current=getStateAt(l,state.currentTime),props=['x','y','z','rotation','rotateX','rotateY','scale','opacity'],values=Object.fromEntries(props.map(p=>[p,current[p]])),existing=l.keyframes.find(k=>Math.abs(k.t-state.currentTime)<.025);if(existing?.protected)return toast('This keyframe is protected');if(existing){existing.values=values;state.selectedKeyframeId=existing.id;}else{const key={id:keyframeId(),t:state.currentTime,protected:false,values};l.keyframes.push(key);state.selectedKeyframeId=key.id;}l.keyframes.sort((a,b)=>a.t-b.t);pushHistory();renderTimeline();renderInspector();toast(`Keyframe added at ${state.currentTime.toFixed(2)}s`); }
  function removeKeyframe(layer,key) { if(layer.locked)return toast('Unlock this layer before editing its keyframes');if(key.protected)return toast('Unprotect this keyframe before deleting it');layer.keyframes=layer.keyframes.filter(k=>k.id!==key.id);if(state.selectedKeyframeId===key.id)state.selectedKeyframeId=null;pushHistory();updateUI();toast('Keyframe deleted'); }
  function removeSelectedKeyframe() { const layer=selected();const key=layer?.keyframes.find(k=>k.id===state.selectedKeyframeId);if(!layer||!key)return false;removeKeyframe(layer,key);return true; }
  let playing=false,lastFrame=0,raf=0;
  function tick(ts) { if(playing&&lastFrame){const delta=(ts-lastFrame)/1000;let t=state.currentTime+delta;if(t>state.duration){t=0;}applyTime(t);}lastFrame=playing?ts:0;requestAnimationFrame(tick); }
  function togglePlayback() { playing=!playing;$('#playBtn').textContent=playing?'Ⅱ':'▶';$('#playBtn').title=playing?'Pause':'Play';if(playing&&state.currentTime>=state.duration)applyTime(0); }
  function canvasPosition(e) { const r=$('#stage').getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H}; }
  function attachEvents() {
    $('#addTextBtn').onclick=()=>makeLayer('text');$('#addShapeBtn').onclick=()=>makeLayer('shape');$('#emptyAddBtn').onclick=()=>makeLayer('text');$('#addImageBtn').onclick=()=>$('#imageFile').click();
    $('#imageFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const url=await readAsDataUrl(file);makeLayer('image',{name:file.name.replace(/\.[^.]+$/,''),dataUrl:url,width:360,height:270});}catch{toast('Could not load that image');}e.target.value='';});
    $$('.asset-card').forEach(card=>card.addEventListener('click',()=>addBuiltinAsset(card.dataset.asset)));
    let activeAssetCategory='All';const filterAssets=()=>{$$('.asset-card').forEach(card=>{const categoryMatch=activeAssetCategory==='All'||card.dataset.category===activeAssetCategory;const searchMatch=card.textContent.toLowerCase().includes($('#assetSearch').value.toLowerCase());card.style.display=categoryMatch&&searchMatch?'':'none';});};
    $$('.asset-category').forEach(b=>b.onclick=()=>{activeAssetCategory=b.dataset.category;$$('.asset-category').forEach(x=>x.classList.toggle('active',x===b));filterAssets();});$('#assetSearch').addEventListener('input',filterAssets);$('#assetFilter').onclick=()=>{const categories=$$('.asset-category'),index=categories.findIndex(b=>b.dataset.category===activeAssetCategory);categories[(index+1)%categories.length].click();};
    $$('.folder-card').forEach(b=>b.onclick=()=>{const value=b.dataset.folder,category=value==='Graphics'?'Graphics':value==='Footage'?'Video':'All',target=$$('.asset-category').find(x=>x.dataset.category===category);target?.click();if(value==='Compositions')toast('Starter composition layers are listed in the timeline');});$('#newFolder').onclick=()=>toast('Custom folders are planned for a later Alpha build');
    $$('.rail-tool').forEach(b=>b.addEventListener('click',()=>{const tool=b.dataset.tool;if(tool==='assets'){toast('Assets panel is open');return;}if(tool==='text'){makeLayer('text');return;}if(tool==='shapes'){makeLayer('shape');return;}if(tool==='3d')return;if(tool==='effects'||tool==='ai'){activeInspectorTab=tool==='effects'?'effects':'assistant';$$('.inspector-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===activeInspectorTab));renderInspector();return;}toast(`${b.textContent.trim()} tools are planned for a later Alpha build`);}));
    $('#scene').addEventListener('pointerdown',e=>{
      const el=e.target.closest('.layer-object');if(!el)return;const l=state.layers.find(x=>x.id===el.dataset.id);if(!l)return;
      if(state.selectedId!==l.id){state.selectedId=l.id;state.selectedKeyframeId=null;updateUI();}
      if(l.locked){toast('This layer is protected');return;}
      const gizmo=e.target.closest('[data-gizmo]')?.dataset.gizmo;
      const mode=gizmo||state.transformMode,handle=e.target.closest('[data-gizmo]')?.dataset.handle;
      e.preventDefault();e.stopPropagation();const start=canvasPosition(e),origin=getStateAt(l,state.currentTime),center={x:origin.x,y:origin.y};
      const startAngle=Math.atan2(start.y-center.y,start.x-center.x),startDistance=Math.max(1,Math.hypot(start.x-center.x,start.y-center.y));let protectedNotice=false;
      const move=ev=>{const pos=canvasPosition(ev);let patch={};
        if(mode==='move')patch={x:clamp(origin.x+pos.x-start.x,-W,W*2),y:clamp(origin.y+pos.y-start.y,-H,H*2)};
        else if(mode==='move-x')patch={x:clamp(origin.x+pos.x-start.x,-W,W*2)};
        else if(mode==='move-y')patch={y:clamp(origin.y+pos.y-start.y,-H,H*2)};
        else if(mode==='move-z')patch={z:clamp(origin.z+(start.y-pos.y)*2,-2000,4000)};
        else if(mode==='rotate')patch={rotation:origin.rotation+(Math.atan2(pos.y-center.y,pos.x-center.x)-startAngle)*180/Math.PI};
        else {const ratio=clamp(Math.hypot(pos.x-center.x,pos.y-center.y)/startDistance,.08,8);patch={scale:clamp(origin.scale*ratio,.05,8)};}
        if(!editLayerAtTime(l,patch)){if(!protectedNotice)toast('This keyframe is protected');protectedNotice=true;return;}renderObjects();renderInspector();
      };
      const up=()=>{window.removeEventListener('pointermove',move);pushHistory();renderTimeline();};window.addEventListener('pointermove',move);window.addEventListener('pointerup',up,{once:true});
    });
    $('#stage').addEventListener('pointerdown',e=>{if(e.target!==$('#stage')&&e.target!==$('#scene'))return;state.selectedId=null;state.selectedKeyframeId=null;updateUI();});
    $('#undoBtn').onclick=undo;$('#redoBtn').onclick=redo;$('#saveBtn').onclick=exportProject;$('#projectName').addEventListener('input',()=>{state.name=$('#projectName').value;autosave();});
    $('#openBtn').onclick=async()=>{if(window.tynkrDesktop){try{const p=await window.tynkrDesktop.openProject();if(p)loadProject(p);}catch{toast('That project file could not be opened');}}else $('#projectFile').click();};$('#projectFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const p=JSON.parse(await f.text());loadProject(p);}catch{toast('That project file could not be opened');}e.target.value='';});
    $('#exportBtn').onclick=exportSvg;$('#playBtn').onclick=togglePlayback;$('#toStart').onclick=()=>{playing=false;$('#playBtn').textContent='▶';applyTime(0);};$('#toEnd').onclick=()=>{playing=false;$('#playBtn').textContent='▶';applyTime(state.duration);};$('#addKeyBtn').onclick=addKeyframe;
    $('#trackScroll').addEventListener('pointerdown',e=>{if(e.target.classList.contains('timeline-kf'))return;const r=$('#trackScroll').getBoundingClientRect();const scrub=ev=>applyTime(clamp((ev.clientX-r.left+$('#trackScroll').scrollLeft)/Math.max($('#trackScroll').scrollWidth,r.width)*state.duration,0,state.duration));scrub(e);$('#trackScroll').classList.add('scrubbing');const move=ev=>scrub(ev);const done=()=>{$('#trackScroll').classList.remove('scrubbing');window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',done);};window.addEventListener('pointermove',move);window.addEventListener('pointerup',done,{once:true});});
    $('#durationBtn').onclick=()=>openPrompt('Set composition duration','Duration in seconds (1–120).',state.duration,v=>{state.duration=clamp(v,1,120);state.currentTime=clamp(state.currentTime,0,state.duration);pushHistory();updateUI();});
    $('#addTrackBtn').onclick=()=>selected()?addKeyframe():toast('Select a layer to add an animation keyframe');
    $('#toggle3d').onclick=()=>{state.camera=!state.camera;pushHistory();updateUI();toast(state.camera?'3D perspective camera enabled':'2D canvas view');};$('#cameraMenu').onclick=()=>{state.camera=!state.camera;pushHistory();updateUI();};$('#frameBtn').onclick=()=>toast('Composition fits the preview frame');$('#cameraSelect').onclick=()=>toast(state.camera?'Active camera · 1920 × 1080':'2D canvas · 1920 × 1080');
    $('#fileMenuButton').onclick=()=>$('#fileDropdown').hidden=!$('#fileDropdown').hidden;$('#saveAsBtn').onclick=exportProject;$('#menuExport').onclick=()=>{exportSvg();$('#fileDropdown').hidden=true;};$('#editMenuButton').onclick=()=>toast('Undo and redo are available in the timeline toolbar');
    $('#shareBtn').onclick=()=>toast('Share links are not available in this local Alpha build');
    $('#minimizeWindow').onclick=()=>window.tynkrDesktop?.minimize();$('#maximizeWindow').onclick=()=>window.tynkrDesktop?.toggleMaximize();$('#closeWindow').onclick=()=>window.tynkrDesktop?.close();
    $$('.inspector-tab').forEach(b=>b.onclick=()=>{activeInspectorTab=b.dataset.tab;$$('.inspector-tab').forEach(t=>t.classList.toggle('active',t===b));renderInspector();});
    $$('.viewer-icon').forEach((b,i)=>b.onclick=()=>toast(['Composition grid preview','Safe frame preview','3D view follows camera mode','Preview quality is set at right'][i]||'Preview tool'));
    $('#frameBack').onclick=()=>applyTime(Math.max(0,state.currentTime-1/30));$('#frameForward').onclick=()=>applyTime(Math.min(state.duration,state.currentTime+1/30));$('#snapshotBtn').onclick=exportSvg;$('.transport-capture').onclick=exportSvg;
    $('#fitSelect').onchange=e=>toast(`Preview fit: ${e.target.value}`);
    $$('.workspace-tab').forEach(b=>b.onclick=()=>{state.workspace=b.dataset.workspace;pushHistory();updateUI();});$('#quality').onchange=e=>{state.quality=e.target.value;$('#stage').classList.remove('quality-draft','quality-preview','quality-final');$('#stage').classList.add(`quality-${state.quality}`);pushHistory();toast(`${state.quality[0].toUpperCase()+state.quality.slice(1)} preview selected · export stays full resolution`);};
    $('#gravityToggle').onclick=openGravity;$('#closeGravity').onclick=closeGravity;$('#closeGravity2').onclick=closeGravity;$('#gravityModal').addEventListener('click',e=>{if(e.target===$('#gravityModal'))closeGravity();});
    ['forceX','forceY','relationship'].forEach(k=>$('#'+k).addEventListener('input',()=>{const g=state.gravity;g[k]=Number($('#'+k).value);$('#'+k+'Out').textContent=k==='relationship'?`${g[k]}%`:String(g[k]);updateGravityReadout();}));
    $('#resetGravity').onclick=()=>{const g=state.gravity;g.a={x:36,y:33};g.b={x:56,y:33};g.forceX=0;g.forceY=16;g.relationship=52;g.last=performance.now();['forceX','forceY','relationship'].forEach(k=>$('#'+k).value=g[k]);$('#forceXOut').textContent='0';$('#forceYOut').textContent='16';$('#relationshipOut').textContent='52%';renderGravity();updateGravityReadout();};
    $('#promptClose').onclick=closePrompt;$('#promptCancel').onclick=closePrompt;$('#promptOk').onclick=()=>{const v=Number($('#promptInput').value);const fn=$('#promptDialog')._apply;closePrompt();if(Number.isFinite(v))fn(v);};
    $$('.transform-mode').forEach(b=>b.onclick=()=>{state.transformMode=b.dataset.transformMode;updateUI();});
    document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select'))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();return;}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();exportProject();return;}if(e.code==='Space'){e.preventDefault();togglePlayback();return;}if(e.key.toLowerCase()==='k')addKeyframe();if(e.key==='Delete'||e.key==='Backspace'){if(!removeSelectedKeyframe()&&selected())deleteLayer(selected());}if(e.key.toLowerCase()==='t')makeLayer('text');if(e.key.toLowerCase()==='s')makeLayer('shape');if(e.key.toLowerCase()==='w'||e.key.toLowerCase()==='e'||e.key.toLowerCase()==='r'){state.transformMode={w:'move',e:'rotate',r:'scale'}[e.key.toLowerCase()];updateUI();}if(e.key==='Escape'){closeGravity();closePrompt();$('#fileDropdown').hidden=true;}});
    window.addEventListener('beforeunload',()=>saveLocal(true));
  }
  function zoom(factor) { const s=$('#stage');s.style.scale=String(Math.max(.55,Math.min(1.4,(Number(s.dataset.zoom)||1)*factor)));s.dataset.zoom=String(Number(s.style.scale)); }
  function renameLayer(l) { openPrompt('Rename layer','Choose a short, recognizable name.',l.name,v=>{if(String(v).trim()){l.name=String(v).trim();pushHistory();updateUI();}});$('#promptInput').type='text';$('#promptInput').value=l.name; }
  function deleteLayer(l) { state.layers=state.layers.filter(x=>x.id!==l.id);if(state.selectedId===l.id)state.selectedId=state.layers.at(-1)?.id||null;state.selectedKeyframeId=null;pushHistory();updateUI();toast('Layer deleted'); }
  function openPrompt(title,copy,value,fn) { $('#promptTitle').textContent=title;$('#promptCopy').textContent=copy;$('#promptInput').value=value;$('#promptInput').type=typeof value==='number'?'number':'text';$('#promptDialog')._apply=fn;$('#promptDialog').hidden=false;$('#promptInput').focus();$('#promptInput').select(); }
  function closePrompt() { $('#promptDialog').hidden=true; }
  function openGravity() { $('#gravityModal').hidden=false;document.body.style.overflow='hidden';const g=state.gravity;$('#forceX').value=g.forceX;$('#forceY').value=g.forceY;$('#relationship').value=g.relationship;$('#forceXOut').textContent=g.forceX;$('#forceYOut').textContent=g.forceY;$('#relationshipOut').textContent=`${g.relationship}%`;g.last=performance.now();renderGravity();updateGravityReadout(); }
  function closeGravity() { $('#gravityModal').hidden=true;document.body.style.overflow=''; }
  function updateGravityReadout() { const g=state.gravity;const r=$('#gravityReadout');if(g.forceX===0&&Math.abs(g.forceY)<25)r.textContent='B lags above A under weak gravity';else if(g.forceX!==0)r.textContent=`B drifts ${g.forceX<0?'left':'right'} while tracking A`;else r.textContent=`B responds to ${g.forceY<0?'upward':'downward'} gravity`; }
  function renderGravity() { const g=state.gravity;$('#objectA').style.left=`${g.a.x}%`;$('#objectA').style.top=`${g.a.y}%`;$('#objectB').style.left=`${g.b.x}%`;$('#objectB').style.top=`${g.b.y}%`;const dx=g.b.x-g.a.x,dy=g.b.y-g.a.y;const line=$('#linkLine');line.style.left=`${g.a.x+3.2}%`;line.style.top=`${g.a.y+9.2}%`;line.style.width=`${Math.max(0,Math.hypot(dx,dy)-7)}%`;line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;}
  function gravityTick(ts) { if(!$('#gravityModal').hidden){const g=state.gravity;if(!g.last)g.last=ts;const dt=Math.min((ts-g.last)/1000,.04);g.last=ts;g.a.y+=dt*5.5;if(g.a.y>78)g.a.y=20;const rel=g.relationship/100;const gx=g.forceX/100,gy=g.forceY/100;const targetX=g.a.x+20+gx*22;const weakGravityLag=Math.max(0,25-Math.abs(g.forceY))*.35;const targetY=g.a.y+gy*32-weakGravityLag;const follow=0.10+rel*.5;g.b.x+=(targetX-g.b.x)*follow*dt*4;g.b.y+=(targetY-g.b.y)*follow*dt*4;g.b.x=clamp(g.b.x,5,90);g.b.y=clamp(g.b.y,10,85);renderGravity();}requestAnimationFrame(gravityTick);}
  async function readAsDataUrl(file) { return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);}); }
  function loadProject(p) { if(!p||!Array.isArray(p.layers))return toast('Project file format is not recognized');state={...defaults(),...p,layers:p.layers.map(cleanLayer),gravity:{...defaults().gravity,...p.gravity}};state.currentTime=clamp(state.currentTime,0,state.duration);$('#projectName').value=state.name;$('#quality').value=state.quality;history=[];historyIndex=-1;updateUI();pushHistory(true);saveLocal(true);toast('Project opened'); }
  function svgEscape(s) { return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c])); }
  function exportSvg() { const layers=state.layers.filter(l=>l.visible);if(!layers.length)return toast('Add a layer before exporting');const nodes=layers.map(l=>{const v=getStateAt(l,state.currentTime),transform=`translate(${v.x} ${v.y}) rotate(${v.rotation}) scale(${v.scale})`;if(l.type==='text'){const lines=svgEscape(l.text).split('\n'),lineH=l.fontSize*1.08;const spans=lines.map((line,i)=>`<tspan x="0" dy="${i===0?-(lines.length-1)*lineH/2:lineH}">${line}</tspan>`).join('');return `<text x="0" y="0" fill="${l.color}" opacity="${v.opacity}" font-family="Segoe UI,Arial,sans-serif" font-size="${l.fontSize}" font-weight="800" text-anchor="middle" dominant-baseline="middle" transform="${transform}">${spans}</text>`;}if(l.type==='shape'){const x=-l.width/2,y=-l.height/2,rx=l.shape==='circle'?Math.min(l.width,l.height)/2:l.shape==='rounded'?18:0;return `<rect x="${x}" y="${y}" width="${l.width}" height="${l.height}" rx="${rx}" fill="${l.color}" opacity="${v.opacity}" transform="${transform}"/>`;}if(l.type==='image'&&l.dataUrl)return `<image x="${-l.width/2}" y="${-l.height/2}" width="${l.width}" height="${l.height}" href="${l.dataUrl}" opacity="${v.opacity}" transform="${transform}"/>`;return '';}).join('\n');const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="#23232d"/>${nodes}</svg>`;if(window.tynkrDesktop){window.tynkrDesktop.exportSvg(svg,`${safeName(state.name)}.svg`).then(path=>toast(path?'SVG exported at 1920 × 1080':'Export canceled')).catch(()=>toast('Could not export SVG'));}else download(new Blob([svg],{type:'image/svg+xml'}),`${safeName(state.name)}.svg`); }
  function safeName(s) { return String(s||'tynkr-project').replace(/[^a-z0-9-_]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'tynkr-project'; }
  function download(blob,name) { const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  function exportProject() { saveLocal(true);const json=JSON.stringify(state,null,2),name=`${safeName(state.name)}.tynkr.json`;if(window.tynkrDesktop){window.tynkrDesktop.saveProject(json,name).then(path=>toast(path?'Editable project saved':'Save canceled')).catch(()=>toast('Could not save project'));}else{const blob=new Blob([json],{type:'application/json'});download(blob,name);toast('Editable Tynkr project downloaded');} }
  // Save downloads a portable editable project; local autosave remains on as well.
  setup();
  requestAnimationFrame(gravityTick);
})();
