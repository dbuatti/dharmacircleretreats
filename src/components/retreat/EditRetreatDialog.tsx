"use client";

import React, { useState } from "react";
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
import { Retreat } from "@/components/retreat-dashboard";

interface EditRetreatDialogProps {
  retreat: Retreat;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Retreat>) => void;
}

export const EditRetreatDialog: React.FC<EditRetreatDialogProps> = ({
  retreat,
  open,
  onOpenChange,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: retreat.name,
    dates: retreat.dates,
    location: retreat.location,
    capacity: retreat.capacity,
    whatsapp_link: retreat.whatsapp_link || ""
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Retreat Details</DialogTitle>
          <DialogDescription>Update the core information for this retreat.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input 
              id="edit-name" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-dates">Dates</Label>
            <Input 
              id="edit-dates" 
              value={formData.dates}
              onChange={(e) => setFormData({...formData, dates: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input 
              id="edit-location" 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-capacity">Capacity</Label>
            <Input 
              id="edit-capacity" 
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-whatsapp">WhatsApp Group Link</Label>
            <Input 
              id="edit-whatsapp" 
              placeholder="https://chat.whatsapp.com/..."
              value={formData.whatsapp_link}
              onChange={(e) => setFormData({...formData, whatsapp_link: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            onSave(formData);
            onOpenChange(false);
          }}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};