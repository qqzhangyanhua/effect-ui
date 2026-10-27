"use client"
import { FeedbackWidget } from "../effects/feedback-widget"

export function FeedbackWidgetDemo() {
  return (
    <div className="relative h-80 w-full">
      <FeedbackWidget className="absolute right-4 bottom-4" onSubmit={() => {}} />
    </div>
  )
}
