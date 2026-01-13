"use client";

import React from "react";
import { 
  Mail, 
  Phone, 
  CheckCircle2, 
  Trash2,
  User,
  Calendar,
  Info,
  Home,
  Car,
  Clock,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Participant } from "@/types";
import { format } from "date-fns";
import { InlineInput } from "./InlineInput";
import { InlineSelect } from "./InlineSelect";
import { toast } from "sonner";

interface ParticipantTableProps {
  participants: Participant[];
  onUpdate: (id: string, updates: Partial<Participant>) => void;
  onDelete: (id: string) => void;
}

// --- Status Options Definitions ---

const registrationOptions = [
  { value: "not_sent", label: "Not Sent", badgeClass: "bg-gray-200 text-gray-800" },
  { value: "sent", label: "Sent", badgeClass: "bg-blue-100 text-blue-800" },
  { value: "received", label: "Received", badgeClass: "bg-purple-100 text-purple-800" },
  { value: "incomplete", label: "Incomplete", badgeClass: "bg-orange-100 text-orange-800" },
  { value: "confirmed", label: "Confirmed", badgeClass: "bg-green-100 text-green-800" },
];

const paymentOptions = [
  { value: "not_paid", label: "Not Paid", badgeClass: "bg-red-100 text-red-800" },
  { value: "deposit_paid", label: "Deposit Paid", badgeClass: "bg-yellow-100 text-yellow-800" },
  { value: "paid_in_full", label: "Paid in Full", badgeClass: "bg-green-100 text-green-800" },
];

const attendanceOptions = [
  { value: "interested", label: "Interested", badgeClass: "bg-gray-100 text-gray-800" },
  { value: "confirmed", label: "Confirmed", badgeClass: "bg-green-100 text-green-800" },
  { value: "withdrawn", label: "Withdrawn", badgeClass: "bg-red-100 text-red-800" },
  { value: "declined", label: "Declined", badgeClass: "bg-red-200 text-red-900" },
];

const whatsappOptions = [
  { value: "joined", label: "Joined", badgeClass: "bg-green-100 text-green-800" },
  { value: "invited", label: "Invited", badgeClass: "bg-blue-100 text-blue-800" },
  { value: "not_invited", label: "Not Invited", badgeClass: "bg-gray-100 text-gray-600" },
  { value: "not_applicable", label: "N/A", badgeClass: "bg-gray-50 text-gray-400" },
];

const accommodationOptions = [
  { value: "camping", label: "Camping (Tent)", badgeClass: "bg-blue-50 text-blue-700" },
  { value: "offsite", label: "Offsite", badgeClass: "bg-purple-50 text-purple-700" },
  { value: "courthouse", label: "Courthouse", badgeClass: "bg-indigo-50 text-indigo-700" },
  { value: "unknown", label: "Unknown", badgeClass: "bg-gray-50 text-gray-400" },
];

const transportationOptions = [
  { value: "driving", label: "Driving (Own)", badgeClass: "bg-green-50 text-green-700" },
  { value: "driving-lift", label: "Driving (Carpool OK)", badgeClass: "bg-yellow-50 text-yellow-700" },
  { value: "need-lift", label: "Need Lift", badgeClass: "bg-red-50 text-red-700" },
  { value: "unknown", label: "Unknown", badgeClass: "bg-gray-50 text-gray-400" },
];

// --- Component ---

