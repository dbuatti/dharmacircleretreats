"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Participant, RegistrationStatus, PaymentStatus, AttendanceStatus } from "@/types";
import { User, Mail, Phone, Utensils, FileText, Calendar, Tag, CheckCircle2, Users, Home, Car } from "lucide-react";

interface EditParticipantDialogProps {
  participant: Participant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Participant>) => void;
}

export const EditParticipantDialog: React.FC<EditParticipantDialogProps> = ({
  participant,
  open,
  onOpenChange,
  onSave
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    dietary_requirements: "",
    notes: "",
    registration_status: "received" as RegistrationStatus,
    payment_status: "not_paid" as PaymentStatus,
    attendance_status: "interested" as AttendanceStatus,
    source: "",
    tags: [] as string[],
    last_contacted: "",
    accommodation_plan: "",
    transportation_plan: ""
  });

  useEffect(() => {
    if (open && participant) {
      setFormData({
        full_name: participant.full_name || "",
        email: participant.email || "",
        phone: participant.phone || "",
        dietary_requirements: participant.dietary_requirements || "",
        notes: participant.notes || "",
        registration_status: participant.registration_status || "received",
        payment_status: participant.payment_status || "not_paid",
        attendance_status: participant.attendance_status || "interested",
        source: participant.source || "",
        tags: participant.tags || [],
        last_contacted: participant.last_contacted 
          ? new Date(participant.last_contacted).toISOString().split('T')[0] 
          : "",
        accommodation_plan: participant.accommodation_plan || "",
        transportation_plan: participant.transportation_plan || ""
      });
    }
  }, [open, participant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participant) return;

    const updates: Partial<Participant> = {
      ...formData,
      last_contacted: formData.last_contacted ? new Date(formData.last_contacted) : undefined
    };

    onSave(participant.id, updates);
    onOpenChange(false);
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(t => t.trim()).filter(t => t);
    setFormData({ ...formData, tags });
  };

  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle className="text-xl uppercase tracking-widest text-[#1e2a5e]">
            Edit Participant
          </DialogTitle>
          <DialogDescription className="font-serif italic">
            Update all details for {participant.full_name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <User className="w-4 h-4" /> Basic Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="edit-full-name" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                <User className="w-3 h-3" /> Full Name
              </Label>
              <Input 
                id="edit-full-name" 
                required
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                  <Mail className="w-3 h-3" /> Email
                </Label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                  <Phone className="w-3 h-3" /> Phone
                </Label>
                <Input 
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Logistics Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Home className="w-4 h-4" /> Logistics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-accommodation" className="text-xs uppercase tracking-widest text-gray-500">
                  Accommodation Plan
                </Label>
                <Select 
                  value={formData.accommodation_plan} 
                  onValueChange={(value) => setFormData({...formData, accommodation_plan: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select accommodation..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="camping">Camping (bring own tent)</SelectItem>
                    <SelectItem value="offsite">Offsite (own accommodation)</SelectItem>
                    <SelectItem value="courthouse">Courthouse</SelectItem>
                    <SelectItem value="">N/A or Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-transportation" className="text-xs uppercase tracking-widest text-gray-500">
                  Transportation Plan
                </Label>
                <Select 
                  value={formData.transportation_plan} 
                  onValueChange={(value) => setFormData({...formData, transportation_plan: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transportation..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driving">Driving (own vehicle)</SelectItem>
                    <SelectItem value="driving-lift">Driving (can give a lift)</SelectItem>
                    <SelectItem value="need-lift">Need a lift</SelectItem>
                    <SelectItem value="">N/A or Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Status & Tracking
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-registration" className="text-xs uppercase tracking-widest text-gray-500">
                  Registration
                </Label>
                <Select 
                  value={formData.registration_status} 
                  onValueChange={(value: RegistrationStatus) => setFormData({...formData, registration_status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_sent">Not Sent</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-payment" className="text-xs uppercase tracking-widest text-gray-500">
                  Payment
                </Label>
                <Select 
                  value={formData.payment_status} 
                  onValueChange={(value: PaymentStatus) => setFormData({...formData, payment_status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_paid">Not Paid</SelectItem>
                    <SelectItem value="deposit_paid">Deposit Paid</SelectItem>
                    <SelectItem value="paid_in_full">Paid in Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-attendance" className="text-xs uppercase tracking-widest text-gray-500">
                  Attendance
                </Label>
                <Select 
                  value={formData.attendance_status} 
                  onValueChange={(value: AttendanceStatus) => setFormData({...formData, attendance_status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-source" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                  <Tag className="w-3 h-3" /> Source
                </Label>
                <Input 
                  id="edit-source"
                  placeholder="e.g., public, manual, link"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-last-contacted" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                  <Calendar className="w-3 h-3" /> Last Contacted
                </Label>
                <Input 
                  id="edit-last-contacted"
                  type="date"
                  value={formData.last_contacted}
                  onChange={(e) => setFormData({...formData, last_contacted: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Additional Details
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="edit-dietary" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                <Utensils className="w-3 h-3" /> Dietary Requirements
              </Label>
              <Input 
                id="edit-dietary"
                placeholder="Vegan, Gluten-free, etc."
                value={formData.dietary_requirements}
                onChange={(e) => setFormData({...formData, dietary_requirements: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                <Tag className="w-3 h-3" /> Tags (comma separated)
              </Label>
              <Input 
                id="edit-tags"
                placeholder="early-bird, friend-of, etc."
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                <FileText className="w-3 h-3" /> Notes
              </Label>
              <Textarea 
                id="edit-notes"
                placeholder="Any special considerations or notes..."
                className="min-h-[100px]"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          {/* User Info (Read-only) */}
          {participant.user_id && (
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center gap-2 text-xs text-green-700 font-medium">
                <Users className="w-3 h-3" />
                <span>Account Linked: {participant.user_id}</span>
              </div>
              {participant.added_by && (
                <div className="text-xs text-gray-500">
                  Added by: {participant.added_by}
                </div>
              )}
              {participant.created_at && (
                <div className="text-xs text-gray-500">
                  Created: {new Date(participant.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-[#1e2a5e] hover:bg-[#2b3a7a]">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};