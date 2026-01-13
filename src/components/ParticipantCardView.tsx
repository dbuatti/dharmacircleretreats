"use client";

import React from "react";
import { Participant } from "@/types";
import { InlineInput } from "./InlineInput";
import { InlineSelect } from "./InlineSelect";
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {participants.map((p) => (
        <div 
          key={p.id} 
          className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
        >
          {/* Header: Name & Actions */}
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
            <div className="flex-1 min-w-0">
              <InlineInput
                value={p.full_name}
                onSave={(v) => handleUpdate(p.id, 'full_name', v)}
                className="text-base font-bold text-gray-900 uppercase tracking-wide"
                placeholder="Name"
                label="Participant Name"
              />
              <div className="flex gap-2 mt-1 text-xs text-gray-500 truncate">
                <InlineInput
                  value={p.email}
                  onSave={(v) => handleUpdate(p.id, 'email', v)}
                  type="email"
                  placeholder="email"
                  className="text-xs w-1/2"
                  label="Email"
                />
                <span className="text-gray-300">|</span>
                <InlineInput
                  value={p.phone}
                  onSave={(v) => handleUpdate(p.id, 'phone', v)}
                  type="tel"
                  placeholder="phone"
                  className="text-xs w-1/2"
                  label="Phone"
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

          {/* Status Cluster: Single Row, 3 States */}
          <div className="px-4 py-2 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto">
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

          {/* Logistics Grid: No Labels, Just Values */}
          <div className="px-4 py-3 grid grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Logistics</div>
              <InlineSelect
                value={p.accommodation_plan || 'unknown'}
                options={accommodationOptions}
                onSave={(v) => handleUpdate(p.id, 'accommodation_plan', v)}
                label="Accom"
                className="justify-between"
              />
              <InlineSelect
                value={p.transportation_plan || 'unknown'}
                options={transportationOptions}
                onSave={(v) => handleUpdate(p.id, 'transportation_plan', v)}
                label="Trans"
                className="justify-between"
              />
              <InlineInput
                value={p.eta}
                onSave={(v) => handleUpdate(p.id, 'eta', v)}
                placeholder="ETA"
                className="w-full"
                label="ETA"
              />
            </div>

            <div className="space-y-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Health</div>
              <InlineInput
                value={p.dietary_requirements}
                onSave={(v) => handleUpdate(p.id, 'dietary_requirements', v)}
                placeholder="Diet"
                className="w-full"
                label="Dietary"
              />
              <InlineSelect
                value={p.whatsapp_status || 'not_invited'}
                options={whatsappOptions}
                onSave={(v) => handleUpdate(p.id, 'whatsapp_status', v)}
                label="WhatsApp"
                className="justify-between"
              />
            </div>

            <div className="space-y-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Notes</div>
              <InlineInput
                value={p.notes}
                onSave={(v) => handleUpdate(p.id, 'notes', v)}
                type="textarea"
                placeholder="Add notes..."
                className="w-full min-h-[60px]"
                label="Notes"
              />
              <InlineInput
                value={p.tags?.join(', ')}
                onSave={(v) => handleUpdate(p.id, 'tags', v.split(',').map((t: string) => t.trim()))}
                placeholder="Tags"
                className="w-full"
                label="Tags"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between uppercase tracking-wider">
            <span>Source: {p.source || 'Manual'}</span>
            <span>{new Date(p.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};