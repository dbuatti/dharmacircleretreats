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
    const totalStartTime = performance.now();
    setLoading(true);
    try {
      const retreatStartTime = performance.now();
      const { data: retreatData, error: retreatError } = await supabase
        .from('retreats')
        .select('*')
        .eq('id', retreatId)
        .single();
      const retreatDuration = performance.now() - retreatStartTime;
      console.log(`[useRetreatData] Fetch Retreat Details: ${retreatDuration.toFixed(3)} ms`);

      if (retreatError) {
        toast.error("Retreat not found");
        console.error("[useRetreatData] Retreat fetch error:", retreatError);
        return;
      }
      setRetreat(retreatData);

      const participantsStartTime = performance.now();
      const { data: partData, error: partError } = await supabase
        .from('participants')
        .select('*')
        .eq('retreat_id', retreatId)
        .order('created_at', { ascending: false });
      const participantsDuration = performance.now() - participantsStartTime;
      console.log(`[useRetreatData] Fetch Participants List: ${participantsDuration.toFixed(3)} ms`);

      if (partError) {
        setParticipants([]);
        console.error("[useRetreatData] Participants fetch error:", partError);
      } else if (partData) {
        setParticipants(partData.map(p => ({
          ...p,
          created_at: new Date(p.created_at),
          last_contacted: p.last_contacted ? new Date(p.last_contacted) : undefined
        })));
        console.log(`[useRetreatData] Loaded ${partData.length} participants.`);
      }
    } catch (error) {
      console.error('[useRetreatData] General Fetch error:', error);
    } finally {
      setLoading(false);
      const totalDuration = performance.now() - totalStartTime;
      console.log(`[useRetreatData] Total Data Fetch Time: ${totalDuration.toFixed(3)} ms`);
    }
  }, [session, retreatId]);

  useEffect(() => {
    console.log("[useRetreatData] Hook initialized/Retreat ID changed. Starting fetch.");
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
      }, () => {
        console.log("[useRetreatData] Realtime update detected for Retreat details. Re-fetching data.");
        fetchData();
      }) 
      .subscribe();

    return () => {
      console.log("[useRetreatData] Cleaning up Supabase channel subscription.");
      supabase.removeChannel(channel);
    };
  }, [fetchData, retreatId]);

  const updateRetreat = async (updates: Partial<Retreat>) => {
    const startTime = performance.now();
    const { data, error } = await supabase.from('retreats').update(updates).eq('id', retreatId).select().single();
    const duration = performance.now() - startTime;
    console.log(`[useRetreatData] Update Retreat Details: ${duration.toFixed(3)} ms`);
    if (error) {
      toast.error("Update failed");
      console.error("[useRetreatData] Update retreat error:", error);
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

    const startTime = performance.now();
    const { data: newPart, error } = await supabase
      .from('participants')
      .insert([insertPayload])
      .select()
      .single();
    const duration = performance.now() - startTime;
    console.log(`[useRetreatData] Add Participant API Call: ${duration.toFixed(3)} ms`);
    
    if (error) {
      toast.error("Failed to add participant");
      console.error("[useRetreatData] Add participant error:", error);
    } else if (newPart) {
      // Update local state immediately
      const participantWithDate: Participant = {
        ...newPart,
        created_at: new Date(newPart.created_at),
        last_contacted: newPart.last_contacted ? new Date(newPart.last_contacted) : undefined
      };
      setParticipants(prev => [participantWithDate, ...prev]);
      console.log("[useRetreatData] Participant added successfully, updating local state.");
      toast.success("Participant added");
    }
  };

  const updateParticipant = async (id: string, updates: Partial<Participant>) => {
    console.log(`[useRetreatData] Starting Update Participant ${id.substring(0, 4)} API Call`);
    const startTime = performance.now();
    const { error } = await supabase.from('participants').update(updates).eq('id', id);
    const endTime = performance.now();
    
    if (error) {
      console.error("[useRetreatData] Update participant error:", error);
      throw new Error("Database update failed"); 
    }
    console.log(`[useRetreatData] Participant ${id.substring(0, 4)} updated successfully. API Duration: ${(endTime - startTime).toFixed(3)} ms`);
  };

  const deleteParticipant = async (id: string) => {
    const startTime = performance.now();
    const { error } = await supabase.from('participants').delete().eq('id', id);
    const duration = performance.now() - startTime;
    console.log(`[useRetreatData] Delete Participant ${id.substring(0, 4)} API Call: ${duration.toFixed(3)} ms`);
    if (error) {
      toast.error("Delete failed");
      console.error("[useRetreatData] Delete participant error:", error);
    } else {
      // Update local state immediately
      setParticipants(prev => prev.filter(p => p.id !== id));
      console.log(`[useRetreatData] Participant ${id.substring(0, 4)} deleted successfully, updating local state.`);
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