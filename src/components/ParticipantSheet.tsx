"use client";

import React, { useState, useMemo, useReducer, useCallback, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  ColumnResizeMode,
  getFilteredRowModel,
  RowSelectionState,
} from "@tanstack/react-table";
import { Participant } from "@/types";
import { cn } from "@/lib/utils";
import { EditableTextCell } from "./sheet/EditableTextCell";
import { SelectCell } from "./sheet/SelectCell";
import { DietaryCell } from "./sheet/DietaryCell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search, Filter, Plus, Trash2, Undo2, Redo2, CheckCircle2, Tag, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// --- 1. Options Definitions ---
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

// --- 2. Undo/Redo State Management ---

interface SheetState {
  data: Participant[];
  history: Participant[][];
  historyIndex: number;
}

type SheetAction = 
  | { type: 'UPDATE_DATA', payload: Participant[] }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const MAX_HISTORY = 10;

const sheetReducer = (state: SheetState, action: SheetAction): SheetState => {
  switch (action.type) {
    case 'UPDATE_DATA':
      if (JSON.stringify(action.payload) === JSON.stringify(state.data)) {
        return state;
      }
      
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(state.data);
      
      return {
        data: action.payload,
        history: newHistory.slice(-MAX_HISTORY),
        historyIndex: newHistory.length - 1,
      };
    case 'UNDO':
      if (state.historyIndex < 0) return state;
      return {
        ...state,
        data: state.history[state.historyIndex],
        historyIndex: state.historyIndex - 1,
      };
    case 'REDO':
      if (state.historyIndex >= state.history.length - 1) return state;
      return {
        ...state,
        data: state.history[state.historyIndex + 1],
        historyIndex: state.historyIndex + 1,
      };
    default:
      return state;
  }
};

// --- 3. Component Props and Setup ---

interface ParticipantSheetProps {
  participants: Participant[];
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => Promise<void>;
  onDeleteParticipant: (id: string) => Promise<void>;
  onAddParticipant: (p: Partial<Participant>) => Promise<void>;
}

