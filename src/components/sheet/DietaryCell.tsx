"use client";

import React from "react";
import { Participant } from "@/types";
import { DietaryMultiSelect } from "../DietaryMultiSelect";
import { Badge } from "@/components/ui/badge";
import { Utensils } from "lucide-react";

interface DietaryCellProps {
  initialValue: string | undefined;
  rowId: string;
  columnId: keyof Participant;
  onSave: (id: string, columnId: keyof Participant, value: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

const getDietaryBadges = (value: string) => {
  if (!value) return <span className="text-gray-400 italic">None</span>;
  
  const parts = value.split(',').map(p => p.trim()).filter(p => p);
  
  return (
    <div className="flex flex-wrap gap-1">
      {parts.map((part, index) => {
        let badgeClass = "bg-gray-100 text-gray-600";
        if (part.toLowerCase().includes('gf')) badgeClass = "bg-green-100 text-green-700";
        else if (part.toLowerCase().includes('df')) badgeClass = "bg-blue-100 text-blue-700";
        else if (part.toLowerCase().includes('vegan')) badgeClass = "bg-purple-100 text-purple-700";
        else if (part.toLowerCase().includes('other')) badgeClass = "bg-orange-100 text-orange-700";

        return (
          <Badge key={index} className={`${badgeClass} text-[10px] uppercase tracking-wider rounded-sm`}>
            {part}
          </Badge>
        );
      })}
    </div>
  );
};

export const DietaryCell: React.FC<DietaryCellProps> = ({
  initialValue = "",
  rowId,
  columnId,
  onSave,
  isEditing,
  setIsEditing,
}) => {
  const handleValueChange = (newValue: string) => {
    // The DietaryMultiSelect is now fully controlled and only calls onChange when the value changes internally.
    // We still need to check against initialValue to prevent unnecessary DB calls if the prop sync was delayed,
    // but the primary loop prevention is now in the controlled component pattern.
    if (newValue !== initialValue) {
      onSave(rowId, columnId, newValue);
    }
  };

  return (
    <div
      className="h-full w-full flex items-center px-2 py-1 cursor-pointer text-sm"
    >
      <DietaryMultiSelect
        value={initialValue}
        onChange={handleValueChange}
      />
    </div>
  );
};