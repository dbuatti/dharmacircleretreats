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
  const otherInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Parse initial value and extract 'Other' text
    const tagsArray = getTagsArray(initialValue);
    const otherTag = tagsArray.find(t => t.startsWith('Other:'));
    
    if (otherTag) {
      setOtherText(otherTag.replace('Other: ', ''));
      // Ensure the main value string doesn't contain the 'Other' tag text in the state if we are managing it separately
      setCurrentValue(tagsArray.filter(t => t !== otherTag).join(', '));
    } else {
      setOtherText('');
      setCurrentValue(initialValue);
    }
  }, [initialValue]);

  // Parse current value into array (excluding the 'Other' tag which is managed by otherText)
  const getTagsArray = (val: string) => {
    return val.split(',')
      .map(t => t.trim())
      .filter(t => t && !t.startsWith('Other:'));
  };

  const tags = getTagsArray(currentValue);
  const allTags = otherText ? [...tags, `Other: ${otherText}`] : tags;

  // Check if specific tags are present
  const hasTag = (tag: string) => tags.some(t => t.toUpperCase() === tag.toUpperCase());

  const updateValue = (newTags: string[], newOtherText: string = otherText) => {
    const finalTags = [...newTags];
    if (newOtherText.trim()) {
      finalTags.push(`Other: ${newOtherText.trim()}`);
    }
    
    const newValue = finalTags.join(', ');
    
    // Update local state for rendering chips
    setCurrentValue(newTags.join(', '));
    setOtherText(newOtherText);
    
    // Save to parent
    onSave(newValue);
    toast.success("Dietary updated");
  };

  const toggleTag = (tag: string) => {
    let newTags = tags;
    if (hasTag(tag)) {
      // Remove tag
      newTags = newTags.filter(t => t.toUpperCase() !== tag.toUpperCase());
    } else {
      // Add tag
      newTags = [...newTags, tag];
    }
    updateValue(newTags);
  };

  const handleOtherSave = () => {
    const trimmedText = otherText.trim();
    
    if (!trimmedText) {
      // If text is cleared, remove the 'Other' tag
      updateValue(tags, '');
      setShowOtherInput(false);
      return;
    }
    
    // Update value with the new other text
    updateValue(tags, trimmedText);
    
    // Keep focus on the input if they want to add another
    if (otherInputRef.current) {
      otherInputRef.current.focus();
    }
  };

  // Render the dropdown content
  const DropdownContent = () => (
    <SelectContent>
      {/* CRITICAL FIX: Use onMouseDown to prevent the Select component from closing on click inside the content area */}
      <div onMouseDown={(e) => e.preventDefault()}>
        
        {/* GF */}
        <SelectItem value="gf" onSelect={(e) => { e.preventDefault(); toggleTag('GF'); }}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasTag('GF') ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            Gluten Free (GF)
          </div>
        </SelectItem>
        
        {/* DF */}
        <SelectItem value="df" onSelect={(e) => { e.preventDefault(); toggleTag('DF'); }}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasTag('DF') ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            Dairy Free (DF)
          </div>
        </SelectItem>
        
        {/* Vegan */}
        <SelectItem value="vegan" onSelect={(e) => { e.preventDefault(); toggleTag('Vegan'); }}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasTag('Vegan') ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            Vegan
          </div>
        </SelectItem>
        
        {/* Other */}
        <SelectItem value="other" onSelect={(e) => { 
          e.preventDefault(); 
          setShowOtherInput(true); 
          // Focus the input after the DOM updates
          setTimeout(() => otherInputRef.current?.focus(), 50);
        }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            Other (Custom)
          </div>
        </SelectItem>
      </div>
    </SelectContent>
  );

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-2 bg-white border rounded-md shadow-sm">
        <Select 
          // Force open when editing
          open={true} 
          // When the select closes (e.g., user clicks outside), stop editing
          onOpenChange={(open) => {
            if (!open) {
              setIsEditing(false);
              setShowOtherInput(false);
              handleOtherSave(); // Ensure last input is saved on close
            }
          }}
          // CRITICAL FIX: Prevent Select from trying to manage value change on its own
          value={undefined} 
          onValueChange={() => {}}
        >
          <SelectTrigger className="w-full border-0 bg-gray-50">
            <SelectValue placeholder="Select dietary..." />
          </SelectTrigger>
          <DropdownContent />
        </Select>
        
        {(showOtherInput || otherText) && (
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
              onBlur={handleOtherSave}
              className="h-7 text-xs"
            />
            <button 
              onClick={handleOtherSave}
              className="px-2 bg-green-600 text-white rounded text-xs"
            >
              Save
            </button>
          </div>
        )}

        {/* Current Selection Chips */}
        <div className="flex flex-wrap gap-1 mt-1">
          {allTags.map((tag, idx) => (
            <Badge 
              key={idx} 
              variant="secondary" 
              className="text-[10px] cursor-pointer hover:bg-red-100 hover:text-red-700"
              onClick={() => {
                if (tag.startsWith('Other:')) {
                  // Remove 'Other' tag
                  updateValue(tags, '');
                  setShowOtherInput(false);
                } else {
                  toggleTag(tag);
                }
              }}
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
      {allTags.length > 0 ? (
        allTags.map((tag, idx) => (
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