export const ParticipantSheet: React.FC<ParticipantSheetProps> = ({
  participants: initialParticipants,
  onUpdateParticipant,
  onDeleteParticipant,
  onAddParticipant,
}) => {
  const [sheetState, dispatch] = useReducer(sheetReducer, {
    data: initialParticipants,
    history: [],
    historyIndex: -1,
  });
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnResizeMode, setColumnResizeMode] = useState<ColumnResizeMode>('onChange');
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);

  // Sync external data changes (e.g., from subscription)
  useEffect(() => {
    dispatch({ type: 'UPDATE_DATA', payload: initialParticipants });
  }, [initialParticipants]);

  // --- 4. Data Manipulation and Optimistic Updates ---

  const updateData = useCallback((rowIndex: number, columnId: keyof Participant, value: any) => {
    const newData = [...sheetState.data];
    const row = newData[rowIndex];
    const oldValue = row[columnId];
    
    if (oldValue === value) return;

    // 1. Optimistic Update
    newData[rowIndex] = {
      ...row,
      [columnId]: value,
    };
    dispatch({ type: 'UPDATE_DATA', payload: newData });
    toast.success("Cell updated (syncing...)");

    // 2. Background Sync
    onUpdateParticipant(row.id, { [columnId]: value })
      .then(() => {
        // Success handled by external fetch/subscription
      })
      .catch((error) => {
        // 3. Rollback on Error
        const rolledBackData = [...sheetState.data];
        rolledBackData[rowIndex] = {
          ...row,
          [columnId]: oldValue, // Revert to old value
        };
        dispatch({ type: 'UPDATE_DATA', payload: rolledBackData });
        toast.error("Update failed. Rolled back changes.");
        console.error("Update error:", error);
      });
  }, [sheetState.data, onUpdateParticipant]);

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

  // Define a custom ColumnDef type to include the non-standard 'enableEditing' property
  type ParticipantColumnDef = ColumnDef<Participant> & {
    enableEditing?: boolean;
  };

  // --- 5. Column Definitions ---

  const columns = useMemo<ParticipantColumnDef[]>(() => [
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
      enableEditing: false,
      meta: {
        freeze: true,
      }
    },
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-full w-full justify-start px-2 text-xs uppercase tracking-widest font-semibold text-[#1e2a5e] hover:bg-gray-100"
        >
          Name
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row, column, getValue }) => (
        <EditableTextCell
          initialValue={getValue() as string}
          rowId={row.original.id}
          columnId="full_name"
          onSave={(id, colId, val) => updateData(row.index, colId, val)}
          isEditing={editingCell?.rowId === row.id && editingCell?.columnId === column.id}
          setIsEditing={(isEditing) => setEditingCell(isEditing ? { rowId: row.id, columnId: column.id } : null)}
          className="font-medium"
        />
      ),
      size: 180,
      meta: {
        freeze: true,
      }
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row, column, getValue }) => (
        <EditableTextCell
          initialValue={getValue() as string}
          rowId={row.original.id}
          columnId="email"
          onSave={(id, colId, val) => updateData(row.index, colId, val)}
          isEditing={editingCell?.rowId === row.id && editingCell?.columnId === column.id}
          setIsEditing={(isEditing) => setEditingCell(isEditing ? { rowId: row.id, columnId: column.id } : null)}
          className="text-gray-600"
        />
      ),
      size: 200,
      meta: {
        freeze: true,
      }
    },
    {
      accessorKey: "dietary_requirements",
      header: "Dietary",
      cell: ({ row, column, getValue }) => (
        <DietaryCell
          initialValue={getValue() as string}
          rowId={row.original.id}
          columnId="dietary_requirements"
          onSave={(id, colId, val) => updateData(row.index, colId, val)}
          isEditing={editingCell?.rowId === row.id && editingCell?.columnId === column.id}
          setIsEditing={(isEditing) => setEditingCell(isEditing ? { rowId: row.id, columnId: column.id } : null)}
        />
      ),
      size: 250,
    },
    {
      accessorKey: "accommodation_plan",
      header: "Accommodation",
      cell: ({ row, column, getValue }) => (
        <SelectCell
          initialValue={getValue() as string}
          rowId={row.original.id}
          columnId="accommodation_plan"
          options={ACCOMMODATION_OPTIONS}
          onSave={(id, colId, val) => updateData(row.index, colId, val)}
          isEditing={editingCell?.rowId === row.id && editingCell?.columnId === column.id}
          setIsEditing={(isEditing) => setEditingCell(isEditing ? { rowId: row.id, columnId: column.id } : null)}
        />
      ),
      size: 150,
    },
    {
      accessorKey: "transportation_plan",
      header: "Transport",
      cell: ({ row, column, getValue }) => (
        <SelectCell
          initialValue={getValue() as string}
          rowId={row.original.id}
          columnId="transportation_plan"
          options={TRANSPORTATION_OPTIONS}
          onSave={(id, colId, val) => updateData(row.index, colId, val)}
          isEditing={editingCell?.rowId === row.id && editingCell?.columnId === column.id}
          setIsEditing={(isEditing) => setEditingCell(isEditing ? { rowId: row.id, columnId: column.id } : null)}
        />
      ),
      size: 150,
    },
    {
      accessorKey: "eta",
      header: "ETA",
      cell: ({ row, column, getValue }) => (
        <EditableTextCell
          initialValue={getValue() as string}
          rowId={row.original.id}
          columnId="eta"
          onSave={(id, colId, val) => updateData(row.index, colId, val)}
          isEditing={editingCell?.rowId === row.id && editingCell?.columnId === column.id}
          setIsEditing={(isEditing) => setEditingCell(isEditing ? { rowId: row.id, columnId: column.id } : null)}
          className="text-gray-700"
        />
      ),
      size: 120,
    },
    {
      accessorKey: "notes",
      header: "Other Info / Notes",
      cell: ({ row, column, getValue }) => (
        <EditableTextCell
          initialValue={getValue() as string}
          rowId={row.original.id}
          columnId="notes"
          onSave={(id, colId, val) => updateData(row.index, colId, val)}
          isEditing={editingCell?.rowId === row.id && editingCell?.columnId === column.id}
          setIsEditing={(isEditing) => setEditingCell(isEditing ? { rowId: row.id, columnId: column.id } : null)}
          className="text-gray-500 italic"
        />
      ),
      size: 300,
    },
    {
      accessorKey: "payment_status",
      header: "Payment",
      cell: ({ row, column, getValue }) => (
        <SelectCell
          initialValue={getValue() as string}
          rowId={row.original.id}
          columnId="payment_status"
          options={PAYMENT_OPTIONS}
          onSave={(id, colId, val) => updateData(row.index, colId, val)}
          isEditing={editingCell?.rowId === row.id && editingCell?.columnId === column.id}
          setIsEditing={(isEditing) => setEditingCell(isEditing ? { rowId: row.id, columnId: column.id } : null)}
        />
      ),
      size: 150,
    },
    {
      accessorKey: "whatsapp_status",
      header: "WhatsApp Group",
      cell: ({ row, column, getValue }) => (
        <SelectCell
          initialValue={getValue() as string}
          rowId={row.original.id}
          columnId="whatsapp_status"
          options={WHATSAPP_OPTIONS}
          onSave={(id, colId, val) => updateData(row.index, colId, val)}
          isEditing={editingCell?.rowId === row.id && editingCell?.columnId === column.id}
          setIsEditing={(isEditing) => setEditingCell(isEditing ? { rowId: row.id, columnId: column.id } : null)}
        />
      ),
      size: 150,
    },
    {
      accessorKey: "registration_status",
      header: "Reg Status",
      cell: ({ row, column, getValue }) => (
        <SelectCell
          initialValue={getValue() as string}
          rowId={row.original.id}
          columnId="registration_status"
          options={REGISTRATION_OPTIONS}
          onSave={(id, colId, val) => updateData(row.index, colId, val)}
          isEditing={editingCell?.rowId === row.id && editingCell?.columnId === column.id}
          setIsEditing={(isEditing) => setEditingCell(isEditing ? { rowId: row.id, columnId: column.id } : null)}
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
      enableEditing: false,
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ getValue }) => (
        <div className="px-2 text-xs text-gray-500">
          {getValue() ? format(getValue() as Date, 'MMM d, yy') : 'N/A'}
        </div>
      ),
      size: 100,
      enableEditing: false,
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
      enableEditing: false,
    },
  ], [updateData, editingCell, onDeleteParticipant]);

  const table = useReactTable({
    data: sheetState.data,
    columns,
    columnResizeMode,
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
      updateData: updateData,
      setEditingCell: setEditingCell,
      editingCell: editingCell,
    }
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const isBulkEditing = selectedRows.length > 0;

  // --- 6. Bulk Actions ---
  const handleBulkUpdate = (columnId: keyof Participant, value: any) => {
    if (!isBulkEditing) return;
    
    const selectedIds = selectedRows.map(row => row.original.id);
    
    // Optimistic update for all selected rows
    const newData = sheetState.data.map(p => 
      selectedIds.includes(p.id) ? { ...p, [columnId]: value } : p
    );
    dispatch({ type: 'UPDATE_DATA', payload: newData });
    toast.success(`${selectedIds.length} participants updated (syncing...)`);

    // Background sync for each selected row
    selectedIds.forEach(id => {
      onUpdateParticipant(id, { [columnId]: value });
    });
    setRowSelection({}); // Clear selection after bulk action
  };

  const handleBulkDelete = () => {
    if (!isBulkEditing) return;
    if (!confirm(`Are you sure you want to delete ${selectedRows.length} participants?`)) return;

    const selectedIds = selectedRows.map(row => row.original.id);
    
    // Optimistic removal
    const newData = sheetState.data.filter(p => !selectedIds.includes(p.id));
    dispatch({ type: 'UPDATE_DATA', payload: newData });
    toast.success(`${selectedIds.length} participants deleted (syncing...)`);

    // Background sync
    selectedIds.forEach(id => {
      onDeleteParticipant(id);
    });
    setRowSelection({});
  };

  // --- 7. Totals Calculation ---
  const totalParticipants = sheetState.data.length;
  const confirmedCount = sheetState.data.filter(p => p.attendance_status === 'confirmed').length;
  const paidCount = sheetState.data.filter(p => p.payment_status === 'paid_in_full').length;
  const dietaryCounts = sheetState.data.reduce((acc, p) => {
    if (p.dietary_requirements) {
      const parts = p.dietary_requirements.toLowerCase().split(',').map(s => s.trim());
      if (parts.includes('gf')) acc.gf++;
      if (parts.includes('df')) acc.df++;
      if (parts.some(part => part.startsWith('other'))) acc.other++;
    }
    return acc;
  }, { gf: 0, df: 0, other: 0 });

  // --- 8. Keyboard Shortcuts (Basic Undo/Redo) ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
        event.preventDefault();
        dispatch({ type: 'UNDO' });
        toast.info('Undo action');
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'y') {
        event.preventDefault();
        dispatch({ type: 'REDO' });
        toast.info('Redo action');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);


  return (
    <div className="space-y-6">
      {/* Top Toolbar: Search, Filter, Undo/Redo */}
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
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-none text-[10px] uppercase tracking-widest text-gray-600"
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={sheetState.historyIndex < 0}
          >
            <Undo2 className="w-3 h-3 mr-2" />
            Undo (Ctrl+Z)
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-none text-[10px] uppercase tracking-widest text-gray-600"
            onClick={() => dispatch({ type: 'REDO' })}
            disabled={sheetState.historyIndex >= sheetState.history.length - 1}
          >
            <Redo2 className="w-3 h-3 mr-2" />
            Redo (Ctrl+Y)
          </Button>
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
                  editingCell?.rowId === row.id && "bg-yellow-50 hover:bg-yellow-100"
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
                      editingCell?.rowId === row.id && cell.column.getIsPinned() === 'left' && "bg-yellow-50",
                    )}
                    onDoubleClick={() => {
                      const columnDef = cell.column.columnDef as ParticipantColumnDef;
                      if (columnDef.enableEditing !== false) {
                        setEditingCell({ rowId: row.id, columnId: cell.column.id });
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