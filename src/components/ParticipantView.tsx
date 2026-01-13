"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Participant } from "@/types";
import { Search, LayoutGrid, List, Filter, Plus, Trash2, CheckCheck, Send, MessageSquare, UserPlus, DollarSign, Utensils } from "lucide-react";
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
import { toast } from "sonner";

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
  const [viewMode, setViewMode] = useState<ViewMode>('table'); // Default to table for power users
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // --- Filtering Logic ---
  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      
      // Advanced filters
      if (filterStatus === 'unpaid') return matchesSearch && p.payment_status === 'not_paid';
      if (filterStatus === 'no_eta') return matchesSearch && !p.eta;
      if (filterStatus === 'no_whatsapp') return matchesSearch && (p.whatsapp_status === 'not_invited' || !p.whatsapp_status);
      
      return matchesSearch && p.attendance_status === filterStatus;
    });
  }, [participants, searchTerm, filterStatus]);

  // --- Selection Logic (with Shift-Click) ---
  const handleSelect = (id: string, isSelected: boolean, shiftKey: boolean) => {
    if (shiftKey && lastSelectedIndex !== null) {
      // Range selection
      const currentIndex = filteredParticipants.findIndex(p => p.id === id);
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      
      const rangeIds = filteredParticipants.slice(start, end + 1).map(p => p.id);
      const newSelectedIds = new Set(selectedIds);
      
      if (isSelected) {
        rangeIds.forEach(id => newSelectedIds.add(id));
      } else {
        rangeIds.forEach(id => newSelectedIds.delete(id));
      }
      
      setSelectedIds(Array.from(newSelectedIds));
    } else {
      // Single selection
      setSelectedIds(prev => 
        isSelected ? [...prev, id] : prev.filter(i => i !== id)
      );
    }
    
    // Update last selected index
    const currentIndex = filteredParticipants.findIndex(p => p.id === id);
    setLastSelectedIndex(currentIndex);
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedIds(filteredParticipants.map(p => p.id));
      setLastSelectedIndex(0);
    } else {
      setSelectedIds([]);
      setLastSelectedIndex(null);
    }
  };

  // --- Bulk Actions ---
  const handleBulkUpdate = (field: keyof Participant, value: any) => {
    selectedIds.forEach(id => onUpdateParticipant(id, { [field]: value }));
    toast.success(`Updated ${selectedIds.length} participants`);
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.length} participants?`)) {
      selectedIds.forEach(id => onDeleteParticipant(id));
      setSelectedIds([]);
      toast.error(`${selectedIds.length} participants deleted`);
    }
  };

  // --- Hotkeys ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if (e.key === 'n') {
        e.preventDefault();
        // Trigger add dialog (assuming it's accessible via ref or state)
        // For now, we'll just log as we can't easily trigger the dialog from here without a ref
        toast.info("Press 'Add Participant' button or click in the empty space");
      }
      if (e.key === 'd' && selectedIds.length > 0) {
        e.preventDefault();
        handleBulkDelete();
      }
      if (e.key === 'Escape') {
        setSelectedIds([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, filteredParticipants]);

  // --- Stats ---
  const stats = {
    total: participants.length,
    unpaid: participants.filter(p => p.payment_status === 'not_paid').length,
    noEta: participants.filter(p => !p.eta).length,
    noWhatsApp: participants.filter(p => p.whatsapp_status === 'not_invited' || !p.whatsapp_status).length,
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Filters, View Toggle, Add */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              id="search-input"
              placeholder="Search (Press /)" 
              className="pl-10 rounded-md h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44 h-10 rounded-md text-xs font-medium">
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3" />
                <SelectValue placeholder="Filter" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Participants</SelectItem>
              <SelectItem value="unpaid">💰 Unpaid</SelectItem>
              <SelectItem value="no_eta">⏰ No ETA</SelectItem>
              <SelectItem value="no_whatsapp">💬 No WhatsApp</SelectItem>
              <SelectItem value="confirmed">✅ Confirmed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 items-center">
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value: ViewMode) => value && setViewMode(value)}
            className="border border-gray-200 rounded-md p-1 bg-white"
          >
            <ToggleGroupItem value="card" aria-label="Card View" className="h-8 w-8 data-[state=on]:bg-[#1e2a5e] data-[state=on]:text-white">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table View" className="h-8 w-8 data-[state=on]:bg-[#1e2a5e] data-[state=on]:text-white">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <AddParticipantDialog 
            onAdd={onAddParticipant} 
            retreatId={retreatId} 
          />
        </div>
      </div>

      {/* Bulk Actions Toolbar (Floating) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4">
          <span className="font-bold text-sm">{selectedIds.length} selected</span>
          <div className="h-4 w-px bg-gray-700"></div>
          
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-3 hover:bg-gray-700 text-white"
              onClick={() => handleBulkUpdate('attendance_status', 'confirmed')}
            >
              <CheckCheck className="w-3 h-3 mr-1" /> Confirm
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-3 hover:bg-gray-700 text-white"
              onClick={() => handleBulkUpdate('payment_status', 'not_paid')}
            >
              <DollarSign className="w-3 h-3 mr-1" /> Mark Unpaid
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-3 hover:bg-gray-700 text-white"
              onClick={() => handleBulkUpdate('whatsapp_status', 'invited')}
            >
              <MessageSquare className="w-3 h-3 mr-1" /> Invite WhatsApp
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-3 hover:bg-gray-700 text-white"
              onClick={() => handleBulkUpdate('accommodation_plan', 'camping')}
            >
              <UserPlus className="w-3 h-3 mr-1" /> Set Camping
            </Button>
          </div>

          <div className="h-4 w-px bg-gray-700"></div>
          <Button 
            size="sm" 
            variant="destructive" 
            className="h-7 px-3 bg-red-600 hover:bg-red-700 text-white"
            onClick={handleBulkDelete}
          >
            <Trash2 className="w-3 h-3" />
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

      {/* Global Totals Footer */}
      <div className="flex flex-wrap gap-6 text-xs text-gray-500 border-t pt-6 pb-2">
        <span className="font-semibold text-gray-900">Total: {stats.total}</span>
        <span className={stats.unpaid > 0 ? "text-red-600 font-medium" : ""}>Unpaid: {stats.unpaid}</span>
        <span className={stats.noEta > 0 ? "text-orange-600 font-medium" : ""}>No ETA: {stats.noEta}</span>
        <span className={stats.noWhatsApp > 0 ? "text-blue-600 font-medium" : ""}>No WhatsApp: {stats.noWhatsApp}</span>
      </div>
    </div>
  );
};