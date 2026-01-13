"use client";

import React, { useState } from "react";
import { Participant } from "@/types";
import { InlineInput } from "./InlineInput";
import { InlineSelect } from "./InlineSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, CheckCircle2 } from "lucide-react";
import { 
  registrationOptions, 
  paymentOptions, 
  attendanceOptions, 
  whatsappOptions, 
  accommodationOptions, 
  transportationOptions 
} from "@/utils/participant-options";

interface ParticipantTableViewProps {
  participants: Participant[];
  onUpdate: (id: string, updates: Partial<Participant>) => void;
  onDelete: (id: string) => void;
  selectedIds: string[];
  onSelect: (id: string, selected: boolean, shiftKey: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

export const ParticipantTableView: React.FC<ParticipantTableViewProps> = ({
  participants,
  onUpdate,
  onDelete,
  selectedIds,
  onSelect,
  onSelectAll,
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Participant; direction: 'asc' | 'desc' } | null>(null);

  const sortedParticipants = React.useMemo(() => {
    if (!sortConfig) return participants;
    return [...participants].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [participants, sortConfig]);

  const handleSort = (key: keyof Participant) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleUpdate = (id: string, field: keyof Participant, value: any) => {
    onUpdate(id, { [field]: value });
    toast.success("Updated");
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete ${name}?`)) {
      onDelete(id);
      toast.error("Deleted");
    }
  };

  const isAllSelected = participants.length > 0 && selectedIds.length === participants.length;

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden bg-white">
      <Table className="min-w-[1200px]">
        <TableHeader className="bg-gray-50 sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-[40px] sticky left-0 bg-gray-50 z-20">
              <Checkbox 
                checked={isAllSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100 min-w-[200px] sticky left-[40px] bg-gray-50 z-20 border-r"
              onClick={() => handleSort('full_name')}
            >
              <div className="flex items-center gap-1 font-semibold">Name</div>
            </TableHead>
            <TableHead className="min-w-[150px] cursor-pointer hover:bg-gray-100" onClick={() => handleSort('attendance_status')}>Status</TableHead>
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
              {/* Checkbox - Sticky Left */}
              <TableCell className="w-[40px] sticky left-0 z-10 bg-inherit">
                <Checkbox 
                  checked={selectedIds.includes(p.id)}
                  // FIX: Assert 'checked' parameter to boolean
                  onCheckedChange={(checked) => onSelect(p.id, !!checked, false)}
                />
              </TableCell>

              {/* Name - Sticky Left */}
              <TableCell className="font-medium min-w-[200px] sticky left-[40px] z-10 bg-inherit border-r">
                <div className="flex flex-col">
                  <InlineInput
                    value={p.full_name}
                    onSave={(v) => handleUpdate(p.id, 'full_name', v)}
                    className="font-semibold text-gray-900 text-sm"
                    placeholder="Name"
                  />
                  <div className="flex gap-2 text-[10px] text-gray-500">
                    <InlineInput
                      value={p.email}
                      onSave={(v) => handleUpdate(p.id, 'email', v)}
                      type="email"
                      placeholder="email"
                      className="text-[10px] w-1/2"
                    />
                    <InlineInput
                      value={p.phone}
                      onSave={(v) => handleUpdate(p.id, 'phone', v)}
                      type="tel"
                      placeholder="phone"
                      className="text-[10px] w-1/2"
                    />
                  </div>
                </div>
              </TableCell>

              {/* Status Cluster */}
              <TableCell className="align-top">
                <div className="flex flex-col gap-1">
                  <InlineSelect
                    value={p.registration_status || 'pending'}
                    options={registrationOptions}
                    onSave={(v) => handleUpdate(p.id, 'registration_status', v)}
                    label="Reg"
                    allowQuickToggle={true}
                  />
                  <InlineSelect
                    value={p.payment_status || 'unpaid'}
                    options={paymentOptions}
                    onSave={(v) => handleUpdate(p.id, 'payment_status', v)}
                    label="Pay"
                    allowQuickToggle={true}
                  />
                  <InlineSelect
                    value={p.attendance_status || 'interested'}
                    options={attendanceOptions}
                    onSave={(v) => handleUpdate(p.id, 'attendance_status', v)}
                    label="Attend"
                    allowQuickToggle={true}
                  />
                </div>
              </TableCell>

              {/* Logistics */}
              <TableCell className="align-top">
                <div className="flex flex-col gap-1 text-xs">
                  <InlineSelect
                    value={p.accommodation_plan || 'unknown'}
                    options={accommodationOptions}
                    onSave={(v) => handleUpdate(p.id, 'accommodation_plan', v)}
                    label="Accom"
                    className="justify-between"
                  />
                  <InlineSelect
                    value={p.transportation_plan || 'unknown'}
                    options={transportationOptions}
                    onSave={(v) => handleUpdate(p.id, 'transportation_plan', v)}
                    label="Trans"
                    className="justify-between"
                  />
                  <InlineInput
                    value={p.eta}
                    onSave={(v) => handleUpdate(p.id, 'eta', v)}
                    placeholder="ETA"
                    className="text-xs"
                  />
                </div>
              </TableCell>

              {/* Health */}
              <TableCell className="align-top">
                <div className="flex flex-col gap-1 text-xs">
                  <InlineInput
                    value={p.dietary_requirements}
                    onSave={(v) => handleUpdate(p.id, 'dietary_requirements', v)}
                    placeholder="Diet"
                    className="text-xs"
                  />
                  <InlineSelect
                    value={p.whatsapp_status || 'not_invited'}
                    options={whatsappOptions}
                    onSave={(v) => handleUpdate(p.id, 'whatsapp_status', v)}
                    label="WhatsApp"
                    className="justify-between"
                  />
                </div>
              </TableCell>

              {/* Notes & Tags */}
              <TableCell className="align-top">
                <InlineInput
                  value={p.notes}
                  onSave={(v) => handleUpdate(p.id, 'notes', v)}
                  type="textarea"
                  placeholder="Notes..."
                  className="text-xs min-h-[40px]"
                />
                <InlineInput
                  value={p.tags?.join(', ')}
                  onSave={(v) => handleUpdate(p.id, 'tags', v.split(',').map((t: string) => t.trim()))}
                  placeholder="Tags"
                  className="text-xs mt-1"
                />
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right align-top">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                  onClick={() => handleDelete(p.id, p.full_name)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};