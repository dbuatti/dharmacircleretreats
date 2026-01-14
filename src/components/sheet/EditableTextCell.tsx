"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Participant } from "@/types";
import { cn } from "@/lib/utils";

interface EditableTextCellProps {
  initialValue: string | undefined | null; // Allow null from DB
  rowId: string;
  columnId: keyof Participant;
  onSave: (id: string, columnId: keyof Participant, value: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  className?: string;
}

const safeString = (value: string | undefined | null): string => value ?? "";

export const EditableTextCell: React.FC<EditableTextCellProps> = ({
  initialValue,
  rowId,
  columnId,
  onSave,
  isEditing,
  setIsEditing,
  className
}) => {
  // Use local state for editing value
  const [value, setValue] = useState(safeString(initialValue));
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state when initialValue changes (only when not editing)
  useEffect(() => {
    if (!isEditing) {
      setValue(safeString(initialValue));
    }
  }, [initialValue, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    const finalValue = value.trim();
    if (finalValue !== safeString(initialValue)) {
      console.log(`[EditableTextCell] Saving change for ${columnId}: ${safeString(initialValue)} -> ${finalValue}`);
      onSave(rowId, columnId, finalValue);
    }
    setIsEditing(false);
  };

  const handleBlur = () => {
    if (isEditing) {
      handleSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setValue(safeString(initialValue)); // Revert changes
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-full w-full p-1 text-sm border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0 rounded-none",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn("h-full w-full flex items-center px-2 py-1 cursor-pointer text-sm", className)}
      onClick={() => setIsEditing(true)}
    >
      {safeString(initialValue) || <span className="text-gray-400 italic">N/A</span>}
    </div>
  );
};