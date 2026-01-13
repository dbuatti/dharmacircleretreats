"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Participant, RegistrationStatus, PaymentStatus, AttendanceStatus } from "@/types";
import { InlineInput } from "./InlineInput";
import { InlineSelect } from "./InlineSelect";
import { DietarySelect } from "./DietarySelect"; // New Import
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, ArrowUpDown } from "lucide-react";
import { BulkToolbar } from "./BulkToolbar";
import { 
  registrationOptions, 
  paymentOptions, 
  attendanceOptions, 
  whatsappOptions, 
  accommodationOptions, 
  transportationOptions 
} from "@/utils/participant-options";

// --- Simulated API Hook (Optimistic Update Pattern) ---
const useUpdateParticipant = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const mutate = async (id: string, updates: Partial<Participant>) => {
    setIsSyncing(true);
    // Simulate network delay (500ms) and 5% error rate
    const delay = new Promise(resolve => setTimeout(resolve, 500));
    const errorChance = Math.random() < 0.05;

    try {
      await delay;
      if (errorChance) throw new Error("Network error");
      // In a real app, this is where you call your API
      console.log(`API: Updated participant ${id}`, updates);
      return { success: true };
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return { mutate, isSyncing };
};

interface ParticipantsTableProps {
  participants: Participant[];
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => void;
  onDeleteParticipant: (id: string) => void;
}

export const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  participants,
  onUpdateParticipant,
  onDeleteParticipant,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Participant; direction: 'asc' | 'desc' } | null>(null);
  const { mutate } = useUpdateParticipant();

  // --- Selection Logic ---
  const handleSelect = (id: string, isSelected: boolean, shiftKey: boolean) => {
    if (shiftKey && lastSelectedIndex !== null) {
      const currentIndex = participants.findIndex(p => p.id === id);
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      const rangeIds = participants.slice(start, end + 1).map(p => p.id);
      const newSelectedIds = new Set(selectedIds);
      if (isSelected) rangeIds.forEach(id => newSelectedIds.add(id));
      else rangeIds.forEach(id => newSelectedIds.delete(id));
      setSelectedIds(Array.from(newSelectedIds));
    } else {
      setSelectedIds(prev => isSelected ? [...prev, id] : prev.filter(i => i !== id));
    }
    setLastSelectedIndex(participants.findIndex(p => p.id === id));
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedIds(participants.map(p => p.id));
      setLastSelectedIndex(0);
    } else {
      setSelectedIds([]);
      setLastSelectedIndex(null);
    }
  };

  // --- Bulk Actions ---
  const handleBulkUpdate = async (updates: Partial<Participant>, mode: 'set' | 'append' | 'prepend' = 'set') => {
    const idsToUpdate = [...selectedIds];
    const updatePromises = idsToUpdate.map(id => mutate(id, updates));

    // Optimistic Update: Update UI immediately
    idsToUpdate.forEach(id => {
      let finalUpdates = { ...updates };
      
      // Handle Append/Prepend for Notes and Tags
      if (mode === 'append' || mode === 'prepend') {
        const current = participants.find(p => p.id === id);
        if (updates.notes && current?.notes) {
          finalUpdates.notes = mode === 'append' 
            ? `${current.notes} ${updates.notes}` 
            : `${updates.notes} ${current.notes}`;
        }
        if (updates.tags && current?.tags) {
          const newTags = updates.tags as string[];
          const combined = mode === 'append'
            ? [...current.tags, ...newTags]
            : [...newTags, ...current.tags];
          finalUpdates.tags = Array.from(new Set(combined)); // Remove duplicates
        }
        // Handle Dietary Append (Special Logic)
        if (updates.dietary_requirements && current?.dietary_requirements) {
          // Merge dietary strings intelligently
          const currentDiet = current.dietary_requirements.split(',').map(t => t.trim());
          const newDiet = updates.dietary_requirements.split(',').map(t => t.trim());
          const combined = Array.from(new Set([...currentDiet, ...newDiet]));
          finalUpdates.dietary_requirements = combined.join(', ');
        }
      }
      
      onUpdateParticipant(id, finalUpdates);
    });

    // Background Sync
    try {
      await Promise.all(updatePromises);
      toast.success(`${idsToUpdate.length} participants updated`, {
        action: {
          label: "Undo",
          onClick: () => {
            toast.info("Undo functionality would restore previous state here");
          }
        }
      });
    } catch (error) {
      toast.error("Sync failed. Rolling back changes.");
      // Rollback logic would go here
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.length;
    if (!confirm(`Delete ${count} participants?`)) return;

    // Optimistic Delete
    const idsToDelete = [...selectedIds];
    idsToDelete.forEach(id => onDeleteParticipant(id));
    setSelectedIds([]);
    
    // Background Sync
    try {
      await new Promise(r => setTimeout(r, 500));
      toast.error(`${count} participants deleted`);
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // --- Sorting ---
  const handleSort = (key: keyof Participant) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedParticipants = useMemo(() => {
    if (!sortConfig) return participants;
    return [...participants].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [participants, sortConfig]);

  // --- Hotkeys ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if (e.key === 'a' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleSelectAll(true);
      }
      if (e.key === 'Escape') {
        setSelectedIds([]);
      }
      if (e.key === 'd' && selectedIds.length > 0) {
        e.preventDefault();
        handleBulkDelete();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && selectedIds.length > 0) {
        e.preventDefault();
        toast.info("Re-applying last bulk action...");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, participants]);

  const isAllSelected = participants.length > 0 && selectedIds.length === participants.length;

  return (
    <div className="space-y-4 pb-20">
      <div className="rounded-lg border shadow-sm overflow-hidden bg-white">
        <Table className="min-w-[1200px]">
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-[40px] sticky left-0 bg-gray-50 z-20">
                <Checkbox 
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 min-w-[200px] sticky left-[40px] bg-gray-50 z-20 border-r"
                onClick={() => handleSort('full_name')}
              >
                <div className="flex items-center gap-1 font-semibold">Name <ArrowUpDown className="w-3 h-3" /></div>
              </TableHead>
              <TableHead className="min-w-[150px]">Status</TableHead>
              <TableHead className="min-w-[120px]">Logistics</TableHead>
              <TableHead className="min-w-[120px]">Health</TableHead>
              <TableHead className="min-w-[150px]">Notes & Tags</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedParticipants.map((p, idx) => (
              <TableRow 
                key={p.id} 
                className={`group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors ${selectedIds.includes(p.id) ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
              >
                <TableCell className="w-[40px] sticky left-0 z-10 bg-inherit">
                  <Checkbox 
                    checked={selectedIds.includes(p.id)}
                    onCheckedChange={(checked) => handleSelect(p.id, !!checked, false)}
                  />
                </TableCell>

                <TableCell className="font-medium min-w-[200px] sticky left-[40px] z-10 bg-inherit border-r">
                  <div className="flex flex-col">
                    <InlineInput
                      value={p.full_name}
                      onSave={(v) => onUpdateParticipant(p.id, { full_name: v })}
                      className="font-semibold text-gray-900 text-sm"
                      placeholder="Name"
                    />
                    <div className="flex gap-2 text-[10px] text-gray-500">
                      <InlineInput
                        value={p.email}
                        onSave={(v) => onUpdateParticipant(p.id, { email: v })}
                        type="email"
                        placeholder="email"
                        className="text-[10px] w-1/2"
                      />
                      <InlineInput
                        value={p.phone}
                        onSave={(v) => onUpdateParticipant(p.id, { phone: v })}
                        type="tel"
                        placeholder="phone"
                        className="text-[10px] w-1/2"
                      />
                    </div>
                  </div>
                </TableCell>

                <TableCell className="align-top">
                  <div className="flex flex-col gap-1">
                    <InlineSelect
                      value={p.registration_status || 'pending'}
                      options={registrationOptions}
                      onSave={(v) => onUpdateParticipant(p.id, { registration_status: v as RegistrationStatus })}
                      label="Reg"
                      allowQuickToggle={true}
                    />
                    <InlineSelect
                      value={p.payment_status || 'unpaid'}
                      options={paymentOptions}
                      onSave={(v) => onUpdateParticipant(p.id, { payment_status: v as PaymentStatus })}
                      label="Pay"
                      allowQuickToggle={true}
                    />
                    <InlineSelect
                      value={p.attendance_status || 'interested'}
                      options={attendanceOptions}
                      onSave={(v) => onUpdateParticipant(p.id, { attendance_status: v as AttendanceStatus })}
                      label="Attend"
                      allowQuickToggle={true}
                    />
                  </div>
                </TableCell>

                <TableCell className="align-top">
                  <div className="flex flex-col gap-1 text-xs">
                    <InlineSelect
                      value={p.accommodation_plan || 'unknown'}
                      options={accommodationOptions}
                      onSave={(v) => onUpdateParticipant(p.id, { accommodation_plan: v })}
                      label="Accom"
                      className="justify-between"
                    />
                    <InlineSelect
                      value={p.transportation_plan || 'unknown'}
                      options={transportationOptions}
                      onSave={(v) => onUpdateParticipant(p.id, { transportation_plan: v })}
                      label="Trans"
                      className="justify-between"
                    />
                    <InlineInput
                      value={p.eta}
                      onSave={(v) => onUpdateParticipant(p.id, { eta: v })}
                      placeholder="ETA"
                      className="text-xs"
                    />
                  </div>
                </TableCell>

                <TableCell className="align-top">
                  <div className="flex flex-col gap-1 text-xs">
                    {/* REPLACED InlineInput with DietarySelect */}
                    <DietarySelect
                      value={p.dietary_requirements}
                      onSave={(v) => onUpdateParticipant(p.id, { dietary_requirements: v })}
                    />
                    <InlineSelect
                      value={p.whatsapp_status || 'not_invited'}
                      options={whatsappOptions}
                      onSave={(v) => onUpdateParticipant(p.id, { whatsapp_status: v })}
                      label="WhatsApp"
                      className="justify-between"
                    />
                  </div>
                </TableCell>

                <TableCell className="align-top">
                  <InlineInput
                    value={p.notes}
                    onSave={(v) => onUpdateParticipant(p.id, { notes: v })}
                    type="textarea"
                    placeholder="Notes..."
                    className="text-xs min-h-[40px]"
                  />
                  <InlineInput
                    value={p.tags?.join(', ')}
                    onSave={(v) => onUpdateParticipant(p.id, { tags: v.split(',').map((t: string) => t.trim()) })}
                    placeholder="Tags"
                    className="text-xs mt-1"
                  />
                </TableCell>

                <TableCell className="text-right align-top">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                    onClick={() => onDeleteParticipant(p.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Bulk Toolbar */}
      <BulkToolbar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
      />
    </div>
  );
};