"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { COMPANY_PATH } from "@/lib/proposals/demo";

export function MoyaHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [floating, setFloating] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setFloating(window.scrollY > 48);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pageshow", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pageshow", update);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      )
        setOpen(false);
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const desktop = matchMedia("(min-width: 761px)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keyboard);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keyboard);
      desktop.removeEventListener("change", resize);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="moya-topbar"
      data-floating={floating}
      data-menu-open={open}
    >
      <nav
        id="moya-main-navigation"
        className={open ? "open" : ""}
        aria-label="Navegación de la propuesta"
      >
        {[
          ["Espacios", "proyectos"],
          ["Qué hacemos", "servicios"],
          ["Nuestra forma", "empresa"],
        ].map(([label, id]) => (
          <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <Link href={`${COMPANY_PATH}/admin`} onClick={() => setOpen(false)}>
          Demo de administración ↗
        </Link>
        <a
          className="moya-nav-cta"
          href="#presupuesto"
          onClick={() => setOpen(false)}
        >
          Hablemos <ArrowUpRight size={16} />
        </a>
      </nav>
      <button
        ref={buttonRef}
        type="button"
        className="moya-mobile-menu"
        aria-label={
          open ? "Cerrar menú de la propuesta" : "Abrir menú de la propuesta"
        }
        aria-expanded={open}
        aria-controls="moya-main-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        <span>Menú</span>
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>
    </header>
  );
}
