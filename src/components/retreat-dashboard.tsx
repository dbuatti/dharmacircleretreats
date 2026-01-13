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
      <header className="bg-[#1e2a5e] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
          <BrandLogo className="w-16 h-16 shadow-lg" />
          <div className="space-y-2">
            <h2 className="brand-script text-white/90 text-xl italic tracking-normal normal-case">Space For Awakening</h2>
            <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] uppercase">{retreat.name}</h1>
            <div className="flex flex-wrap justify-center items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/70 pt-4">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {retreat.dates}</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {retreat.location}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Button 
              variant="outline" 
              className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white uppercase tracking-[0.2em] text-[10px] h-10 px-6 rounded-none transition-all" 
              onClick={() => setShowEditRetreat(true)}
            >
              <Settings className="w-3 h-3 mr-2" />
              Retreat Settings
            </Button>
            <Button 
              variant="outline" 
              className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white uppercase tracking-[0.2em] text-[10px] h-10 px-6 rounded-none transition-all" 
              onClick={onCopyWhatsApp}
            >
              <MessageCircle className="w-3 h-3 mr-2" />
              WhatsApp Group
            </Button>
            <Button 
              variant="ghost" 
              className="text-white/60 hover:text-white hover:bg-transparent uppercase tracking-[0.2em] text-[10px] h-10 transition-all flex items-center gap-2" 
              onClick={onLogout}
            >
              <LogOut className="w-3 h-3" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        <StatsCards participants={participants} capacity={retreat.capacity} />

        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
            <h3 className="text-xl font-light uppercase tracking-[0.2em] text-[#1e2a5e]">Manage Participants</h3>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10 border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] bg-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Card className="border-none shadow-none bg-white">
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