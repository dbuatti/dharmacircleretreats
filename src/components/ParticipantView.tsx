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

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  retreatId,
  participants,
  onAddParticipant,
  onUpdateParticipant,
  onDeleteParticipant,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      
      // Simple filter by attendance status for demo
      return matchesSearch && p.attendance_status === filterStatus;
    });
  }, [participants, searchTerm, filterStatus]);

  const handleSelect = (id: string, isSelected: boolean) => {
    setSelectedIds(prev => isSelected ? [...prev, id] : prev.filter(i => i !== id));
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) setSelectedIds(filteredParticipants.map(p => p.id));
    else setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} participants?`)) {
      selectedIds.forEach(id => onDeleteParticipant(id));
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search & Filter */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search name or email..." 
              className="pl-10 rounded-md h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 h-10 rounded-md text-xs font-medium">
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3" />
                <SelectValue placeholder="Filter" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle & Add */}
        <div className="flex gap-3 items-center">
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value: ViewMode) => value && setViewMode(value)}
            className="border border-gray-200 rounded-md p-1 bg-white"
          >
            <ToggleGroupItem value="card" className="h-8 w-8 data-[state=on]:bg-gray-900 data-[state=on]:text-white">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" className="h-8 w-8 data-[state=on]:bg-gray-900 data-[state=on]:text-white">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <AddParticipantDialog 
            onAdd={onAddParticipant} 
            retreatId={retreatId} 
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.length} selected
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleBulkDelete}
            className="h-7"
          >
            <Trash2 className="w-3 h-3 mr-2" />
            Delete
          </Button>
        </div>
      )}

      {/* Content */}
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