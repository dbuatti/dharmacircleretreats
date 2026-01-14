"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  RowSelectionState,
} from "@tanstack/react-table";
import { Participant } from "@/types";
import { cn } from "@/lib/utils";
import { EditableTextCell } from "./sheet/EditableTextCell";
import { SelectCell } from "./sheet/SelectCell";
import { DietaryCell } from "./sheet/DietaryCell";
import { CellEditorWrapper } from "./sheet/CellEditorWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search, Filter, Plus, Trash2, CheckCircle2, Tag, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { SortableHeader } from "./sheet/SortableHeader";

// --- Options Definitions ---
interface SelectOption {
  value: string;
  label: string;
  badgeClass?: string;
}

const ACCOMMODATION_OPTIONS: SelectOption[] = [
  { value: "camping", label: "Camping" },
  { value: "offsite", label: "Offsite" },
  { value: "courthouse", label: "Courthouse" },
  { value: "unknown", label: "Unknown" },
];

const TRANSPORTATION_OPTIONS: SelectOption[] = [
  { value: "driving", label: "Driving (Own)" },
  { value: "driving-lift", label: "Driving (Carpool OK)" },
  { value: "need-lift", label: "Need a Lift" },
  { value: "unknown", label: "Unknown" },
];

const PAYMENT_OPTIONS: SelectOption[] = [
  { value: "not_paid", label: "Not Paid", badgeClass: "bg-red-100 text-red-800" },
  { value: "deposit_paid", label: "Deposit Paid", badgeClass: "bg-yellow-100 text-yellow-800" },
  { value: "paid_in_full", label: "Paid in Full", badgeClass: "bg-green-100 text-green-800" },
];

const WHATSAPP_OPTIONS: SelectOption[] = [
  { value: "joined", label: "Joined", badgeClass: "bg-green-100 text-green-800" },
  { value: "invited", label: "Invited", badgeClass: "bg-blue-100 text-blue-800" },
  { value: "not_invited", label: "Not Invited", badgeClass: "bg-gray-100 text-gray-600" },
  { value: "not_applicable", label: "N/A", badgeClass: "bg-gray-50 text-gray-400" },
];

const REGISTRATION_OPTIONS: SelectOption[] = [
  { value: "not_sent", label: "Not Sent", badgeClass: "bg-gray-200 text-gray-800" },
  { value: "sent", label: "Sent", badgeClass: "bg-blue-100 text-blue-800" },
  { value: "received", label: "Received", badgeClass: "bg-purple-100 text-purple-800" },
  { value: "incomplete", label: "Incomplete", badgeClass: "bg-orange-100 text-orange-800" },
  { value: "confirmed", label: "Confirmed", badgeClass: "bg-green-100 text-green-800" },
];

// --- Component Props ---
interface ParticipantSheetProps {
  participants: Participant[];
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => Promise<void>;
  onDeleteParticipant: (id: string) => Promise<void>;
  onAddParticipant: (p: Partial<Participant>) => Promise<void>;
  isUpdating?: boolean;
}

