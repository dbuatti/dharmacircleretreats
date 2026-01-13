"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface InlineInputProps {
  value: string | undefined;
  onSave: (newValue: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  className?: string;
}

export const InlineInput: React.FC<InlineInputProps> = ({
  value: initialValue = '',
  onSave,
  placeholder = 'Click to edit',
  type = 'text',
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync external value changes
  useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedValue = currentValue.trim();
    if (trimmedValue !== initialValue) {
      onSave(trimmedValue);
      toast.success('Saved', { duration: 1500 });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(initialValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    const InputComponent = type === 'textarea' ? Textarea : Input;
    return (
      <div className="relative flex items-center w-full group">
        <InputComponent
          ref={inputRef as any}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "h-8 text-sm p-2 border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md shadow-sm",
            type === 'textarea' ? 'min-h-[60px] resize-none' : 'h-9',
            className
          )}
        />
        <div className="absolute right-2 flex gap-1">
          <Check className="w-3 h-3 text-green-500 cursor-pointer" onClick={handleSave} />
          <X className="w-3 h-3 text-red-500 cursor-pointer" onClick={handleCancel} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative cursor-text rounded-md transition-all",
        "hover:bg-gray-50 hover:ring-1 hover:ring-gray-200 hover:px-2 hover:-mx-2",
        "border-b border-transparent hover:border-dashed hover:border-gray-300",
        "flex items-center min-h-[2rem]",
        className
      )}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      <span className={cn(
        "truncate",
        !currentValue && "text-gray-400 italic"
      )}>
        {currentValue || placeholder}
      </span>
      {/* Pencil icon on hover */}
      <span className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 text-xs">
        ✏️
      </span>
    </div>
  );
};

// Helper for Tailwind classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}