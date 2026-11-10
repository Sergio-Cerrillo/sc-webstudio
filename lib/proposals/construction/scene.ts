import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ART, fitView, smooth } from "./config";
import { createConstructionModel, type ConstructionModel } from "./model";

export type ConstructionEngine = {
  dispose: () => void;
  skip: (target: HTMLElement) => void;
};
type Options = {
  section: HTMLElement;
  stage: HTMLElement;
  mount: HTMLElement;
  onProgress: (p: number) => void;
  onLost: () => void;
  modelFactory?: () => ConstructionModel;
};

export function mountConstruction({
  section,
  stage,
  mount,
  onProgress,
  onLost,
  modelFactory = createConstructionModel,
}: Options): ConstructionEngine {
  gsap.registerPlugin(ScrollTrigger);
  const mobile = stage.clientWidth < 761;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: mobile ? "low-power" : "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.4 : 1.65));
  renderer.setClearColor(ART.background, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled=true;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.className = "moya-architecture-canvas";
  mount.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(ART.background, 55, 110);
  const camera = new THREE.OrthographicCamera(-25, 25, 20, -20, 0.1, 160);
  // This transform is never animated. Resize changes only the projection.
  camera.position.set(27, 22, 30);
  camera.lookAt(0, 2, 0);
  camera.updateMatrixWorld();
  const model = modelFactory();
  if (mobile)
    model.root.traverse((object) => {
      if (
        object instanceof THREE.Mesh &&
        Math.min(...object.scale.toArray()) < 0.12
      )
        object.castShadow = false;
    });
  scene.add(model.root);
  const hemisphere = new THREE.HemisphereLight("#c6e2f4", "#252b23", .72);
  scene.add(hemisphere);
  const key = new THREE.DirectionalLight("#ffdfb0", 3.6);
  key.position.set(-12, 21, 14);
  key.castShadow = true;
  key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(key.shadow.camera, {
    left: -23,
    right: 23,
    top: 25,
    bottom: -20,
    near: 1,
    far: 65,
  });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.035;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight("#8cc9ec", 3.4);
  rim.position.set(6, 12, -17);
  scene.add(rim);
  const fill = new THREE.DirectionalLight("#c4dcea", 1.2);
  fill.position.set(12, 7, 13);
  scene.add(fill);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.8;
  room.dispose();
  pmrem.dispose();
  const floorGeometry = new THREE.PlaneGeometry(200, 200),
    floorMaterial = new THREE.ShadowMaterial({color:"#000000",opacity:.42,depthWrite:false});
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.8;
  floor.receiveShadow = true;
  scene.add(floor);

  // A sparse field of points follows the drawing path, not an independent clock.
  const particlePositions = new Float32Array((mobile ? 22 : 40) * 3);
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3),
  );
  const particleMaterial = new THREE.PointsMaterial({
    color: "#cce6d3",
    size: mobile ? 0.085 : 0.07,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  const drawingClip=new THREE.Plane(new THREE.Vector3(0,-1,0),0);
  (model.skeleton.material as THREE.LineBasicMaterial).clippingPlanes=[drawingClip];
  let disposed = false,
    contextLost = false,
    raf = 0,
    visible = true,
    width = 0,
    height = 0;
  const state = { progress: 0 };
  const viewCorners: THREE.Vector3[] = [];
  for (const x of [-14.5, 14.5])
    for (const y of [-0.7, 9.2])
      for (const z of [-10.5, 10.5])
        viewCorners.push(
          new THREE.Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse),
        );
  const bounds = {
    minX: Math.min(...viewCorners.map((v) => v.x)),
    maxX: Math.max(...viewCorners.map((v) => v.x)),
    minY: Math.min(...viewCorners.map((v) => v.y)),
    maxY: Math.max(...viewCorners.map((v) => v.y)),
  };
  const size = () => {
    const w = stage.clientWidth,
      h = stage.clientHeight;
    if (w === width && h === height) return;
    width = w;
    height = h;
    renderer.setPixelRatio(
      Math.min(
        devicePixelRatio || 1,
        w < 761 ? 1.4 : 1.65,
        Math.sqrt(2_600_000 / Math.max(1, w * h)),
      ),
    );
    renderer.setSize(w, h, false);
    Object.assign(camera, fitView(w, h, bounds));
    camera.updateProjectionMatrix();
  };
  const render = () => {
    raf = 0;
    if (disposed || contextLost || document.hidden || !visible) return;
    size();
    const p = state.progress;
    for (const part of model.parts) part.object.visible = p > part.at + 0.00001;
    const skeletonMaterial=model.skeleton.material as THREE.LineBasicMaterial;
    skeletonMaterial.opacity=smooth(.008,.08,p)*(1-smooth(.49,.78,p))*.28;
    drawingClip.constant=.35+8.1*smooth(.01,.43,p);
    const lineMaterial = model.blueprint.material as THREE.LineBasicMaterial;
    lineMaterial.opacity =
      (0.45 + 0.4 * smooth(0, 0.1, p)) * (1 - smooth(0.33, 0.64, p));
    model.blueprint.geometry.setDrawRange(
      0,
      Math.max(
        12,
        Math.floor(
          ((0.35 + 0.65 * smooth(0, 0.13, p)) *
            model.blueprint.geometry.getAttribute("position").count) /
            2,
        ) * 2,
      ),
    );
    const excavation = smooth(0.075, 0.16, p);
    model.excavation.scale.x = 20 * excavation + 0.001;
    model.excavation.scale.z = 11.5 * excavation + 0.001;
    // Mesh's y scale remains its actual thickness; x/z are dimensions here.
    const sunset = smooth(0.84, 0.98, p);
    key.color.set("#ffdfb0").lerp(new THREE.Color("#ffb97b"), sunset);
    key.intensity = 3.6 - sunset * 0.6;
    rim.intensity = 3.4 - sunset * .65;
    model.warmMaterials.forEach((mat, i) => {
      mat.emissiveIntensity = (i ? 0.12 : 0.03) + sunset * (i ? 1.1 : 0.22);
    });
    particleMaterial.opacity = (1 - smooth(0.28, 0.42, p)) * 0.75;
    for (let i = 0; i < particlePositions.length / 3; i++) {
      const t = (p * 2.8 + i / (particlePositions.length / 3)) % 1;
      const edge = Math.floor(t * 4),
        s = (t * 4) % 1;
      const corners = [
        [-10, -4],
        [10, -4],
        [10, 6],
        [-10, 6],
      ];
      const a = corners[edge],
        b = corners[(edge + 1) % 4];
      particlePositions[i * 3] = a[0] + (b[0] - a[0]) * s;
      particlePositions[i * 3 + 1] = 0.09 + Math.sin(i * 7 + p * 15) ** 2 * 0.3;
      particlePositions[i * 3 + 2] = a[1] + (b[1] - a[1]) * s;
    }
    particleGeometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    stage.dataset.progress = p.toFixed(5);
    stage.dataset.drawCalls = String(renderer.info.render.calls);
    onProgress(p);
  };
  const request = () => {
    if (!disposed && !contextLost && !raf) raf = requestAnimationFrame(render);
  };
  const timeline = gsap.timeline({ paused: true, onUpdate: request });
  timeline.to(state, { progress: 1, duration: 1, ease: "none" }, 0);
  for (const part of model.parts) {
    const final = part.object.position.clone();
    const [dx, dy, dz] = part.offset;
    part.object.position.set(final.x + dx, final.y + dy, final.z + dz);
    part.object.scale.y = 0.0001;
    part.object.scale.x = part.grow ? 1 : 0.0001;
    part.object.scale.z = part.grow ? 1 : 0.0001;
    part.object.rotation.z = part.tilt || 0;
    timeline.to(
      part.object.position,
      {
        x: final.x,
        y: final.y,
        z: final.z,
        duration: part.duration,
        ease: "power2.out",
      },
      part.at,
    );
    timeline.to(
      part.object.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: part.duration,
        ease: part.grow ? "power2.inOut" : "power2.out",
      },
      part.at,
    );
    if (part.tilt)
      timeline.to(
        part.object.rotation,
        { z: 0, duration: part.duration, ease: "power2.out" },
        part.at,
      );
  }
  // Pin spacing belongs to this section; no transformed site wrapper, scroll
  // interception or smooth-scroll plugin. Scrub is the only temporal damping.
  const trigger = ScrollTrigger.create({
    trigger: section,
    pin: stage,
    pinSpacing: true,
    start: "top top",
    end: () =>
      `+=${stage.clientHeight * (stage.clientWidth < 761 ? 3.45 : 4.4)}`,
    animation: timeline,
    scrub: 0.45,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onRefresh: request,
  });
  // Preserve the current construction when the viewport changes (including
  // opening DevTools or rotating a phone). Refit the same fixed camera only.
  let resizeProgress: number | undefined;
  const beginResize = () => {
    if (resizeProgress === undefined && trigger.isActive)
      resizeProgress = state.progress;
  };
  const finishResize = () => {
    if (resizeProgress === undefined) return;
    const p = resizeProgress;
    resizeProgress = undefined;
    trigger.scroll(trigger.start + (trigger.end - trigger.start) * p);
    trigger.getTween()?.progress(1);
    timeline.progress(p);
    request();
  };
  window.addEventListener("resize", beginResize);
  ScrollTrigger.addEventListener("refresh", finishResize);
  const resize = new ResizeObserver(() => {
    size();
    request();
  });
  resize.observe(stage);
  const intersection = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) request();
    },
    { rootMargin: "100% 0px" },
  );
  intersection.observe(section);
  const resume = () => {
    if (!document.hidden) request();
  };
  const lost = (event: Event) => {
    event.preventDefault();
    if (!disposed) {
      contextLost = true;
      cancelAnimationFrame(raf);
      raf = 0;
      const wasActive = trigger.isActive;
      trigger.kill(true);
      if (wasActive)
        section.scrollIntoView({ behavior: "instant", block: "start" });
      onLost();
    }
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", resume);
  // Render once before exposing the canvas. All subsequent frames are demand
  // driven by the scrub tween or a resize, so the GPU rests when scroll stops.
  size();
  timeline.progress(trigger.progress);
  render();
  mount.dataset.ready = "true";
  return {
    skip(target) {
      // Finish any smoothing before native instant navigation so returning to
      // the pinned section always reconstructs the correct reversible state.
      trigger.getTween()?.progress(1);
      target.scrollIntoView({ behavior: "instant", block: "start" });
      ScrollTrigger.update();
      target.focus({ preventScroll: true });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      trigger.kill(true);
      timeline.kill();
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("resize", beginResize);
      ScrollTrigger.removeEventListener("refresh", finishResize);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      model.dispose();
      floorGeometry.dispose();
      floorMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      env.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      mount.removeAttribute("data-ready");
    },
  };
}
