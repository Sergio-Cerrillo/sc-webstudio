"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  CHAPTERS,
  chapterAt,
  smooth,
} from "@/lib/proposals/construction/config";
import type { ConstructionEngine } from "@/lib/proposals/construction/scene";
import { ConstructionFallback } from "./construction-fallback";

export function MoyaOpening() {
  const sectionRef = useRef<HTMLElement>(null),
    stageRef = useRef<HTMLDivElement>(null),
    mountRef = useRef<HTMLDivElement>(null);
  const progressRef=useRef<HTMLSpanElement>(null);
  const engineRef = useRef<ConstructionEngine>();
  const [phase, setPhase] = useState(0),
    [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    const section = sectionRef.current,
      stage = stageRef.current,
      mount = mountRef.current;
    if (!section || !stage || !mount) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let alive = true,
      generation = 0,
      lastPhase = -1;
    const setup = () => {
      const version = ++generation;
      engineRef.current?.dispose();
      engineRef.current = undefined;
      setReady(false);
      setFailed(false);
      stage.style.setProperty("--narrative-opacity", "1");
      stage.style.setProperty("--narrative-y", "0px");
      setPhase(media.matches ? 4 : 0);
      if (media.matches) return;
      void import("@/lib/proposals/construction/scene")
        .then(({ mountConstruction }) => {
          if (!alive || version !== generation) return;
          // Never insert pin spacing above a visitor who has already passed
          // the cover while the lazy scene module was downloading.
          if (section.getBoundingClientRect().bottom <= 1) {
            setFailed(true);
            setPhase(4);
            return;
          }
          try {
            engineRef.current = mountConstruction({
              section,
              stage,
              mount,
              onProgress(p) {
                const next = chapterAt(p);
                if (next !== lastPhase) {
                  lastPhase = next;
                  setPhase(next);
                }
                const start = CHAPTERS[next].at,
                  end = CHAPTERS[next + 1]?.at ?? 1.1;
                const fade = next === 0 ? 1 : smooth(start, start + 0.025, p);
                const exit = 1 - smooth(end - 0.035, end - 0.004, p);
                stage.style.setProperty(
                  "--narrative-opacity",
                  String(fade * exit),
                );
                stage.style.setProperty(
                  "--narrative-y",
                  `${(1 - fade) * 13 - (1 - exit) * 9}px`,
                );
                stage.style.setProperty("--progress", String(p));
                stage.style.setProperty("--sunset",String(smooth(.76,1,p)));
                stage.style.setProperty("--chapter-enter",String(fade));
                stage.style.setProperty("--material-opacity",String(smooth(.61,.75,p)));
                stage.dataset.chapter=String(next);
                if(progressRef.current)progressRef.current.textContent=String(Math.round(p*100)).padStart(2,"0");
              },
              onLost() {
                setFailed(true);
                setReady(false);
                setPhase(4);
                stage.style.setProperty("--narrative-opacity", "1");
                stage.style.setProperty("--narrative-y", "0px");
              },
            });
            setReady(true);
          } catch (error) {
            console.error("No se pudo iniciar la escena arquitectónica", error);
            setFailed(true);
            setPhase(4);
          }
        })
        .catch(() => {
          if (alive && version === generation) {
            setFailed(true);
            setPhase(4);
          }
        });
    };
    setup();
    media.addEventListener("change", setup);
    return () => {
      alive = false;
      generation++;
      engineRef.current?.dispose();
      engineRef.current = undefined;
      media.removeEventListener("change", setup);
    };
  }, []);
  const skip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("proyectos");
    if (!target) return;
    if (engineRef.current) engineRef.current.skip(target);
    else {
      target.scrollIntoView({ behavior: "instant", block: "start" });
      target.focus({ preventScroll: true });
    }
  };
  const chapter = CHAPTERS[phase];
  return (
    <>
      <section
        id="construccion-3d"
        ref={sectionRef}
        className="moya-construction-opening"
        aria-label="Construimos lo que imaginas"
        data-ready={ready}
        data-fallback={failed}
      >
        <div ref={stageRef} className="moya-construction-scene">
          <div className="moya-architecture-atmosphere" />
          <div className="moya-architecture-grain" aria-hidden="true"/>
          <div className="moya-architecture-chapter-number" aria-hidden="true">0{phase+1}</div>
          <div className="moya-architecture-fallback moya-architecture-terrain">
            <ConstructionFallback />
          </div>
          <div className="moya-architecture-fallback moya-architecture-finished">
            <ConstructionFallback complete />
          </div>
          <div ref={mountRef} className="moya-architecture-mount" />
          <div className="moya-architecture-vignette" />
          <div className="moya-architecture-narrative">
            <p className="moya-architecture-eyebrow">
              <span /> DEL PLANO A LA VIDA
            </p>
            <p className="moya-architecture-phase">
              0{phase + 1} <span>/ {chapter.label}</span>
            </p>
            <h2>
              <span className="moya-chapter-line"><span>{chapter.title}</span></span>
              <span className="moya-chapter-line"><span><em>{chapter.accent}</em></span></span>
            </h2>
            <p className="moya-architecture-detail">{chapter.detail}</p>
            <div className="moya-architecture-materials" aria-label="Paleta de materiales">
              <span><i className="material-stone"/>Piedra</span>
              <span><i className="material-wood"/>Madera</span>
              <span><i className="material-glass"/>Luz</span>
            </div>
            {phase === 4 && (
              <a
                href="#proyectos"
                onClick={skip}
                className="moya-architecture-cta"
              >
                Descubre nuestros proyectos <ArrowUpRight size={17} />
              </a>
            )}
          </div>
          <div className="moya-architecture-readout" aria-hidden="true"><span>EL PROCESO</span><p><span ref={progressRef}>00</span><small>%</small></p><i/><span>DE LA VISIÓN AL ESPACIO</span></div>
          <span className="moya-architecture-edition" aria-hidden="true">
            MATERIA · LUZ · PRECISIÓN <i /> GERMANS MOYA
          </span>
          <div className="moya-architecture-bottom">
            <span className="moya-architecture-scroll">
              <span className="moya-motion-label">Tu scroll. Nuestra forma de construir.</span>
              <span className="moya-static-label">
                De imaginarlo a hacerlo realidad
              </span>
              <ArrowDown size={13} />
            </span>
            <a
              href="#proyectos"
              onClick={skip}
              className="moya-architecture-skip"
            >
              <span className="moya-motion-label">Saltar animación</span>
              <span className="moya-static-label">Ver proyectos</span>
              <ArrowDownRight size={14} />
            </a>
          </div>
          <div
            className="moya-architecture-rail"
            aria-label={`Etapa: ${chapter.label}`}
          >
            {CHAPTERS.map((c, i) => (
              <div
                key={c.label}
                data-active={i === phase}
                data-complete={i < phase}
              >
                <b />
                <span>0{i + 1}</span>
                <p>{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
