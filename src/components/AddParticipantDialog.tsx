"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { Participant } from "@/types";

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
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name) return;

    onAdd({
      ...formData,
      retreat_id: retreatId,
      registration_status: "received",
      payment_status: "not_paid",
      attendance_status: "interested",
      tags: ["manual-entry"]
    });

    // Reset form and close dialog
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      dietary_requirements: "",
      notes: ""
    });
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
      <DialogContent className="rounded-none border-none">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl uppercase tracking-widest text-[#1e2a5e]">Add Participant</DialogTitle>
          <DialogDescription className="font-serif italic">Enter details for a new participant.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] uppercase tracking-widest text-gray-500">Full Name *</Label>
            <Input 
              id="name" 
              required
              className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-gray-500">Email</Label>
              <Input 
                id="email" 
                type="email"
                className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest text-gray-500">Phone</Label>
              <Input 
                id="phone"
                className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dietary" className="text-[10px] uppercase tracking-widest text-gray-500">Dietary Requirements</Label>
            <Input 
              id="dietary"
              className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10"
              value={formData.dietary_requirements}
              onChange={(e) => setFormData({...formData, dietary_requirements: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[10px] uppercase tracking-widest text-gray-500">Notes</Label>
            <Textarea 
              id="notes"
              className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 min-h-[80px] resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-[#1e2a5e] hover:bg-[#2b3a7a]">Add Participant</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};