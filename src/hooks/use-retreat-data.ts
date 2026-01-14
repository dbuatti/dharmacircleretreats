import { useState, useCallback, useEffect } from "react";
import { Participant, Retreat } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

export function useRetreatData(retreatId: string | undefined) {
  const { session } = useSession();
  const [retreat, setRetreat] = useState<Retreat | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!session || !retreatId) return;
    setLoading(true);
    try {
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

      const { data: partData, error: partError } = await supabase
        .from('participants')
        .select('*')
        .eq('retreat_id', retreatId)
        .order('created_at', { ascending: false });

      if (partError) {
        setParticipants([]);
      } else if (partData) {
        setParticipants(partData.map(p => ({
          ...p,
          created_at: new Date(p.created_at),
          last_contacted: p.last_contacted ? new Date(p.last_contacted) : undefined
        })));
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [session, retreatId]);

  useEffect(() => {
    fetchData();
    
    // We are removing the real-time listener here to prevent full re-fetches on every participant change.
    // Updates will now be handled via local state manipulation in the functions below.
    
    // However, we keep the channel open for potential future use or if other tables need real-time updates.
    const channel = supabase
      .channel(`retreat-${retreatId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'retreats', // Only listen to retreat changes, not participants
        filter: `id=eq.${retreatId}` 
      }, () => fetchData()) // Re-fetch only if retreat details change
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, retreatId]);

  const updateRetreat = async (updates: Partial<Retreat>) => {
    const { data, error } = await supabase.from('retreats').update(updates).eq('id', retreatId).select().single();
    if (error) {
      toast.error("Update failed");
      console.error("Update retreat error:", error);
    } else {
      setRetreat(data); // Update local state immediately
      toast.success("Retreat updated");
    }
  };

  const addParticipant = async (data: Partial<Participant>) => {
    // Validate required fields
    if (!data.full_name || !data.email) {
      toast.error("Name and email are required");
      return;
    }

    const insertPayload = {
      ...data,
      retreat_id: retreatId,
      user_id: session?.user.id,
      added_by: session?.user.email
    };

    const { data: newPart, error } = await supabase
      .from('participants')
      .insert([insertPayload])
      .select()
      .single();
    
    if (error) {
      toast.error("Failed to add participant");
      console.error("Add participant error:", error);
    } else if (newPart) {
      // Update local state immediately
      const participantWithDate: Participant = {
        ...newPart,
        created_at: new Date(newPart.created_at),
        last_contacted: newPart.last_contacted ? new Date(newPart.last_contacted) : undefined
      };
      setParticipants(prev => [participantWithDate, ...prev]);
      toast.success("Participant added");
    }
  };

  const updateParticipant = async (id: string, updates: Partial<Participant>) => {
    // Note: The ParticipantSheet component handles the optimistic update in the UI.
    // We only need to handle the database sync and error rollback here.
    const { error } = await supabase.from('participants').update(updates).eq('id', id);
    
    if (error) {
      // The ParticipantSheet component is responsible for rolling back the UI state if this promise rejects/fails.
      console.error("Update participant error:", error);
      throw new Error("Database update failed"); 
    }
    // Success: No need to update local state here, as the ParticipantSheet already did the optimistic update.
    // If we were to update state here, it would cause a double-render, which is fine, but we rely on the sheet's optimistic update for speed.
  };

  const deleteParticipant = async (id: string) => {
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (error) {
      toast.error("Delete failed");
      console.error("Delete participant error:", error);
    } else {
      // Update local state immediately
      setParticipants(prev => prev.filter(p => p.id !== id));
      toast.success("Participant removed");
    }
  };

  return {
    retreat,
    participants,
    loading,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    updateRetreat,
    copyWhatsApp: () => {
      if (retreat?.whatsapp_link) {
        navigator.clipboard.writeText(retreat.whatsapp_link);
        toast.success("WhatsApp link copied");
      } else toast.error("No link set");
    }
  };
}