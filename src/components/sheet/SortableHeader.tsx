"use client";

import React from "react";
import { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface SortableHeaderProps<TData> {
  column: Column<TData, unknown>;
  title: string;
}

export function SortableHeader<TData>({ column, title }: SortableHeaderProps<TData>) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-full w-full justify-start px-2 text-xs uppercase tracking-widest font-semibold text-[#1e2a5e] hover:bg-gray-100"
    >
      {title}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );
}