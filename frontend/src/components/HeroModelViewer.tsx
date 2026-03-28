import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

type HeroModelViewerProps = {
  src: string;
};

const HERO_MODEL_COLORS = [
  0x45d8a5, 0x1cc6b7, 0x23a6d5, 0x7ddf6a, 0x5fd0ff, 0x49e3c3, 0xa0e05f,
];

function pickRandomColor(): number {
  const idx = Math.floor(Math.random() * HERO_MODEL_COLORS.length);
  return HERO_MODEL_COLORS[idx] ?? 0x45d8a5;
}

function getExt(path: string): string {
  const cleanPath = path.split("?")[0] ?? path;
  const parts = cleanPath.split(".");
  return (parts[parts.length - 1] ?? "").toLowerCase();
}

export default function HeroModelViewer({ src }: HeroModelViewerProps) {
  const ext = useMemo(() => getExt(src), [src]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [modelColor, setModelColor] = useState<number>(() => pickRandomColor());
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    setStatus("loading");
    setModelColor(pickRandomColor());
  }, [src]);

  useEffect(() => {
    if (ext !== "stl" || !canvasRef.current) {
      setStatus("error");
      return;
    }

    let mounted = true;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth || 560;
    const height = canvas.clientHeight || 360;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 16, 34);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1;
    controls.enablePan = false;
    controls.target.set(0, 0, 0);
    controls.update();

    const keyLight = new THREE.DirectionalLight(0xdaf9ef, 0.75);
    keyLight.position.set(18, 24, 14);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(modelColor, 1.05);
    fillLight.position.set(-18, 12, -10);
    scene.add(fillLight);

    scene.add(new THREE.AmbientLight(0x9eead7, 0.22));

    function fitObject(object: any): void {
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center);

      const fittedBox = new THREE.Box3().setFromObject(object);
      const size = fittedBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const fovInRadians = THREE.MathUtils.degToRad(camera.fov);
      const cameraDistance = (maxDim * 0.5) / Math.tan(fovInRadians * 0.5);

      camera.near = Math.max(0.01, cameraDistance / 200);
      camera.far = Math.max(1000, cameraDistance * 30);
      camera.updateProjectionMatrix();

      controls.target.set(0, 0, 0);
      camera.position.set(0, maxDim * 0.18, cameraDistance * 1.35);
      camera.lookAt(controls.target);
      controls.update();
    }

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    if (ext === "stl") {
      const loader = new STLLoader();
      loader.load(
        src,
        (geometry: any) => {
          if (!mounted) return;

          geometry.computeBoundingBox();
          geometry.computeBoundingSphere();
          const radius = geometry.boundingSphere?.radius ?? 0;
          if (!Number.isFinite(radius) || radius <= 0) {
            setStatus("error");
            return;
          }

          geometry.center();
          geometry.computeVertexNormals();

          const material = new THREE.MeshStandardMaterial({
            color: modelColor,
            emissive: modelColor,
            emissiveIntensity: 0.22,
            metalness: 0.04,
            roughness: 0.62,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.rotation.x = -Math.PI / 2;
          const normalizedScale = 8 / radius;
          mesh.scale.setScalar(normalizedScale);

          modelGroup.add(mesh);
          fitObject(modelGroup);
          setStatus("ready");
        },
        undefined,
        () => {
          if (!mounted) return;
          setStatus("error");
        },
      );
    }

    let frameId = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nextWidth = canvas.clientWidth || width;
      const nextHeight = canvas.clientHeight || height;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight, false);
    };
    window.addEventListener("resize", onResize);

    return () => {
      mounted = false;
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(frameId);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj: any) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m: any) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, [ext, modelColor, src]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute z-30 left-1/2 -translate-x-1/2 bottom-[6%] w-[98%] h-[86%]"
      />
      {status === "loading" ? (
        <p className="absolute z-40 left-1/2 -translate-x-1/2 bottom-8 text-xs text-white/75 text-center px-4">
          Loading 3D model...
        </p>
      ) : null}
      {status === "error" ? (
        <p className="absolute z-40 left-1/2 -translate-x-1/2 bottom-8 text-xs text-white/75 text-center px-4">
          This STL could not be previewed. Try another STL file.
        </p>
      ) : null}
    </>
  );
}
