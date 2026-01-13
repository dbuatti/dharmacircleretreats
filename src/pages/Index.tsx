"use client";

import { RetreatDashboard } from "@/components/retreat-dashboard";
import { useRetreatData } from "@/hooks/use-retreat-data";
import { Toaster } from "@/components/ui/toaster";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { retreat, participants, loading, addParticipant, updateParticipant, sendEmails, copyWhatsApp } = useRetreatData();
  const { session } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading retreat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toaster />
      <RetreatDashboard
        retreat={retreat}
        participants={participants}
        onAddParticipant={addParticipant}
        onUpdateParticipant={updateParticipant}
        onSendEmails={sendEmails}
        onCopyWhatsApp={copyWhatsApp}
        onLogout={handleLogout}
        userEmail={session?.user?.email}
      />
    </div>
  );
};

export default Index;