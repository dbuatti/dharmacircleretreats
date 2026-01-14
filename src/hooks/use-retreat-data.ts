import { useState, useCallback, useEffect, useRef } from "react";
import { Participant, Retreat } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

// Helper function to format dates from Supabase string to Date object
const formatParticipantDates = (p: any): Participant => ({
  ...p,
  created_at: new Date(p.created_at),
  last_contacted: p.last_contacted ? new Date(p.last_contacted) : undefined
});

export function useRetreatData(retreatId: string | undefined) {
  const { session } = useSession();
  const [retreat, setRetreat] = useState<Retreat | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Track pending updates to prevent duplicates (still useful for bulk actions/rapid clicks)
  const pendingUpdates = useRef(new Set<string>());

  const fetchData = useCallback(async () => {
    if (!session || !retreatId) return;
    
    // Only set loading true if we are currently not loading and need to fetch data
    if (!loading) setLoading(true);
    
    try {
      const [retreatResult, participantsResult] = await Promise.all([
        supabase.from('retreats').select('*').eq('id', retreatId).single(),
        supabase.from('participants').select('*').eq('retreat_id', retreatId).order('created_at', { ascending: false })
      ]);

      if (retreatResult.error) {
        toast.error("Retreat not found");
        console.error("[useRetreatData] Retreat fetch error:", retreatResult.error);
        setRetreat(null);
      } else {
        setRetreat(retreatResult.data);
      }

      if (participantsResult.error) {
        setParticipants([]);
        console.error("[useRetreatData] Participants fetch error:", participantsResult.error);
      } else if (participantsResult.data) {
        setParticipants(participantsResult.data.map(formatParticipantDates));
      }
    } catch (error) {
      console.error('[useRetreatData] General Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [session, retreatId]);

  // Real-time and initial fetch setup
  useEffect(() => {
    if (!retreatId) return;
    
    fetchData();
    
    // 1. Retreat Channel (for retreat metadata changes)
    const retreatChannel = supabase
      .channel(`retreat-${retreatId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'retreats', 
        filter: `id=eq.${retreatId}` 
      }, (payload) => {
        console.log(`[useRetreatData] Realtime retreat event: ${payload.eventType}`);
        if (payload.new) {
            setRetreat(payload.new as Retreat);
        }
      })
      .subscribe();

    // 2. Participants Channel (for participant list changes)
    const participantsChannel = supabase
      .channel(`participants-${retreatId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'participants', 
        filter: `retreat_id=eq.${retreatId}` 
      }, (payload) => {
        console.log(`[useRetreatData] Realtime participant event: ${payload.eventType}`);
        
        setParticipants(prevParticipants => {
          const newParticipants = [...prevParticipants];
          const newRecord = payload.new as Participant | undefined;
          const oldRecord = payload.old as Participant | undefined;
          
          if (payload.eventType === 'INSERT' && newRecord) {
            // Add new participant (e.g., from public registration or manual add by another user)
            if (!newParticipants.some(p => p.id === newRecord.id)) {
                const participantWithDate = formatParticipantDates(newRecord);
                // Insert at the beginning since we sort by created_at descending
                return [participantWithDate, ...newParticipants];
            }
          } else if (payload.eventType === 'UPDATE' && newRecord) {
            // Update existing participant
            const index = newParticipants.findIndex(p => p.id === newRecord.id);
            if (index !== -1) {
                newParticipants[index] = formatParticipantDates(newRecord);
                return newParticipants;
            }
          } else if (payload.eventType === 'DELETE' && oldRecord) {
            // Remove deleted participant
            return newParticipants.filter(p => p.id !== oldRecord.id);
          }
          
          return prevParticipants; // No change or handled by optimistic update
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(retreatChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [fetchData, retreatId]);

  const updateRetreat = async (updates: Partial<Retreat>) => {
    if (!retreatId) return;
    
    // Optimistic update for retreat details
    setRetreat(prev => prev ? { ...prev, ...updates } : null);

    const { error } = await supabase.from('retreats').update(updates).eq('id', retreatId);
    if (error) {
      toast.error("Retreat update failed. Please refresh.");
      console.error("[useRetreatData] Update retreat error:", error);
      // Rely on real-time listener or manual refresh to correct state if needed
    } else {
      toast.success("Retreat updated");
    }
  };

  const addParticipant = async (data: Partial<Participant>) => {
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
      console.error("[useRetreatData] Add participant error:", error);
    } else if (newPart) {
      // Real-time listener handles state update, but we can ensure the toast is shown
      toast.success("Participant added");
    }
  };

  const updateParticipant = async (id: string, updates: Partial<Participant>) => {
    // Prevent duplicate updates for the same field
    const updateKey = `${id}-${Object.keys(updates).join('-')}`;
    if (pendingUpdates.current.has(updateKey)) {
      console.log(`[useRetreatData] Skipping duplicate update for ${updateKey}`);
      return;
    }
    
    pendingUpdates.current.add(updateKey);
    setIsUpdating(true);

    // 1. Optimistic Update: Apply changes immediately to local state
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));

    try {
      const { error } = await supabase.from('participants').update(updates).eq('id', id);
      
      if (error) {
        console.error(`[useRetreatData] Update failed for ${id}:`, error);
        toast.error("Database update failed. Please refresh to revert local changes.");
        // If update fails, the real-time listener won't fire, so the optimistic change remains.
        // We rely on the user refreshing or a subsequent successful fetch to correct the state.
        throw new Error("Database update failed"); 
      }
      
      console.log(`[useRetreatData] Participant ${id.substring(0, 4)} updated successfully via API.`);
    } finally {
      pendingUpdates.current.delete(updateKey);
      setIsUpdating(false);
    }
  };

  const deleteParticipant = async (id: string) => {
    // Optimistic delete
    setParticipants(prev => prev.filter(p => p.id !== id));
    
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (error) {
      toast.error("Delete failed. Reverting list.");
      console.error("[useRetreatData] Delete participant error:", error);
      // Re-fetch data to revert the optimistic delete
      fetchData();
    } else {
      // Real-time listener handles state update for other users
      toast.success("Participant removed");
    }
  };

  return {
    retreat,
    participants,
    loading,
    isUpdating,
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