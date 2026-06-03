"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"

type RotatingWordProps = {
    words: string[]
    intervalMs?: number
    className?: string
}

export default function RotatingWord({
    words,
    intervalMs = 2400,
    className,
}: RotatingWordProps) {
    const reducedMotion = useReducedMotion()
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (words.length <= 1) return

        const timer = window.setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length)
        }, intervalMs)

        return () => window.clearInterval(timer)
    }, [intervalMs, words.length])

    const activeWord = words[index] ?? ""
    const reservedWidth = useMemo(() => {
        const longest = words.reduce((acc, word) => Math.max(acc, word.length), 0)
        return `${Math.max(8, longest + 1)}ch`
    }, [words])

    if (reducedMotion) {
        return (
            <span
                className={className}
                style={{ width: reservedWidth }}
                aria-live="polite"
                aria-atomic="true"
            >
                {activeWord}
            </span>
        )
    }

    return (
        <span
            className="relative inline-flex h-[1.15em] items-center overflow-hidden align-bottom"
            style={{ width: reservedWidth }}
            aria-live="polite"
            aria-atomic="true"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={activeWord}
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                    transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
                    className={className}
                >
                    {activeWord}
                </motion.span>
            </AnimatePresence>
        </span>
    )
}
