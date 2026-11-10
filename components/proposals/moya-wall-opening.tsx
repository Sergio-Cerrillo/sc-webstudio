"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, ArrowDownRight } from "lucide-react";
import { clamp, wallAt, wallCopyAt, WALL_ASSETS } from "@/lib/proposals/wall-opening";

export function MoyaWallOpening() {
  const sectionRef = useRef<HTMLElement>(null),
    sceneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = sectionRef.current,
      scene = sceneRef.current;
    if (!section || !scene) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0,
      previous = -1,
      previousHeight = scene.clientHeight,
      lastProgress = 0;
    const draw = () => {
      raf = 0;
      const height = scene.clientHeight;
      if (height !== previousHeight && lastProgress > 0 && lastProgress < 1) {
        const start = scrollY + section.getBoundingClientRect().top;
        scrollTo({
          top:
            start + lastProgress * Math.max(1, section.offsetHeight - height),
          behavior: "instant",
        });
      }
      previousHeight = height;
      const progress = media.matches
        ? 1
        : clamp(
            -section.getBoundingClientRect().top /
              Math.max(1, section.offsetHeight - height),
          );
      lastProgress = progress;
      if (progress === previous) return;
      previous = progress;
      const { shift, light } = wallAt(progress);
      const copy = wallCopyAt(media.matches ? 0 : progress);
      scene.style.setProperty("--wall-position", String(shift / 100));
      scene.style.setProperty("--wall-light", String(light));
      scene.style.setProperty(
        "--wall-copy",
        String(copy.shade),
      );
      scene.style.setProperty("--wall-support",String(copy.support));
      copy.lines.forEach((line,i)=>{
        scene.style.setProperty(`--wall-line-${i}-y`,`${line.y}%`);
        scene.style.setProperty(`--wall-line-${i}-x`,`${line.x}px`);
        scene.style.setProperty(`--wall-line-${i}-opacity`,String(line.opacity));
      });
      scene.style.setProperty("--wall-progress", `${progress * 100}%`);
      scene.style.setProperty(
        "--wall-caption",
        String(media.matches ? 0 : copy.caption),
      );
      scene.dataset.progress = progress.toFixed(5);
      scene.dataset.wallShift = shift.toFixed(4);
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const motion = () => {
      previous = -1;
      request();
    };
    const resize = new ResizeObserver(request);
    resize.observe(scene);
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    window.addEventListener("pageshow", request);
    media.addEventListener("change", motion);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      window.removeEventListener("pageshow", request);
      media.removeEventListener("change", motion);
    };
  }, []);
  return (
    <section
      ref={sectionRef}
      className="moya-wall-opening"
      aria-label="Construccions Germans Moya · Nuestra firma"
    >
      <div ref={sceneRef} className="moya-wall-scene">
        <div className="moya-wall-frame">
          <img
            className="moya-wall-base"
            src={`${WALL_ASSETS}/01-casa-base.webp`}
            width={1672}
            height={941}
            loading="eager"
            fetchPriority="high"
            alt="Casa mediterránea de Germans Moya, con entrada de madera, jardín y ala acristalada"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = "true";
                img.src = `${WALL_ASSETS}/01-casa-base.png`;
              }
            }}
          />
          <div className="moya-wall-moving">
            <img
              src={`${WALL_ASSETS}/02-pared-logo-transparente.webp`}
              width={1672}
              height={941}
              loading="eager"
              fetchPriority="high"
              alt=""
              aria-hidden="true"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = "true";
                  img.src = `${WALL_ASSETS}/02-pared-logo-transparente.png`;
                }
              }}
            />
            <div className="moya-wall-raking" />
          </div>
        </div>
        <div className="moya-wall-shade" />
        <div className="moya-wall-copy">
          <p className="p-eyebrow">Construccions Germans Moya</p>
          <h1>
            <span className="moya-wall-line"><span>Construimos.</span></span>
            <span className="moya-wall-line"><span><em>Reformamos.</em></span></span>
            <span className="moya-wall-line"><span>Transformamos.</span></span>
          </h1>
          <p>
            Del primer trazo.
            <br />A una forma de vivir.
          </p>
          <span className="moya-wall-cue">
            <span className="moya-motion-label">
              Desliza para descubrir nuestra firma
            </span>
            <span className="moya-static-label">
              Espacios con nuestra firma
            </span>
            <ArrowDown size={16} />
          </span>
        </div>
        <div className="moya-wall-caption" aria-hidden="true">
          <span>EL OFICIO DE CONSTRUIR</span>
          <p>
            Nuestra firma.
            <br />
            <em>En cada detalle.</em>
          </p>
        </div>
        <a
          className="moya-wall-skip"
          href="#proyectos"
          onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById("proyectos");
            target?.scrollIntoView({ behavior: "instant", block: "start" });
            target?.focus({ preventScroll: true });
          }}
        >
          <span className="moya-motion-label">Saltar animación</span>
          <span className="moya-static-label">Ver proyectos</span>
          <ArrowDownRight size={15} />
        </a>
        <div className="moya-wall-track" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
