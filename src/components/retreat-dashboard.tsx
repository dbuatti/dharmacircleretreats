"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  MessageCircle,
  LogOut,
  Settings,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatsCards } from "./StatsCards";
import { ParticipantTable } from "./ParticipantTable";
import { EditRetreatDialog } from "./EditRetreatDialog";

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
  onLogout,
  userEmail
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditRetreat, setShowEditRetreat] = useState(false);

  const filteredParticipants = participants.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{retreat.name}</h1>
            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {retreat.dates} • {retreat.location}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditRetreat(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={onCopyWhatsApp}>
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <StatsCards participants={participants} capacity={retreat.capacity} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Participants</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Filter participants..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ParticipantTable 
              participants={filteredParticipants} 
              onUpdate={onUpdateParticipant}
              onDelete={onDeleteParticipant}
            />
          </CardContent>
        </Card>
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