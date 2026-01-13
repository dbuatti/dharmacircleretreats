"use client";

import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Edit } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  badgeClass: string;
}

interface InlineSelectProps {
  value: string | undefined;
  options: Option[];
  onSave: (newValue: string) => void;
  placeholder?: string;
  className?: string;
}

export const InlineSelect: React.FC<InlineSelectProps> = ({
  value: initialValue = '',
  options,
  onSave,
  placeholder = 'Select status',
  className,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(initialValue);

  React.useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  const selectedOption = options.find(opt => opt.value === currentValue);
  const displayLabel = selectedOption?.label || placeholder;
  const displayClass = selectedOption?.badgeClass || 'bg-gray-100 text-gray-500';

  const handleValueChange = (newValue: string) => {
    setCurrentValue(newValue);
    onSave(newValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Select 
        value={currentValue} 
        onValueChange={handleValueChange}
        open={true}
        onOpenChange={(open) => {
          if (!open) setIsEditing(false);
        }}
      >
        <SelectTrigger 
          className={cn(
            "h-8 text-xs p-1 border-blue-300 focus:ring-1 focus:ring-blue-500 rounded-sm w-full",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div
      className={cn(
        "group relative cursor-pointer inline-block rounded-sm transition-all",
        className
      )}
      onClick={() => setIsEditing(true)}
      title="Click to change status"
    >
      <Badge className={cn("text-[10px] uppercase tracking-widest font-medium py-1 px-2", displayClass)}>
        {displayLabel}
      </Badge>
      <Edit className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};