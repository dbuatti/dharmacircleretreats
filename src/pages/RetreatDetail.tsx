"use client";

import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RetreatDashboard } from "@/components/retreat-dashboard";
import { useRetreatData } from "@/hooks/use-retreat-data";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { ParticipantSheet } from "@/components/ParticipantSheet";

const RetreatDetail = () => {
  console.log("[RetreatDetail] Component mounted/re-rendered.");
  const { id } = useParams<{ id: string }>();
  const { 
    retreat, 
    participants, 
    loading, 
    addParticipant, 
    updateParticipant, 
    deleteParticipant,
    updateRetreat,
    copyWhatsApp 
  } = useRetreatData(id);
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      console.log("[RetreatDetail] Loading data...");
    } else if (retreat) {
      console.log(`[RetreatDetail] Data loaded. Retreat: ${retreat.name}, Participants: ${participants.length}`);
    } else {
      console.error("[RetreatDetail] Data finished loading, but retreat is null.");
    }
  }, [loading, retreat, participants.length]);

  const handleLogout = async () => {
    console.log("[RetreatDetail] Initiating logout.");
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!retreat) return <div className="p-8 text-center">Retreat not found.</div>;

  return (
    <div>
      <div className="bg-white border-b px-4 py-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Retreats
        </Button>
      </div>
      <RetreatDashboard
        retreat={retreat}
        participants={participants}
        onUpdateRetreat={updateRetreat}
        onCopyWhatsApp={copyWhatsApp}
        onLogout={handleLogout}
      >
        <ParticipantSheet
          participants={participants}
          onUpdateParticipant={updateParticipant}
          onDeleteParticipant={deleteParticipant}
          onAddParticipant={addParticipant}
        />
      </RetreatDashboard>
    </div>
  );
};

export default RetreatDetail;