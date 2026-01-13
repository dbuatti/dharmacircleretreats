"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

interface DietarySelectProps {
  value: string | undefined; // Comma-separated string "GF, DF, Other: Nuts"
  onSave: (newValue: string) => void;
  className?: string;
}

export const DietarySelect: React.FC<DietarySelectProps> = ({
  value: initialValue = '',
  onSave,
  className,
}) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const otherInputRef = useRef<HTMLInputElement>(null);

  // Parse initial value into array
  const getTagsArray = (val: string) => {
    return val.split(',').map(t => t.trim()).filter(t => t);
  };

  const tags = getTagsArray(currentValue);

  // Check if specific tags are present
  const hasTag = (tag: string) => tags.some(t => t.toUpperCase() === tag.toUpperCase());

  const toggleTag = (tag: string) => {
    if (hasTag(tag)) {
      // Remove tag
      const newTags = tags.filter(t => t.toUpperCase() !== tag.toUpperCase());
      updateValue(newTags);
    } else {
      // Add tag
      updateValue([...tags, tag]);
    }
  };

  const handleOtherSave = () => {
    if (!otherText.trim()) {
      setShowOtherInput(false);
      return;
    }
    const newTag = `Other: ${otherText.trim()}`;
    // Check if this specific "Other" tag already exists
    if (!tags.some(t => t.startsWith('Other:'))) {
      updateValue([...tags, newTag]);
    } else {
      // Replace existing "Other" tag
      const newTags = tags.filter(t => !t.startsWith('Other:'));
      updateValue([...newTags, newTag]);
    }
    setOtherText('');
    setShowOtherInput(false);
    // Keep focus on the input if they want to add another
    if (otherInputRef.current) {
      otherInputRef.current.focus();
    }
  };

  const updateValue = (newTags: string[]) => {
    const newValue = newTags.join(', ');
    setCurrentValue(newValue);
    onSave(newValue);
    toast.success("Dietary updated");
  };

  // Render the dropdown content
  const DropdownContent = () => (
    <SelectContent>
      <SelectItem value="gf" onClick={() => toggleTag('GF')}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${hasTag('GF') ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          Gluten Free (GF)
        </div>
      </SelectItem>
      <SelectItem value="df" onClick={() => toggleTag('DF')}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${hasTag('DF') ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          Dairy Free (DF)
        </div>
      </SelectItem>
      <SelectItem value="vegan" onClick={() => toggleTag('Vegan')}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${hasTag('Vegan') ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          Vegan
        </div>
      </SelectItem>
      <SelectItem value="other" onClick={() => {
        setShowOtherInput(true);
        // Focus the input after the DOM updates
        setTimeout(() => otherInputRef.current?.focus(), 50);
      }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          Other (Custom)
        </div>
      </SelectItem>
    </SelectContent>
  );

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-2 bg-white border rounded-md shadow-sm">
        <Select 
          open={true} 
          onOpenChange={(open) => {
            if (!open) {
              setIsEditing(false);
              setShowOtherInput(false);
            }
          }}
        >
          <SelectTrigger className="w-full border-0 bg-gray-50">
            <SelectValue placeholder="Select dietary..." />
          </SelectTrigger>
          <DropdownContent />
        </Select>
        
        {showOtherInput && (
          <div className="flex gap-1 animate-in fade-in slide-in-from-top-1">
            <Input 
              ref={otherInputRef}
              placeholder="Enter allergy/restriction..." 
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleOtherSave();
                }
              }}
              className="h-7 text-xs"
            />
            <button 
              onClick={handleOtherSave}
              className="px-2 bg-green-600 text-white rounded text-xs"
            >
              Add
            </button>
          </div>
        )}

        {/* Current Selection Chips */}
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((tag, idx) => (
            <Badge 
              key={idx} 
              variant="secondary" 
              className="text-[10px] cursor-pointer hover:bg-red-100 hover:text-red-700"
              onClick={() => toggleTag(tag)}
              title="Click to remove"
            >
              {tag} ×
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  // View Mode (Read-only with hover edit)
  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer group relative rounded-md transition-all",
        "hover:bg-gray-50 hover:ring-1 hover:ring-gray-200 hover:px-2 hover:-mx-2",
        "border-b border-transparent hover:border-dashed hover:border-gray-300",
        "flex items-center min-h-[2rem] gap-1 flex-wrap",
        className
      )}
      title="Click to edit dietary requirements"
    >
      {tags.length > 0 ? (
        tags.map((tag, idx) => (
          <span key={idx} className="text-xs bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">
            {tag}
          </span>
        ))
      ) : (
        <span className="text-gray-400 italic text-xs">None</span>
      )}
      <span className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 text-xs">
        ✏️
      </span>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}