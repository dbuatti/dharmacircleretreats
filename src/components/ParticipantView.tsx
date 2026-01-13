"use client";

import React, { useState, useMemo } from "react";
import { Participant } from "@/types";
import { Search, LayoutGrid, List, Filter } from "lucide-react";
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
import { ParticipantsTable } from "./ParticipantsTable";
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
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      
      if (filterStatus === 'unpaid') return matchesSearch && p.payment_status === 'not_paid';
      if (filterStatus === 'no_eta') return matchesSearch && !p.eta;
      if (filterStatus === 'no_whatsapp') return matchesSearch && (p.whatsapp_status === 'not_invited' || !p.whatsapp_status);
      
      return matchesSearch && p.attendance_status === filterStatus;
    });
  }, [participants, searchTerm, filterStatus]);

  // --- Stats ---
  const stats = {
    total: participants.length,
    unpaid: participants.filter(p => p.payment_status === 'not_paid').length,
    noEta: participants.filter(p => !p.eta).length,
    noWhatsApp: participants.filter(p => p.whatsapp_status === 'not_invited' || !p.whatsapp_status).length,
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
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

      {/* Content */}
      {viewMode === 'card' ? (
        <ParticipantCardView
          participants={filteredParticipants}
          onUpdate={onUpdateParticipant}
          onDelete={onDeleteParticipant}
        />
      ) : (
        <ParticipantsTable
          participants={filteredParticipants}
          onUpdateParticipant={onUpdateParticipant}
          onDeleteParticipant={onDeleteParticipant}
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