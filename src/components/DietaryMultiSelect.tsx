"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DIETARY_OPTIONS = [
  { value: "gf", label: "Gluten Free (GF)" },
  { value: "df", label: "Dairy Free (DF)" },
  { value: "vegan", label: "Vegan" },
  { value: "other", label: "Other (Specify)" },
];

interface DietaryMultiSelectProps {
  value: string; // Comma-separated string of selected options + custom text
  onChange: (value: string) => void;
  disabled?: boolean;
  // Props to make it controllable by parent (for table editing)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Helper function to parse the comma-separated string into internal state structure
const parseValue = (value: string) => {
  let currentSelected: string[] = [];
  let currentCustomText = "";
  // Exclude 'other' itself from simple matching
  const predefinedValues = DIETARY_OPTIONS.map(o => o.value).filter(v => v !== 'other'); 

  if (value) {
    const parts = value.split(',').map(p => p.trim()).filter(p => p);
    const customParts: string[] = [];
    let otherSelected = false;

    parts.forEach(part => {
      const lowerPart = part.toLowerCase();
      
      if (predefinedValues.includes(lowerPart)) {
        if (!currentSelected.includes(lowerPart)) {
          currentSelected.push(lowerPart);
        }
      } else if (lowerPart === 'other') {
        otherSelected = true;
      } else if (lowerPart.startsWith('other:')) {
        otherSelected = true;
        currentCustomText = part.substring('other:'.length).trim();
      } else {
        // Anything else is treated as custom text
        customParts.push(part);
      }
    });
    
    // If we found custom parts that weren't prefixed with 'other:', combine them and select 'other'
    if (customParts.length > 0) {
        otherSelected = true;
        // If we already extracted text from 'other:', append the new custom parts
        currentCustomText = currentCustomText 
            ? `${currentCustomText}, ${customParts.join(', ')}` 
            : customParts.join(', ');
    }
    
    if (otherSelected && !currentSelected.includes('other')) {
        currentSelected.push('other');
    }
  }
  
  return { selectedValues: currentSelected, customText: currentCustomText };
};

// Helper function to format internal state back into the comma-separated string
const formatValue = (selectedValues: string[], customText: string) => {
  let outputParts = selectedValues.filter(v => v !== 'other');
  
  if (selectedValues.includes("other")) {
    if (customText.trim()) {
      outputParts.push(`other: ${customText.trim()}`);
    } else {
      // If 'other' is selected but no text is provided, just include 'other'
      outputParts.push('other');
    }
  }

  return outputParts.join(', ');
};


export const DietaryMultiSelect: React.FC<DietaryMultiSelectProps> = ({
  value,
  onChange,
  disabled = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  // Internal state for Popover if not controlled externally
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = controlledOnOpenChange || setUncontrolledOpen;

  // Derive state from the external value prop
  const { selectedValues, customText } = useMemo(() => parseValue(value), [value]);

  const handleSelect = (optionValue: string) => {
    let newSelected: string[];
    
    if (selectedValues.includes(optionValue)) {
      newSelected = selectedValues.filter(v => v !== optionValue);
    } else {
      newSelected = [...selectedValues, optionValue];
    }
    
    // Format and call onChange immediately
    const newOutput = formatValue(newSelected, customText);
    onChange(newOutput);
  };
  
  const handleCustomTextChange = (newCustomText: string) => {
    // Format and call onChange immediately
    const newOutput = formatValue(selectedValues, newCustomText);
    onChange(newOutput);
  };

  const displayValue = selectedValues.map(v => {
    const option = DIETARY_OPTIONS.find(o => o.value === v);
    return option ? option.label.replace(/\s\(.*\)/, '') : v;
  }).join(', ');

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between rounded-none border-0 border-b border-gray-200 px-0 h-full min-h-[36px] focus:ring-0 focus:border-[#1e2a5e] bg-transparent text-left"
            disabled={disabled}
          >
            <div className="flex items-center gap-2 truncate">
                <Utensils className="w-4 h-4 text-gray-400" />
                <span className={cn("text-sm", selectedValues.length === 0 ? "text-gray-400 italic" : "text-gray-800")}>
                    {selectedValues.length > 0 ? displayValue : "Select dietary requirements..."}
                </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandGroup>
              {DIETARY_OPTIONS.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2 w-full">
                    <Checkbox
                      checked={selectedValues.includes(option.value)}
                      onCheckedChange={() => handleSelect(option.value)}
                      id={`dietary-${option.value}`}
                    />
                    <Label htmlFor={`dietary-${option.value}`} className="flex-1 cursor-pointer text-sm">
                      {option.label}
                    </Label>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
          
          {selectedValues.includes("other") && (
            <div className="p-2 border-t">
              <Input
                id="custom-dietary"
                placeholder="Specify 'Other' requirements..."
                value={customText}
                onChange={(e) => handleCustomTextChange(e.target.value)}
                className="h-8 text-sm"
                disabled={disabled}
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};