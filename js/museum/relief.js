/* Relief 3D photo-texturé : il s'agit d'une interprétation frontale, pas d'un scan. */
(function () {
  'use strict';
  window.LCA = window.LCA || {};

  function makeCutout(source, profile) {
    const instrument = profile === 'instrument', backgroundThreshold = instrument ? 36 : 50;
    const limit = 900, scale = Math.min(1, limit / Math.max(source.naturalWidth || source.width, source.naturalHeight || source.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(2, Math.round((source.naturalWidth || source.width) * scale));
    canvas.height = Math.max(2, Math.round((source.naturalHeight || source.height) * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height), pixels = image.data;
    const w = canvas.width, h = canvas.height;
    const visited = new Uint8Array(w * h), stack = [];
    /* Modèle de fond : les photos de musée ont un fond en dégradé. On l'estime en interpolant les quatre bords (surface de Coons),
       puis un pixel est du fond s'il est proche de ce que la surface prédit à sa position. */
    const edge = (n, at) => { const out = new Float32Array(n * 3), r = 3; for (let k = 0; k < n; k++) { let sr = 0, sg = 0, sb = 0, c = 0; for (let d = -4; d <= 4; d++) { const kk = Math.max(0, Math.min(n - 1, k + d)); for (let t = 0; t < r; t++) { const i = at(kk, t) * 4; sr += pixels[i]; sg += pixels[i + 1]; sb += pixels[i + 2]; c++; } } out[k * 3] = sr / c; out[k * 3 + 1] = sg / c; out[k * 3 + 2] = sb / c; } return out; };
    const eT = edge(w, (k, t) => t * w + k), eB = edge(w, (k, t) => (h - 1 - t) * w + k), eL = edge(h, (k, t) => k * w + t), eR = edge(h, (k, t) => k * w + (w - 1 - t));
    const model = (p, ch) => { const x = p % w, y = (p - x) / w, u = x / (w - 1), v = y / (h - 1);
      return (1 - v) * eT[x * 3 + ch] + v * eB[x * 3 + ch] + (1 - u) * eL[y * 3 + ch] + u * eR[y * 3 + ch]
        - ((1 - u) * (1 - v) * eT[ch] + u * (1 - v) * eT[(w - 1) * 3 + ch] + (1 - u) * v * eB[ch] + u * v * eB[(w - 1) * 3 + ch]); };
    const backgroundDistance = p => { const i = p * 4, dr = pixels[i] - model(p, 0), dg = pixels[i + 1] - model(p, 1), db = pixels[i + 2] - model(p, 2); return Math.sqrt(dr * dr + dg * dg + db * db); };
    const isBackground = p => backgroundDistance(p) < backgroundThreshold;
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
      const holeLimit = Math.max(instrument ? 24 : 300, w * h * (instrument ? .0007 : .004)), seen = new Uint8Array(w * h);
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
    const labels = new Int32Array(w * h), sizes = [0], contrastSums = [0]; let labelId = 0, largest = 0;
    for (let p = 0; p < w * h; p++) {
      if (visited[p] || pixels[p * 4 + 3] <= 24) continue;
      labelId++; let count = 0, contrast = 0; const todo = [p]; visited[p] = 1; labels[p] = labelId;
      while (todo.length) {
        const q = todo.pop(), qx = q % w, qy = Math.floor(q / w); count++; contrast += backgroundDistance(q);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue; const nx = qx + dx, ny = qy + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const n = ny * w + nx;
          if (!visited[n] && pixels[n * 4 + 3] > 24) { visited[n] = 1; labels[n] = labelId; todo.push(n); }
        }
      }
      sizes[labelId] = count; contrastSums[labelId] = contrast; largest = Math.max(largest, count);
    }
    /* Les cordes, baguettes et petits pieds séparés par le fond font partie de l’instrument. */
    const minComponent = Math.max(instrument ? 24 : 64, largest * (instrument ? .001 : .02)), minFineFeature = Math.max(10, Math.floor(w * h * .00001));
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let p = 0; p < w * h; p++) {
      const x = p % w, y = Math.floor(p / w), i = p * 4, id = labels[p];
      const fineDetail = instrument && id && sizes[id] >= minFineFeature && contrastSums[id] / sizes[id] > backgroundThreshold * .82;
      if (!id || (sizes[id] < minComponent && !fineDetail)) { pixels[i + 3] = 0; labels[p] = 0; continue; }
      let edge = false;
      for (let dy = -1; dy <= 1 && !edge; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue; const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h || !labels[ny * w + nx]) { edge = true; break; }
      }
      if(edge){
        const distance=backgroundDistance(p),a=instrument?Math.max(.58,Math.min(.97,(distance-8)/(backgroundThreshold-8))):220/255,inv=1-a;
        for(let ch=0;ch<3;ch++)pixels[i+ch]=Math.max(0,Math.min(255,(pixels[i+ch]-model(p,ch)*inv)/a));pixels[i+3]=Math.round(a*255);
      }else pixels[i+3]=255;
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
    const pad = Math.max(3, Math.round(Math.max(x1 - x0, y1 - y0) * (instrument ? .018 : .035)));
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

  function create(canvas, url, options) {
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
      try { model = makePhotoModel(THREE, image.image, 1.7, options); }
      catch (err) { console.warn('Détourage photo indisponible, création du relief 3D de secours.', err); model = makeTexturedRelief(THREE, image.image, 1.7); }
      try { root.add(model.group); root.rotation.x = -.04; ready = true; resize(); canvas.parentElement.classList.add('ready'); }
      catch (err) { console.error('Impossible de préparer le relief 3D de la pièce.', err); }
      image.dispose();
    }, undefined, () => { console.error('Photo source du modèle 3D non chargée : '+url); });
    return { reset() { root.rotation.set(-.04, 0, 0); camera.position.z = 4.1; }, dispose() {
      if (disposed) return; disposed = true; cancelAnimationFrame(frame); if (observer) observer.disconnect();
      listeners.forEach(([type, fn, opts, target]) => (target || canvas).removeEventListener(type, fn, opts));
      if (model) model.dispose(); renderer.dispose(); canvas.parentElement.classList.remove('ready');
    } };
  }

  function makePhotoModel(THREE, image, height, options) {
    const cutout = makeCutout(image, options && options.kind), color = new THREE.CanvasTexture(cutout.canvas);
    color.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
    const alphaCanvas = document.createElement('canvas'); alphaCanvas.width = cutout.canvas.width; alphaCanvas.height = cutout.canvas.height;
    const alphaCtx = alphaCanvas.getContext('2d'); alphaCtx.drawImage(cutout.canvas, 0, 0);
    const alphaData = alphaCtx.getImageData(0, 0, alphaCanvas.width, alphaCanvas.height), a = alphaData.data;
    for (let i = 0; i < a.length; i += 4) { a[i] = a[i + 1] = a[i + 2] = a[i + 3]; a[i + 3] = 255; }
    alphaCtx.putImageData(alphaData, 0, 0);
    const alpha = new THREE.CanvasTexture(alphaCanvas), aspect = cutout.canvas.width / cutout.canvas.height;
    const modelHeight = Math.min(height, 1.8 / aspect), modelWidth = modelHeight * aspect;
    const segY = 176, segX = Math.max(64, Math.round(segY * Math.min(1.25, aspect))), geo = new THREE.PlaneGeometry(modelWidth, modelHeight, segX, segY), pos = geo.attributes.position;
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
    return { group, width: modelWidth, height: modelHeight, dispose() { geo.dispose(); backGeo.dispose(); frontMaterial.dispose(); backMaterial.dispose(); color.dispose(); alpha.dispose(); } };
  }

  /* Garde un modèle manipulable si un navigateur autorise l’image WebGL, mais bloque son détourage sur canvas. */
  function makeTexturedRelief(THREE, source, maxHeight) {
    const canvas = document.createElement('canvas'), scale = Math.min(1, 1000 / Math.max(source.naturalWidth || source.width, source.naturalHeight || source.height));
    canvas.width = Math.max(2, Math.round((source.naturalWidth || source.width) * scale)); canvas.height = Math.max(2, Math.round((source.naturalHeight || source.height) * scale));
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
    const aspect = canvas.width / canvas.height, height = Math.min(maxHeight, 1.8 / aspect), width = height * aspect;
    const geo = new THREE.PlaneGeometry(width, height, 80, 112), pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const u = geo.attributes.uv.getX(i) * 2 - 1, v = geo.attributes.uv.getY(i) * 2 - 1; pos.setZ(i, Math.max(0, 1 - u * u) * Math.max(0, 1 - v * v) * .055); }
    geo.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide, roughness: .92 }), group = new THREE.Group();
    group.add(new THREE.Mesh(geo, material));
    return { group, dispose() { geo.dispose(); material.dispose(); texture.dispose(); } };
  }

  function createGallery(canvas, collection, onSelect) {
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
    const floor = addBox(18.5, .28, 15.2, 0x8e704c, 0, -.14, -.8, .9); floor.receiveShadow = true;
    addBox(18.5, 7.2, .32, 0x765037, 0, 3.6, -7.6);
    addBox(.32, 7.2, 15.2, 0x6a4934, -9.1, 3.6, -.8); addBox(.32, 7.2, 15.2, 0x6a4934, 9.1, 3.6, -.8);
    addBox(18.5, .24, 15.2, 0x493623, 0, 7.2, -.8);
    addBox(18.2, .34, .24, 0x422e20, 0, .28, -7.35);
    const tile = new THREE.GridHelper(18, 18, 0xd3ad76, 0x5f4933); tile.position.set(0, .012, -.8); tile.material.transparent = true; tile.material.opacity = .22; room.add(tile); resources.push(tile.geometry, tile.material);
    /* Des poutres au plafond donnent la lecture d'une salle visitable ; aucun montant ne passe devant la caméra. */
    for (let x = -8; x <= 8; x += 2) addBox(.15, .16, 14.4, 0x4d3422, x, 6.88, -.7);
    const positions = [-7, -4.2, -1.4, 1.4, 4.2, 7], frameMaterials = new Map(), exhibitViews = new Map();
    const labelTexture = mask => {
      const c = document.createElement('canvas'); c.width = 512; c.height = 144; const x = c.getContext('2d');
      x.fillStyle = '#322519'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#e9bf72'; x.fillRect(0, 0, 9, c.height);
      x.fillStyle = '#fff0d4'; x.textAlign = 'left'; x.textBaseline = 'middle'; let size = 27; x.font = '700 ' + size + 'px system-ui';
      while (x.measureText(mask.traditionalName).width > 465 && size > 16) { size -= 1; x.font = '700 ' + size + 'px system-ui'; }
      x.fillText(mask.traditionalName, 24, 46); x.fillStyle = '#d3bea1'; x.font = '500 20px system-ui'; x.fillText(mask.people + ' · ' + mask.place, 24, 98);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding; resources.push(t); return t;
    };
    /* Les photos des masques et des instruments partagent le même relief photo et le même cadre mural. */
    const addFramedPhoto = (item, options) => {
      const id = item.id, width = options.width || (item.kind === 'instrument' ? 2.65 : 2.5), height = 3.3;
      const holder = new THREE.Group();
      holder.position.set(options.x, 3.62, options.z); holder.rotation.y = options.rotationY || 0; holder.userData.exhibitId = id; room.add(holder); pickables.push(holder);
      exhibitViews.set(id, options.view);
      const panelGeo = new THREE.BoxGeometry(width, height, .18), panel = new THREE.Mesh(panelGeo, material(0x392a1f)); holder.add(panel); resources.push(panelGeo);
      const frameMat = material(0x9c7141, .58, .08); frameMaterials.set(id, frameMat);
      const frontZ = .13, rail = .1;
      [[width + .12, rail, 0, height / 2], [width + .12, rail, 0, -height / 2]].forEach(([w,h,x,y]) => { const g = new THREE.BoxGeometry(w,h,.13), o = new THREE.Mesh(g,frameMat); o.position.set(x,y,frontZ); holder.add(o); resources.push(g); });
      [[-width / 2,0],[width / 2,0]].forEach(([x,y]) => { const g = new THREE.BoxGeometry(rail,height + .1,.13), o = new THREE.Mesh(g,frameMat); o.position.set(x,y,frontZ); holder.add(o); resources.push(g); });
      const boardGeo = new THREE.PlaneGeometry(width - .08, .62), boardMat = new THREE.MeshBasicMaterial({ map: labelTexture(item) }), board = new THREE.Mesh(boardGeo, boardMat);
      board.position.set(0, -height / 2 - .42, frontZ); holder.add(board); resources.push(boardGeo, boardMat);
      if (!item.image) { console.error('Photo manquante pour la vitrine « '+id+' ».'); return; }
      new THREE.TextureLoader().load(item.image, image => {
        if (closed) { image.dispose(); return; }
        try {
          /* Photo directe et relief de profondeur par luminosité, identiques aux vitrines de masques. */
          image.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          const source = image.image, aspect = (source.naturalWidth || source.width) / (source.naturalHeight || source.height);
          const photoHeight = Math.min(2.3, height - .82, (width - .3) / aspect), photoWidth = photoHeight * aspect;
          const geo = new THREE.PlaneGeometry(photoWidth, photoHeight, 72, 96), pos = geo.attributes.position;
          try {
            const sample = document.createElement('canvas'); sample.width = 256; sample.height = 256;
            const ctx = sample.getContext('2d', { willReadFrequently: true }); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.filter = 'blur(.8px)'; ctx.drawImage(source, 0, 0, sample.width, sample.height); ctx.filter = 'none';
            const data = ctx.getImageData(0, 0, 256, 256).data;
            for (let n = 0; n < pos.count; n++) { const u = geo.attributes.uv.getX(n), v = geo.attributes.uv.getY(n), px = Math.min(255, Math.floor(u * 256)), py = Math.min(255, Math.floor((1 - v) * 256)), j = (py * 256 + px) * 4, lum = (data[j] * .2126 + data[j + 1] * .7152 + data[j + 2] * .0722) / 255; pos.setZ(n, Math.max(0, .56 - lum) * .085); }
          } catch (err) { /* L'image garde un rendu photo si le navigateur interdit la lecture des pixels. */ }
          geo.computeVertexNormals();
          const frontMat = new THREE.MeshBasicMaterial({ map: image, side: THREE.DoubleSide }), front = new THREE.Mesh(geo, frontMat), backGeo = geo.clone(), backMat = material(0x60402b, .9), back = new THREE.Mesh(backGeo, backMat);
          front.position.set(0, .04, .23); back.position.set(0, .04, .18); back.rotation.y = Math.PI; holder.add(front, back);
          models.set(id, { dispose() { geo.dispose(); backGeo.dispose(); frontMat.dispose(); image.dispose(); } });
        } catch (err) { console.error('Impossible de créer le relief photo de « '+id+' ».', err); image.dispose(); }
      }, undefined, err => { console.error('Photo de la vitrine non chargée : '+item.image, err); });
    };
    /* Six masques sur le mur du fond ; les instruments occupent le mur latéral, tous avec de vraies photos. */
    collection.filter(item => item.kind !== 'instrument').slice(0, 6).forEach((mask, i) => {
      const x = positions[i] === undefined ? 0 : positions[i];
      addFramedPhoto(mask, { x, z: -7.31, rotationY: 0, view: { x: 3.2, y: 3.15, z: -2.25, theta: 0, radius: 14.1 } });
    });
    const instrumentZ = [-4.8, 0, 4.8];
    collection.filter(item => item.kind === 'instrument').forEach((item, i) => {
      const z = instrumentZ[i] === undefined ? -4.8 + i * 3.2 : instrumentZ[i];
      addFramedPhoto(item, { x: 9.02, z, rotationY: -Math.PI / 2, view: { x: 8.55, y: 3.62, z, theta: -Math.PI / 2, radius: 11.8 } });
    });
    const updateCamera = () => { camera.position.set(target.x + orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta), target.y + orbit.radius * Math.cos(orbit.phi), target.z + orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta)); camera.lookAt(target); };
    const resize = () => { if (closed) return; const r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return; renderer.setSize(Math.round(r.width), Math.round(r.height), false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); };
    const select = (id, source) => { const item = collection.find(m => m.id === id); if (!item) return; selectedId = id; const view = exhibitViews.get(id); if (view) { target.set(view.x, view.y, view.z); orbit.theta = view.theta; orbit.radius = view.radius; updateCamera(); } frameMaterials.forEach((mat,key)=>{const active=key===id;mat.color.setHex(active?0xf2bd5c:0x9c7141);mat.emissive.setHex(active?0x8a4810:0x000000);mat.emissiveIntensity=active ? .5 : 0}); if(onSelect)onSelect(item, source); };
    const selectAt = (clientX, clientY) => { const r = canvas.getBoundingClientRect(); mouse.set((clientX - r.left) / r.width * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1); raycaster.setFromCamera(mouse, camera); const hit = raycaster.intersectObjects(pickables, true)[0]; if (!hit) return; let node = hit.object; while (node && !node.userData.exhibitId) node = node.parent; if (node) select(node.userData.exhibitId, 'canvas'); };
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
