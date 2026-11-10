import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ART } from "./config";

type Vec3 = [number, number, number];
export type AssemblyPart = {
  object: THREE.Group;
  at: number;
  duration: number;
  offset: Vec3;
  grow?: boolean;
  tilt?: number;
};
/** A model adapter. A future GLTF adapter can return named assembly groups
 * through the same interface without changing camera, scroll or interface. */
export type ConstructionModel = {
  root: THREE.Group;
  parts: AssemblyPart[];
  blueprint: THREE.LineSegments;
  skeleton: THREE.LineSegments;
  excavation: THREE.Mesh;
  warmMaterials: THREE.MeshStandardMaterial[];
  dispose: () => void;
};

export function createConstructionModel(): ConstructionModel {
  const root = new THREE.Group(),
    parts: AssemblyPart[] = [];
  const geometries = new Set<THREE.BufferGeometry>(),
    materials = new Set<THREE.Material>(),
    textures = new Set<THREE.Texture>();
  const keep = <T extends THREE.BufferGeometry>(g: T) => {
    geometries.add(g);
    return g;
  };
  const cube = keep(new RoundedBoxGeometry(1, 1, 1, 1, .014)),
    sphere = keep(new THREE.IcosahedronGeometry(1, 2)),
    cylinder = keep(new THREE.CylinderGeometry(1, 1, 1, 8)),
    leafGeometry = keep(new THREE.OctahedronGeometry(1,0));
  const material = (color: string, roughness = 0.8, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    materials.add(m);
    return m;
  };
  // Subtle, deterministic concrete grain; no downloaded textures or assets.
  const grain = document.createElement("canvas");
  grain.width = grain.height = 128;
  const gctx = grain.getContext("2d")!,
    pixels = gctx.createImageData(128, 128);
  let seed = 91;
  for (let i = 0; i < pixels.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const v = 211 + (seed % 26);
    pixels.data.set([v, v, v, 255], i);
  }
  gctx.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(grain);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textures.add(texture);
  const surface = (kind:"stone"|"wood") => {
    const canvas=document.createElement("canvas");canvas.width=canvas.height=256;
    const ctx=canvas.getContext("2d")!,image=ctx.createImageData(256,256);
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){
      const i=(y*256+x)*4;
      const n=(Math.sin(x*127.1+y*311.7)*43758.5453)%1;
      const cloud=Math.sin(x*.027+Math.sin(y*.019))*Math.cos(y*.041+x*.011);
      if(kind==="stone"){
        const vein=Math.exp(-Math.abs(Math.sin(y*.051+Math.sin(x*.023)*.7))*34);
        const v=222+cloud*10+n*9-vein*16;
        image.data.set([v,v-6,v-17,255],i);
      }else{
        const grain=Math.sin(x*.43+Math.sin(y*.023)*1.8+Math.sin(x*.069)*2.8);
        const pore=Math.sin(x*2.9+y*.019)>.93?-19:0;
        const v=131+grain*15+n*9+pore;
        image.data.set([v+24,v-4,v-28,255],i);
      }
    }
    ctx.putImageData(image,0,0);
    const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;
    map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;textures.add(map);return map;
  };
  const stoneMap=surface("stone"),woodMap=surface("wood");
  const concrete = material(ART.concrete, 0.94),
    limestone = material(ART.limestone, 0.86),
    steel = material(ART.metal, 0.36, 0.7),
    bronze = material(ART.bronze, 0.35, 0.65),
    site = material("#172327", 0.97),
    soil = material("#080e11", 1),
    gravel = material("#1c292a", 0.95),
    leaf = material(ART.foliage, 0.95),
    leafLight = material("#4c6049", 0.95),
    bark = material("#605344", 1);
  concrete.map = texture;
  concrete.bumpMap=texture;concrete.bumpScale=.045;
  limestone.map=stoneMap;limestone.bumpMap=stoneMap;limestone.bumpScale=.055;
  limestone.roughness=.74;
  const wood=material("#d5bd96",.58);wood.map=woodMap;wood.bumpMap=woodMap;wood.bumpScale=.025;
  // World-space stone mapping keeps courses/slabs from stretching the grain.
  limestone.onBeforeCompile=shader=>{
    shader.vertexShader="varying vec3 vStoneWorld; varying vec3 vStoneNormal;\n"+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace("#include <worldpos_vertex>","#include <worldpos_vertex>\nvStoneWorld=(modelMatrix*vec4(transformed,1.0)).xyz;vStoneNormal=normalize(mat3(modelMatrix)*objectNormal);");
    shader.fragmentShader="varying vec3 vStoneWorld; varying vec3 vStoneNormal;\n"+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace("#include <map_fragment>",`#ifdef USE_MAP
      vec3 sw=pow(abs(vStoneNormal),vec3(4.0));sw/=max(dot(sw,vec3(1.0)),0.0001);
      vec3 sp=vStoneWorld*.58;
      diffuseColor *= texture2D(map,sp.yz)*sw.x+texture2D(map,sp.xz)*sw.y+texture2D(map,sp.xy)*sw.z;
      #endif`);
  };
  limestone.customProgramCacheKey=()=>"moya-limestone-world-v1";
  leaf.side=THREE.DoubleSide;leafLight.side=THREE.DoubleSide;
  const glass = new THREE.MeshPhysicalMaterial({
    color: ART.glass,
    metalness: 0.18,
    roughness: 0.09,
    transparent: true,
    opacity: 0.48,
    envMapIntensity: 1.8,
    clearcoat: 1,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  materials.add(glass);
  const interior = material("#71674e", 0.85);
  interior.emissive = new THREE.Color(ART.warm);
  interior.emissiveIntensity = 0.03;
  const strip = material("#ebc795", 0.4);
  strip.emissive = new THREE.Color(ART.warm);
  strip.emissiveIntensity = 0.12;
  const part = (
    name: string,
    at: number,
    duration: number,
    offset: Vec3 = [0, -2, 0],
    grow = false,
    tilt = 0,
  ) => {
    const object = new THREE.Group();
    object.name = name;
    root.add(object);
    parts.push({ object, at, duration, offset, grow, tilt });
    return object;
  };
  const box = (
    parent: THREE.Object3D,
    position: Vec3,
    size: Vec3,
    mat: THREE.Material,
    shadow = true,
  ) => {
    const mesh = new THREE.Mesh(cube, mat);
    mesh.position.set(...position);
    mesh.scale.set(...size);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const beam = (
    parent: THREE.Object3D,
    a: Vec3,
    b: Vec3,
    r: number,
    mat: THREE.Material,
  ) => {
    const start = new THREE.Vector3(...a),
      end = new THREE.Vector3(...b),
      d = end.clone().sub(start);
    const m = new THREE.Mesh(cylinder, mat);
    m.position.copy(start.add(end).multiplyScalar(0.5));
    m.scale.set(r, d.length(), r);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    m.castShadow = true;
    parent.add(m);
  };
  // Site plinth: a quiet architectural object, floating just above the ground.
  box(root, [0, -0.46, 0], [28, 0.65, 21], site);
  box(root, [0, -0.1, 0], [27.7, 0.09, 20.7], gravel);
  box(root, [0, -0.38, 0], [28.08, 0.035, 21.08], bronze, false);
  // Excavation opens inside the site before the footing grid fills it.
  const excavation = box(root, [0, 0.005, 0.2], [20, 0.035, 11.5], soil, false);
  excavation.scale.x = 0.001;
  excavation.scale.z = 0.001;

  // Precise luminous linework, one drawing range driven by the clock.
  const linePoints: number[] = [];
  const line = (a: Vec3, b: Vec3) => linePoints.push(...a, ...b);
  for (const z of [-4, 0, 4.2]) line([-10, 0.03, z], [10, 0.03, z]);
  for (const x of [-10, -5, 0, 5, 10]) line([x, 0.03, -4], [x, 0.03, 6]);
  const corners: Vec3[] = [
    [-10, 0.03, -4],
    [10, 0.03, -4],
    [10, 0.03, 6],
    [-10, 0.03, 6],
  ];
  corners.forEach((v, i) => line(v, corners[(i + 1) % 4]));
  for (const x of [-10, 10])
    for (const z of [-4, 6]) {
      line([x - 0.4, 0.035, z], [x + 0.4, 0.035, z]);
      line([x, 0.035, z - 0.4], [x, 0.035, z + 0.4]);
    }
  // Dashed dimension lines outside the construction footprint.
  for (let x = -10; x < 10; x += 0.55)
    line([x, 0.035, 7.4], [x + 0.28, 0.035, 7.4]);
  const lineGeometry = keep(new THREE.BufferGeometry());
  lineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePoints, 3),
  );
  const blueprintMaterial = new THREE.LineBasicMaterial({
    color: ART.blueprint,
    transparent: true,
    opacity: 0.7,
  });
  materials.add(blueprintMaterial);
  const blueprint = new THREE.LineSegments(lineGeometry, blueprintMaterial);
  root.add(blueprint);

  // Footings, reinforced grid, ground floor. Every group is an assembly part.
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 5; col++) {
      const x = -8.5 + col * 4.1,
        z = -3.2 + row * 4;
      const p = part(
        `footing-${row}-${col}`,
        0.1 + (row * 5 + col) * 0.003,
        0.105,
        [0, -0.8, 0],
        true,
      );
      box(p, [x, 0.16, z], [1.3, 0.45, 1.3], concrete);
    }
  for (let i = 0; i < 4; i++) {
    const p = part(
      `foundation-${i}`,
      0.16 + i * 0.012,
      0.11,
      [0, -1.1, 0],
      true,
    );
    box(p, [-7.2 + i * 4.8, 0.35, 0.6], [4.75, 0.35, 10], concrete);
  }

  // Two levels with a cantilevered upper gallery and a lower garden wing.
  for (let level = 0; level < 2; level++) {
    const bottom = 0.55 + level * 3.65,
      at = level === 0 ? 0.28 : 0.43;
    for (let j = 0; j < 2; j++)
      for (let i = 0; i < 3; i++) {
        const x = -8.5 + i * 5.4,
          z = -3.3 + j * 6.6,
          index = j * 3 + i;
        const p = part(
          `column-${level}-${index}`,
          at + index * 0.009,
          0.13,
          [0, 0, 0],
          true,
        );
        // Scaling around the footing makes columns grow upward, not through it.
        p.position.set(x, bottom, z);
        box(
          p,
          [0, 1.72, 0],
          [0.36, 3.44, 0.36],
          level === 0 ? concrete : steel,
        );
      }
    for (let j = 0; j < 2; j++) {
      const p = part(
        `beam-${level}-${j}`,
        at + 0.085 + j * 0.018,
        0.13,
        [j ? 4 : -4, 1.2, 0],
        false,
        j ? 0.025 : -0.025,
      );
      box(p, [-3.1, bottom + 3.45, -3.3 + j * 6.6], [11.3, 0.3, 0.3], steel);
    }
    for (let i = 0; i < 3; i++) {
      const p = part(`cross-beam-${level}-${i}`, at + 0.12 + i * 0.012, 0.11, [
        0,
        1.8,
        i % 2 ? 3 : -3,
      ]);
      box(p, [-8.5 + i * 5.4, bottom + 3.45, 0], [0.28, 0.27, 7], steel);
    }
    const slab = part(
      `slab-${level}`,
      level === 0 ? 0.43 : 0.6,
      0.12,
      [0, 2.8, 0],
    );
    box(slab, [-3.25, 4.15 + level * 3.65, 0], [13.4, 0.3, 8.3], limestone);
    box(slab, [-3.25, 4.32 + level * 3.65, 0], [12.9, 0.06, 7.85], gravel);
    box(
      slab,
      [-3.25, 4.0 + level * 3.65, 4.07],
      [13.15, 0.035, 0.045],
      strip,
      false,
    );
  }
  // Single-height wing; entry recess and a sheltered roof terrace.
  for (let i = 0; i < 4; i++) {
    const p = part(`wing-pier-${i}`, 0.32 + i * 0.015, 0.13, [0, 0, 0], true);
    p.position.set(3.4 + (i % 2) * 6, 0.55, -3.2 + Math.floor(i / 2) * 8.4);
    box(p, [0, 1.72, 0], [0.38, 3.44, 0.38], concrete);
  }
  const wingRoof = part("garden-wing-roof", 0.53, 0.12, [0, 3, 0]);
  box(wingRoof, [6.4, 4.15, 1], [7.5, 0.35, 9.4], limestone);
  box(wingRoof, [6.4, 4.36, 1], [7.08, 0.06, 8.95], gravel);
  box(wingRoof, [6.4, 3.95, 5.63], [7.2, 0.04, 0.04], strip, false);

  // Architectural envelope: deep stone reveals, not a stack of closed cubes.
  const back = part("upper-stone-volume", 0.64, 0.14, [0, 0, -4]);
  box(back, [-3.3, 6.03, -3.94], [13.15, 3.2, 0.23], limestone);
  box(back, [-9.85, 6.03, 0], [0.25, 3.2, 8.1], limestone);
  const lowerBack = part("ground-floor-core", 0.6, 0.15, [0, -2.5, 0]);
  box(lowerBack, [-3.7, 2.24, -3.35], [10.9, 3.1, 0.3], concrete);
  // Stone garden wing divided around an oversize inset doorway.
  for (let i = 0; i < 3; i++) {
    const p = part(`stone-panel-${i}`, 0.65 + i * 0.027, 0.14, [
      4 + i * 0.4,
      0,
      0,
    ]);
    box(p, [4.1 + i * 2.1, 2.25, 5.4], [2.05, 3.15, 0.28], limestone);
    // Fine horizontal joint and a bronze base profile.
    box(p, [4.1 + i * 2.1, 1.8, 5.55], [2, 0.012, 0.012], bronze, false);
  }
  const side = part("wing-side-reveals", 0.69, 0.14, [4, 0, 0]);
  box(side, [9.65, 2.24, -2.4], [0.28, 3.1, 1.55], limestone);
  box(side, [9.65, 2.24, 4.6], [0.28, 3.1, 1.55], limestone);
  box(side, [9.65, 3.56, 1.1], [0.28, 0.46, 5.6], limestone);
  box(side, [9.65, 0.95, 1.1], [0.28, 0.7, 5.6], limestone);

  // Glazing, mullions and visible warm interiors. No expensive transmission pass.
  for (let level = 0; level < 2; level++)
    for (let i = 0; i < 6; i++) {
      const at = 0.7 + level * 0.035 + i * 0.008,
        x = -8.3 + i * 2.12,
        y = 2.28 + level * 3.65,
        z = level ? 3.98 : 3.48;
      const p = part(`glazing-${level}-${i}`, at, 0.115, [0, 0.6, 2.5]);
      box(p, [x, y, z], [2.04, 3.03, 0.055], glass, false);
      box(p, [x - 1.04, y, z + 0.04], [0.055, 3.12, 0.09], bronze);
      box(p, [x, y + 1.54, z + 0.04], [2.1, 0.055, 0.09], bronze);
      box(p, [x, y - 1.54, z + 0.04], [2.1, 0.055, 0.09], bronze);
      const room = part(
        `interior-${level}-${i}`,
        at - 0.03,
        0.12,
        [0, 0, 0],
        true,
      );
      box(room, [x, y - 0.13, z - 1.5], [1.9, 2.7, 0.06], interior, false);
      if (i % 2 === 0) {
        box(room, [x, y - 1.28, z - 0.85], [1.35, 0.38, 0.8], site);
        box(room, [x, y - 0.95, z - 0.95], [0.65, 0.08, 0.55], limestone);
      }
    }
  for (let i = 0; i < 3; i++) {
    const p = part(`side-glass-${i}`, 0.77 + i * 0.012, 0.1, [3, 0, 0]);
    box(p, [9.68, 2.4, -0.8 + i * 1.6], [0.055, 1.96, 1.54], glass, false);
    box(p, [9.74, 2.4, -1.59 + i * 1.6], [0.07, 2.02, 0.045], bronze);
  }
  for (let i = 0; i < 4; i++) {
    const p = part(
      `upper-return-glazing-${i}`,
      0.76 + i * 0.012,
      0.1,
      [2.4, 0.5, 0],
    );
    box(p, [3.32, 6.0, -2.85 + i * 1.94], [0.055, 3.06, 1.87], glass, false);
    box(p, [3.37, 6.0, -3.8 + i * 1.94], [0.07, 3.13, 0.055], bronze);
  }

  // Vertical oak/bronze fins give the upper gallery a recognisable rhythm.
  for (let i = 0; i < 13; i++) {
    const p = part(`gallery-fin-${i}`, 0.75 + i * 0.004, 0.09, [-1.8, 0.8, 1]);
    box(p, [-9.25 + i * 0.255, 6.0, 4.22], [0.085, 3.22, 0.43], wood);
  }
  const terrace = part("gallery-balustrade", 0.82, 0.1, [0, 1.5, 0]);
  box(terrace, [-3.2, 4.27, 4.6], [12.9, 0.15, 1.15], limestone);
  box(terrace, [-3.2, 4.95, 5.13], [12.8, 1.1, 0.045], glass, false);
  box(terrace, [-3.2, 5.52, 5.13], [12.9, 0.045, 0.055], bronze);
  for (let i = 0; i < 7; i++)
    box(terrace, [-9.6 + i * 2.13, 4.95, 5.15], [0.035, 1.1, 0.035], bronze);
  for (let i = 0; i < 11; i++) {
    const p = part(`pergola-${i}`, 0.79 + i * 0.006, 0.1, [0, 1.8, -1]);
    box(p, [4.1 + i * 0.43, 6.48, 0.5], [0.11, 0.16, 5], wood);
  }
  const pergolaPosts = part("pergola-support", 0.77, 0.1, [0, 0, 0], true);
  for (const x of [4.1, 8.4])
    for (const z of [-2, 3])
      box(pergolaPosts, [x, 5.42, z], [0.09, 2.1, 0.09], bronze);
  const stairs = part("arrival-stair", 0.83, 0.1, [0, -0.6, 2]);
  for (let i = 0; i < 4; i++)
    box(
      stairs,
      [1.4, 0.08 + i * 0.105, 7.3 - i * 0.55],
      [5.4, 0.15 + i * 0.09, 0.6],
      limestone,
    );
  for (let i = 0; i < 4; i++) {
    const p = part(`path-${i}`, 0.86 + i * 0.012, 0.09, [0, -0.4, 1]);
    box(p, [1.4, 0.015, 8 + i * 0.62], [5.3, 0.09, 0.5], concrete);
  }

  const tree = (x: number, z: number, size: number, index: number, y = 0) => {
    const p = part(
      `olive-${index}`,
      0.855 + index * 0.008,
      0.095,
      [0, -0.7, 0],
      true,
    );
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.scale.setScalar(size);
    p.add(group);
    box(group, [0, 0.14, 0], [1.8, 0.3, 1.8], site);
    box(group, [0, 0.32, 0], [1.6, 0.06, 1.6], soil);
    beam(group, [0, 0.3, 0], [0.1, 2.7, 0], 0.095, bark);
    const count=typeof matchMedia!=="undefined"&&matchMedia("(max-width:760px)").matches?280:560;
    const leaves=new THREE.InstancedMesh(leafGeometry,leafLight,count);
    const dummy=new THREE.Object3D(),color=new THREE.Color();
    for (let j = 0; j < 5; j++) {
      const angle = j * 2.4,
        px = Math.cos(angle) * 0.56,
        pz = Math.sin(angle) * 0.45,
        py = 2.45 + (j % 3) * 0.25;
      beam(group, [0.05, 1.9, 0], [px, py, pz], 0.045, bark);
    }
    for(let i=0;i<count;i++){
      const a=i*2.39996,r=Math.sqrt((i*.618034)%1),v=Math.sin(i*7.13);
      const lobe=i%5,angle=lobe*2.4;
      dummy.position.set(Math.cos(angle)*.56+Math.cos(a)*r*.75,2.8+(lobe%3)*.25+v*.63,Math.sin(angle)*.45+Math.sin(a)*r*.68);
      dummy.rotation.set(i*1.73,i*.71,i*2.41);dummy.scale.set(.05,.15+(i%5)*.012,.016);
      dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);
      color.set(lobe%2?"#78856b":"#485d46").multiplyScalar(.7+(i%7)*.065);leaves.setColorAt(i,color);
    }
    leaves.castShadow=true;group.add(leaves);
  };
  tree(-11, 5.7, 1, 0);
  tree(11, 6.7, 1.1, 1);
  tree(-10.8, -6.3, 0.95, 2);
  tree(8.2, -6.8, 1, 3);
  tree(7, 1.1, 0.52, 4, 4.4);
  for (let i = 0; i < 15; i++) {
    const p = part(
      `planting-${i}`,
      0.87 + (i % 5) * 0.009,
      0.08,
      [0, -0.25, 0],
      true,
    );
    const x = i < 8 ? -7.5 + i * 0.8 : 5.5 + (i - 8) * 0.7,
      z = i < 8 ? 7.1 : 8;
    const m = new THREE.Mesh(sphere, i % 2 ? leaf : leafLight);
    m.position.set(x, 0.22, z);
    m.scale.set(0.45, 0.3, 0.4);
    m.castShadow = true;
    p.add(m);
  }
  const bollards = part("garden-lighting", 0.91, 0.06, [0, 0, 0], true);
  for (const x of [-2, 4.9])
    for (const z of [8, 9.5]) {
      box(bollards, [x, 0.34, z], [0.14, 0.65, 0.14], steel);
      box(bollards, [x, 0.55, z + 0.075], [0.1, 0.12, 0.012], strip, false);
    }

  // Give every assembly group a local footing/pivot. Scaling a group around
  // the scene origin would make off-centre beams drift across the site.
  root.updateMatrixWorld(true);
  for (const p of parts) {
    const bounds = new THREE.Box3().setFromObject(p.object),
      pivot = bounds.getCenter(new THREE.Vector3());
    pivot.y = bounds.min.y;
    const delta = pivot.clone().sub(p.object.position);
    p.object.position.copy(pivot);
    p.object.children.forEach((child) => child.position.sub(delta));
  }
  root.updateMatrixWorld(true);
  const outlineBox=new THREE.BoxGeometry(1,1,1);
  const edges=new THREE.EdgesGeometry(outlineBox),wire:number[]=[];
  outlineBox.dispose();
  const point=new THREE.Vector3();
  for(const p of parts){
    if(!/(column|beam|slab|stone-panel|upper-stone-volume|glazing)/.test(p.object.name))continue;
    p.object.traverse(object=>{
      if(!(object instanceof THREE.Mesh)||object.geometry!==cube||Math.min(...object.scale.toArray())<.12)return;
      const positions=edges.getAttribute("position");
      for(let i=0;i<positions.count;i++){point.fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld);wire.push(point.x,point.y,point.z)}
    });
  }
  edges.dispose();
  const wireGeometry=keep(new THREE.BufferGeometry());wireGeometry.setAttribute("position",new THREE.Float32BufferAttribute(wire,3));
  const wireMaterial=new THREE.LineBasicMaterial({color:ART.blueprint,transparent:true,opacity:0,depthWrite:false});materials.add(wireMaterial);
  const skeleton=new THREE.LineSegments(wireGeometry,wireMaterial);root.add(skeleton);
  return {
    root,
    parts,
    blueprint,
    skeleton,
    excavation,
    warmMaterials: [interior, strip],
    dispose() {
      root.traverse(object=>{if(object instanceof THREE.InstancedMesh)object.dispose()});
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
