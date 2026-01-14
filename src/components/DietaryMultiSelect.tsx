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

export const DietaryMultiSelect: React.FC<DietaryMultiSelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");

  // Effect 1: Sync Prop -> State (Robust Parsing)
  useEffect(() => {
    let currentSelected: string[] = [];
    let currentCustomText = "";
    const predefinedValues = DIETARY_OPTIONS.map(o => o.value);

    if (value) {
      // Split and trim parts, keeping original case for custom text extraction
      const parts = value.split(',').map(p => p.trim()).filter(p => p);
      
      parts.forEach(part => {
        const lowerPart = part.toLowerCase();
        
        if (predefinedValues.includes(lowerPart) && !currentSelected.includes(lowerPart)) {
          // Case 1: Predefined option (e.g., 'gf', 'vegan')
          currentSelected.push(lowerPart);
        } else if (lowerPart.startsWith('other:')) {
          // Case 2: 'other: custom text' format
          if (!currentSelected.includes('other')) {
            currentSelected.push('other');
          }
          // Extract text after 'other:'
          currentCustomText = part.substring('other:'.length).trim();
        }
      });
      
      // Fallback: If 'other' is selected but no 'other:' prefix was found, 
      // check for any non-predefined parts that might be the custom text (e.g., old format or simple entry)
      if (currentSelected.includes('other') && !currentCustomText) {
          const nonPredefinedParts = parts.filter(p => !predefinedValues.includes(p.toLowerCase()));
          if (nonPredefinedParts.length > 0) {
              currentCustomText = nonPredefinedParts.join(', ');
          }
      }
    }
    
    // Optimization: Only update state if the parsed value is different from the current state
    
    const currentSelectedString = JSON.stringify(currentSelected.sort());
    const localSelectedString = JSON.stringify(selectedValues.sort());

    if (currentSelectedString !== localSelectedString) {
        setSelectedValues(currentSelected);
    }
    
    if (currentCustomText !== customText) {
        setCustomText(currentCustomText);
    }

  }, [value]); // Dependency on value only

  // Effect 2: Sync State -> Prop
  useEffect(() => {
    // Combine selected values and custom text into the output string
    let outputParts = selectedValues.filter(v => v !== 'other');
    
    if (selectedValues.includes("other")) {
      if (customText.trim()) {
        outputParts.push(`other: ${customText.trim()}`);
      } else {
        outputParts.push('other');
      }
    }

    const output = outputParts.join(', ');

    // Only call onChange if the derived output is different from the current prop value
    if (output !== value) {
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
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between rounded-none border-0 border-b border-gray-200 px-0 h-10 focus:ring-0 focus:border-[#1e2a5e] bg-transparent text-left"
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
                    <Label htmlFor={`dietary-${option.value}`} className="flex-1 cursor-pointer">
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
        </PopoverContent>
      </Popover>
      
      {selectedValues.includes("other") && (
        <div className="space-y-1 pt-2">
          <Label htmlFor="custom-dietary" className="text-[10px] uppercase tracking-widest text-gray-500">
            Specify "Other"
          </Label>
          <Input
            id="custom-dietary"
            placeholder="e.g., Nut allergy, Low FODMAP"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10 transition-colors"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};