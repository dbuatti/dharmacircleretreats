"use client";

import React, { useState, useEffect } from "react";
import { Participant } from "@/types";
import { DietaryMultiSelect } from "../DietaryMultiSelect";
import { Badge } from "@/components/ui/badge";
import { Utensils, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DietaryCellProps {
  initialValue: string | undefined;
  rowId: string;
  columnId: keyof Participant;
  onSave: (id: string, columnId: keyof Participant, value: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isSaving: boolean; // New prop
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
  isSaving, // Use new prop
}) => {
  // Local state to hold value during editing
  const [localValue, setLocalValue] = useState(initialValue);

  // 1. Sync local state when initialValue changes (only when not editing)
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(initialValue);
    }
  }, [initialValue, isEditing]);

  // 2. Handle saving when editing state changes from true to false
  useEffect(() => {
    // Only save if the popover is closing AND the value has changed
    if (!isEditing && localValue !== initialValue) {
      console.log(`[DietaryCell] Saving change for ${columnId}: ${initialValue} -> ${localValue}`);
      onSave(rowId, columnId, localValue);
    }
  }, [isEditing, localValue, initialValue, onSave, rowId, columnId]);

  // 3. Handle Popover open/close state synchronization
  const handleOpenChange = (open: boolean) => {
    // If the popover is closing, set isEditing to false, which triggers the save via useEffect (step 2)
    if (!open) {
      setIsEditing(false);
    }
  };

  // Display mode
  if (!isEditing) {
    return (
      <div
        className="h-full w-full flex items-center px-2 py-1 cursor-pointer text-sm justify-between"
        onClick={() => setIsEditing(true)}
      >
        <div className={cn("flex-1", isSaving && "opacity-50")}>
          {getDietaryBadges(initialValue)}
        </div>
        {isSaving && <Loader2 className="w-3 h-3 animate-spin text-blue-500 ml-2 shrink-0" />}
      </div>
    );
  }

  // Editing mode
  return (
    <div className="h-full w-full flex items-center px-2 py-1 bg-white">
      <DietaryMultiSelect
        value={localValue}
        onChange={setLocalValue} // Update local state immediately
        onOpenChange={handleOpenChange} // Control external editing state
        open={isEditing} // Force open when editing
        disabled={isSaving}
      />
    </div>
  );
};