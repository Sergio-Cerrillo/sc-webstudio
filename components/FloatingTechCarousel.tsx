"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type FloatingTechCarouselProps = {
    items: string[]
    direction?: "left" | "right"
    className?: string
    duration?: number
}

export default function FloatingTechCarousel({
    items,
    direction = "left",
    className,
    duration = 42,
}: FloatingTechCarouselProps) {
    const loopItems = [...items, ...items, ...items, ...items]
    const travel = direction === "left" ? ["0%", "-25%"] : ["-25%", "0%"]

    return (
        <div
            className={cn(
                "pointer-events-auto relative overflow-hidden py-2",
                className,
            )}
        >
            <motion.div
                animate={{ x: travel }}
                transition={{
                    duration,
                    ease: "linear",
                    repeat: Number.POSITIVE_INFINITY,
                }}
                className="relative z-10 flex w-max items-center gap-3"
            >
                {loopItems.map((item, index) => (
                    <span
                        key={`${item}-${index}`}
                        className="select-none whitespace-nowrap rounded-full border border-neutral-300 bg-white/90 px-5 py-2 text-xs font-semibold tracking-[0.16em] text-neutral-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-400 dark:border-white/20 dark:bg-white/10 dark:text-neutral-100 dark:hover:border-white/35"
                    >
                        {item}
                    </span>
                ))}
            </motion.div>
        </div>
    )
}
