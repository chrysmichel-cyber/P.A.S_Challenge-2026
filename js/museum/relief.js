/* Relief 3D photo-texturé : il s'agit d'une interprétation frontale, pas d'un scan. */
(function () {
  'use strict';
  window.LCA = window.LCA || {};

  function makeCutout(source) {
    const limit = 900, scale = Math.min(1, limit / Math.max(source.naturalWidth || source.width, source.naturalHeight || source.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(2, Math.round((source.naturalWidth || source.width) * scale));
    canvas.height = Math.max(2, Math.round((source.naturalHeight || source.height) * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height), pixels = image.data;
    const w = canvas.width, h = canvas.height, bins = new Map(), sampleStep = Math.max(1, Math.floor(Math.max(w, h) / 300));
    const add = p => { const i = p * 4, key = [pixels[i] >> 4, pixels[i + 1] >> 4, pixels[i + 2] >> 4].join(','); bins.set(key, (bins.get(key) || 0) + 1); };
    for (let x = 0; x < w; x += sampleStep) { add(x); add((h - 1) * w + x); }
    for (let y = 0; y < h; y += sampleStep) { add(y * w); add(y * w + w - 1); }
    const bgKey = Array.from(bins).sort((a, b) => b[1] - a[1])[0][0].split(',').map(v => Number(v) * 16 + 8);
    const visited = new Uint8Array(w * h), stack = [];
    /* Modèle de fond : les photos de musée ont un fond en dégradé. On l'estime en interpolant les quatre bords (surface de Coons),
       puis un pixel est du fond s'il est proche de ce que la surface prédit à sa position. */
    const edge = (n, at) => { const out = new Float32Array(n * 3), r = 3; for (let k = 0; k < n; k++) { let sr = 0, sg = 0, sb = 0, c = 0; for (let d = -4; d <= 4; d++) { const kk = Math.max(0, Math.min(n - 1, k + d)); for (let t = 0; t < r; t++) { const i = at(kk, t) * 4; sr += pixels[i]; sg += pixels[i + 1]; sb += pixels[i + 2]; c++; } } out[k * 3] = sr / c; out[k * 3 + 1] = sg / c; out[k * 3 + 2] = sb / c; } return out; };
    const eT = edge(w, (k, t) => t * w + k), eB = edge(w, (k, t) => (h - 1 - t) * w + k), eL = edge(h, (k, t) => k * w + t), eR = edge(h, (k, t) => k * w + (w - 1 - t));
    const model = (p, ch) => { const x = p % w, y = (p - x) / w, u = x / (w - 1), v = y / (h - 1);
      return (1 - v) * eT[x * 3 + ch] + v * eB[x * 3 + ch] + (1 - u) * eL[y * 3 + ch] + u * eR[y * 3 + ch]
        - ((1 - u) * (1 - v) * eT[ch] + u * (1 - v) * eT[(w - 1) * 3 + ch] + (1 - u) * v * eB[ch] + u * v * eB[(w - 1) * 3 + ch]); };
    const isBackground = p => { const i = p * 4, dr = pixels[i] - model(p, 0), dg = pixels[i + 1] - model(p, 1), db = pixels[i + 2] - model(p, 2); return dr * dr + dg * dg + db * db < 50 * 50; };
    const seed = p => { if (!visited[p] && isBackground(p)) { visited[p] = 1; stack.push(p); } };
    for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
    const grow = n => { if (!visited[n] && isBackground(n)) { visited[n] = 1; stack.push(n); } };
    while (stack.length) {
      const p = stack.pop(), x = p % w;
      if (x > 0) grow(p - 1); if (x < w - 1) grow(p + 1);
      if (p >= w) grow(p - w); if (p < w * (h - 1)) grow(p + w);
    }
    /* Fonds enfermés : ils ne touchent pas le bord, donc le remplissage précédent les a manqués.
       On retire ceux qui ont la couleur du fond et une taille notable ; les petits reflets clairs restent. */
    {
      const holeLimit = Math.max(300, w * h * .004), seen = new Uint8Array(w * h);
      const near = p => isBackground(p);
      for (let p0 = 0; p0 < w * h; p0++) {
        if (visited[p0] || seen[p0] || !near(p0)) continue;
        const comp = [p0]; seen[p0] = 1; let k = 0;
        while (k < comp.length) {
          const q = comp[k++], qx = q % w;
          const nb = [qx > 0 ? q - 1 : -1, qx < w - 1 ? q + 1 : -1, q >= w ? q - w : -1, q < w * (h - 1) ? q + w : -1];
          for (const n of nb) if (n >= 0 && !visited[n] && !seen[n] && near(n)) { seen[n] = 1; comp.push(n); }
        }
        if (comp.length >= holeLimit) comp.forEach(q => { visited[q] = 1; });
      }
    }
    /* Étiquette les îlots du premier plan pour retirer les poussières isolées du fond photo. */
    const labels = new Int32Array(w * h), sizes = [0]; let labelId = 0, largest = 0;
    for (let p = 0; p < w * h; p++) {
      if (visited[p] || pixels[p * 4 + 3] <= 24) continue;
      labelId++; let count = 0; const todo = [p]; visited[p] = 1; labels[p] = labelId;
      while (todo.length) {
        const q = todo.pop(), qx = q % w, qy = Math.floor(q / w); count++;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue; const nx = qx + dx, ny = qy + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const n = ny * w + nx;
          if (!visited[n] && pixels[n * 4 + 3] > 24) { visited[n] = 1; labels[n] = labelId; todo.push(n); }
        }
      }
      sizes[labelId] = count; largest = Math.max(largest, count);
    }
    const minComponent = Math.max(64, largest * .02);
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let p = 0; p < w * h; p++) {
      const x = p % w, y = Math.floor(p / w), i = p * 4, id = labels[p];
      if (!id || sizes[id] < minComponent) { pixels[i + 3] = 0; labels[p] = 0; continue; }
      let edge = false;
      for (let dy = -1; dy <= 1 && !edge; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue; const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h || !labels[ny * w + nx]) { edge = true; break; }
      }
      if(edge){const a=220/255,inv=1-a;pixels[i]=Math.max(0,Math.min(255,(pixels[i]-bgKey[0]*inv)/a));pixels[i+1]=Math.max(0,Math.min(255,(pixels[i+1]-bgKey[1]*inv)/a));pixels[i+2]=Math.max(0,Math.min(255,(pixels[i+2]-bgKey[2]*inv)/a));pixels[i+3]=220}else pixels[i+3]=255;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    /* Étend la couleur du sujet sous les pixels transparents pour éviter les franges claires. */
    for(let y=Math.max(0,y0-1);y<=Math.min(h-1,y1+1);y++)for(let x=Math.max(0,x0-1);x<=Math.min(w-1,x1+1);x++){
      const p=y*w+x,i=p*4;if(labels[p]||pixels[i+3])continue;let r=0,g=0,b=0,n=0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||nx>=w||ny<0||ny>=h)continue;const q=ny*w+nx,j=q*4;if(labels[q]){r+=pixels[j];g+=pixels[j+1];b+=pixels[j+2];n++}}
      if(n){pixels[i]=r/n;pixels[i+1]=g/n;pixels[i+2]=b/n}
    }
    ctx.putImageData(image, 0, 0);
    if (x1 <= x0 || y1 <= y0) return { canvas, bounds: { x: 0, y: 0, w, h } };
    const pad = Math.max(3, Math.round(Math.max(x1 - x0, y1 - y0) * .035));
    const left = Math.max(0, x0 - pad), top = Math.max(0, y0 - pad), right = Math.min(w, x1 + pad + 1), bottom = Math.min(h, y1 + pad + 1);
    const crop = document.createElement('canvas'); crop.width = right - left; crop.height = bottom - top;
    crop.getContext('2d').drawImage(canvas, left, top, crop.width, crop.height, 0, 0, crop.width, crop.height);
    return { canvas: crop, bounds: { x: left, y: top, w: crop.width, h: crop.height } };
  }

  function makeDepthSamples(canvas) {
    const scale = Math.min(1, 256 / Math.max(canvas.width, canvas.height)), sample = document.createElement('canvas');
    sample.width = Math.max(2, Math.round(canvas.width * scale)); sample.height = Math.max(2, Math.round(canvas.height * scale));
    const ctx = sample.getContext('2d', { willReadFrequently: true }); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.filter = 'blur(.8px)'; ctx.drawImage(canvas, 0, 0, sample.width, sample.height); ctx.filter = 'none';
    return { data: ctx.getImageData(0, 0, sample.width, sample.height).data, width: sample.width, height: sample.height };
  }

  function depthAt(sample, u, v) {
    const x = Math.max(0, Math.min(sample.width - 1, u * (sample.width - 1))), y = Math.max(0, Math.min(sample.height - 1, (1 - v) * (sample.height - 1)));
    const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(sample.width - 1, x0 + 1), y1 = Math.min(sample.height - 1, y0 + 1), tx = x - x0, ty = y - y0;
    const channel = c => { const a=sample.data[(y0*sample.width+x0)*4+c],b=sample.data[(y0*sample.width+x1)*4+c],d=sample.data[(y1*sample.width+x0)*4+c],e=sample.data[(y1*sample.width+x1)*4+c];return (a*(1-tx)+b*tx)*(1-ty)+(d*(1-tx)+e*tx)*ty; };
    const lum=(channel(0)*.2126+channel(1)*.7152+channel(2)*.0722)/255,coverage=channel(3)/255;
    return coverage*(.012+Math.max(0,.62-lum)*.095);
  }

  function create(canvas, url) {
    const THREE = window.THREE;
    let renderer, frame = 0, observer = null, disposed = false, ready = false;
    const listeners = [];
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setClearColor(0x000000, 0);
    } catch (err) { return { dispose() {} }; }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 30); camera.position.set(0, 0, 4.1);
    scene.add(new THREE.HemisphereLight(0xffe0b0, 0x28180f, 1.35));
    const key = new THREE.DirectionalLight(0xffedcf, 1.65); key.position.set(-2.5, 3.2, 4); scene.add(key);
    const fill = new THREE.DirectionalLight(0x9bb9cf, .48); fill.position.set(3, .3, 2); scene.add(fill);
    const root = new THREE.Group(); scene.add(root);
    let model = null;
    const pointers = new Map(); let lastPinch = 0;
    const minZoom = 2.25, maxZoom = 6.5;
    const resize = () => {
      if (!renderer || disposed) return;
      const rect = canvas.getBoundingClientRect(); if (!rect.width || !rect.height) return;
      renderer.setSize(Math.round(rect.width), Math.round(rect.height), false);
      camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix();
    };
    const render = () => { if (disposed) return; frame = requestAnimationFrame(render); if (ready) renderer.render(scene, camera); };
    const move = e => {
      if (!pointers.has(e.pointerId)) return;
      const old = pointers.get(e.pointerId), next = { x: e.clientX, y: e.clientY };
      pointers.set(e.pointerId, next);
      if (pointers.size === 1) { root.rotation.y += (next.x - old.x) * .009; root.rotation.x += (next.y - old.y) * .009; }
      else {
        const pts = Array.from(pointers.values()), dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (lastPinch) camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z + (lastPinch - dist) * .012));
        lastPinch = dist;
      }
    };
    const down = e => { canvas.focus({ preventScroll: true }); canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointers.size === 2) { const p = Array.from(pointers.values()); lastPinch = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); } };
    const up = e => { pointers.delete(e.pointerId); lastPinch = 0; };
    const wheel = e => { e.preventDefault(); camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z + e.deltaY * .003)); };
    const keydown = e => { const step = e.shiftKey ? .22 : .1; if (e.key === 'ArrowLeft') root.rotation.y -= step; else if (e.key === 'ArrowRight') root.rotation.y += step; else if (e.key === 'ArrowUp') root.rotation.x -= step; else if (e.key === 'ArrowDown') root.rotation.x += step; else if (e.key === '+' || e.key === '=') camera.position.z = Math.max(minZoom, camera.position.z - .2); else if (e.key === '-') camera.position.z = Math.min(maxZoom, camera.position.z + .2); else return; e.preventDefault(); };
    const on = (type, fn, opts) => { canvas.addEventListener(type, fn, opts); listeners.push([type, fn, opts]); };
    on('pointerdown', down); on('pointermove', move); on('pointerup', up); on('pointercancel', up); on('wheel', wheel, { passive: false }); on('keydown', keydown);
    if ('ResizeObserver' in window) { observer = new ResizeObserver(resize); observer.observe(canvas); } else { window.addEventListener('resize', resize); listeners.push(['resize', resize, undefined, window]); }
    resize(); render();
    new THREE.TextureLoader().load(url, image => {
      if (disposed) { image.dispose(); return; }
      try { model = makePhotoModel(THREE, image.image, 1.7); root.add(model.group); root.rotation.x = -.04; ready = true; resize(); canvas.parentElement.classList.add('ready'); }
      catch (err) { console.error('Impossible de préparer le relief 3D du masque.', err); }
      image.dispose();
    }, undefined, () => { console.error('Photo source du modèle 3D non chargée : '+url); });
    return { reset() { root.rotation.set(-.04, 0, 0); camera.position.z = 4.1; }, dispose() {
      if (disposed) return; disposed = true; cancelAnimationFrame(frame); if (observer) observer.disconnect();
      listeners.forEach(([type, fn, opts, target]) => (target || canvas).removeEventListener(type, fn, opts));
      if (model) model.dispose(); renderer.dispose(); canvas.parentElement.classList.remove('ready');
    } };
  }

  function makePhotoModel(THREE, image, height) {
    const cutout = makeCutout(image), color = new THREE.CanvasTexture(cutout.canvas);
    color.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
    const alphaCanvas = document.createElement('canvas'); alphaCanvas.width = cutout.canvas.width; alphaCanvas.height = cutout.canvas.height;
    const alphaCtx = alphaCanvas.getContext('2d'); alphaCtx.drawImage(cutout.canvas, 0, 0);
    const alphaData = alphaCtx.getImageData(0, 0, alphaCanvas.width, alphaCanvas.height), a = alphaData.data;
    for (let i = 0; i < a.length; i += 4) { a[i] = a[i + 1] = a[i + 2] = a[i + 3]; a[i + 3] = 255; }
    alphaCtx.putImageData(alphaData, 0, 0);
    const alpha = new THREE.CanvasTexture(alphaCanvas), aspect = cutout.canvas.width / cutout.canvas.height, width = Math.max(.28, Math.min(1.8, height * aspect));
    const segY = 176, segX = Math.max(64, Math.round(segY * Math.min(1.25, aspect))), geo = new THREE.PlaneGeometry(width, height, segX, segY), pos = geo.attributes.position;
    const depthSamples = makeDepthSamples(cutout.canvas);
    for (let i = 0; i < pos.count; i++) {
      const u = geo.attributes.uv.getX(i), v = geo.attributes.uv.getY(i);
      pos.setZ(i, depthAt(depthSamples, u, v));
    }
    geo.computeVertexNormals();
    const group = new THREE.Group();
    const frontMaterial = new THREE.MeshStandardMaterial({ map: color, side: THREE.DoubleSide, transparent: true, alphaTest: .025, roughness: .96, metalness: 0 });
    const front = new THREE.Mesh(geo, frontMaterial); group.add(front);
    const backGeo = geo.clone(), backMaterial = new THREE.MeshStandardMaterial({ color: 0x44372b, alphaMap: alpha, side: THREE.DoubleSide, transparent: true, alphaTest: .025, roughness: .98, metalness: 0 });
    const back = new THREE.Mesh(backGeo, backMaterial); back.position.z = -.075; back.rotation.y = Math.PI; group.add(back);
    return { group, width, height, dispose() { geo.dispose(); backGeo.dispose(); frontMaterial.dispose(); backMaterial.dispose(); color.dispose(); alpha.dispose(); } };
  }

  /* Ambiance de la salle selon la grande zone : mêmes volumes, matières et couleurs propres à l’architecture du musée du village. */
  const ROOM_STYLES = {
    ouest: { floor: 0x8e704c, wall: 0x765037, side: 0x6a4934, ceil: 0x493623, base: 0x422e20, beam: 0x4d3422 },
    nord: { floor: 0xd8cfbb, wall: 0xf0eadc, side: 0xe6dec9, ceil: 0xcfc3aa, base: 0x2d6fa8, beam: 0x2d6fa8 },
    est: { floor: 0xb9ab8a, wall: 0xe5d8bc, side: 0xd8c9a6, ceil: 0x4a2c18, base: 0x4a2c18, beam: 0x5a3820 },
    centrale: { floor: 0x6a4528, wall: 0xa8683c, side: 0x8c5430, ceil: 0x967734, base: 0x3e2616, beam: 0x5a3a22 },
    australe: { floor: 0x7d725e, wall: 0x8a7d6b, side: 0x7a6e5d, ceil: 0x5a4a38, base: 0x5a5042, beam: 0x4a3a2a }
  };
  function createGallery(canvas, collection, onSelect, region) {
    const RS = ROOM_STYLES[region] || ROOM_STYLES.ouest;
    const THREE = window.THREE;
    let renderer, raf = 0, observer = null, closed = false, selectedId = null, downPoint = null;
    const resources = [], models = new Map(), pickables = [], pointers = new Map(), raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' }); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6)); }
    catch (err) { return { selectById() {}, dispose() {} }; }
    renderer.setClearColor(0x1b251f, 1);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1b251f); scene.fog = new THREE.Fog(0x1b251f, 25, 45);
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 70);
    const target = new THREE.Vector3(3.2, 3.15, -2.25), orbit = { theta: 0, phi: 1.38, radius: 14.1 };
    const room = new THREE.Group(); scene.add(room);
    const material = (color, roughness = .86, metalness = 0) => { const m = new THREE.MeshStandardMaterial({ color, roughness, metalness }); resources.push(m); return m; };
    const addBox = (w, h, d, color, x, y, z, roughness) => { const g = new THREE.BoxGeometry(w, h, d), m = material(color, roughness); const o = new THREE.Mesh(g, m); o.position.set(x, y, z); room.add(o); resources.push(g); return o; };
    scene.add(new THREE.HemisphereLight(0xffe4ba, 0x201b15, .8));
    const warm = new THREE.PointLight(0xffbd73, 1.0, 26); warm.position.set(0, 5, 1); scene.add(warm);
    const fill = new THREE.DirectionalLight(0xd2e8d1, .55); fill.position.set(-5, 7, 5); scene.add(fill);
    const floor = addBox(18.5, .28, 15.2, RS.floor, 0, -.14, -.8, .9); floor.receiveShadow = true;
    addBox(18.5, 7.2, .32, RS.wall, 0, 3.6, -7.6);
    addBox(.32, 7.2, 15.2, RS.side, -9.1, 3.6, -.8); addBox(.32, 7.2, 15.2, RS.side, 9.1, 3.6, -.8);
    addBox(18.5, .24, 15.2, RS.ceil, 0, 7.2, -.8);
    addBox(18.2, .34, .24, RS.base, 0, .28, -7.35);
    const tile = new THREE.GridHelper(18, 18, 0xd3ad76, 0x5f4933); tile.position.set(0, .012, -.8); tile.material.transparent = true; tile.material.opacity = .22; room.add(tile); resources.push(tile.geometry, tile.material);
    /* Des poutres au plafond donnent la lecture d'une salle visitable ; aucun montant ne passe devant la caméra. */
    for (let x = -8; x <= 8; x += 2) addBox(.15, .16, 14.4, RS.beam, x, 6.88, -.7);
    const positions = [-7, -4.2, -1.4, 1.4, 4.2, 7], podiums = new Map(), frameMaterials = new Map(), stagePositions = new Map();
    const ringGeo = new THREE.TorusGeometry(1.12, .055, 8, 48), ringMat = new THREE.MeshStandardMaterial({ color: 0xf2bd5c, emissive: 0xa45a16, emissiveIntensity: .42, roughness: .45 });
    resources.push(ringGeo, ringMat);
    const selectionRing = new THREE.Mesh(ringGeo, ringMat); selectionRing.rotation.x = -Math.PI / 2; selectionRing.position.y = .04; selectionRing.visible = false; room.add(selectionRing);
    const labelTexture = mask => {
      const c = document.createElement('canvas'); c.width = 512; c.height = 144; const x = c.getContext('2d');
      x.fillStyle = '#322519'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#e9bf72'; x.fillRect(0, 0, 9, c.height);
      x.fillStyle = '#fff0d4'; x.textAlign = 'left'; x.textBaseline = 'middle'; let size = 27; x.font = '700 ' + size + 'px system-ui';
      while (x.measureText(mask.traditionalName).width > 465 && size > 16) { size -= 1; x.font = '700 ' + size + 'px system-ui'; }
      x.fillText(mask.traditionalName, 24, 46); x.fillStyle = '#d3bea1'; x.font = '500 20px system-ui'; x.fillText(mask.people + ' · ' + mask.place, 24, 98);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding; resources.push(t); return t;
    };
    /* La salle accroche six vitrines ; les masques en plus restent dans la liste et la galerie photo. */
    collection.filter(item => item.kind !== 'instrument').slice(0, 6).forEach((mask, i) => {
      const x = positions[i] === undefined ? 0 : positions[i], id = mask.id;
      const panelGeo = new THREE.BoxGeometry(2.5, 3.3, .18), panel = new THREE.Mesh(panelGeo, material(0x392a1f)); panel.position.set(x, 3.55, -7.31); panel.userData.exhibitId = id; room.add(panel); resources.push(panelGeo); pickables.push(panel); podiums.set(id, panel);
      const frameMat = material(0x9c7141, .58, .08); frameMaterials.set(id, frameMat);
      [[2.62,.1,x,5.22], [2.62,.1,x,1.88]].forEach(([w,h,fx,fy])=>{const g=new THREE.BoxGeometry(w,h,.13),o=new THREE.Mesh(g,frameMat);o.position.set(fx,fy,-7.18);room.add(o);resources.push(g)});
      [[x-1.26,3.55],[x+1.26,3.55]].forEach(([fx,fy])=>{const g=new THREE.BoxGeometry(.1,3.34,.13),o=new THREE.Mesh(g,frameMat);o.position.set(fx,fy,-7.18);room.add(o);resources.push(g)});
      const boardGeo = new THREE.PlaneGeometry(2.45, .62), boardMat = new THREE.MeshBasicMaterial({ map: labelTexture(mask) }), board = new THREE.Mesh(boardGeo, boardMat);
      board.position.set(x, 1.51, -7.16); board.userData.exhibitId = id; room.add(board); resources.push(boardGeo, boardMat); pickables.push(board);
      new THREE.TextureLoader().load(mask.image, image => {
        if (closed) { image.dispose(); return; }
        try {
          /* Texture photo directe : elle reste lisible même si le navigateur interdit le détourage canvas. */
          image.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          const source=image.image,aspect=(source.naturalWidth||source.width)/(source.naturalHeight||source.height),height=2.28,width=Math.max(.72,Math.min(2.28,height*aspect));
          const geo=new THREE.PlaneGeometry(width,height,72,96),pos=geo.attributes.position;
          try{const sample=document.createElement('canvas');sample.width=256;sample.height=256;const ctx=sample.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.filter='blur(.8px)';ctx.drawImage(source,0,0,sample.width,sample.height);ctx.filter='none';const data=ctx.getImageData(0,0,256,256).data;for(let n=0;n<pos.count;n++){const u=geo.attributes.uv.getX(n),v=geo.attributes.uv.getY(n),px=Math.min(255,Math.floor(u*256)),py=Math.min(255,Math.floor((1-v)*256)),j=(py*256+px)*4,lum=(data[j]*.2126+data[j+1]*.7152+data[j+2]*.0722)/255;pos.setZ(n,Math.max(0,.56-lum)*.085)}}catch(err){/* La photo reste visible à plat si l’accès aux pixels est bloqué. */}geo.computeVertexNormals();
          const frontMat=new THREE.MeshBasicMaterial({map:image,side:THREE.DoubleSide}),front=new THREE.Mesh(geo,frontMat),backGeo=geo.clone(),backMat=material(0x60402b,.9),back=new THREE.Mesh(backGeo,backMat);back.position.z=-.045;back.rotation.y=Math.PI;
          const group=new THREE.Group();group.add(front,back);group.position.set(x,3.62,-7.02);group.userData.exhibitId=mask.id;room.add(group);pickables.push(group);
          models.set(mask.id,{dispose(){geo.dispose();backGeo.dispose();frontMat.dispose();image.dispose()}});
        } catch (err) { console.error('Impossible de créer le relief photo du masque « '+mask.id+' ».',err);image.dispose(); }
      }, undefined, image => { console.error('Photo du masque non chargée : '+mask.image); if (image&&image.dispose) image.dispose(); });
    });
    const addInstrument = (item, x, z) => {
      const id=item.id;stagePositions.set(id,{x,z});
      const stageGeo=new THREE.CylinderGeometry(1.22,1.3,.24,28),stage=new THREE.Mesh(stageGeo,material(0x533721,.72));stage.position.set(x,.14,z);stage.userData.exhibitId=id;room.add(stage);resources.push(stageGeo);pickables.push(stage);
      const plaqueGeo=new THREE.PlaneGeometry(2.55,.7),plaqueMat=new THREE.MeshBasicMaterial({map:labelTexture(item)}),plaque=new THREE.Mesh(plaqueGeo,plaqueMat);plaque.position.set(x,.58,z+1.21);plaque.userData.exhibitId=id;room.add(plaque);resources.push(plaqueGeo,plaqueMat);pickables.push(plaque);
      const wood=material(0x6b3f25,.78),dark=material(0x40291b,.83),gold=material(0xb98a4c,.57),skin=material(0xd4b98b,.9),string=material(0xd9c99b,.48,.08);
      const part=(geo,mat,px,py,pz,sx,sy,sz)=>{const o=new THREE.Mesh(geo,mat);o.position.set(px,py,pz);if(sx)o.scale.set(sx,sy,sz);o.userData.exhibitId=id;room.add(o);resources.push(geo);pickables.push(o);return o};
      const boxPart=(w,h,d,mat,px,py,pz)=>part(new THREE.BoxGeometry(w,h,d),mat,px,py,pz);
      if(id==='instrument-kora'){
        part(new THREE.SphereGeometry(.82,20,16),wood,x,1.03,z,.88,.72,.55);part(new THREE.SphereGeometry(.72,20,16),skin,x,1.04,z+.34,.88,.72,.12);
        boxPart(.16,2.25,.16,dark,x,2.22,z);boxPart(1.18,.12,.12,gold,x,1.56,z+.42);[-.58,.58].forEach(dx=>boxPart(.1,1.08,.12,dark,x+dx,1.49,z+.25));
        const sg=new THREE.BoxGeometry(.014,1.55,.012);resources.push(sg);for(let k=0;k<21;k++){const o=new THREE.Mesh(sg,string);o.position.set(x-.55+k*.055,2.43,z+.47);o.userData.exhibitId=id;room.add(o);pickables.push(o)}boxPart(.28,.16,.18,gold,x,3.38,z);
      }else if(id==='instrument-bala'){
        [-.48,.48].forEach(dz=>boxPart(2.9,.13,.13,dark,x,.95,z+dz));[-1.25,1.25].forEach(dx=>[-.48,.48].forEach(dz=>boxPart(.12,.98,.12,wood,x+dx,.5,z+dz)));
        for(let k=0;k<9;k++){const dx=-1.28+k*.32,width=.23+Math.sin(k/8*Math.PI)*.04;boxPart(width,.14,.83,gold,x+dx,1.42+Math.sin(k*.7)*.035,z);part(new THREE.SphereGeometry(.22,12,10),wood,x+dx,.68,z,.72,1.25,.8)}
        boxPart(.07,.8,.07,dark,x-1.48,1.9,z+.56);boxPart(.07,.8,.07,dark,x+1.48,1.9,z+.56);
      }else{
        const pts=[new THREE.Vector2(.3,0),new THREE.Vector2(.38,.18),new THREE.Vector2(.44,.55),new THREE.Vector2(.53,1),new THREE.Vector2(.73,1.48),new THREE.Vector2(.76,1.63)];part(new THREE.LatheGeometry(pts,24),wood,x,.22,z);
        part(new THREE.CylinderGeometry(.73,.73,.06,28),skin,x,1.83,z);const hoop=part(new THREE.TorusGeometry(.75,.055,8,32),gold,x,1.86,z);hoop.rotation.x=Math.PI/2;
        const rg=new THREE.BoxGeometry(.026,1.1,.026);resources.push(rg);for(let k=0;k<12;k++){const a=k*Math.PI*2/12,o=new THREE.Mesh(rg,dark);o.position.set(x+Math.cos(a)*.53,1,z+Math.sin(a)*.53);o.userData.exhibitId=id;room.add(o);pickables.push(o)}
      }
    };
    const instrumentXs=[-5.8,-.1,5.45];
    collection.filter(item=>item.kind==='instrument').forEach((item,i)=>addInstrument(item,instrumentXs[i]===undefined?0:instrumentXs[i],1.45));
    const updateCamera = () => { camera.position.set(target.x + orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta), target.y + orbit.radius * Math.cos(orbit.phi), target.z + orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta)); camera.lookAt(target); };
    const resize = () => { if (closed) return; const r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return; renderer.setSize(Math.round(r.width), Math.round(r.height), false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); };
    const select = id => { const item = collection.find(m => m.id === id); if (!item) return; selectedId = id; const isInstrument=item.kind==='instrument',panel=podiums.get(id);selectionRing.visible=isInstrument;if(isInstrument){const p=stagePositions.get(id);if(p)selectionRing.position.set(p.x,.04,p.z)}frameMaterials.forEach((mat,key)=>{const active=!isInstrument&&key===id;mat.color.setHex(active?0xf2bd5c:0x9c7141);mat.emissive.setHex(active?0x8a4810:0x000000);mat.emissiveIntensity=active ? .5 : 0});if(panel&&panel.material&&panel.material.emissive)panel.material.emissive.setHex(isInstrument?0x000000:0x160d06);if(onSelect)onSelect(item); };
    const selectAt = (clientX, clientY) => { const r = canvas.getBoundingClientRect(); mouse.set((clientX - r.left) / r.width * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1); raycaster.setFromCamera(mouse, camera); const hit = raycaster.intersectObjects(pickables, true)[0]; if (!hit) return; let node = hit.object; while (node && !node.userData.exhibitId) node = node.parent; if (node) select(node.userData.exhibitId); };
    const down = e => { canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); downPoint = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false }; };
    const move = e => {
      if (!pointers.has(e.pointerId)) { const r = canvas.getBoundingClientRect(); mouse.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); raycaster.setFromCamera(mouse, camera); canvas.style.cursor = raycaster.intersectObjects(pickables, true).length ? 'pointer' : 'grab'; return; }
      const p = pointers.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y; pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (downPoint && Math.hypot(e.clientX - downPoint.x, e.clientY - downPoint.y) > 5) downPoint.moved = true;
      if (pointers.size > 1) { const pts = Array.from(pointers.values()), dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y); if (move.pinch) orbit.radius = Math.max(10.5, Math.min(18, orbit.radius + (move.pinch - dist) * .018)); move.pinch = dist; }
      else { orbit.theta -= dx * .006; orbit.phi = Math.max(.76, Math.min(1.62, orbit.phi + dy * .004)); }
      updateCamera();
    };
    const up = e => { const was = downPoint && downPoint.id === e.pointerId ? downPoint : null; pointers.delete(e.pointerId); move.pinch = 0; if (was && !was.moved && pointers.size === 0) selectAt(e.clientX, e.clientY); if (was) downPoint = null; };
    const wheel = e => { e.preventDefault(); orbit.radius = Math.max(10.5, Math.min(18, orbit.radius + e.deltaY * .009)); updateCamera(); };
    const keydown = e => { if (e.key === 'ArrowLeft') orbit.theta += .12; else if (e.key === 'ArrowRight') orbit.theta -= .12; else if (e.key === 'ArrowUp') orbit.phi = Math.max(.76, orbit.phi - .08); else if (e.key === 'ArrowDown') orbit.phi = Math.min(1.62, orbit.phi + .08); else if (e.key === 'Enter') { const i = Math.max(0, collection.findIndex(m => m.id === selectedId)); select(collection[(i + 1) % collection.length].id); } else return; e.preventDefault(); updateCamera(); };
    const listeners = [['pointerdown', down], ['pointermove', move], ['pointerup', up], ['pointercancel', up], ['wheel', wheel, { passive: false }], ['keydown', keydown]];
    listeners.forEach(([name, fn, opts]) => canvas.addEventListener(name, fn, opts));
    if ('ResizeObserver' in window) { observer = new ResizeObserver(resize); observer.observe(canvas); } else { window.addEventListener('resize', resize); listeners.push(['resize', resize, undefined, window]); }
    updateCamera(); resize();
    const draw = () => { if (closed) return; raf = requestAnimationFrame(draw); renderer.render(scene, camera); };
    draw(); if (collection.length) select(collection[0].id);
    return { selectById: select, dispose() { if (closed) return; closed = true; cancelAnimationFrame(raf); if (observer) observer.disconnect(); listeners.forEach(([name, fn, opts, targetNode]) => (targetNode || canvas).removeEventListener(name, fn, opts)); models.forEach(m => m.dispose()); resources.forEach(r => r && r.dispose && r.dispose()); renderer.dispose(); } };
  }
  window.LCA.maskRelief = { create, createGallery };
})();
