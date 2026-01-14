"use client";

import React, { useState, useEffect } from "react";
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
}

// Helper function to parse the comma-separated string into internal state
const parseValue = (value: string) => {
  let currentSelected: string[] = [];
  let currentCustomText = "";
  const predefinedValues = DIETARY_OPTIONS.map(o => o.value);

  if (value) {
    const parts = value.split(',').map(p => p.trim()).filter(p => p);
    
    parts.forEach(part => {
      const lowerPart = part.toLowerCase();
      
      if (predefinedValues.includes(lowerPart) && !currentSelected.includes(lowerPart)) {
        currentSelected.push(lowerPart);
      } else if (lowerPart.startsWith('other:')) {
        if (!currentSelected.includes('other')) {
          currentSelected.push('other');
        }
        currentCustomText = part.substring('other:'.length).trim();
      } else if (!predefinedValues.includes(lowerPart) && currentSelected.includes('other')) {
        // If 'other' is selected, collect all non-predefined parts as custom text
        currentCustomText = (currentCustomText ? currentCustomText + ', ' : '') + part;
      }
    });
    
    // Final cleanup for custom text if 'other' is selected but wasn't explicitly parsed with 'other:' prefix
    if (currentSelected.includes('other') && !currentCustomText) {
        const nonPredefinedParts = parts.filter(p => !predefinedValues.includes(p.toLowerCase()));
        if (nonPredefinedParts.length > 0) {
            currentCustomText = nonPredefinedParts.join(', ');
        }
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
      outputParts.push('other');
    }
  }

  return outputParts.join(', ');
};


export const DietaryMultiSelect: React.FC<DietaryMultiSelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  
  // Ref to track if the change originated internally
  const isInternalChange = React.useRef(false);

  // Effect 1: Sync Prop -> State (Only run when external prop changes)
  useEffect(() => {
    // If the last change was internal, skip synchronization to prevent loop
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    
    const { selectedValues: newSelected, customText: newCustom } = parseValue(value);
    
    setSelectedValues(newSelected);
    setCustomText(newCustom);
  }, [value]);

  // Effect 2: Sync State -> Prop (Only run when internal state changes)
  useEffect(() => {
    const output = formatValue(selectedValues, customText);

    if (output !== value) {
      isInternalChange.current = true;
      onChange(output);
    }
  }, [selectedValues, customText, onChange, value]);


  const handleSelect = (optionValue: string) => {
    setSelectedValues(prev => {
      if (prev.includes(optionValue)) {
        return prev.filter(v => v !== optionValue);
      } else {
        return [...prev, optionValue];
      }
    });
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
                onChange={(e) => setCustomText(e.target.value)}
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