import React from "react"
import { FileText, ShoppingCart, CreditCard, Scissors, Truck } from "lucide-react"

export type StepKey = "draft" | "ordered" | "paid" | "sewing" | "shipped"

export type StatusStepperProps = {
  value: StepKey
  onChange?: (value: StepKey) => void
  className?: string
}

const steps: { key: StepKey; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: "draft", label: "ฉบับร่าง", icon: FileText, color: "bg-gray-200" },
  { key: "ordered", label: "สั่งซื้อ", icon: ShoppingCart, color: "bg-blue-200" },
  { key: "paid", label: "ชำระแล้ว", icon: CreditCard, color: "bg-green-200" },
  { key: "sewing", label: "ตัดเย็บ", icon: Scissors, color: "bg-purple-200" },
  { key: "shipped", label: "จัดส่ง", icon: Truck, color: "bg-amber-200" },
]

export const StatusStepper: React.FC<StatusStepperProps> = ({ value, onChange, className }) => {
  const activeIndex = steps.findIndex(step => step.key === value);

  return (
    <div className={["w-full overflow-hidden", className || ""].join(" ")}>
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-100 -translate-y-1/2">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-in-out status-stepper-bar"
            style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
            data-active-index={activeIndex}
            data-steps-length={steps.length}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = index <= activeIndex;
            const isCurrent = step.key === value;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="relative flex flex-col items-center flex-1">
                {/* Step indicator */}
                <button
                  type="button"
                  onClick={() => onChange?.(step.key)}
                  className={[
                    "relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                    isActive
                      ? `${step.color} text-white shadow-md scale-110`
                      : "bg-gray-100 text-gray-400",
                    isCurrent ? "ring-2 ring-offset-2 ring-blue-500" : ""
                  ].join(" ")}
                  aria-current={isCurrent ? "step" : undefined}
                  title={step.label}
                >
                  <StepIcon className="w-5 h-5" aria-hidden="true" />
                </button>

                {/* Step label */}
                <span
                  className={[
                    "mt-2 text-xs font-medium text-center transition-colors",
                    isActive ? "text-gray-900" : "text-gray-500"
                  ].join(" ")}
                >
                  {step.label}
                </span>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-5 left-[calc(50%+20px)] right-0 h-0.5 bg-transparent">
                    <div
                      className={[
                        "h-full w-full transition-all duration-500",
                        isActive ? "bg-blue-500" : "bg-gray-200"
                      ].join(" ")}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatusStepper
