import React from 'react';
import { CellContext } from '@tanstack/react-table';
import { Participant } from '@/types';

interface CellMeta {
  editingCell: { rowId: string; columnId: string } | null;
  setEditingCell: (editing: { rowId: string; columnId: string } | null) => void;
  updateData: (rowIndex: number, columnId: keyof Participant, value: any) => void;
}

interface SelectOption {
  value: string;
  label: string;
  badgeClass?: string;
}

interface CellEditorWrapperProps<TValue> {
  cellContext: CellContext<Participant, TValue>;
  EditorComponent: React.FC<any>; // The specific cell component (EditableTextCell, SelectCell, etc.)
  options?: SelectOption[]; // For SelectCell options
  className?: string; // For EditableTextCell styling
}

export const CellEditorWrapper = <TValue,>({ cellContext, EditorComponent, options, className }: CellEditorWrapperProps<TValue>) => {
  const { row, column, getValue, table } = cellContext;
  const meta = table.options.meta as CellMeta;
  
  const rowId = row.id;
  const columnId = column.id as keyof Participant;
  const initialValue = getValue() as any;
  const rowIndex = row.index;

  const isEditing = meta.editingCell?.rowId === rowId && meta.editingCell?.columnId === columnId;

  const setIsEditing = (isEditing: boolean) => {
    meta.setEditingCell(isEditing ? { rowId, columnId: column.id } : null);
  };

  const onSave = (id: string, colId: keyof Participant, value: any) => {
    meta.updateData(rowIndex, colId, value);
  };

  // DietaryCell manages its own editing state via Popover, but we pass the props for consistency
  // and to allow it to use the onSave callback.
  return (
    <EditorComponent
      initialValue={initialValue}
      rowId={rowId}
      columnId={columnId}
      onSave={onSave}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      options={options} // Passed to SelectCell
      className={className} // Passed to EditableTextCell
    />
  );
};