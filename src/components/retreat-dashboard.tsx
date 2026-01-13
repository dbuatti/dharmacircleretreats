"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  MessageCircle,
  LogOut,
  Settings,
  Search,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatsCards } from "./StatsCards";
import { ParticipantTable } from "./ParticipantTable";
import { EditRetreatDialog } from "./EditRetreatDialog";
import { BrandLogo } from "./BrandLogo";

export interface Participant {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  registration_status: string;
  payment_status: string;
  attendance_status: string;
  dietary_requirements: string;
  notes: string;
  tags: string[];
  created_at: Date;
}

export interface Retreat {
  id: string;
  name: string;
  dates: string;
  location: string;
  capacity: number;
  whatsapp_link?: string;
}

interface RetreatDashboardProps {
  retreat: Retreat;
  participants: Participant[];
  onAddParticipant: (p: Partial<Participant>) => void;
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => void;
  onDeleteParticipant: (id: string) => void;
  onUpdateRetreat: (updates: Partial<Retreat>) => void;
  onCopyWhatsApp: () => void;
  onLogout: () => void;
  userEmail?: string;
}

export const RetreatDashboard: React.FC<RetreatDashboardProps> = ({
  retreat,
  participants,
  onUpdateParticipant,
  onDeleteParticipant,
  onUpdateRetreat,
  onCopyWhatsApp,
  onLogout
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditRetreat, setShowEditRetreat] = useState(false);

  const filteredParticipants = participants.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <header className="bg-[#1e2a5e] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
          <BrandLogo className="w-16 h-16 shadow-lg" />
          <div className="space-y-2">
            <h2 className="brand-script text-white/80 text-xl italic capitalize tracking-normal">Space for awakening</h2>
            <h1 className="text-3xl md:text-4xl font-light tracking-widest uppercase">{retreat.name}</h1>
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm uppercase tracking-wider text-white/70 pt-2">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {retreat.dates}</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {retreat.location}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 uppercase tracking-widest text-[10px]" size="sm" onClick={() => setShowEditRetreat(true)}>
              <Settings className="w-3 h-3 mr-2" />
              Retreat Settings
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 uppercase tracking-widest text-[10px]" size="sm" onClick={onCopyWhatsApp}>
              <MessageCircle className="w-3 h-3 mr-2" />
              WhatsApp Group
            </Button>
            <Button variant="ghost" className="text-white/60 hover:text-white uppercase tracking-widest text-[10px]" size="sm" onClick={onLogout}>
              <LogOut className="w-3 h-3 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        <StatsCards participants={participants} capacity={retreat.capacity} />

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <h3 className="text-xl font-light uppercase tracking-widest text-[#1e2a5e]">Manage Participants</h3>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10 border-gray-200 focus:ring-[#1e2a5e]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <ParticipantTable 
                participants={filteredParticipants} 
                onUpdate={onUpdateParticipant}
                onDelete={onDeleteParticipant}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <EditRetreatDialog 
        retreat={retreat}
        open={showEditRetreat}
        onOpenChange={setShowEditRetreat}
        onSave={onUpdateRetreat}
      />
    </div>
  );
};