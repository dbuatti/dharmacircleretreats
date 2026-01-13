import { useState, useCallback, useEffect } from "react";
import { Participant, Retreat } from "@/components/retreat-dashboard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

export function useRetreatData(retreatId: string | undefined) {
  const { session } = useSession();
  const [retreat, setRetreat] = useState<Retreat | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !retreatId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch retreat details
        const { data: retreatData, error: retreatError } = await supabase
          .from('retreats')
          .select('*')
          .eq('id', retreatId)
          .single();

        if (retreatError) {
          toast.error("Retreat not found");
          return;
        }
        setRetreat(retreatData);

        // Fetch participants
        const { data: partData, error: partError } = await supabase
          .from('participants')
          .select('*')
          .eq('retreat_id', retreatId)
          .order('created_at', { ascending: false });

        if (partError) {
          console.error('Error fetching participants:', partError);
          setParticipants([]);
        } else if (partData) {
          const formattedData = partData.map(p => ({
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

    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel(`retreat-${retreatId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `retreat_id=eq.${retreatId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newParticipant = { ...payload.new, created_at: new Date(payload.new.created_at) } as Participant;
            setParticipants(prev => [newParticipant, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedParticipant = { ...payload.new, created_at: new Date(payload.new.created_at) } as Participant;
            setParticipants(prev => prev.map(p => p.id === payload.new.id ? updatedParticipant : p));
          } else if (payload.eventType === 'DELETE') {
            setParticipants(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, retreatId]);

  const addParticipant = useCallback(async (participantData: Partial<Participant>) => {
    if (!session || !retreatId) {
      toast.error("Missing session or retreat ID");
      return;
    }

    const participant = {
      ...participantData,
      retreat_id: retreatId,
      user_id: session.user.id,
      added_by: session.user.email || "Unknown",
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
  }, [retreatId, session]);

  const updateParticipant = useCallback(async (id: string, updates: Partial<Participant>) => {
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
  }, []);

  const sendEmails = useCallback(async (participantIds: string[], template: string) => {
    const updates = participantIds.map(id => 
      supabase
        .from('participants')
        .update({ last_contacted: new Date().toISOString() })
        .eq('id', id)
    );

    await Promise.all(updates);
    toast.success(`Sent emails to ${participantIds.length} participants`);
  }, []);

  const copyWhatsApp = useCallback(() => {
    if (retreat?.whatsapp_link) {
      navigator.clipboard.writeText(retreat.whatsapp_link);
      toast.success("WhatsApp link copied");
    } else {
      toast.error("No WhatsApp link set");
    }
  }, [retreat]);

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