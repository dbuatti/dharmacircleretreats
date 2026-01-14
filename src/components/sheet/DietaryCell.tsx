"use client";

import React, { useState, useEffect } from "react";
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
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = (newValue: string) => {
    if (newValue !== initialValue) {
      onSave(rowId, columnId, newValue);
    }
    // Note: We rely on the Popover's internal state management for closing the editor.
  };

  return (
    <div
      className="h-full w-full flex items-center px-2 py-1 cursor-pointer text-sm"
    >
      <DietaryMultiSelect
        value={value}
        onChange={handleSave}
      />
    </div>
  );
};