"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, User, Mail, Phone, Utensils, FileText, Clock } from "lucide-react";
import { Participant } from "@/types";
import { DietaryMultiSelect } from "./DietaryMultiSelect";

interface AddParticipantDialogProps {
  onAdd: (participant: Partial<Participant>) => void;
  retreatId: string;
}

export const AddParticipantDialog: React.FC<AddParticipantDialogProps> = ({ onAdd, retreatId }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    dietary_requirements: "",
    notes: "",
    eta: "" // New field
  });

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      dietary_requirements: "",
      notes: "",
      eta: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) return;

    onAdd({
      ...formData,
      retreat_id: retreatId,
      registration_status: "received",
      payment_status: "not_paid",
      attendance_status: "interested",
      source: "manual",
      tags: ["manual-entry"],
      whatsapp_status: "not_invited" // Default status for manual entry
    });

    resetForm();
    setOpen(false);
  };

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#1e2a5e] hover:bg-[#2b3a7a] rounded-none uppercase tracking-[0.2em] text-[10px] h-10 px-6">
          <Plus className="w-4 h-4 mr-2" />
          Add Participant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-none">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl uppercase tracking-widest text-[#1e2a5e]">Add Participant</DialogTitle>
          <DialogDescription className="font-serif italic">
            Create a new participant record manually. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                <User className="w-3 h-3" /> Full Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="name" 
                required
                placeholder="John Doe"
                className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                  <Mail className="w-3 h-3" /> Email
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="john@example.com"
                  className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                  <Phone className="w-3 h-3" /> Phone
                </Label>
                <Input 
                  id="phone"
                  placeholder="+1 234 567 890"
                  className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="eta" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                <Clock className="w-3 h-3" /> Estimated Arrival Time (ETA)
              </Label>
              <Input 
                id="eta"
                placeholder="e.g., Fri 5pm or Sat 9:00 am"
                className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10"
                value={formData.eta}
                onChange={(e) => setFormData({...formData, eta: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="dietary" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                <Utensils className="w-3 h-3" /> Dietary Requirements
              </Label>
              <DietaryMultiSelect
                value={formData.dietary_requirements}
                onChange={(value) => setFormData({...formData, dietary_requirements: value})}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                <FileText className="w-3 h-3" /> Notes
              </Label>
              <Textarea 
                id="notes"
                placeholder="Any special considerations..."
                className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 min-h-[80px] resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-[#1e2a5e] hover:bg-[#2b3a7a]" disabled={!formData.full_name.trim()}>
            Add Participant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};