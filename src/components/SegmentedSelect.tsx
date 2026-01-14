"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SegmentedSelectProps {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const SegmentedSelect: React.FC<SegmentedSelectProps> = ({
  options,
  value,
  onValueChange,
  disabled = false,
  className,
}) => {
  return (
    <RadioGroup 
      value={value} 
      onValueChange={onValueChange} 
      className={cn("grid gap-2", className)}
      disabled={disabled}
    >
      {options.map((option) => (
        <div 
          key={option.value} 
          className={cn(
            "flex items-start space-x-3 p-3 border rounded-none cursor-pointer transition-all",
            "hover:bg-gray-50",
            value === option.value 
              ? "border-[#1e2a5e] bg-blue-50/50 shadow-sm" 
              : "border-gray-200 bg-white"
          )}
          onClick={() => !disabled && onValueChange(option.value)}
        >
          <RadioGroupItem 
            value={option.value} 
            id={`option-${option.value}`} 
            className="mt-1 h-4 w-4 border-[#1e2a5e] text-[#1e2a5e] focus:ring-[#1e2a5e]"
          />
          <div className="flex flex-col space-y-1">
            <Label 
              htmlFor={`option-${option.value}`} 
              className={cn(
                "text-sm font-medium leading-none cursor-pointer",
                value === option.value ? "text-[#1e2a5e]" : "text-gray-700"
              )}
            >
              {option.label}
            </Label>
            {option.description && (
              <p className="text-xs text-gray-500 font-serif italic">
                {option.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </RadioGroup>
  );
};