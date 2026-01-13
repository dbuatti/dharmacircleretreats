"use client";

import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from 'sonner';

interface Option {
  value: string;
  label: string;
  color: string;
  icon?: string;
}

interface InlineSelectProps {
  value: string | undefined;
  options: Option[];
  onSave: (newValue: string) => void;
  label: string;
  className?: string;
  allowQuickToggle?: boolean;
}

export const InlineSelect: React.FC<InlineSelectProps> = ({
  value: initialValue = '',
  options,
  onSave,
  label,
  className,
  allowQuickToggle = true,
}) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  const selectedOption = options.find(opt => opt.value === currentValue) || options[0];

  const handleValueChange = (newValue: string) => {
    setCurrentValue(newValue);
    onSave(newValue);
    toast.success(`${label} updated`, { duration: 1500 });
  };

  const handleClick = () => {
    if (!allowQuickToggle) {
      setIsOpen(true);
      return;
    }
    const currentIndex = options.findIndex(opt => opt.value === currentValue);
    const nextIndex = (currentIndex + 1) % options.length;
    const nextValue = options[nextIndex].value;
    handleValueChange(nextValue);
  };

  return (
    <Select 
      value={currentValue} 
      onValueChange={handleValueChange}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger 
        className={cn(
          "h-7 w-full border-transparent bg-transparent px-1.5 py-0.5 rounded transition-all duration-200",
          "hover:bg-gray-50 hover:border-gray-200 hover:px-2",
          "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:bg-white",
          "data-[state=open]:bg-white data-[state=open]:border-blue-500",
          "text-xs font-medium capitalize",
          className
        )}
        onClick={(e) => {
          if (allowQuickToggle) {
            e.preventDefault();
            handleClick();
          }
        }}
        // FIX: Removed 'showIcon' prop as it does not exist on SelectTrigger
      >
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value} className="capitalize">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full bg-${opt.color}-500`}></span>
              {opt.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}