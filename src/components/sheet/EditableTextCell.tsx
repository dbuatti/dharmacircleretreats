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
  const [value, setValue] = useState(safeString(initialValue));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(safeString(initialValue));
  }, [initialValue]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    if (isEditing) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (value !== safeString(initialValue)) {
      console.log(`[EditableTextCell] Saving change for ${columnId}: ${safeString(initialValue)} -> ${value}`);
      onSave(rowId, columnId, value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
      // Note: Tab/Shift+Tab navigation logic is handled by the browser's default focus behavior
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