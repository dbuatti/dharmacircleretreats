"use client";

import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Participant } from "@/types";
import { format } from "date-fns";
import { InlineInput } from "./InlineInput";
import { InlineSelect } from "./InlineSelect";
import { CheckCircle2, Trash2, Info, Tag, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
  onSelect: (id: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
}

// Helper to get badge class from options
const getBadgeClass = (value: string, options: typeof registrationOptions) => {
  return options.find(opt => opt.value === value)?.badgeClass || 'bg-gray-100 text-gray-500';
};

// Helper to format logistics display
const formatLogistics = (value: string | undefined) => {
  if (!value || value === 'unknown') {
    return <span className="text-gray-400 italic">N/A</span>;
  }
  return value.replace(/-/g, ' ');
};

export const ParticipantTableView: React.FC<ParticipantTableViewProps> = ({ 
  participants, 
  onUpdate,
  onDelete,
  selectedIds,
  onSelect,
  onSelectAll
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Participant, direction: 'ascending' | 'descending' } | null>(null);

  const sortedParticipants = React.useMemo(() => {
    let sortableItems = [...participants];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || aValue === null) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (bValue === undefined || bValue === null) return sortConfig.direction === 'ascending' ? -1 : 1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [participants, sortConfig]);

  const requestSort = (key: keyof Participant) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleUpdate = (id: string, field: keyof Participant, value: string) => {
    const finalValue = (field === 'accommodation_plan' || field === 'transportation_plan') && value === 'unknown' ? null : value;
    
    if (field === 'tags') {
      const tagsArray = value.split(',').map(t => t.trim()).filter(t => t);
      onUpdate(id, { tags: tagsArray });
    } else {
      onUpdate(id, { [field]: finalValue });
    }
  };

  const handleToggleConfirmed = (p: Participant) => {
    const newStatus = p.attendance_status === "confirmed" ? "interested" : "confirmed";
    onUpdate(p.id, { attendance_status: newStatus });
  };

  const isAllSelected = participants.length > 0 && selectedIds.length === participants.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < participants.length;

  const renderSortIcon = (key: keyof Participant) => {
    if (sortConfig?.key !== key) return <ArrowUpDown className="ml-2 h-3 w-3 text-gray-400" />;
    if (sortConfig.direction === 'ascending') return <span className="ml-2">▲</span>;
    return <span className="ml-2">▼</span>;
  };

  const TableHeaderCell: React.FC<{ sortKey: keyof Participant, label: string }> = ({ sortKey, label }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center text-[10px] uppercase tracking-widest text-gray-500 font-medium">
        {label}
        {renderSortIcon(sortKey)}
      </div>
    </TableHead>
  );

  return (
    <div className="overflow-x-auto rounded-lg border shadow-sm">
      <Table className="min-w-full">
        <TableHeader className="bg-gray-50 sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-[40px] sticky left-0 bg-gray-50">
              <Checkbox 
                checked={isAllSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                aria-label="Select all"
                className={cn(isIndeterminate && "indeterminate")}
              />
            </TableHead>
            <TableHeaderCell sortKey="full_name" label="Name" />
            <TableHeaderCell sortKey="email" label="Email" />
            <TableHeaderCell sortKey="phone" label="Phone" />
            <TableHeaderCell sortKey="attendance_status" label="Status" />
            <TableHeaderCell sortKey="accommodation_plan" label="Accommodation" />
            <TableHeaderCell sortKey="transportation_plan" label="Transport" />
            <TableHeaderCell sortKey="eta" label="ETA" />
            <TableHeaderCell sortKey="dietary_requirements" label="Dietary" />
            <TableHeaderCell sortKey="whatsapp_status" label="WhatsApp" />
            <TableHeaderCell sortKey="notes" label="Notes" />
            <TableHeaderCell sortKey="tags" label="Tags" />
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedParticipants.map((p, index) => (
            <TableRow 
              key={p.id} 
              className={cn(
                "group transition-colors",
                index % 2 === 1 ? "bg-white" : "bg-gray-50/50",
                selectedIds.includes(p.id) && "bg-blue-50 hover:bg-blue-100"
              )}
            >
              {/* Checkbox */}
              <TableCell className="w-[40px] sticky left-0 z-0 bg-inherit">
                <Checkbox 
                  checked={selectedIds.includes(p.id)}
                  onCheckedChange={(checked) => onSelect(p.id, !!checked)}
                />
              </TableCell>

              {/* Name */}
              <TableCell className="font-medium text-sm whitespace-nowrap">
                <InlineInput
                  value={p.full_name}
                  onSave={(v) => handleUpdate(p.id, 'full_name', v)}
                  className="text-sm font-medium text-[#1e2a5e]"
                  placeholder="Name"
                />
                <div className="text-[10px] text-gray-400 mt-1">
                  {p.source} | {format(p.created_at, "MMM d")}
                </div>
              </TableCell>

              {/* Email */}
              <TableCell className="text-xs whitespace-nowrap">
                <InlineInput
                  value={p.email}
                  onSave={(v) => handleUpdate(p.id, 'email', v)}
                  type="email"
                  placeholder="Add Email"
                  className="text-xs"
                />
              </TableCell>

              {/* Phone */}
              <TableCell className="text-xs whitespace-nowrap">
                <InlineInput
                  value={p.phone}
                  onSave={(v) => handleUpdate(p.id, 'phone', v)}
                  type="tel"
                  placeholder="Add Phone"
                  className="text-xs"
                />
              </TableCell>

              {/* Status (Multi-Pill) */}
              <TableCell className="space-y-1">
                <InlineSelect
                  value={p.attendance_status}
                  options={attendanceOptions}
                  onSave={(v) => handleUpdate(p.id, 'attendance_status', v)}
                  className="w-full"
                />
                <InlineSelect
                  value={p.registration_status}
                  options={registrationOptions}
                  onSave={(v) => handleUpdate(p.id, 'registration_status', v)}
                  className="w-full"
                />
                <InlineSelect
                  value={p.payment_status}
                  options={paymentOptions}
                  onSave={(v) => handleUpdate(p.id, 'payment_status', v)}
                  className="w-full"
                />
              </TableCell>

              {/* Accommodation */}
              <TableCell className="text-xs whitespace-nowrap">
                <InlineSelect
                  value={p.accommodation_plan || 'unknown'}
                  options={accommodationOptions}
                  onSave={(v) => handleUpdate(p.id, 'accommodation_plan', v)}
                  placeholder="Accommodation"
                />
              </TableCell>

              {/* Transport */}
              <TableCell className="text-xs whitespace-nowrap">
                <InlineSelect
                  value={p.transportation_plan || 'unknown'}
                  options={transportationOptions}
                  onSave={(v) => handleUpdate(p.id, 'transportation_plan', v)}
                  placeholder="Transport"
                />
              </TableCell>

              {/* ETA */}
              <TableCell className="text-xs whitespace-nowrap">
                <InlineInput
                  value={p.eta}
                  onSave={(v) => handleUpdate(p.id, 'eta', v)}
                  placeholder="Add ETA"
                  className="text-xs"
                />
              </TableCell>

              {/* Dietary */}
              <TableCell className="text-xs max-w-[150px] truncate">
                <InlineInput
                  value={p.dietary_requirements}
                  onSave={(v) => handleUpdate(p.id, 'dietary_requirements', v)}
                  placeholder="None"
                  className="text-xs"
                />
              </TableCell>

              {/* WhatsApp */}
              <TableCell className="text-xs whitespace-nowrap">
                <InlineSelect
                  value={p.whatsapp_status || 'not_invited'}
                  options={whatsappOptions}
                  onSave={(v) => handleUpdate(p.id, 'whatsapp_status', v)}
                  placeholder="WhatsApp"
                />
              </TableCell>

              {/* Notes */}
              <TableCell className="text-xs max-w-[150px] truncate">
                <InlineInput
                  value={p.notes}
                  onSave={(v) => handleUpdate(p.id, 'notes', v)}
                  type="textarea"
                  placeholder="Add notes..."
                  className="text-xs"
                />
              </TableCell>

              {/* Tags */}
              <TableCell className="text-xs max-w-[150px] truncate">
                <InlineInput
                  value={p.tags?.join(', ') || ''}
                  onSave={(v) => handleUpdate(p.id, 'tags', v)}
                  placeholder="Add tags"
                  className="text-xs"
                />
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right w-[100px] whitespace-nowrap">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                    onClick={() => handleToggleConfirmed(p)}
                    title="Quick toggle confirmed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onDelete(p.id)}
                    title="Delete participant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};