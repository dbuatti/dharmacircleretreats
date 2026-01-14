import React from 'react';
import { CellContext } from '@tanstack/react-table';
import { Participant } from '@/types';

interface CellMeta {
  editingCell: { rowId: string; columnId: string } | null;
  setEditingCell: (editing: { rowId: string; columnId: string } | null) => void;
  updateData: (rowId: string, columnId: keyof Participant, value: any) => void;
  savingCells: Set<string>;
}

interface SelectOption {
  value: string;
  label: string;
  badgeClass?: string;
}

interface CellEditorWrapperProps<TValue> {
  cellContext: CellContext<Participant, TValue>;
  EditorComponent: React.FC<any>;
  options?: SelectOption[];
  className?: string;
}

export const CellEditorWrapper = <TValue,>({ cellContext, EditorComponent, options, className }: CellEditorWrapperProps<TValue>) => {
  const { row, column, getValue, table } = cellContext;
  const meta = table.options.meta as CellMeta;
  
  // Use the actual participant ID from row.original.id, not row.id (which is the row index)
  const rowId = row.original.id;
  const columnId = column.id as keyof Participant;
  const initialValue = getValue() as any;

  const isEditing = meta.editingCell?.rowId === rowId && meta.editingCell?.columnId === columnId;
  const isSaving = meta.savingCells.has(`${rowId}-${columnId}`);

  const setIsEditing = (isEditing: boolean) => {
    meta.setEditingCell(isEditing ? { rowId, columnId: column.id } : null);
  };

  const onSave = (id: string, colId: keyof Participant, value: any) => {
    console.log(`[CellEditorWrapper] Calling updateData. RowID: ${rowId}, Column: ${colId}, Value: ${value}`);
    meta.updateData(rowId, colId, value);
  };

  return (
    <EditorComponent
      initialValue={initialValue}
      rowId={rowId}
      columnId={columnId}
      onSave={onSave}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      options={options}
      className={className}
      isSaving={isSaving}
    />
  );
};