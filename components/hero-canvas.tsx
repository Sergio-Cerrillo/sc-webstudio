"use client"

import { useEffect, useRef } from "react"

interface HeroCanvasProps {
  isDarkMode: boolean
}

export default function HeroCanvas({ isDarkMode }: HeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return

    let unmounted = false

    async function loadCanvas() {
      const ReactDOM = await import("react-dom/client")
      const React = await import("react")

      const { Canvas } = await import("@react-three/fiber")
      const { Effects } = await import("@react-three/drei")
      const { Particles } = await import("./gl/particles")
      const { VignetteShader } = await import("./gl/shaders/vignetteShader")

      if (unmounted || !containerRef.current) return

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
      }

      const root = ReactDOM.createRoot(containerRef.current)

      root.render(
        React.createElement(Canvas, {
          camera: {
            position: [1.26, 2.66, -1.82],
            fov: 50,
            near: 0.01,
            far: 300,
          }
        },
          React.createElement("color", { attach: "background", args: [isDarkMode ? "#000000" : "#ffffff"] }),
          React.createElement(Particles, {
            speed: config.speed,
            aperture: config.aperture,
            focus: config.focus,
            size: config.size,
            noiseScale: config.noiseScale,
            noiseIntensity: config.noiseIntensity,
            timeScale: config.timeScale,
            pointSize: config.pointSize,
            opacity: config.opacity,
            planeScale: config.planeScale,
            useManualTime: false,
            manualTime: 0,
            introspect: false,
            isDarkMode: isDarkMode
          }),
          React.createElement(Effects, { multisamping: 0, disableGamma: true },
            React.createElement("shaderPass", {
              args: [VignetteShader],
              "uniforms-darkness-value": config.vignetteDarkness,
              "uniforms-offset-value": config.vignetteOffset
            })
          )
        )
      )
    }

    loadCanvas()

    return () => {
      unmounted = true
    }
  }, [isDarkMode])

  return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}
