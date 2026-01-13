"use client";

import React from "react";
import { Participant } from "@/types";
import { InlineInput } from "./InlineInput";
import { InlineSelect } from "./InlineSelect";
import { DietarySelect } from "./DietarySelect"; // New Import
import { Trash2 } from "lucide-react";
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

interface ParticipantCardViewProps {
  participants: Participant[];
  onUpdate: (id: string, updates: Partial<Participant>) => void;
  onDelete: (id: string) => void;
}

export const ParticipantCardView: React.FC<ParticipantCardViewProps> = ({ 
  participants, 
  onUpdate,
  onDelete 
}) => {

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete ${name}?`)) {
      onDelete(id);
      toast.error("Participant deleted");
    }
  };

  const handleUpdate = (id: string, field: keyof Participant, value: any) => {
    onUpdate(id, { [field]: value });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {participants.map((p) => (
        <div 
          key={p.id} 
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
        >
          {/* Header: Name & Actions */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
            <div className="flex-1">
              <InlineInput
                value={p.full_name}
                onSave={(v) => handleUpdate(p.id, 'full_name', v)}
                className="text-lg font-bold text-gray-900 uppercase tracking-wide"
                placeholder="Full Name"
              />
              <div className="flex gap-3 mt-1 text-sm text-gray-500">
                <InlineInput
                  value={p.email}
                  onSave={(v) => handleUpdate(p.id, 'email', v)}
                  type="email"
                  placeholder="email@example.com"
                  className="text-sm text-gray-600"
                />
                <span className="text-gray-300">|</span>
                <InlineInput
                  value={p.phone}
                  onSave={(v) => handleUpdate(p.id, 'phone', v)}
                  type="tel"
                  placeholder="+61 4..."
                  className="text-sm text-gray-600"
                />
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50"
              onClick={() => handleDelete(p.id, p.full_name)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          {/* Status Row: Labeled Pills */}
          <div className="px-6 py-3 bg-white border-b border-gray-100 flex flex-wrap gap-2 items-center">
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

          {/* Logistics Grid */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Logistics Column */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Logistics</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Accom:</span>
                  <InlineSelect
                    value={p.accommodation_plan || 'unknown'}
                    options={accommodationOptions}
                    onSave={(v) => handleUpdate(p.id, 'accommodation_plan', v)}
                    label="Accom"
                    className="text-xs"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Trans:</span>
                  <InlineSelect
                    value={p.transportation_plan || 'unknown'}
                    options={transportationOptions}
                    onSave={(v) => handleUpdate(p.id, 'transportation_plan', v)}
                    label="Trans"
                    className="text-xs"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">ETA:</span>
                  <InlineInput
                    value={p.eta}
                    onSave={(v) => handleUpdate(p.id, 'eta', v)}
                    placeholder="+ Add"
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Health & Comms Column */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Health & Comms</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Diet:</span>
                  {/* REPLACED InlineInput with DietarySelect */}
                  <DietarySelect
                    value={p.dietary_requirements}
                    onSave={(v) => handleUpdate(p.id, 'dietary_requirements', v)}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">WhatsApp:</span>
                  <InlineSelect
                    value={p.whatsapp_status || 'not_invited'}
                    options={whatsappOptions}
                    onSave={(v) => handleUpdate(p.id, 'whatsapp_status', v)}
                    label="Chat"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Notes & Tags Column */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notes & Tags</h4>
              <div className="space-y-2">
                <InlineInput
                  value={p.notes}
                  onSave={(v) => handleUpdate(p.id, 'notes', v)}
                  type="textarea"
                  placeholder="Add notes..."
                  className="text-xs min-h-[60px]"
                />
                <InlineInput
                  value={p.tags?.join(', ')}
                  onSave={(v) => handleUpdate(p.id, 'tags', v.split(',').map((t: string) => t.trim()))}
                  placeholder="Tags (comma sep)"
                  className="text-xs bg-gray-50 rounded px-2 py-1"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between uppercase tracking-wider">
            <span>Source: {p.source || 'Manual'}</span>
            <span>{new Date(p.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};