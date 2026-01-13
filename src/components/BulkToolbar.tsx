"use client";

import React, { useState } from "react";
import { X, Check, Trash2, Send, MessageSquare, UserPlus, DollarSign, Utensils, Home, Car, Clock, Tag, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Participant } from "@/types";

interface BulkToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkUpdate: (updates: Partial<Participant>, mode?: 'set' | 'append' | 'prepend') => void;
  onBulkDelete: () => void;
}

export const BulkToolbar: React.FC<BulkToolbarProps> = ({ 
  selectedCount, 
  onClearSelection, 
  onBulkUpdate,
  onBulkDelete 
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'logistics' | 'health' | 'notes' | 'actions'>('status');

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-gray-900 text-white rounded-lg shadow-2xl z-50 animate-in slide-in-from-bottom-4 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm bg-blue-600 px-2 py-0.5 rounded">{selectedCount} Selected</span>
          <span className="text-xs text-gray-400">Bulk Edit Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-7 hover:bg-gray-700 text-white" onClick={onClearSelection}>
            <X className="w-3 h-3 mr-1" /> Clear
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-700 scrollbar-hide">
        {[
          { id: 'status', label: 'Status', icon: Check },
          { id: 'logistics', label: 'Logistics', icon: Home },
          { id: 'health', label: 'Health', icon: Utensils },
          { id: 'notes', label: 'Notes & Tags', icon: FileText },
          { id: 'actions', label: 'Actions', icon: Send },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-gray-800 text-white border-b-2 border-blue-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-4 bg-gray-800/50 min-h-[80px]">
        {activeTab === 'status' && (
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-400">Registration</label>
              <Select onValueChange={(v: any) => onBulkUpdate({ registration_status: v })}>
                <SelectTrigger className="h-8 w-32 bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Set Reg..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="not_sent">Not Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-400">Payment</label>
              <Select onValueChange={(v: any) => onBulkUpdate({ payment_status: v })}>
                <SelectTrigger className="h-8 w-32 bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Set Pay..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid_in_full">Paid</SelectItem>
                  <SelectItem value="deposit_paid">Deposit</SelectItem>
                  <SelectItem value="not_paid">Not Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-400">Attendance</label>
              <Select onValueChange={(v: any) => onBulkUpdate({ attendance_status: v })}>
                <SelectTrigger className="h-8 w-32 bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Set Att..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {activeTab === 'logistics' && (
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-400">Accommodation</label>
              <Select onValueChange={(v: any) => onBulkUpdate({ accommodation_plan: v })}>
                <SelectTrigger className="h-8 w-36 bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Set Accom..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camping">Camping</SelectItem>
                  <SelectItem value="offsite">Offsite</SelectItem>
                  <SelectItem value="courthouse">Courthouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-400">Transport</label>
              <Select onValueChange={(v: any) => onBulkUpdate({ transportation_plan: v })}>
                <SelectTrigger className="h-8 w-36 bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Set Trans..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driving">Driving</SelectItem>
                  <SelectItem value="driving-lift">Carpool OK</SelectItem>
                  <SelectItem value="need-lift">Needs Lift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-400">ETA</label>
              <Input 
                placeholder="e.g. Fri 5pm" 
                className="h-8 w-32 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                onBlur={(e) => onBulkUpdate({ eta: e.target.value })}
              />
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-400">Dietary (Tags)</label>
              <Input 
                placeholder="GF, DF, Onion..." 
                className="h-8 w-48 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                onBlur={(e) => {
                  const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                  // Join into a string for the bulk update
                  onBulkUpdate({ dietary_requirements: tags.join(', ') }, 'append');
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-400">WhatsApp</label>
              <Select onValueChange={(v: any) => onBulkUpdate({ whatsapp_status: v })}>
                <SelectTrigger className="h-8 w-32 bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Set Chat..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="joined">Joined</SelectItem>
                  <SelectItem value="not_invited">Not Invited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-400">Append Notes</label>
              <Input 
                placeholder="Add text..." 
                className="h-8 w-64 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                onBlur={(e) => {
                  if(e.target.value) onBulkUpdate({ notes: e.target.value }, 'append');
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-400">Add Tags</label>
              <Input 
                placeholder="tag1, tag2" 
                className="h-8 w-48 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                onBlur={(e) => {
                  const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                  if(tags.length > 0) onBulkUpdate({ tags: tags }, 'append');
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="flex flex-wrap gap-3 items-center">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8" onClick={() => toast.info("Invites sent to " + selectedCount + " participants")}>
              <Send className="w-3 h-3 mr-2" /> Send Invites
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => onBulkUpdate({ payment_status: 'paid_in_full' })}>
              <DollarSign className="w-3 h-3 mr-2" /> Mark Paid
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-8" onClick={() => onBulkUpdate({ whatsapp_status: 'invited' })}>
              <MessageSquare className="w-3 h-3 mr-2" /> WhatsApp
            </Button>
            <div className="h-6 w-px bg-gray-600 mx-2"></div>
            <Button size="sm" variant="destructive" className="h-8" onClick={onBulkDelete}>
              <Trash2 className="w-3 h-3 mr-2" /> Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};