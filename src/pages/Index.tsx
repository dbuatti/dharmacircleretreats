"use client";

import { RetreatDashboard } from "@/components/retreat-dashboard";
import { useRetreatData } from "@/hooks/use-retreat-data";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const { retreat, participants, addParticipant, updateParticipant, sendEmails, copyWhatsApp } = useRetreatData();

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
      />
    </div>
  );
};

export default Index;