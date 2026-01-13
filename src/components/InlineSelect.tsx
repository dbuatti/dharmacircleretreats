"use client";

import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Option {
  value: string;
  label: string;
  color: string; // Tailwind color class (e.g., 'green', 'red')
  icon?: string;
}

interface InlineSelectProps {
  value: string | undefined;
  options: Option[];
  onSave: (newValue: string) => void;
  label: string; // For accessibility and context
  className?: string;
}

export const InlineSelect: React.FC<InlineSelectProps> = ({
  value: initialValue = '',
  options,
  onSave,
  label,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialValue);

  useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  const selectedOption = options.find(opt => opt.value === currentValue) || options[0];

  const handleValueChange = (newValue: string) => {
    setCurrentValue(newValue);
    onSave(newValue);
    toast.success(`${label} updated`, { duration: 1500 });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Select 
        value={currentValue} 
        onValueChange={handleValueChange}
        open={true}
        onOpenChange={(open) => !open && setIsEditing(false)}
      >
        <SelectTrigger className="h-8 w-full border-blue-500 ring-2 ring-blue-500/20 rounded-md">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full bg-${opt.color}-500`}></span>
                {opt.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer inline-block transition-all hover:opacity-80",
        className
      )}
      title={`Click to edit ${label}`}
    >
      <Badge 
        variant="outline" 
        className={cn(
          "capitalize font-medium px-2 py-0.5 rounded-md text-[10px] border-0",
          `bg-${selectedOption.color}-50 text-${selectedOption.color}-700`
        )}
      >
        {label}: {selectedOption.label}
      </Badge>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}