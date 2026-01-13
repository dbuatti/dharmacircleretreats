"use client";

import React, { useState } from "react";
import { Participant } from "@/types";
import { InlineInput } from "./InlineInput";
import { InlineSelect } from "./InlineSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  onSelect: (id: string, selected: boolean) => void;
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
      <Table className="min-w-[1000px]">
        <TableHeader className="bg-gray-50 sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-[40px] bg-gray-50">
              <Checkbox 
                checked={isAllSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('full_name')}
            >
              <div className="flex items-center gap-1">Name <ArrowUpDown className="w-3 h-3" /></div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Logistics</TableHead>
            <TableHead>Health</TableHead>
            <TableHead className="w-[150px]">Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedParticipants.map((p, idx) => (
            <TableRow 
              key={p.id} 
              className={`group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}
            >
              <TableCell>
                <Checkbox 
                  checked={selectedIds.includes(p.id)}
                  onCheckedChange={(checked) => onSelect(p.id, !!checked)}
                />
              </TableCell>
              
              {/* Name & Contact */}
              <TableCell className="font-medium">
                <InlineInput
                  value={p.full_name}
                  onSave={(v) => handleUpdate(p.id, 'full_name', v)}
                  className="font-semibold text-gray-900"
                />
                <div className="text-xs text-gray-500 mt-0.5">
                  <InlineInput
                    value={p.email}
                    onSave={(v) => handleUpdate(p.id, 'email', v)}
                    type="email"
                    placeholder="email"
                    className="text-xs"
                  />
                </div>
              </TableCell>

              {/* Status (Stacked Pills) */}
              <TableCell className="align-top">
                <div className="flex flex-col gap-1">
                  <InlineSelect
                    value={p.registration_status || 'pending'}
                    options={registrationOptions}
                    onSave={(v) => handleUpdate(p.id, 'registration_status', v)}
                    label="Reg"
                    className="text-[10px]"
                  />
                  <InlineSelect
                    value={p.payment_status || 'unpaid'}
                    options={paymentOptions}
                    onSave={(v) => handleUpdate(p.id, 'payment_status', v)}
                    label="Pay"
                    className="text-[10px]"
                  />
                  <InlineSelect
                    value={p.attendance_status || 'interested'}
                    options={attendanceOptions}
                    onSave={(v) => handleUpdate(p.id, 'attendance_status', v)}
                    label="Attend"
                    className="text-[10px]"
                  />
                </div>
              </TableCell>

              {/* Logistics */}
              <TableCell className="align-top">
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-8">Accom:</span>
                    <InlineSelect
                      value={p.accommodation_plan || 'unknown'}
                      options={accommodationOptions}
                      onSave={(v) => handleUpdate(p.id, 'accommodation_plan', v)}
                      label=""
                      className="text-[10px]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-8">Trans:</span>
                    <InlineSelect
                      value={p.transportation_plan || 'unknown'}
                      options={transportationOptions}
                      onSave={(v) => handleUpdate(p.id, 'transportation_plan', v)}
                      label=""
                      className="text-[10px]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-8">ETA:</span>
                    <InlineInput
                      value={p.eta}
                      onSave={(v) => handleUpdate(p.id, 'eta', v)}
                      placeholder="..."
                      className="text-[10px] font-mono"
                    />
                  </div>
                </div>
              </TableCell>

              {/* Health */}
              <TableCell className="align-top">
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-8">Diet:</span>
                    <InlineInput
                      value={p.dietary_requirements}
                      onSave={(v) => handleUpdate(p.id, 'dietary_requirements', v)}
                      placeholder="None"
                      className="text-[10px]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-8">Chat:</span>
                    <InlineSelect
                      value={p.whatsapp_status || 'not_invited'}
                      options={whatsappOptions}
                      onSave={(v) => handleUpdate(p.id, 'whatsapp_status', v)}
                      label=""
                      className="text-[10px]"
                    />
                  </div>
                </div>
              </TableCell>

              {/* Notes & Tags */}
              <TableCell className="align-top">
                <InlineInput
                  value={p.notes}
                  onSave={(v) => handleUpdate(p.id, 'notes', v)}
                  type="textarea"
                  placeholder="..."
                  className="text-[10px] min-h-[60px]"
                />
                <InlineInput
                  value={p.tags?.join(', ')}
                  onSave={(v) => handleUpdate(p.id, 'tags', v.split(',').map((t: string) => t.trim()))}
                  placeholder="tags"
                  className="text-[10px] mt-1 bg-gray-100 rounded px-1"
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