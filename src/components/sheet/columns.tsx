"use client";

import { ColumnDef, flexRender } from "@tanstack/react-table";
import { Participant } from "@/types";
import { CellEditorWrapper } from "@/components/sheet/CellEditorWrapper";
import { EditableTextCell } from "@/components/sheet/EditableTextCell";
import { SelectCell } from "@/components/sheet/SelectCell";
import { DietaryCell } from "@/components/sheet/DietaryCell";
import { SortableHeader } from "@/components/sheet/SortableHeader";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

// --- Options Definitions ---
interface SelectOption {
  value: string;
  label: string;
  badgeClass?: string;
}

export const ACCOMMODATION_OPTIONS: SelectOption[] = [
  { value: "camping", label: "Camping" },
  { value: "offsite", label: "Offsite" },
  { value: "courthouse", label: "Courthouse" },
  { value: "unknown", label: "Unknown" },
];

export const TRANSPORTATION_OPTIONS: SelectOption[] = [
  { value: "driving", label: "Driving (Own)" },
  { value: "driving-lift", label: "Driving (Carpool OK)" },
  { value: "need-lift", label: "Need a Lift" },
  { value: "unknown", label: "Unknown" },
];

export const PAYMENT_OPTIONS: SelectOption[] = [
  { value: "not_paid", label: "Not Paid", badgeClass: "bg-red-100 text-red-800" },
  { value: "deposit_paid", label: "Deposit Paid", badgeClass: "bg-yellow-100 text-yellow-800" },
  { value: "paid_in_full", label: "Paid in Full", badgeClass: "bg-green-100 text-green-800" },
];

export const WHATSAPP_OPTIONS: SelectOption[] = [
  { value: "joined", label: "Joined", badgeClass: "bg-green-100 text-green-800" },
  { value: "invited", label: "Invited", badgeClass: "bg-blue-100 text-blue-800" },
  { value: "not_invited", label: "Not Invited", badgeClass: "bg-gray-100 text-gray-600" },
  { value: "not_applicable", label: "N/A", badgeClass: "bg-gray-50 text-gray-400" },
];

export const REGISTRATION_OPTIONS: SelectOption[] = [
  { value: "not_sent", label: "Not Sent", badgeClass: "bg-gray-200 text-gray-800" },
  { value: "sent", label: "Sent", badgeClass: "bg-blue-100 text-blue-800" },
  { value: "received", label: "Received", badgeClass: "bg-purple-100 text-purple-800" },
  { value: "incomplete", label: "Incomplete", badgeClass: "bg-orange-100 text-orange-800" },
  { value: "confirmed", label: "Confirmed", badgeClass: "bg-green-100 text-green-800" },
];

interface GetColumnsProps {
  onDeleteParticipant: (id: string) => Promise<void>;
}

export const getColumns = ({ onDeleteParticipant }: GetColumnsProps): ColumnDef<Participant>[] => [
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