import * as THREE from 'three';

// Cutaway of a ceiling duct run fed by a mini-central indoor unit.
// Progress p (0..1) is scrubbed by scroll and fully determines the scene, so scrolling back rewinds it.
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (v: number) => { v = clamp(v); return v * v * (3 - 2 * v); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initDuct(canvas: HTMLCanvasElement) {
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch { return null; }
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x0b1b33, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x6fe3d6, 1.2); rim.position.set(-6, 2, -4); scene.add(rim);

  // Duct: bottom, back wall and a partial top; the front is cut away so we can look inside.
  const L = 12, W = 1.8, H = 1.1;
  const grimy = new THREE.Color('#6d6a60'), cleanC = new THREE.Color('#aebccb');
  const steel = new THREE.MeshStandardMaterial({ color: grimy.clone(), metalness: .75, roughness: .45, side: THREE.DoubleSide });
  const edge = new THREE.MeshStandardMaterial({ color: '#d7e0e8', metalness: .9, roughness: .3 });
  const duct = new THREE.Group(); scene.add(duct);
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(L, .04, W), steel); bottom.position.y = -H / 2; duct.add(bottom);
  const back = new THREE.Mesh(new THREE.BoxGeometry(L, H, .04), steel); back.position.z = -W / 2; duct.add(back);
  const top = new THREE.Mesh(new THREE.BoxGeometry(L, .04, W * .55), steel); top.position.set(0, H / 2, -W / 2 + W * .275); duct.add(top);
  for (let x = -L / 2; x <= L / 2 + .01; x += 2) { // flange joints
    const f = new THREE.Mesh(new THREE.BoxGeometry(.06, H + .1, .06), edge); f.position.set(x, 0, -W / 2); duct.add(f);
    const g = new THREE.Mesh(new THREE.BoxGeometry(.06, .06, W + .06), edge); g.position.set(x, -H / 2, 0); duct.add(g);
  }

  // Ceiling slab with the service grille the crew enters through, and the indoor unit at the far end.
  const HZ = -W / 2 + W * .275; // hatch sits on the top panel
  const hatch = new THREE.Group(); hatch.position.set(5.0, H / 2 + .03, HZ); scene.add(hatch);
  const hatchPlate = new THREE.Mesh(new THREE.BoxGeometry(.8, .03, .8), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .6 }));
  hatchPlate.position.x = -.4; hatch.add(hatchPlate);
  for (let i = 0; i < 6; i++) { const sl = new THREE.Mesh(new THREE.BoxGeometry(.72, .05, .03), new THREE.MeshStandardMaterial({ color: '#c3ced8' })); sl.position.set(-.4, .02, -.32 + i * .13); hatch.add(sl); }
  const unit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 2.3), new THREE.MeshStandardMaterial({ color: '#e9eef2', roughness: .5, metalness: .1 }));
  unit.position.set(-L / 2 - .8, .05, 0); scene.add(unit);
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .05, 32), new THREE.MeshStandardMaterial({ color: '#30475f', metalness: .6, roughness: .4 }));
  fan.rotation.z = Math.PI / 2; fan.position.set(-L / 2 + .02, 0, 0); scene.add(fan);

  // Dust: instanced specks on the floor, back wall and underside of the top.
  const N = innerWidth < 760 ? 900 : 1600;
  const dustGeo = new THREE.IcosahedronGeometry(1, 0);
  const dustMat = new THREE.MeshStandardMaterial({ color: '#7d7466', roughness: 1, flatShading: true });
  const dust = new THREE.InstancedMesh(dustGeo, dustMat, N); scene.add(dust);
  const base: THREE.Vector3[] = [], size: number[] = [], tLoose: number[] = [], tOut: number[] = [], jit: THREE.Vector3[] = [], grow: number[] = [];
  const rnd = (() => { let s = 11; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  for (let i = 0; i < N; i++) {
    const r = rnd(), x = -L / 2 + .2 + rnd() * (L - .4);
    let p: THREE.Vector3;
    if (r < .62) p = new THREE.Vector3(x, -H / 2 + .03, -W / 2 + .05 + rnd() * (W - .1));
    else if (r < .9) p = new THREE.Vector3(x, -H / 2 + .05 + rnd() * (H - .1), -W / 2 + .03);
    else p = new THREE.Vector3(x, H / 2 - .03, -W / 2 + .05 + rnd() * W * .5);
    base.push(p); size.push(.006 + rnd() * .016);
    tLoose.push(lerp(.34, .6, (5 - x) / (5 + L / 2)) + rnd() * .02);
    tOut.push(.6 + rnd() * .16);
    jit.push(new THREE.Vector3((rnd() - .5) * .3, .1 + rnd() * .35, (rnd() - .5) * .4));
    grow.push(rnd() * .12);
  }
  const nozzle = new THREE.Vector3(5.0, .2, HZ);

  // Brush: rod + radial bristles; enters from the hatch side (reading start) and travels toward the unit.
  const brush = new THREE.Group(); scene.add(brush);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 10, 12), edge); rod.rotation.z = Math.PI / 2; rod.position.x = 5; brush.add(rod);
  const head = new THREE.Group(); brush.add(head);
  const bristleGeo = new THREE.CylinderGeometry(.008, .008, .5, 4); bristleGeo.translate(0, .25, 0);
  const bristles = new THREE.InstancedMesh(bristleGeo, new THREE.MeshStandardMaterial({ color: '#e3c98d', roughness: .8 }), 220);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sv = new THREE.Vector3(1, 1, 1), pv = new THREE.Vector3();
  for (let i = 0; i < 220; i++) { e.set((i / 220) * Math.PI * 2 * 9, 0, 0); q.setFromEuler(e); pv.set(-.25 + (i / 220) * .5, 0, 0); m.compose(pv, q, sv); bristles.setMatrixAt(i, m); }
  head.add(bristles);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .55, 16), edge); hub.rotation.z = Math.PI / 2; head.add(hub);

  // Extraction hose dropping through the hatch.
  const hose = new THREE.Group(); scene.add(hose);
  const hoseMesh = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, 3, 24), new THREE.MeshStandardMaterial({ color: '#16191d', roughness: .7 }));
  hoseMesh.position.y = 1.5; hose.add(hoseMesh);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(.2, .16, .3, 24), new THREE.MeshStandardMaterial({ color: '#0d0f12', roughness: .5 })); hose.add(tip);
  hose.position.set(5.0, 3.5, HZ);

  // Clean airflow particles.
  const A = 360;
  const airPos = new Float32Array(A * 3); const airSeed: number[] = [];
  for (let i = 0; i < A; i++) { airSeed.push(rnd() * L); airPos[i * 3 + 1] = -H / 2 + .12 + rnd() * (H - .24); airPos[i * 3 + 2] = -W / 2 + .12 + rnd() * (W - .24); }
  const airGeo = new THREE.BufferGeometry(); airGeo.setAttribute('position', new THREE.BufferAttribute(airPos, 3));
  const airMat = new THREE.PointsMaterial({ color: '#7ff0e2', size: .045, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(airGeo, airMat));

  let p = 0, active = true, raf = 0, t0 = performance.now();
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas); resize();
  new IntersectionObserver(([en]) => { active = en.isIntersecting; }).observe(canvas);

  const camA = new THREE.Vector3(6.5, 4.2, 9.6), camB = new THREE.Vector3(2.2, 1.6, 4.6), camC = new THREE.Vector3(-1.5, 1.2, 5.2);
  const lookA = new THREE.Vector3(-.5, -.2, 0), lookB = new THREE.Vector3(1, -.2, -.2), lookC = new THREE.Vector3(-2.5, -.1, -.2);
  const cp = new THREE.Vector3(), lp = new THREE.Vector3(), dv = new THREE.Vector3();

  const frame = (now: number) => {
    const time = (now - t0) / 1000;
    const narrow = camera.aspect < 1;
    // camera path
    const k1 = smooth(p / .45), k2 = smooth((p - .55) / .45);
    cp.copy(camA).lerp(camB, k1).lerp(camC, k2); lp.copy(lookA).lerp(lookB, k1).lerp(lookC, k2);
    if (narrow) {
      cp.set(lerp(8.2, 5.2, k1), lerp(2.6, 1.7, k1), lerp(2.6, 1.9, k1)); lp.set(lerp(-3, -4.5, k1), -.35, -.25);
      if (k2 > 0) { cp.lerp(new THREE.Vector3(2.4, 1.5, 2.6), k2); }
    }
    camera.position.copy(cp); camera.lookAt(lp);

    // walls get cleaner as dust leaves
    steel.color.copy(grimy).lerp(cleanC, smooth((p - .6) / .25));
    // hatch + hose
    const open = smooth((p - .2) / .1) * (1 - smooth((p - .86) / .08));
    hatch.rotation.z = -open * 1.25;
    hose.position.y = lerp(3.5, .3, smooth((p - .24) / .1)) + smooth((p - .82) / .08) * 3.2;
    // brush travel
    const bIn = smooth((p - .26) / .08), bTravel = smooth((p - .34) / .28), bOut = smooth((p - .62) / .14);
    const bx = lerp(lerp(8.5, 5.0, bIn), -L / 2 + .6, bTravel) * (1 - bOut) + 8.5 * bOut;
    head.position.set(bx, -.02, -.1); rod.position.x = bx + 5;
    head.rotation.x = time * 9 + p * 40;
    brush.visible = p > .24 && p < .8;

    // dust
    for (let i = 0; i < N; i++) {
      const b = base[i];
      let s = size[i] * smooth((p - grow[i]) / .1);
      pv.copy(b);
      const loose = smooth((p - tLoose[i]) / .04);
      if (loose > 0) { pv.addScaledVector(jit[i], loose); pv.y += Math.sin(time * 3 + i) * .02 * loose; }
      const out = smooth((p - tOut[i]) / .07);
      if (out > 0) { dv.copy(nozzle).sub(pv); pv.addScaledVector(dv, out); s *= 1 - out; }
      e.set(i, i * .7, 0); q.setFromEuler(e); sv.set(Math.max(s, 1e-4) * 1.6, Math.max(s, 1e-4) * .55, Math.max(s, 1e-4) * 1.3);
      m.compose(pv, q, sv); dust.setMatrixAt(i, m);
    }
    dust.instanceMatrix.needsUpdate = true;

    // airflow
    airMat.opacity = smooth((p - .8) / .1) * .9;
    if (airMat.opacity > 0) {
      for (let i = 0; i < A; i++) airPos[i * 3] = ((airSeed[i] + time * 2.4) % L) - L / 2;
      airGeo.attributes.position.needsUpdate = true;
    }
    fan.rotation.x = time * (p > .8 ? 12 : 2);
    renderer.render(scene, camera);
  };
  const loop = (now: number) => { raf = requestAnimationFrame(loop); if (active) frame(now); };
  raf = requestAnimationFrame(loop);

  return {
    setProgress(v: number) { p = v; },
    renderAt(v: number) { p = v; frame(performance.now()); },
    dispose() { cancelAnimationFrame(raf); renderer.dispose(); },
  };
}
