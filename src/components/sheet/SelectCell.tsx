"use client";

import React, { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Participant } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SelectOption {
  value: string;
  label: string;
  badgeClass?: string;
}

interface SelectCellProps {
  initialValue: string | undefined;
  rowId: string;
  columnId: keyof Participant;
  options: SelectOption[];
  onSave: (id: string, columnId: keyof Participant, value: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

const getStatusBadge = (status: string, options: SelectOption[]) => {
  const option = options.find(o => o.value === status);
  const label = option?.label || status.replace(/_/g, " ");
  const badgeClass = option?.badgeClass || 'bg-gray-100 text-gray-600';

  return <Badge className={cn(badgeClass, 'capitalize text-[10px] font-medium tracking-wider rounded-sm')}>{label}</Badge>;
};

export const SelectCell: React.FC<SelectCellProps> = ({
  initialValue = "",
  rowId,
  columnId,
  options,
  onSave,
  isEditing,
  setIsEditing,
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (newValue !== initialValue) {
      onSave(rowId, columnId, newValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Select 
        value={value} 
        onValueChange={handleValueChange}
        open={isEditing}
        onOpenChange={(open) => {
          // Only close editing state if the select component closes
          if (!open) setIsEditing(false);
        }}
      >
        <SelectTrigger className="h-full w-full p-1 text-sm border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 rounded-none bg-white">
          <SelectValue placeholder="Select..." />
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

  // Display mode
  const displayValue = options.find(o => o.value === initialValue)?.label || initialValue || "";
  
  // Use badge display for status columns
  if (['payment_status', 'attendance_status', 'registration_status', 'whatsapp_status'].includes(columnId as string)) {
    return (
      <div 
        className="h-full w-full flex items-center px-2 py-1 cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        {getStatusBadge(initialValue || "", options)}
      </div>
    );
  }

  // Use simple text display for logistics columns
  return (
    <div
      className="h-full w-full flex items-center px-2 py-1 cursor-pointer text-sm capitalize"
      onClick={() => setIsEditing(true)}
    >
      {(displayValue as string).replace(/_/g, ' ') || <span className="text-gray-400 italic">N/A</span>}
    </div>
  );
};