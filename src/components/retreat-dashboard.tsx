"use client";

import React, { useState } from "react";
import { Calendar, MessageCircle, LogOut, Settings, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCards } from "./StatsCards";
import { EditRetreatDialog } from "./EditRetreatDialog";
import { BrandLogo } from "./BrandLogo";
import { Participant, Retreat } from "@/types";
import { ParticipantView } from "./ParticipantView";

interface RetreatDashboardProps {
  retreat: Retreat;
  participants: Participant[];
  onAddParticipant: (p: Partial<Participant>) => void;
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => void;
  onDeleteParticipant: (id: string) => void;
  onUpdateRetreat: (updates: Partial<Retreat>) => void;
  onCopyWhatsApp: () => void;
  onLogout: () => void;
}

export const RetreatDashboard: React.FC<RetreatDashboardProps> = ({
  retreat,
  participants,
  onAddParticipant,
  onUpdateParticipant,
  onDeleteParticipant,
  onUpdateRetreat,
  onCopyWhatsApp,
  onLogout
}) => {
  const [showEditRetreat, setShowEditRetreat] = useState(false);

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      {/* Header */}
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
          <h3 className="text-xl font-light uppercase tracking-[0.2em] text-[#1e2a5e] border-b border-gray-100 pb-6">Manage Participants</h3>
          
          <ParticipantView
            retreatId={retreat.id}
            participants={participants}
            onAddParticipant={onAddParticipant}
            onUpdateParticipant={onUpdateParticipant}
            onDeleteParticipant={onDeleteParticipant}
          />
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