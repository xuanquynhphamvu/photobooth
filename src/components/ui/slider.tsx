"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* 
 * A simple Slider component that mimics shadcn/ui but uses native input 
 * to avoid adding @radix-ui/react-slider dependency for now.
 */

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number[];
  max?: number;
  min?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, min = 0, max = 100, step = 1, onValueChange, ...props }, ref) => {
    
    // Convert array value to single value for input
    const singleValue = value?.[0] ?? min;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      onValueChange?.([val]);
    };
    
    // Calculate percentage for background track fill
    const percentage = ((singleValue - min) / (max - min)) * 100;

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={singleValue}
          onChange={handleChange}
          ref={ref}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200", 
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2",
            // Custom Track Fill logic via gradient (common simple trick)
            // Or just rely on accent-color for simple browsers, but let's try a gradient for that 'filled' look
          )}
          style={{
             backgroundImage: `linear-gradient(to right, #745e59 ${percentage}%, #e7e5e4 ${percentage}%)`
          }}
          {...props}
        />
        <style jsx>{`
            /* Webkit Thumb */
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: white;
                border: 2px solid #745e59;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                margin-top: 0px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
            }
            /* Firefox Thumb */
            input[type="range"]::-moz-range-thumb {
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: white;
                border: 2px solid #745e59;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
        `}</style>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
