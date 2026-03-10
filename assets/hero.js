 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/assets/hero.js b/assets/hero.js
index 1c9d0e5f92a486563b86160d95a81a27283055dc..40a8048f51678b3eecf03f82439422c213ea14bd 100644
--- a/assets/hero.js
+++ b/assets/hero.js
@@ -1,56 +1,91 @@
 (() => {
   const canvas = document.getElementById('hero-canvas');
   if (!canvas || typeof THREE === 'undefined') return;
 
-  const scene = new THREE.Scene();
-  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
-  camera.position.set(0, 0, 9);
+  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
+  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
 
-  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
-  renderer.setSize(innerWidth, innerHeight);
-  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
+  const scene = new THREE.Scene();
+  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
+  camera.position.set(0, 0, 14);
 
   const group = new THREE.Group();
   scene.add(group);
 
-  const geometry = new THREE.IcosahedronGeometry(2.2, 12);
-  const material = new THREE.MeshPhysicalMaterial({
-    color: 0x5be6ff,
-    transmission: .94,
-    roughness: .2,
-    thickness: .5,
-    metalness: .05,
-    transparent: true,
-    opacity: .35
-  });
+  const pointsGeometry = new THREE.BufferGeometry();
+  const count = 900;
+  const positions = new Float32Array(count * 3);
+  const colors = new Float32Array(count * 3);
+
+  const c1 = new THREE.Color('#67f0ff');
+  const c2 = new THREE.Color('#9a83ff');
 
-  const orb = new THREE.Mesh(geometry, material);
-  group.add(orb);
+  for (let i = 0; i < count; i++) {
+    const i3 = i * 3;
+    const r = 3 + Math.random() * 8;
+    const a = Math.random() * Math.PI * 2;
+    const y = (Math.random() - 0.5) * 8;
+    positions[i3] = Math.cos(a) * r;
+    positions[i3 + 1] = y;
+    positions[i3 + 2] = Math.sin(a) * r;
+
+    const mix = Math.random();
+    const color = c1.clone().lerp(c2, mix);
+    colors[i3] = color.r;
+    colors[i3 + 1] = color.g;
+    colors[i3 + 2] = color.b;
+  }
+
+  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
+  pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
 
   const points = new THREE.Points(
-    new THREE.BufferGeometry().setAttribute('position', geometry.getAttribute('position')),
-    new THREE.PointsMaterial({ color: 0x9b7bff, size: 0.05 })
+    pointsGeometry,
+    new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.92 })
   );
   group.add(points);
 
-  const light1 = new THREE.PointLight(0x5be6ff, 12, 40);
-  light1.position.set(4, 3, 5);
-  const light2 = new THREE.PointLight(0x9b7bff, 10, 40);
-  light2.position.set(-3, -2, 4);
-  scene.add(light1, light2);
+  const flowMesh = new THREE.Mesh(
+    new THREE.TorusKnotGeometry(3.8, 0.12, 380, 32),
+    new THREE.MeshStandardMaterial({
+      color: 0x76d9ff,
+      emissive: 0x253273,
+      roughness: 0.24,
+      metalness: 0.48,
+      transparent: true,
+      opacity: 0.55
+    })
+  );
+  flowMesh.rotation.x = Math.PI / 2.4;
+  group.add(flowMesh);
+
+  scene.add(new THREE.AmbientLight(0xffffff, 0.24));
+  const key = new THREE.PointLight(0x67f0ff, 14, 50);
+  key.position.set(3, 5, 8);
+  const fill = new THREE.PointLight(0x9a83ff, 10, 60);
+  fill.position.set(-6, -2, 4);
+  scene.add(key, fill);
+
+  function resize() {
+    const width = window.innerWidth;
+    const height = window.innerHeight;
+    camera.aspect = width / height;
+    camera.updateProjectionMatrix();
+    renderer.setSize(width, height, false);
+  }
+
+  function animate(t = 0) {
+    const time = t * 0.00045;
+    group.rotation.y = time * 0.9;
+    flowMesh.rotation.z = Math.sin(time * 2.8) * 0.45;
+    points.rotation.y = -time * 0.45;
+    points.rotation.x = Math.sin(time) * 0.2;
 
-  const animate = (t) => {
-    group.rotation.y = t * 0.00023;
-    group.rotation.x = Math.sin(t * 0.00012) * .2;
-    orb.scale.setScalar(1 + Math.sin(t * 0.0015) * .025);
     renderer.render(scene, camera);
     requestAnimationFrame(animate);
-  };
-  animate(0);
+  }
 
-  addEventListener('resize', () => {
-    camera.aspect = innerWidth / innerHeight;
-    camera.updateProjectionMatrix();
-    renderer.setSize(innerWidth, innerHeight);
-  });
+  resize();
+  window.addEventListener('resize', resize);
+  animate();
 })();
 
EOF
)
