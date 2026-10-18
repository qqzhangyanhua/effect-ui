"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type StepState = "active" | "completed" | "inactive"

interface StepperContextValue {
  activeStep: number
  setActiveStep: (step: number) => void
  orientation: "horizontal" | "vertical"
}

interface StepItemContextValue {
  step: number
  state: StepState
}

const StepperContext = React.createContext<StepperContextValue | null>(null)
const StepItemContext = React.createContext<StepItemContextValue | null>(null)

function useStepper() {
  const context = React.useContext(StepperContext)
  if (!context) throw new Error("Stepper parts must be used within Stepper")
  return context
}

function useStepItem() {
  const context = React.useContext(StepItemContext)
  if (!context) throw new Error("Stepper item parts must be used within StepperItem")
  return context
}

function Stepper({
  value,
  defaultValue = 1,
  onValueChange,
  orientation = "horizontal",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  orientation?: "horizontal" | "vertical"
}) {
  const [internal, setInternal] = React.useState(defaultValue)
  const activeStep = value ?? internal
  const setActiveStep = React.useCallback(
    (step: number) => {
      if (value === undefined) setInternal(step)
      onValueChange?.(step)
    },
    [value, onValueChange],
  )

  return (
    <StepperContext.Provider value={{ activeStep, setActiveStep, orientation }}>
      <div
        data-orientation={orientation}
        className={cn(
          "group/stepper flex",
          orientation === "horizontal" ? "w-full flex-row" : "flex-col",
          className,
        )}
        {...props}
      />
    </StepperContext.Provider>
  )
}

function StepperItem({
  step,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { step: number }) {
  const { activeStep } = useStepper()
  const state: StepState = step < activeStep ? "completed" : step === activeStep ? "active" : "inactive"
  return (
    <StepItemContext.Provider value={{ step, state }}>
      <div
        data-state={state}
        className={cn(
          "group/step flex items-center group-data-[orientation=horizontal]/stepper:flex-1",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </StepItemContext.Provider>
  )
}

function StepperTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setActiveStep } = useStepper()
  const { step } = useStepItem()
  return (
    <button
      type="button"
      className={cn("inline-flex items-center gap-2 rounded-full outline-none", className)}
      onClick={() => setActiveStep(step)}
      {...props}
    >
      {children}
    </button>
  )
}

function StepperIndicator({ className }: { className?: string }) {
  const { step, state } = useStepItem()
  return (
    <span
      data-state={state}
      className={cn(
        "relative flex size-6 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground data-[state=active]:bg-primary data-[state=completed]:bg-primary data-[state=active]:text-primary-foreground data-[state=completed]:text-primary-foreground",
        className,
      )}
    >
      <span className="group-data-[state=completed]/step:opacity-0">{step}</span>
      <CheckIcon className="absolute size-3.5 scale-0 group-data-[state=completed]/step:scale-100" />
    </span>
  )
}

function StepperTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-medium", className)} {...props} />
}

function StepperSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-2 h-0.5 flex-1 bg-muted group-data-[state=completed]/step:bg-primary group-data-[orientation=vertical]/stepper:mx-0 group-data-[orientation=vertical]/stepper:h-8 group-data-[orientation=vertical]/stepper:w-0.5",
        className,
      )}
      {...props}
    />
  )
}

export {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperSeparator,
}