export const ParticipantTable: React.FC<ParticipantTableProps> = ({ 
  participants, 
  onUpdate,
  onDelete 
}) => {
  
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      onDelete(id);
    }
  };

  const handleUpdate = (id: string, field: keyof Participant, value: string) => {
    // Convert 'unknown' back to null for database storage if it's a logistics field
    const finalValue = (field === 'accommodation_plan' || field === 'transportation_plan') && value === 'unknown' ? null : value;
    
    // Handle tags separately as they are an array
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
    toast.info(`${p.full_name} status set to ${newStatus.toUpperCase()}.`);
  };

  return (
    <div className="space-y-4">
      {participants.length === 0 ? (
        <div className="py-12 text-center text-gray-400 font-serif italic">
          No participants match your filters.
        </div>
      ) : (
        <div className="grid gap-4">
          {participants.map((p) => (
            <div 
              key={p.id} 
              className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg group"
            >
              {/* Row 1: Name, Contact, Quick Actions */}
              <div className="flex justify-between items-start border-b pb-4 mb-4">
                <div className="flex flex-col space-y-1 w-full max-w-md">
                  {/* Name (Inline Editable) */}
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#1e2a5e]" />
                    <InlineInput
                      value={p.full_name}
                      onSave={(v) => handleUpdate(p.id, 'full_name', v)}
                      className="text-xl font-bold text-[#1e2a5e] uppercase tracking-wider"
                      placeholder="Participant Name"
                    />
                  </div>

                  {/* Contact Info Block */}
                  <div className="pl-7 space-y-1">
                    {/* Email (Inline Editable) */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <InlineInput
                        value={p.email}
                        onSave={(v) => handleUpdate(p.id, 'email', v)}
                        type="email"
                        placeholder="Add Email"
                        className="text-sm"
                      />
                    </div>

                    {/* Phone (Inline Editable) */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <InlineInput
                        value={p.phone}
                        onSave={(v) => handleUpdate(p.id, 'phone', v)}
                        type="tel"
                        placeholder="Add Phone"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions (Hidden until hover) */}
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                    onClick={() => handleToggleConfirmed(p)}
                    title={p.attendance_status === "confirmed" ? "Mark as Interested" : "Quick Confirm Attendance"}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(p.id, p.full_name)}
                    title="Delete participant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Row 2: Statuses and Logistics (4-Column Grid) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                
                {/* Column 1: Statuses (Vertical Stack) */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Status</h4>
                  <div className="space-y-2">
                    <InlineSelect
                      value={p.attendance_status}
                      options={attendanceOptions}
                      onSave={(v) => handleUpdate(p.id, 'attendance_status', v)}
                    />
                    <InlineSelect
                      value={p.registration_status}
                      options={registrationOptions}
                      onSave={(v) => handleUpdate(p.id, 'registration_status', v)}
                    />
                    <InlineSelect
                      value={p.payment_status}
                      options={paymentOptions}
                      onSave={(v) => handleUpdate(p.id, 'payment_status', v)}
                    />
                  </div>
                </div>

                {/* Column 2: Logistics (Vertical Stack with Icons as Labels) */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Logistics</h4>
                  
                  {/* Accommodation */}
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <InlineSelect
                      value={p.accommodation_plan || 'unknown'}
                      options={accommodationOptions}
                      onSave={(v) => handleUpdate(p.id, 'accommodation_plan', v)}
                      placeholder="Accommodation Plan"
                    />
                  </div>
                  
                  {/* Transportation */}
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400" />
                    <InlineSelect
                      value={p.transportation_plan || 'unknown'}
                      options={transportationOptions}
                      onSave={(v) => handleUpdate(p.id, 'transportation_plan', v)}
                      placeholder="Transportation Plan"
                    />
                  </div>
                  
                  {/* ETA */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <InlineInput
                      value={p.eta}
                      onSave={(v) => handleUpdate(p.id, 'eta', v)}
                      placeholder="Add ETA (e.g., Fri 5pm)"
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Column 3: Health & Comms */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Health & Comms</h4>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-600">Dietary:</span>
                    <InlineInput
                      value={p.dietary_requirements}
                      onSave={(v) => handleUpdate(p.id, 'dietary_requirements', v)}
                      placeholder="None specified"
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <InlineSelect
                      value={p.whatsapp_status || 'not_invited'}
                      options={whatsappOptions}
                      onSave={(v) => handleUpdate(p.id, 'whatsapp_status', v)}
                      placeholder="WhatsApp Status"
                    />
                  </div>
                </div>

                {/* Column 4: Notes & Metadata */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Notes & Tags</h4>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-600">Notes:</span>
                    <InlineInput
                      value={p.notes}
                      onSave={(v) => handleUpdate(p.id, 'notes', v)}
                      type="textarea"
                      placeholder="Add notes..."
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-600">Tags:</span>
                    <InlineInput
                      value={p.tags?.join(', ') || ''}
                      onSave={(v) => handleUpdate(p.id, 'tags', v)}
                      placeholder="Add tags (comma separated)"
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Metadata (Consolidated) */}
                  <div className="flex flex-wrap gap-3 pt-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                    {p.source && (
                      <div className="flex items-center gap-1">
                        Source: {p.source}
                      </div>
                    )}
                    {p.created_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(p.created_at, "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};