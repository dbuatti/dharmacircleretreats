"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineInputProps {
  value: string | undefined;
  onSave: (newValue: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  className?: string;
  readOnly?: boolean;
}

export const InlineInput: React.FC<InlineInputProps> = ({
  value: initialValue = '',
  onSave,
  placeholder = 'Click to edit',
  type = 'text',
  className,
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (currentValue !== initialValue) {
      onSave(currentValue);
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

  const displayValue = currentValue || placeholder;
  const isPlaceholder = !currentValue;

  if (readOnly) {
    return (
      <div className={cn("py-1 px-0 text-sm", className, isPlaceholder ? 'text-gray-400 italic' : 'text-gray-700')}>
        {displayValue}
      </div>
    );
  }

  if (isEditing) {
    const InputComponent = type === 'textarea' ? Textarea : Input;
    return (
      <div className="flex items-center space-x-2 w-full">
        <InputComponent
          ref={inputRef as any}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "h-8 text-sm p-1 border-blue-300 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm",
            type === 'textarea' ? 'min-h-[60px] resize-none' : 'h-8',
            className
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative py-1 px-0 cursor-pointer transition-all hover:bg-gray-50/50 rounded-sm",
        className
      )}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      <span className={cn("text-sm", isPlaceholder ? 'text-gray-400 italic' : 'text-gray-700')}>
        {displayValue}
      </span>
      <Edit className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};