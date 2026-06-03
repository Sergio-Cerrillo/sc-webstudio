import { Effects } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Particles } from "./particles";
import { VignetteShader } from "./shaders/vignetteShader";
import { useTheme } from "next-themes";

export const GL = ({ hovering }: { hovering: boolean }) => {
  const { theme } = useTheme();

  // Configuración fija optimizada
  const config = {
    speed: 1.0,
    focus: 3.8,
    aperture: 1.79,
    size: 512,
    noiseScale: 0.6,
    noiseIntensity: 0.52,
    timeScale: 1,
    pointSize: 10.0,
    opacity: 0.8,
    planeScale: 10.0,
    vignetteDarkness: 1.5,
    vignetteOffset: 0.4,
  };

  return (
    <div id="webgl" className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        camera={{
          position: [
            1.2629783123314589, 2.664606471394044, -1.8178993743288914,
          ],
          fov: 50,
          near: 0.01,
          far: 300,
        }}
      >
        <color attach="background" args={[theme === "dark" ? "#000" : "#fff"]} />
        <Particles
          speed={config.speed}
          aperture={config.aperture}
          focus={config.focus}
          size={config.size}
          noiseScale={config.noiseScale}
          noiseIntensity={config.noiseIntensity}
          timeScale={config.timeScale}
          pointSize={config.pointSize}
          opacity={config.opacity}
          planeScale={config.planeScale}
          useManualTime={false}
          manualTime={0}
          introspect={hovering}
          isDarkMode={theme === "dark"}
        />
        <Effects multisamping={0} disableGamma>
          <shaderPass
            args={[VignetteShader]}
            uniforms-darkness-value={config.vignetteDarkness}
            uniforms-offset-value={config.vignetteOffset}
          />
        </Effects>
      </Canvas>
    </div>
  );
};
