"use client"

import * as React from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

export interface StaggerListProps {
  className?: string
  children?: React.ReactNode
  delay?: number
}

const list: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

function StaggerList({
  className,
  children,
  delay = 0,
}: StaggerListProps) {
  const reduce = useReducedMotion() === true
  return (
    <motion.ul
      data-slot="stagger-list"
      className={cn("flex flex-col gap-2", className)}
      variants={reduce ? undefined : list}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, amount: 0.3 }}
      transition={reduce ? { duration: 0 } : { delayChildren: delay }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.li key={index} variants={reduce ? undefined : item}>
          {child}
        </motion.li>
      ))}
    </motion.ul>
  )
}

export { StaggerList }
