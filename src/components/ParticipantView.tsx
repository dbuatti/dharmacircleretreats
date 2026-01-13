"use client";

import React, { useState, useMemo } from "react";
import { Participant } from "@/types";
import { Search, LayoutGrid, List, Filter, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ParticipantCardView } from "./ParticipantCardView";
import { ParticipantTableView } from "./ParticipantTableView";
import { AddParticipantDialog } from "./AddParticipantDialog";

interface ParticipantViewProps {
  retreatId: string;
  participants: Participant[];
  onAddParticipant: (p: Partial<Participant>) => void;
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => void;
  onDeleteParticipant: (id: string) => void;
}

type ViewMode = 'card' | 'table';
type FilterKey = 'all' | 'attendance_status' | 'payment_status' | 'whatsapp_status';

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  retreatId,
  participants,
  onAddParticipant,
  onUpdateParticipant,
  onDeleteParticipant,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKey, setFilterKey] = useState<FilterKey>('all');
  const [filterValue, setFilterValue] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredParticipants = useMemo(() => {
    let filtered = participants.filter(p => {
      const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterKey === 'all' || filterValue === 'all') {
        return matchesSearch;
      }

      // Dynamic filtering based on selected key
      const pValue = p[filterKey as keyof Participant];
      return matchesSearch && pValue === filterValue;
    });
    return filtered;
  }, [participants, searchTerm, filterKey, filterValue]);

  const handleSelect = (id: string, isSelected: boolean) => {
    setSelectedIds(prev => 
      isSelected ? [...prev, id] : prev.filter(i => i !== id)
    );
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedIds(filteredParticipants.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} participants?`)) {
      selectedIds.forEach(id => onDeleteParticipant(id));
      setSelectedIds([]);
    }
  };

  const filterOptions = [
    { key: 'all', label: 'All Statuses', options: [{ value: 'all', label: 'All Participants' }] },
    { key: 'attendance_status', label: 'Attendance Status', options: [
      { value: 'all', label: 'All Attendance' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'interested', label: 'Interested' },
      { value: 'withdrawn', label: 'Withdrawn' },
    ]},
    { key: 'payment_status', label: 'Payment Status', options: [
      { value: 'all', label: 'All Payments' },
      { value: 'paid_in_full', label: 'Paid in Full' },
      { value: 'deposit_paid', label: 'Deposit Paid' },
      { value: 'not_paid', label: 'Not Paid' },
    ]},
    { key: 'whatsapp_status', label: 'WhatsApp Status', options: [
      { value: 'all', label: 'All WhatsApp' },
      { value: 'joined', label: 'Joined' },
      { value: 'invited', label: 'Invited' },
      { value: 'not_invited', label: 'Not Invited' },
    ]},
  ];

  const currentFilterGroup = filterOptions.find(f => f.key === filterKey) || filterOptions[0];

  return (
    <div className="space-y-8">
      {/* Top Bar: Search, Filter, View Toggle, Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search & Filter */}
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search name or email..." 
              className="pl-10 rounded-md h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select 
            value={`${filterKey}:${filterValue}`} 
            onValueChange={(val) => {
              const [key, value] = val.split(':') as [FilterKey, string];
              setFilterKey(key);
              setFilterValue(value);
            }}
          >
            <SelectTrigger className="w-full md:w-48 h-10 rounded-md text-[10px] uppercase tracking-widest font-medium">
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3" />
                <SelectValue placeholder="Filter Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map(group => (
                <React.Fragment key={group.key}>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.label}
                  </div>
                  {group.options.map(option => (
                    <SelectItem key={option.value} value={`${group.key}:${option.value}`}>
                      {option.label}
                    </SelectItem>
                  ))}
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle & Add Button */}
        <div className="flex gap-4 items-center">
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value: ViewMode) => value && setViewMode(value)}
            className="border border-gray-200 rounded-md p-1"
          >
            <ToggleGroupItem value="card" aria-label="Toggle card view" className="h-8 w-8 p-0 data-[state=on]:bg-[#1e2a5e] data-[state=on]:text-white">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Toggle table view" className="h-8 w-8 p-0 data-[state=on]:bg-[#1e2a5e] data-[state=on]:text-white">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <AddParticipantDialog 
            onAdd={onAddParticipant} 
            retreatId={retreatId} 
          />
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md flex items-center justify-between transition-all duration-300">
          <span className="text-sm text-blue-800 font-medium">
            {selectedIds.length} participant{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleBulkDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Content Area */}
      {viewMode === 'card' ? (
        <ParticipantCardView
          participants={filteredParticipants}
          onUpdate={onUpdateParticipant}
          onDelete={onDeleteParticipant}
        />
      ) : (
        <ParticipantTableView
          participants={filteredParticipants}
          onUpdate={onUpdateParticipant}
          onDelete={onDeleteParticipant}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
        />
      )}
    </div>
  );
};