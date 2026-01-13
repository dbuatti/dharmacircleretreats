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
import { Retreat } from "@/types";
import { Calendar, MapPin, Users, Link as LinkIcon } from "lucide-react";

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

  // Reset form when dialog opens or retreat changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: retreat.name,
        dates: retreat.dates,
        location: retreat.location,
        capacity: retreat.capacity,
        whatsapp_link: retreat.whatsapp_link || ""
      });
    }
  }, [open, retreat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-none">
        <DialogHeader>
          <DialogTitle className="text-xl uppercase tracking-widest text-[#1e2a5e]">Edit Retreat Details</DialogTitle>
          <DialogDescription className="font-serif italic">
            Update the core information for this retreat. Changes are saved immediately.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="flex items-center gap-2 text-sm font-medium">
                <span className="w-4 h-4 text-gray-400">📝</span> Retreat Name
              </Label>
              <Input 
                id="edit-name" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Summer Yoga Intensive"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dates" className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="w-4 h-4 text-gray-400" /> Dates
                </Label>
                <Input 
                  id="edit-dates" 
                  value={formData.dates}
                  onChange={(e) => setFormData({...formData, dates: e.target.value})}
                  placeholder="June 12-15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-capacity" className="flex items-center gap-2 text-sm font-medium">
                  <Users className="w-4 h-4 text-gray-400" /> Capacity
                </Label>
                <Input 
                  id="edit-capacity" 
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location" className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="w-4 h-4 text-gray-400" /> Location
              </Label>
              <Input 
                id="edit-location" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Bali, Indonesia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-whatsapp" className="flex items-center gap-2 text-sm font-medium">
                <LinkIcon className="w-4 h-4 text-gray-400" /> WhatsApp Group Link
              </Label>
              <Input 
                id="edit-whatsapp" 
                placeholder="https://chat.whatsapp.com/..."
                value={formData.whatsapp_link}
                onChange={(e) => setFormData({...formData, whatsapp_link: e.target.value})}
              />
            </div>
          </div>
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