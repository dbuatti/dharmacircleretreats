"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

interface InlineInputProps {
  value: string | undefined;
  onSave: (newValue: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  className?: string;
  label?: string;
}

export const InlineInput: React.FC<InlineInputProps> = ({
  value: initialValue = '',
  onSave,
  placeholder = 'Click to edit',
  type = 'text',
  className,
  label,
}) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [isDirty, setIsDirty] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(initialValue);
    setIsDirty(false);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentValue(e.target.value);
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!isDirty) return;
    
    const trimmedValue = currentValue.trim();
    setIsDirty(false);
    onSave(trimmedValue);
    
    toast.success('Saved', { 
      duration: 1500,
      className: 'bg-green-50 text-green-800 border border-green-200'
    });
  };

  const handleBlur = () => {
    setIsFocused(false);
    handleSave();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      handleSave();
      // Move to next field
      const next = inputRef.current?.closest('td')?.nextElementSibling?.querySelector('input, textarea');
      if (next) {
        // FIX: Assert the type to HTMLInputElement or HTMLTextAreaElement
        (next as HTMLInputElement | HTMLTextAreaElement).focus();
      }
    }
    if (e.key === 'Escape') {
      setCurrentValue(initialValue);
      setIsDirty(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Tab') {
      handleSave();
    }
  };

  const InputComponent = type === 'textarea' ? Textarea : Input;

  return (
    <div className="relative group">
      <InputComponent
        ref={inputRef as any}
        value={currentValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={label}
        className={cn(
          "h-8 p-1.5 border-transparent bg-transparent rounded transition-all duration-200",
          "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:bg-white",
          "hover:bg-gray-50 hover:border-gray-200 hover:px-2",
          isFocused && "bg-white shadow-sm border-blue-500",
          !currentValue && "text-gray-400 italic",
          className
        )}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
        {isDirty && isFocused ? (
          <div className="flex gap-1">
            <Check className="w-3 h-3 text-green-500" />
            <span className="text-[10px] text-green-600 font-medium">Saving...</span>
          </div>
        ) : (
          <span className="opacity-0 group-hover:opacity-100 text-gray-400 text-[10px]">
            ✏️
          </span>
        )}
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}