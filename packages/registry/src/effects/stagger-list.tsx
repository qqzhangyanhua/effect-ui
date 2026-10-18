"use client"

import * as React from "react"
import { motion, type Variants } from "motion/react"

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
  return (
    <motion.ul
      data-slot="stagger-list"
      className={cn("flex flex-col gap-2", className)}
      variants={list}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delayChildren: delay }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.li key={index} variants={item}>
          {child}
        </motion.li>
      ))}
    </motion.ul>
  )
}

export { StaggerList }
