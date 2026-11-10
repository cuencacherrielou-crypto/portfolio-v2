/* =========================================================
   3D Studio — interactive hard-surface lantern (Three.js)
   Recreates the Blender shepherd-hook lantern procedurally.
   If assets/model.glb exists (exported from Blender as glTF
   Binary), that model is loaded instead.
   ========================================================= */
(function () {
  const stage = document.getElementById('modelStage');
  if (!stage || typeof THREE === 'undefined') return;
  try {
    const t = document.createElement('canvas');
    if (!(t.getContext('webgl') || t.getContext('experimental-webgl'))) throw 0;
  } catch (e) {
    stage.innerHTML = '<img src="assets/blender-lamp.jpg" alt="Blender lantern model" style="width:100%;height:100%;object-fit:cover">';
    return;
  }

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Renderer / scene ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(4.6, 3.4, 6.2);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.9, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.enableZoom = false;          // don't hijack page scrolling
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.55;
  controls.autoRotate = !reduceMotion;
  controls.autoRotateSpeed = 1.1;
  let resumeTimer;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    stage.classList.add('touched');
    clearTimeout(resumeTimer);
  });
  controls.addEventListener('end', () => {
    resumeTimer = setTimeout(() => { controls.autoRotate = !reduceMotion; }, 4000);
  });

  // ---------- Lights ----------
  scene.add(new THREE.HemisphereLight(0xcfc4ff, 0x1a1024, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 7, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1; key.shadow.camera.far = 20;
  key.shadow.camera.left = -3; key.shadow.camera.right = 3;
  key.shadow.camera.top = 5; key.shadow.camera.bottom = -2;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9b7bff, 1.2);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  // ---------- Floor (soft glow disc that catches shadows) ----------
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 64),
    new THREE.ShadowMaterial({ opacity: 0.35 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, 'rgba(255,138,61,0.55)');
    r.addColorStop(0.45, 'rgba(124,77,255,0.18)');
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  const floorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6),
    new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false })
  );
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.y = 0.002;
  scene.add(floorGlow);

  // ---------- Procedural lantern ----------
  const model = new THREE.Group();
  scene.add(model);

  const metal = new THREE.MeshStandardMaterial({ color: 0x3a3842, metalness: 0.75, roughness: 0.32 });
  const metalLight = new THREE.MeshStandardMaterial({ color: 0x8a8794, metalness: 0.7, roughness: 0.28 });
  const allMats = [metal, metalLight];

  function shadowed(m) { m.castShadow = true; m.receiveShadow = true; return m; }

  // Base disc + pole
  const base = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.0, 0.1, 64), metalLight));
  base.position.y = 0.05;
  model.add(base);
  const baseCap = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.08, 32), metal));
  baseCap.position.set(0.35, 0.14, 0);
  model.add(baseCap);

  const poleX = 0.35;
  const pole = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 3.5, 24), metalLight));
  pole.position.set(poleX, 1.85, 0);
  model.add(pole);

  // Shepherd's hook
  const hookCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(poleX, 3.55, 0),
    new THREE.Vector3(poleX, 3.85, 0),
    new THREE.Vector3(poleX - 0.08, 4.07, 0),
    new THREE.Vector3(poleX - 0.3, 4.15, 0),
    new THREE.Vector3(poleX - 0.52, 4.05, 0),
    new THREE.Vector3(poleX - 0.6, 3.85, 0),
    new THREE.Vector3(poleX - 0.55, 3.72, 0),
  ]);
  const hook = shadowed(new THREE.Mesh(new THREE.TubeGeometry(hookCurve, 64, 0.042, 16, false), metalLight));
  model.add(hook);
  const hookTip = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), metalLight));
  hookTip.position.copy(hookCurve.getPoint(1));
  model.add(hookTip);

  // Lantern hangs from the hook (swings gently)
  const hangX = poleX - 0.6, hangY = 3.78;
  const swing = new THREE.Group();
  swing.position.set(hangX, hangY, 0);
  model.add(swing);

  const loop = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 8, 24), metal));
  loop.position.y = -0.04;
  swing.add(loop);
  const stem = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), metal));
  stem.position.y = -0.2;
  swing.add(stem);

  const lantern = new THREE.Group();
  lantern.position.y = -0.3;
  swing.add(lantern);

  // Profile (radius, y) from the top finial down to the bottom tip
  const profile = [
    [0.0, 0.0], [0.035, -0.02], [0.05, -0.08], [0.07, -0.16], [0.16, -0.24],
    [0.2, -0.3], [0.17, -0.36], [0.2, -0.42], [0.3, -0.52], [0.38, -0.66],
    [0.41, -0.8], [0.4, -0.95], [0.34, -1.12], [0.24, -1.27], [0.12, -1.38], [0.03, -1.44], [0.0, -1.45],
  ];
  const radiusAt = (y) => {
    for (let i = 0; i < profile.length - 1; i++) {
      const [r1, y1] = profile[i], [r2, y2] = profile[i + 1];
      if (y <= y1 && y >= y2) return r1 + (r2 - r1) * ((y - y1) / (y2 - y1));
    }
    return 0;
  };

  // Solid ribbed top dome (down to y = -0.8)
  const topPts = profile.filter(([, yy]) => yy >= -0.8).map(([r, yy]) => new THREE.Vector2(r, yy));
  const dome = shadowed(new THREE.Mesh(new THREE.LatheGeometry(topPts, 48), metal));
  lantern.add(dome);
  // Horizontal grooves on the dome
  [-0.47, -0.56, -0.64, -0.72].forEach((yy) => {
    const r = radiusAt(yy) + 0.004;
    const g = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 6, 64), metalLight);
    g.rotation.x = Math.PI / 2; g.position.y = yy;
    lantern.add(g);
  });

  // Open cage (lower half): vertical ribs + horizontal rings
  const ribs = 14;
  const cagePts = profile.filter(([, yy]) => yy <= -0.78);
  for (let i = 0; i < ribs; i++) {
    const a = (i / ribs) * Math.PI * 2;
    const pts = cagePts.map(([r, yy]) => new THREE.Vector3(Math.cos(a) * r, yy, Math.sin(a) * r));
    const rib = shadowed(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.011, 6, false), metal));
    lantern.add(rib);
  }
  for (let yy = -0.86; yy > -1.4; yy -= 0.09) {
    const r = radiusAt(yy);
    const ring = shadowed(new THREE.Mesh(new THREE.TorusGeometry(r, 0.01, 6, 64), metal));
    ring.rotation.x = Math.PI / 2; ring.position.y = yy;
    lantern.add(ring);
  }
  const rim1 = shadowed(new THREE.Mesh(new THREE.TorusGeometry(radiusAt(-0.8), 0.022, 8, 64), metalLight));
  rim1.rotation.x = Math.PI / 2; rim1.position.y = -0.8;
  lantern.add(rim1);

  // Glowing bulb + light inside the cage
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffd2a8, emissive: 0xff8a3d, emissiveIntensity: 2.2 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 32), bulbMat);
  bulb.position.y = -1.0;
  lantern.add(bulb);
  const glass = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: 0.12, depthWrite: false })
  );
  glass.position.y = -1.02;
  lantern.add(glass);
  const lampLight = new THREE.PointLight(0xff8a3d, 2.4, 6, 1.6);
  lampLight.position.y = -1.0;
  lantern.add(lampLight);

  // ---------- Floating sparkles ----------
  const sparkCount = 90;
  const sparkGeo = new THREE.BufferGeometry();
  const sp = new Float32Array(sparkCount * 3);
  const seeds = [];
  for (let i = 0; i < sparkCount; i++) {
    const r = 0.8 + Math.random() * 2.2, a = Math.random() * Math.PI * 2;
    sp[i * 3] = Math.cos(a) * r; sp[i * 3 + 1] = Math.random() * 4.5; sp[i * 3 + 2] = Math.sin(a) * r;
    seeds.push(Math.random() * 10);
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
    color: 0xffb27a, size: 0.035, transparent: true, opacity: 0.8, depthWrite: false,
  }));
  scene.add(sparks);

  // ---------- Optional: load a real Blender export (assets/model.glb) ----------
  if (THREE.GLTFLoader && location.protocol !== 'file:') {
    fetch('assets/model.glb', { method: 'HEAD' }).then((res) => {
      if (!res.ok) return;
      new THREE.GLTFLoader().load('assets/model.glb', (gltf) => {
        const obj = gltf.scene;
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        const s = 4.2 / Math.max(size.x, size.y, size.z);
        obj.scale.setScalar(s);
        box.setFromObject(obj);
        const c = box.getCenter(new THREE.Vector3());
        obj.position.sub(new THREE.Vector3(c.x, box.min.y, c.z));
        obj.traverse((m) => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; if (m.material) allMats.push(m.material); } });
        model.clear();
        model.add(obj);
      });
    }).catch(() => {});
  }

  // ---------- Controls: light + wireframe ----------
  let lightOn = true, lightLevel = 1;
  function toggleLight() {
    lightOn = !lightOn;
    const b = document.getElementById('lampToggle');
    if (b) b.firstChild.textContent = lightOn ? 'Toggle light ' : 'Light is off ';
  }
  document.getElementById('lampToggle')?.addEventListener('click', toggleLight);

  const wireBtn = document.getElementById('wireToggle');
  wireBtn?.addEventListener('click', () => {
    const on = !wireBtn.classList.contains('on');
    wireBtn.classList.toggle('on', on);
    wireBtn.textContent = on ? 'Solid view' : 'Wireframe view';
    allMats.forEach((m) => { m.wireframe = on; });
  });

  // Click the lantern itself to toggle its light
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let downAt = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return; // was a drag
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    if (ray.intersectObject(lantern, true).length) toggleLight();
  });

  // ---------- Resize + visibility ----------
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull the camera back on narrow screens so the whole lamp fits
    const dist = w / h < 0.9 ? 9.5 : 7.8;
    const dir = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).addScaledVector(dir, dist);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  let visible = false;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { rootMargin: '100px' }).observe(stage);

  // ---------- Loop ----------
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime();

    lightLevel += ((lightOn ? 1 : 0) - lightLevel) * 0.08;
    const flicker = reduceMotion ? 1 : 0.94 + Math.sin(t * 13) * 0.03 + Math.sin(t * 7.3) * 0.03;
    lampLight.intensity = 2.4 * lightLevel * flicker;
    bulbMat.emissiveIntensity = 0.1 + 2.1 * lightLevel * flicker;
    glass.material.opacity = 0.12 * lightLevel;

    if (!reduceMotion) {
      swing.rotation.z = Math.sin(t * 1.3) * 0.05;
      swing.rotation.x = Math.sin(t * 0.9) * 0.03;
      const pos = sparkGeo.attributes.position;
      for (let i = 0; i < sparkCount; i++) {
        let yy = pos.array[i * 3 + 1] + 0.004 + Math.sin(t + seeds[i]) * 0.001;
        if (yy > 4.8) yy = 0;
        pos.array[i * 3 + 1] = yy;
      }
      pos.needsUpdate = true;
      sparks.material.opacity = 0.35 + 0.45 * lightLevel;
    }

    controls.update();
    renderer.render(scene, camera);
  })();
})();
