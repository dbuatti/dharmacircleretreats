"use client";

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RetreatDashboard } from "@/components/retreat-dashboard";
import { useRetreatData } from "@/hooks/use-retreat-data";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const RetreatDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { retreat, participants, loading, addParticipant, updateParticipant, sendEmails, copyWhatsApp } = useRetreatData(id);
  const { session } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
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
        retreat={retreat as any}
        participants={participants}
        onAddParticipant={addParticipant}
        onUpdateParticipant={updateParticipant}
        onSendEmails={sendEmails as any}
        onCopyWhatsApp={copyWhatsApp}
        onLogout={handleLogout}
        userEmail={session?.user?.email}
      />
    </div>
  );
};

export default RetreatDetail;