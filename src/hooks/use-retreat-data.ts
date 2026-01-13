import { useState, useCallback, useEffect } from "react";
import { Participant, Retreat } from "@/components/retreat-dashboard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

export function useRetreatData() {
  const { session } = useSession();
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

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch participants from Supabase
  useEffect(() => {
    if (!session) return;

    const fetchParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('participants')
          .select('*')
          .eq('retreat_id', 'retreat-1')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching participants:', error);
          // Fallback to sample data
          setParticipants([
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
          return;
        }

        if (data) {
          // Convert Supabase dates to Date objects
          const formattedData = data.map(p => ({
            ...p,
            created_at: new Date(p.created_at),
            last_contacted: p.last_contacted ? new Date(p.last_contacted) : undefined
          }));
          setParticipants(formattedData);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();

    // Set up real-time subscription
    const channel = supabase
      .channel('participants-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `retreat_id=eq.retreat-1` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setParticipants(prev => [{ ...payload.new, created_at: new Date(payload.new.created_at) }, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setParticipants(prev => prev.map(p => p.id === payload.new.id ? { ...payload.new, created_at: new Date(payload.new.created_at) } : p));
          } else if (payload.eventType === 'DELETE') {
            setParticipants(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const addParticipant = useCallback(async (participantData: Partial<Participant>) => {
    if (!session) {
      toast.error("You must be logged in");
      return;
    }

    // Check for duplicates in current data
    const duplicate = participants.find(p => 
      p.full_name.toLowerCase() === participantData.full_name?.toLowerCase() ||
      (p.email && participantData.email && p.email.toLowerCase() === participantData.email.toLowerCase()) ||
      (p.phone && participantData.phone && p.phone === participantData.phone)
    );

    if (duplicate) {
      toast.error(`Possible duplicate: ${duplicate.full_name}`);
      return;
    }

    const participant: Partial<Participant> = {
      ...participantData,
      retreat_id: "retreat-1",
      added_by: session.user.email || "Unknown",
      created_at: new Date()
    };

    try {
      const { error } = await supabase
        .from('participants')
        .insert([participant]);

      if (error) {
        toast.error(`Failed to add: ${error.message}`);
        return;
      }

      toast.success(`${participantData.full_name} added to retreat`);
    } catch (error) {
      toast.error("Unexpected error adding participant");
    }
  }, [participants, session]);

  const updateParticipant = useCallback(async (id: string, updates: Partial<Participant>) => {
    if (!session) {
      toast.error("You must be logged in");
      return;
    }

    try {
      const { error } = await supabase
        .from('participants')
        .update(updates)
        .eq('id', id);

      if (error) {
        toast.error(`Failed to update: ${error.message}`);
        return;
      }

      toast.success("Participant updated");
    } catch (error) {
      toast.error("Unexpected error updating participant");
    }
  }, [session]);

  const sendEmails = useCallback(async (participantIds: string[], template: "registration" | "welcome" | "final") => {
    if (!session) {
      toast.error("You must be logged in");
      return;
    }

    const selected = participants.filter(p => participantIds.includes(p.id));
    
    if (selected.length === 0) {
      toast.error("No participants selected");
      return;
    }

    // Update last contacted and registration status in database
    try {
      const updates = participantIds.map(id => 
        supabase
          .from('participants')
          .update({ 
            last_contacted: new Date().toISOString(),
            registration_status: participants.find(p => p.id === id)?.registration_status === "not_sent" ? "sent" : undefined
          })
          .eq('id', id)
      );

      await Promise.all(updates);
      
      toast.success(`Sent ${selected.length} ${template} email(s)`);
    } catch (error) {
      toast.error("Failed to send emails");
    }
  }, [participants, session]);

  const copyWhatsApp = useCallback(() => {
    navigator.clipboard.writeText(retreat.whatsapp_link);
    toast.success("WhatsApp link copied to clipboard");
  }, [retreat.whatsapp_link]);

  return {
    retreat,
    participants,
    loading,
    addParticipant,
    updateParticipant,
    sendEmails,
    copyWhatsApp
  };
}