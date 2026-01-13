import { useState, useCallback } from "react";
import { Participant, Retreat } from "@/components/retreat-dashboard";
import { toast } from "sonner";

export function useRetreatData() {
  const [retreat, setRetreat] = useState<Retreat>({
    id: "retreat-1",
    name: "Spring Renewal Retreat",
    dates: "March 15-17, 2024",
    location: "Mountain Sanctuary, CA",
    capacity: 20,
    whatsapp_link: "https://chat.whatsapp.com/example",
    status: "open",
    organisers: ["Alex", "Sam"]
  });

  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "p1",
      full_name: "Sarah Chen",
      email: "sarah.chen@email.com",
      phone: "+1-555-0101",
      source: "whatsapp",
      registration_status: "confirmed",
      payment_status: "paid_in_full",
      attendance_status: "confirmed",
      dietary_requirements: "Vegetarian, gluten-free",
      notes: "First-time attendee, very excited",
      tags: ["vegan", "early-bird"],
      last_contacted: new Date("2024-02-20"),
      added_by: "Alex",
      created_at: new Date("2024-02-15")
    },
    {
      id: "p2",
      full_name: "Marcus Johnson",
      email: "marcus.j@email.com",
      source: "email",
      registration_status: "incomplete",
      payment_status: "deposit_paid",
      attendance_status: "confirmed",
      dietary_requirements: "",
      notes: "Waiting for full payment",
      tags: ["waitlist"],
      added_by: "Sam",
      created_at: new Date("2024-02-18")
    },
    {
      id: "p3",
      full_name: "Priya Sharma",
      phone: "+1-555-0103",
      source: "manual",
      registration_status: "not_sent",
      payment_status: "not_paid",
      attendance_status: "interested",
      dietary_requirements: "Vegan",
      notes: "Friend of participant, might join",
      tags: ["friend-of-facilitator"],
      added_by: "Alex",
      created_at: new Date("2024-02-22")
    },
    {
      id: "p4",
      full_name: "David Kim",
      email: "david.kim@email.com",
      phone: "+1-555-0104",
      source: "whatsapp",
      registration_status: "received",
      payment_status: "not_paid",
      attendance_status: "confirmed",
      dietary_requirements: "No shellfish allergy",
      notes: "Joined WhatsApp but hasn't filled form",
      tags: ["allergy-alert"],
      last_contacted: new Date("2024-02-25"),
      added_by: "Sam",
      created_at: new Date("2024-02-20")
    },
    {
      id: "p5",
      full_name: "Emma Wilson",
      email: "emma.w@email.com",
      source: "forwarded",
      registration_status: "sent",
      payment_status: "not_paid",
      attendance_status: "interested",
      dietary_requirements: "",
      notes: "Invited by Sarah, hasn't responded",
      tags: ["pending"],
      added_by: "Alex",
      created_at: new Date("2024-02-23")
    }
  ]);

  const addParticipant = useCallback((participantData: Partial<Participant>) => {
    const participant: Participant = {
      id: `p${Date.now()}`,
      full_name: participantData.full_name!,
      email: participantData.email,
      phone: participantData.phone,
      source: participantData.source || "manual",
      registration_status: participantData.registration_status || "not_sent",
      payment_status: participantData.payment_status || "not_paid",
      attendance_status: participantData.attendance_status || "interested",
      dietary_requirements: participantData.dietary_requirements || "",
      notes: participantData.notes || "",
      tags: participantData.tags || [],
      added_by: "Current User",
      created_at: new Date()
    };

    setParticipants(prev => [...prev, participant]);
    toast.success(`${participant.full_name} added to retreat`);
  }, []);

  const updateParticipant = useCallback((id: string, updates: Partial<Participant>) => {
    setParticipants(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
    toast.success("Participant updated");
  }, []);

  const sendEmails = useCallback((participantIds: string[], template: "registration" | "welcome" | "final") => {
    const selected = participants.filter(p => participantIds.includes(p.id));
    
    if (selected.length === 0) {
      toast.error("No participants selected");
      return;
    }

    // Simulate sending
    toast.success(`Sent ${selected.length} ${template} email(s)`);

    // Update last contacted and registration status
    setParticipants(prev => 
      prev.map(p => 
        participantIds.includes(p.id) 
          ? { 
              ...p, 
              last_contacted: new Date(), 
              registration_status: p.registration_status === "not_sent" ? "sent" : p.registration_status 
            }
          : p
      )
    );
  }, [participants]);

  const copyWhatsApp = useCallback(() => {
    navigator.clipboard.writeText(retreat.whatsapp_link);
    toast.success("WhatsApp link copied to clipboard");
  }, [retreat.whatsapp_link]);

  return {
    retreat,
    participants,
    addParticipant,
    updateParticipant,
    sendEmails,
    copyWhatsApp
  };
}