const ParticipantSheetComponent: React.FC<ParticipantSheetProps> = ({
  participants,
  onUpdateParticipant,
  onDeleteParticipant,
  onAddParticipant,
  isUpdating = false,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [savingCells, setSavingCells] = useState<Set<string>>(new Set());

  // --- Column Definitions ---
  const columns = useMemo<ColumnDef<Participant>[]>(() => {
    return [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300 text-[#1e2a5e] focus:ring-[#1e2a5e]"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300 text-[#1e2a5e] focus:ring-[#1e2a5e]"
          />
        ),
        size: 30,
        enableResizing: false,
        enableSorting: false,
      },
      {
        accessorKey: "full_name",
        header: ({ column }) => (
          <SortableHeader column={column} title="Name" />
        ),
        cell: (props) => (
          <CellEditorWrapper
            cellContext={props}
            EditorComponent={EditableTextCell}
            className="font-medium"
          />
        ),
        size: 180,
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <SortableHeader column={column} title="Email" />
        ),
        cell: (props) => (
          <CellEditorWrapper
            cellContext={props}
            EditorComponent={EditableTextCell}
            className="text-gray-600"
          />
        ),
        size: 200,
      },
      {
        accessorKey: "dietary_requirements",
        header: "Dietary",
        cell: (props) => (
          <CellEditorWrapper
            cellContext={props}
            EditorComponent={DietaryCell}
          />
        ),
        size: 250,
      },
      {
        accessorKey: "accommodation_plan",
        header: "Accommodation",
        cell: (props) => (
          <CellEditorWrapper
            cellContext={props}
            EditorComponent={SelectCell}
            options={ACCOMMODATION_OPTIONS}
          />
        ),
        size: 150,
      },
      {
        accessorKey: "transportation_plan",
        header: "Transport",
        cell: (props) => (
          <CellEditorWrapper
            cellContext={props}
            EditorComponent={SelectCell}
            options={TRANSPORTATION_OPTIONS}
          />
        ),
        size: 150,
      },
      {
        accessorKey: "eta",
        header: "ETA",
        cell: (props) => (
          <CellEditorWrapper
            cellContext={props}
            EditorComponent={EditableTextCell}
            className="text-gray-700"
          />
        ),
        size: 120,
      },
      {
        accessorKey: "notes",
        header: "Other Info / Notes",
        cell: (props) => (
          <CellEditorWrapper
            cellContext={props}
            EditorComponent={EditableTextCell}
            className="text-gray-500 italic"
          />
        ),
        size: 300,
      },
      {
        accessorKey: "payment_status",
        header: "Payment",
        cell: (props) => (
          <CellEditorWrapper
            cellContext={props}
            EditorComponent={SelectCell}
            options={PAYMENT_OPTIONS}
          />
        ),
        size: 150,
      },
      {
        accessorKey: "whatsapp_status",
        header: "WhatsApp Group",
        cell: (props) => (
          <CellEditorWrapper
            cellContext={props}
            EditorComponent={SelectCell}
            options={WHATSAPP_OPTIONS}
          />
        ),
        size: 150,
      },
      {
        accessorKey: "registration_status",
        header: "Reg Status",
        cell: (props) => (
          <CellEditorWrapper
            cellContext={props}
            EditorComponent={SelectCell}
            options={REGISTRATION_OPTIONS}
          />
        ),
        size: 150,
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ getValue }) => (
          <div className="px-2 text-xs text-gray-500">
            {getValue() as string || 'N/A'}
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <SortableHeader column={column} title="Created" />
        ),
        cell: ({ getValue }) => (
          <div className="px-2 text-xs text-gray-500">
            {getValue() ? format(getValue() as Date, 'MMM d, yy') : 'N/A'}
          </div>
        ),
        size: 100,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex justify-end px-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDeleteParticipant(row.original.id)}
              title="Delete participant"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
        size: 80,
        enableResizing: false,
        enableSorting: false,
      },
    ];
  }, [onDeleteParticipant]);

  const table = useReactTable({
    data: participants,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    initialState: {
      columnPinning: {
        left: ['select', 'full_name', 'email'],
      },
    },
    meta: {
      updateData: async (rowId: string, columnId: keyof Participant, value: any) => {
        // Find the row by ID directly from the participants array
        const row = participants.find(p => p.id === rowId);
        if (!row) {
          console.error(`[ParticipantSheet] Row with ID ${rowId} not found`);
          toast.error("Could not find participant to update");
          return;
        }

        // Check if this row is selected and if there are multiple selections
        const isRowSelected = table.getSelectedRowModel().rows.some(r => r.original.id === rowId);
        const selectedRows = table.getSelectedRowModel().rows;
        const isMultiSelected = selectedRows.length > 1;
        const isBulkAction = isRowSelected && isMultiSelected;

        const rowsToUpdate = isBulkAction 
          ? selectedRows.map(r => r.original) 
          : [row];
        
        console.log(`[ParticipantSheet] Saving ${rowsToUpdate.length} row(s) for ${columnId}: ${value}`);
        
        // Track saving state
        const cellKey = `${rowId}-${columnId}`;
        setSavingCells(prev => new Set(prev).add(cellKey));

        try {
          const updates = rowsToUpdate.map(r => 
            onUpdateParticipant(r.id, { [columnId]: value })
          );
          
          await Promise.all(updates);
          
          toast.success(`${rowsToUpdate.length > 1 ? rowsToUpdate.length + ' changes' : 'Change'} saved`);
        } catch (error) {
          console.error("Failed to save changes:", error);
          toast.error("Bulk update failed");
        } finally {
          setSavingCells(prev => {
            const newSet = new Set(prev);
            newSet.delete(cellKey);
            return newSet;
          });
        }
      },
      setEditingCell: setEditingCell,
      editingCell: editingCell,
      savingCells: savingCells,
    }
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const isBulkEditing = selectedRows.length > 0;

  const handleAddRow = async () => {
    const newParticipant: Partial<Participant> = {
      full_name: "New Participant",
      email: "",
      registration_status: "not_sent",
      payment_status: "not_paid",
      attendance_status: "interested",
      source: "manual",
      accommodation_plan: "unknown",
      transportation_plan: "unknown",
      whatsapp_status: "not_invited",
    };
    await onAddParticipant(newParticipant);
  };

  const handleBulkUpdate = async (columnId: keyof Participant, value: any) => {
    if (!isBulkEditing) return;
    
    const selectedIds = selectedRows.map(row => row.original.id);
    const toastId = toast.loading(`Updating ${selectedIds.length} participants...`);

    try {
      const updates = selectedIds.map(id => 
        onUpdateParticipant(id, { [columnId]: value })
      );
      await Promise.all(updates);
      toast.success(`${selectedIds.length} participants updated`);
      // We keep the selection active here to allow for sequential bulk actions.
    } catch (error) {
      console.error("Bulk update failed:", error);
      toast.error("Bulk update failed");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleBulkDelete = async () => {
    if (!isBulkEditing) return;
    if (!confirm(`Are you sure you want to delete ${selectedRows.length} participants?`)) return;

    const selectedIds = selectedRows.map(row => row.original.id);
    const toastId = toast.loading(`Deleting ${selectedIds.length} participants...`);

    try {
      const deletions = selectedIds.map(id => onDeleteParticipant(id));
      await Promise.all(deletions);
      toast.success(`${selectedIds.length} participants deleted`);
      setRowSelection({}); // Clear selection after deletion
    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error("Bulk delete failed");
    } finally {
      toast.dismiss(toastId);
    }
  };

  // --- Totals Calculation ---
  const totalParticipants = participants.length;
  const confirmedCount = participants.filter(p => p.attendance_status === 'confirmed').length;
  const paidCount = participants.filter(p => p.payment_status === 'paid_in_full').length;
  const dietaryCounts = participants.reduce((acc, p) => {
    if (p.dietary_requirements) {
      const parts = p.dietary_requirements.toLowerCase().split(',').map(s => s.trim());
      if (parts.includes('gf')) acc.gf++;
      if (parts.includes('df')) acc.df++;
      if (parts.some(part => part.startsWith('other'))) acc.other++;
    }
    return acc;
  }, { gf: 0, df: 0, other: 0 });

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Global search (name, email, notes...)" 
            className="pl-10 border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] bg-white h-10"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          {isUpdating && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-none text-[10px] uppercase tracking-widest text-gray-600"
          >
            <Filter className="w-3 h-3 mr-2" />
            Column Filters (WIP)
          </Button>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {isBulkEditing && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-none flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium text-blue-800">{selectedRows.length} rows selected:</span>
          
          <Button 
            size="sm" 
            variant="secondary" 
            className="bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-none text-[10px] uppercase tracking-widest"
            onClick={() => handleBulkUpdate('attendance_status', 'confirmed')}
          >
            <CheckCircle2 className="w-3 h-3 mr-2" /> Mark Confirmed
          </Button>
          
          <Button 
            size="sm" 
            variant="secondary" 
            className="bg-green-100 text-green-800 hover:bg-green-200 rounded-none text-[10px] uppercase tracking-widest"
            onClick={() => handleBulkUpdate('payment_status', 'paid_in_full')}
          >
            <Tag className="w-3 h-3 mr-2" /> Mark Paid
          </Button>

          <Button 
            size="sm" 
            variant="destructive" 
            className="rounded-none text-[10px] uppercase tracking-widest"
            onClick={handleBulkDelete}
          >
            <Trash2 className="w-3 h-3 mr-2" /> Delete Selected
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="rounded-none text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-100"
            onClick={() => setRowSelection({})}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Spreadsheet Table */}
      <div className="relative overflow-x-auto border rounded-none shadow-sm bg-white">
        <div 
          className="w-full"
          style={{
            width: table.getTotalSize(),
          }}
        >
          {/* Table Header */}
          <div className="sticky top-0 z-10 bg-gray-50 border-b">
            {table.getHeaderGroups().map(headerGroup => (
              <div key={headerGroup.id} className="flex">
                {headerGroup.headers.map(header => (
                  <div
                    key={header.id}
                    style={{
                      width: header.getSize(),
                      minWidth: header.column.columnDef.minSize,
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                    className={cn(
                      "relative h-12 flex items-center text-left text-xs uppercase tracking-widest text-gray-500 font-medium border-r border-gray-100",
                      header.column.getIsPinned() === 'left' && 'sticky z-20 bg-gray-50 border-r border-gray-200',
                      header.column.id === 'select' && 'justify-center',
                      header.column.id === 'full_name' && 'left-[30px]',
                      header.column.id === 'email' && 'left-[210px]',
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="w-full h-full">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-transparent hover:bg-[#1e2a5e] opacity-0 hover:opacity-100 transition-opacity",
                          header.column.getIsResizing() && "bg-[#1e2a5e] opacity-100"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Table Body */}
          <div className="relative">
            {table.getRowModel().rows.map((row, index) => (
              <div
                key={row.id}
                className={cn(
                  "flex border-b border-gray-100 transition-colors group",
                  index % 2 === 1 ? "bg-gray-50/50" : "bg-white",
                  row.getIsSelected() && "bg-blue-50 hover:bg-blue-100",
                  editingCell?.rowId === row.original.id && "bg-yellow-50 hover:bg-yellow-100"
                )}
              >
                {row.getVisibleCells().map(cell => (
                  <div
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.columnDef.minSize,
                      maxWidth: cell.column.columnDef.maxSize,
                    }}
                    className={cn(
                      "h-14 p-0 border-r border-gray-100 overflow-hidden",
                      cell.column.getIsPinned() === 'left' && 'sticky z-10 border-r border-gray-200',
                      cell.column.id === 'select' && 'flex items-center justify-center',
                      cell.column.id === 'full_name' && 'left-[30px]',
                      cell.column.id === 'email' && 'left-[210px]',
                      cell.column.getIsPinned() === 'left' && (index % 2 === 1 ? "bg-gray-50/50" : "bg-white"),
                      row.getIsSelected() && cell.column.getIsPinned() === 'left' && "bg-blue-50",
                      editingCell?.rowId === row.original.id && cell.column.getIsPinned() === 'left' && "bg-yellow-50",
                    )}
                    onDoubleClick={() => {
                      const columnDef = cell.column.columnDef as any;
                      if (columnDef.enableEditing !== false) {
                        setEditingCell({ rowId: row.original.id, columnId: cell.column.id });
                      }
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            ))}
            
            {/* Quick Add Row */}
            <div className="flex border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div 
                style={{ width: table.getTotalSize() }}
                className="h-14 flex items-center px-4 text-sm text-gray-500 font-medium"
                onClick={handleAddRow}
              >
                <Plus className="w-4 h-4 mr-2" /> Add New Participant
              </div>
            </div>
          </div>
          
          {/* Totals Row */}
          <div className="flex bg-[#1e2a5e] text-white h-10">
            {table.getHeaderGroups()[0].headers.map(header => {
              const isPinned = header.column.getIsPinned() === 'left';
              const isFirstPinned = header.column.id === 'select';
              const isName = header.column.id === 'full_name';
              const isDietary = header.column.id === 'dietary_requirements';
              
              return (
                <div
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className={cn(
                    "h-full flex items-center px-2 text-xs uppercase tracking-widest font-medium border-r border-[#2b3a7a]",
                    isPinned && 'sticky z-20 bg-[#1e2a5e] border-r border-[#2b3a7a]',
                    isFirstPinned && 'justify-center',
                    isName && 'left-[30px]',
                    isDietary && 'text-right justify-end',
                  )}
                >
                  {isName && (
                    <span className="flex items-center gap-2">
                      <Users className="w-3 h-3" /> Total: {totalParticipants}
                    </span>
                  )}
                  {isDietary && (
                    <div className="flex gap-3 text-[10px]">
                      <span>GF: {dietaryCounts.gf}</span>
                      <span>DF: {dietaryCounts.df}</span>
                      <span>Other: {dietaryCounts.other}</span>
                    </div>
                  )}
                  {header.column.id === 'payment_status' && (
                    <span>Paid: {paidCount}</span>
                  )}
                  {header.column.id === 'attendance_status' && (
                    <span>Confirmed: {confirmedCount}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ParticipantSheet = React.memo(ParticipantSheetComponent);