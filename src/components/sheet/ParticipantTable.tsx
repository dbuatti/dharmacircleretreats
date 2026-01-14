"use client";

import React from "react";
import {
  flexRender,
  Table,
} from "@tanstack/react-table";
import { Participant } from "@/types";
import { cn } from "@/lib/utils";
import { Plus, Users, Loader2 } from "lucide-react";

interface ParticipantTableProps {
  table: Table<Participant>;
  editingCell: { rowId: string; columnId: string } | null;
  setEditingCell: (editing: { rowId: string; columnId: string } | null) => void;
  handleAddRow: () => Promise<void>;
  totalParticipants: number;
  confirmedCount: number;
  paidCount: number;
  dietaryCounts: { gf: number; df: number; other: number };
}

export const ParticipantTable: React.FC<ParticipantTableProps> = ({
  table,
  editingCell,
  setEditingCell,
  handleAddRow,
  totalParticipants,
  confirmedCount,
  paidCount,
  dietaryCounts,
}) => {
  return (
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
  );
};