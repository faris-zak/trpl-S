import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const host = document.getElementById("model-stage");
const loading = document.querySelector("[data-model-loading]");
const datum = document.querySelector("[data-model-datum]");
const viewTitle = document.querySelector("[data-view-title]");
const viewKicker = document.querySelector("[data-view-kicker]");
const viewCopy = document.querySelector("[data-view-copy]");
const viewButtons = [...document.querySelectorAll("[data-model-view]")];
const layerInputs = [...document.querySelectorAll("[data-model-layer]")];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd7d9d7);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;
renderer.domElement.setAttribute("aria-hidden", "true");
host.prepend(renderer.domElement);

const perspectiveCamera = new THREE.PerspectiveCamera(36, 1, 0.1, 160);
perspectiveCamera.position.set(25, 16, 26);
const orthographicCamera = new THREE.OrthographicCamera(-16, 16, 12, -12, 0.1, 160);
let activeCamera = perspectiveCamera;
let orthoSize = 12;

const controls = new OrbitControls(activeCamera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.target.set(0, 3.9, 0);
controls.minDistance = 10;
controls.maxDistance = 70;
controls.maxPolarAngle = Math.PI * 0.49;

scene.add(new THREE.HemisphereLight(0xffffff, 0x6a645b, 2.6));
const sun = new THREE.DirectionalLight(0xffffff, 3.4);
sun.position.set(-16, 25, -12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -30;
sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30;
sun.shadow.camera.bottom = -30;
sun.shadow.camera.far = 80;
sun.shadow.bias = -0.00035;
sun.shadow.normalBias = 0.035;
scene.add(sun);

const materials = {
  concrete: new THREE.MeshStandardMaterial({ color: 0xc9c3b8, roughness: 0.76, metalness: 0.02 }),
  concreteDark: new THREE.MeshStandardMaterial({ color: 0x827c72, roughness: 0.82, metalness: 0.01 }),
  steel: new THREE.MeshStandardMaterial({ color: 0x25282a, roughness: 0.28, metalness: 0.78 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x303335, roughness: 0.38, metalness: 0.64, side: THREE.DoubleSide }),
  timber: new THREE.MeshStandardMaterial({ color: 0x98785a, roughness: 0.74, metalness: 0.01, side: THREE.DoubleSide }),
  stone: new THREE.MeshStandardMaterial({ color: 0xd9d4cb, roughness: 0.92, metalness: 0 }),
  room: new THREE.MeshStandardMaterial({ color: 0xe5e0d7, roughness: 0.82, metalness: 0 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x7f9fa8,
    transparent: true,
    opacity: 0.27,
    roughness: 0.08,
    metalness: 0,
    transmission: 0.48,
    thickness: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
  water: new THREE.MeshPhysicalMaterial({ color: 0x5e8f9b, transparent: true, opacity: 0.56, roughness: 0.12, metalness: 0 }),
};

const root = new THREE.Group();
scene.add(root);

const groups = {
  frame: new THREE.Group(),
  roof: new THREE.Group(),
  glass: new THREE.Group(),
  rooms: new THREE.Group(),
  interior: new THREE.Group(),
};
Object.values(groups).forEach((group) => root.add(group));

const groundRooms = new THREE.Group();
const upperRooms = new THREE.Group();
const floorPlates = new THREE.Group();
groups.rooms.add(floorPlates, groundRooms, upperRooms);

function finishMesh(mesh, { shadows = true } = {}) {
  mesh.castShadow = shadows;
  mesh.receiveShadow = shadows;
  return mesh;
}

function box(width, height, depth, material, x, y, z, parent = root, options = {}) {
  const mesh = finishMesh(new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material), options);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function beamBetween(a, b, thickness, material = materials.concrete, parent = groups.frame, depth = thickness) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const length = start.distanceTo(end);
  const mesh = finishMesh(new THREE.Mesh(new THREE.BoxGeometry(thickness, depth, length), material));
  mesh.position.copy(midpoint);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), end.clone().sub(start).normalize());
  parent.add(mesh);
  return mesh;
}

function glassPanel(width, height, x, y, z, rotationY = 0, parent = groups.glass) {
  const mesh = finishMesh(new THREE.Mesh(new THREE.PlaneGeometry(width, height), materials.glass), { shadows: false });
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotationY;
  parent.add(mesh);
  return mesh;
}

function roofPlate(material, y, thickness = 0.22) {
  const shape = new THREE.Shape();
  shape.moveTo(-10.75, -8.25);
  shape.lineTo(10.75, -8.25);
  shape.lineTo(10.2, 8.25);
  shape.lineTo(-10.2, 8.25);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
  geometry.rotateX(Math.PI / 2);
  const mesh = finishMesh(new THREE.Mesh(geometry, material));
  mesh.receiveShadow = false;
  mesh.position.y = y;
  groups.roof.add(mesh);
  return mesh;
}

function framePanel(x, zStart, zEnd, count) {
  const span = (zEnd - zStart) / (count - 1);
  for (let i = 0; i < count; i += 1) {
    const z = zStart + span * i;
    const roofZ = z * 1.05;
    beamBetween([x, 3.85, z], [x, 7.8, roofZ], 0.11, materials.steel, groups.frame, 0.11);
  }
}

// Ground, terrace and water establish only the immediate architectural datum.
box(34, 0.24, 28, materials.stone, 0, -0.12, 1.1, root);
box(18.4, 0.18, 2.7, materials.timber, 0, 0.05, 7.4, root);
box(10, 0.11, 3, materials.water, 0.8, 0.08, 11.0, root, { shadows: false });

// Occupied floor plates remain legible behind the exoskeleton.
const groundSlab = box(16.5, 0.34, 12.1, materials.concrete, 0, 0.22, 0, floorPlates);
const upperSlab = box(16.1, 0.4, 11.5, materials.concrete, 0, 3.65, -0.05, floorPlates);

// Ground floor: solid west service/studio cores, open east and south family spaces.
box(4.4, 3.05, 4.6, materials.room, -5.9, 1.9, -3.3, groundRooms);
box(4.2, 3.05, 4.0, materials.room, -6.0, 1.9, 2.25, groundRooms);
box(3.0, 3.05, 3.4, materials.room, -1.9, 1.9, 3.0, groundRooms);
box(2.0, 3.05, 3.0, materials.concreteDark, -1.3, 1.9, -3.75, groundRooms);

// Fully occupied upper level: room bars surround only one controlled southeast void.
box(6.1, 2.75, 4.5, materials.room, -4.8, 5.2, -3.0, upperRooms);
box(5.3, 2.75, 4.5, materials.room, 4.7, 5.2, -3.0, upperRooms);
box(7.5, 2.75, 3.7, materials.room, -3.2, 5.2, 3.65, upperRooms);
box(3.7, 2.75, 3.2, materials.room, 2.9, 5.2, 3.8, upperRooms);

// Glass planes follow occupied volumes without pretending to carry load.
glassPanel(11.2, 3.05, 2.25, 1.9, 5.86, 0);
glassPanel(6.8, 3.05, 8.27, 1.9, 1.75, Math.PI / 2);
glassPanel(4.8, 3.05, 8.27, 1.9, -3.35, Math.PI / 2);
glassPanel(7.0, 2.7, 4.45, 5.2, -5.82, 0);
glassPanel(5.4, 2.7, 8.08, 5.2, -2.8, Math.PI / 2);
glassPanel(5.6, 2.7, 1.9, 5.2, 5.82, 0);

// Mullions make the occupied upper edge visible through the frame.
for (let x = -0.8; x <= 7.3; x += 1.35) {
  box(0.07, 2.8, 0.09, materials.steel, x, 5.2, -5.86, groups.glass, { shadows: false });
}
for (let x = -0.8; x <= 7.0; x += 1.35) {
  box(0.07, 3.0, 0.09, materials.steel, x, 1.85, 5.89, groups.glass, { shadows: false });
}

// Floating stair and upper bridge occupy the east structural field.
const stairSteps = 15;
for (let i = 0; i < stairSteps; i += 1) {
  const t = i / (stairSteps - 1);
  box(2.05, 0.16, 0.52, materials.timber, 6.1, 0.55 + t * 3.0, 3.9 - t * 5.0, groups.interior);
}
beamBetween([5.15, 0.42, 4.1], [5.15, 3.62, -1.1], 0.12, materials.steel, groups.interior, 0.12);
beamBetween([7.05, 0.42, 4.1], [7.05, 3.62, -1.1], 0.12, materials.steel, groups.interior, 0.12);
box(2.3, 0.22, 5.7, materials.timber, 5.85, 3.92, 1.55, groups.interior);
for (let z = -1.0; z <= 4.0; z += 0.72) box(0.06, 1.0, 0.06, materials.steel, 4.72, 4.45, z, groups.interior);
beamBetween([4.72, 4.95, -1.0], [4.72, 4.95, 4.0], 0.07, materials.steel, groups.interior, 0.07);

// EAST: preserve the sketch DNA - roof chord, inverted V, hangers and crossing diagonal.
const eastX = 9.05;
beamBetween([eastX, 8.05, -7.65], [eastX, 8.05, 7.65], 0.48, materials.concrete, groups.frame, 0.64);
beamBetween([eastX, 8.0, -7.55], [eastX, 3.0, 0.15], 0.62, materials.concrete, groups.frame, 0.78);
beamBetween([eastX, 3.0, 0.15], [eastX, 8.0, 7.55], 0.62, materials.concrete, groups.frame, 0.78);
beamBetween([eastX + 0.04, 0.25, -6.15], [eastX + 0.04, 8.05, 4.65], 0.68, materials.concrete, groups.frame, 0.82);
beamBetween([eastX, 3.75, -5.65], [eastX, 3.75, 5.65], 0.26, materials.steel, groups.frame, 0.34);
framePanel(eastX, -6.1, 6.1, 11);

// NORTH: the east frame turns the corner and opens around the family entrance.
const northZ = -7.45;
beamBetween([-10.35, 8.08, northZ], [10.35, 8.08, northZ], 0.45, materials.steel, groups.frame, 0.58);
beamBetween([-10.0, 8.0, northZ], [-2.7, 0.25, northZ], 0.58, materials.concrete, groups.frame, 0.74);
beamBetween([10.0, 8.0, northZ], [2.7, 0.25, northZ], 0.58, materials.concrete, groups.frame, 0.74);
beamBetween([-2.7, 0.25, northZ], [2.7, 0.25, northZ], 0.24, materials.steel, groups.frame, 0.32);
beamBetween([-7.6, 3.75, northZ], [7.6, 3.75, northZ], 0.24, materials.steel, groups.frame, 0.32);

// SOUTH: the same system widens to span the terrace and panoramic family edge.
const southZ = 7.45;
beamBetween([-10.0, 8.08, southZ], [10.0, 8.08, southZ], 0.46, materials.steel, groups.frame, 0.6);
beamBetween([-9.8, 8.0, southZ], [-3.8, 0.2, southZ], 0.58, materials.concrete, groups.frame, 0.76);
beamBetween([9.8, 8.0, southZ], [3.8, 0.2, southZ], 0.58, materials.concrete, groups.frame, 0.76);
beamBetween([-7.8, 3.75, southZ], [7.8, 3.75, southZ], 0.24, materials.steel, groups.frame, 0.34);
for (let x = -6.4; x <= 6.4; x += 1.6) beamBetween([x, 3.9, southZ], [x * 1.16, 7.8, southZ], 0.1, materials.steel, groups.frame, 0.1);

// WEST: compressed buttresses preserve identity while protecting service spaces.
const westX = -9.05;
beamBetween([westX, 8.05, -7.55], [westX, 8.05, 7.55], 0.44, materials.steel, groups.frame, 0.58);
beamBetween([westX, 8.0, -7.4], [westX, 0.22, -4.5], 0.55, materials.concrete, groups.frame, 0.72);
beamBetween([westX, 8.0, 7.4], [westX, 0.22, 4.5], 0.55, materials.concrete, groups.frame, 0.72);
beamBetween([westX, 3.75, -5.3], [westX, 3.75, 5.3], 0.22, materials.steel, groups.frame, 0.3);

// Roof field: a dark plate with warm underside, perimeter truss and a triangular rooflight datum.
roofPlate(materials.timber, 7.95, 0.18);
roofPlate(materials.roof, 8.22, 0.28);
beamBetween([-10.55, 8.1, -8.0], [10.55, 8.1, -8.0], 0.3, materials.steel, groups.roof, 0.44);
beamBetween([-10.0, 8.1, 8.0], [10.0, 8.1, 8.0], 0.3, materials.steel, groups.roof, 0.44);
beamBetween([-10.4, 8.1, -8.0], [-10.0, 8.1, 8.0], 0.3, materials.steel, groups.roof, 0.44);
beamBetween([10.4, 8.1, -8.0], [10.0, 8.1, 8.0], 0.3, materials.steel, groups.roof, 0.44);

const rooflightShape = new THREE.Shape();
rooflightShape.moveTo(-2.9, -2.2);
rooflightShape.lineTo(3.0, -2.2);
rooflightShape.lineTo(0.2, 3.0);
rooflightShape.closePath();
const rooflight = finishMesh(new THREE.Mesh(new THREE.ShapeGeometry(rooflightShape), materials.glass), { shadows: false });
rooflight.rotation.x = -Math.PI / 2;
rooflight.position.y = 8.42;
groups.roof.add(rooflight);

// A sparse datum grid supports inspection without turning the model into scenery.
const grid = new THREE.GridHelper(46, 46, 0x6f7475, 0xaab0b0);
grid.position.y = 0.015;
grid.material.opacity = 0.38;
grid.material.transparent = true;
scene.add(grid);

const viewContent = {
  perspective: {
    kicker: "Massing model",
    title: "Continuous exoskeleton",
    copy: "The east megaframe, north arrival portal, south terrace span and west service anchors are one connected load-bearing system beneath the roof field.",
    datum: "Perspective / structural massing",
  },
  east: {
    kicker: "Signature elevation",
    title: "East DNA preserved",
    copy: "The inverted V, crossing diagonal, roof hangers and occupied upper floor remain the dominant composition. Proportions are refined without replacing the original idea.",
    datum: "East / orthographic",
  },
  north: {
    kicker: "Arrival consequence",
    title: "Frame becomes threshold",
    copy: "The roof chord and corner members turn north to form a legible entrance portal. Arrival is created by structure, not by applied facade gestures.",
    datum: "North / orthographic",
  },
  south: {
    kicker: "Family consequence",
    title: "Frame becomes panorama",
    copy: "The same anchors widen around the double-height family edge, terrace and pool, preserving a triangular silhouette without reducing the south side to a glass rectangle.",
    datum: "South / orthographic",
  },
  west: {
    kicker: "Privacy consequence",
    title: "Frame becomes buttress",
    copy: "The structural field compresses around solid service cores. Openings are controlled, but the roof line and inclined corner anchors keep the house unmistakably trpl-S.",
    datum: "West / orthographic",
  },
  "ground-plan": {
    kicker: "Planning consequence",
    title: "Open family edge, solid service edge",
    copy: "Studio, guest and service cores stabilize the west. Living, dining, stair and terrace occupy the free south-east field behind the megaframe.",
    datum: "Ground / model-derived plan",
  },
  "upper-plan": {
    kicker: "Planning consequence",
    title: "An occupied upper floor",
    copy: "Bedroom and family-room bars occupy nearly the full upper plate. Only one controlled void remains above the family living room beside the stair bridge.",
    datum: "Upper / model-derived plan",
  },
  section: {
    kicker: "Sectional consequence",
    title: "Structure remains inside the room",
    copy: "The sectional reveal exposes the bridge, floating stair, upper rooms and roof field as one spatial system. The frame is experienced from inside rather than read as facade decoration.",
    datum: "Section / south half removed",
  },
};

const layerMap = {
  frame: groups.frame,
  roof: groups.roof,
  glass: groups.glass,
  rooms: groups.rooms,
  interior: groups.interior,
};

function setLayer(name, visible) {
  if (layerMap[name]) layerMap[name].visible = visible;
  const input = layerInputs.find((candidate) => candidate.dataset.modelLayer === name);
  if (input) input.checked = visible;
}

function resetPlanLayers() {
  groundRooms.visible = true;
  upperRooms.visible = true;
  groundSlab.visible = true;
  upperSlab.visible = true;
  renderer.clippingPlanes = [];
}

function useCamera(camera) {
  activeCamera = camera;
  controls.object = activeCamera;
}

function setOrtho(position, target = new THREE.Vector3(0, 4, 0), up = new THREE.Vector3(0, 1, 0), size = 12) {
  orthoSize = size;
  useCamera(orthographicCamera);
  orthographicCamera.up.copy(up);
  orthographicCamera.position.copy(position);
  orthographicCamera.lookAt(target);
  orthographicCamera.updateProjectionMatrix();
  controls.target.copy(target);
  controls.enableRotate = false;
  controls.update();
  resize();
}

function setPerspective(position, target = new THREE.Vector3(0, 4, 0)) {
  useCamera(perspectiveCamera);
  perspectiveCamera.up.set(0, 1, 0);
  perspectiveCamera.position.copy(position);
  perspectiveCamera.lookAt(target);
  controls.target.copy(target);
  controls.enableRotate = true;
  controls.update();
}

function setView(name) {
  resetPlanLayers();
  setLayer("frame", true);
  setLayer("roof", true);
  setLayer("glass", true);
  setLayer("rooms", true);
  setLayer("interior", true);

  if (name === "perspective") setPerspective(new THREE.Vector3(25, 16, 26));
  if (name === "east") setOrtho(new THREE.Vector3(34, 4.2, 0), new THREE.Vector3(0, 4.1, 0), new THREE.Vector3(0, 1, 0), 10.6);
  if (name === "west") setOrtho(new THREE.Vector3(-34, 4.2, 0), new THREE.Vector3(0, 4.1, 0), new THREE.Vector3(0, 1, 0), 10.6);
  if (name === "north") setOrtho(new THREE.Vector3(0, 4.2, -36), new THREE.Vector3(0, 4.1, 0), new THREE.Vector3(0, 1, 0), 10.6);
  if (name === "south") setOrtho(new THREE.Vector3(0, 4.2, 36), new THREE.Vector3(0, 4.1, 0), new THREE.Vector3(0, 1, 0), 10.6);
  if (name === "ground-plan") {
    setLayer("roof", false);
    setLayer("frame", false);
    upperRooms.visible = false;
    upperSlab.visible = false;
    setOrtho(new THREE.Vector3(0, 36, 0.01), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1), 14);
  }
  if (name === "upper-plan") {
    setLayer("roof", false);
    setLayer("frame", false);
    groundRooms.visible = false;
    groundSlab.visible = false;
    setOrtho(new THREE.Vector3(0, 36, 0.01), new THREE.Vector3(0, 3.4, 0), new THREE.Vector3(0, 0, -1), 14);
  }
  if (name === "section") {
    setLayer("glass", false);
    renderer.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)];
    setOrtho(new THREE.Vector3(0, 4.4, 36), new THREE.Vector3(0, 4.0, 0), new THREE.Vector3(0, 1, 0), 10.6);
  }

  viewButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.modelView === name));
  const content = viewContent[name];
  if (content) {
    viewKicker.textContent = content.kicker;
    viewTitle.textContent = content.title;
    viewCopy.textContent = content.copy;
    datum.textContent = content.datum;
  }
  host.dataset.currentView = name;
}

viewButtons.forEach((button) => button.addEventListener("click", () => setView(button.dataset.modelView)));
layerInputs.forEach((input) => input.addEventListener("change", () => setLayer(input.dataset.modelLayer, input.checked)));

function resize() {
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  renderer.setSize(width, height, false);
  perspectiveCamera.aspect = width / height;
  perspectiveCamera.updateProjectionMatrix();
  const aspect = width / height;
  orthographicCamera.left = -orthoSize * aspect;
  orthographicCamera.right = orthoSize * aspect;
  orthographicCamera.top = orthoSize;
  orthographicCamera.bottom = -orthoSize;
  orthographicCamera.updateProjectionMatrix();
}

new ResizeObserver(resize).observe(host);
resize();
setView("perspective");
loading?.remove();

function animate() {
  controls.update();
  renderer.render(scene, activeCamera);
  requestAnimationFrame(animate);
}
animate();

window.trplSModel = {
  setView,
  getView: () => host.dataset.currentView,
  renderer,
  scene,
};
window.dispatchEvent(new Event("trpls:model-ready"));
