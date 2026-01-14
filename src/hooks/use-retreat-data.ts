import { useState, useCallback, useEffect, useRef } from "react";
import { Participant, Retreat } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

export function useRetreatData(retreatId: string | undefined) {
  const { session } = useSession();
  const [retreat, setRetreat] = useState<Retreat | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Track pending updates to prevent duplicates
  const pendingUpdates = useRef(new Set<string>());

  const fetchData = useCallback(async () => {
    if (!session || !retreatId) return;
    
    setLoading(true);
    try {
      const [retreatResult, participantsResult] = await Promise.all([
        supabase.from('retreats').select('*').eq('id', retreatId).single(),
        supabase.from('participants').select('*').eq('retreat_id', retreatId).order('created_at', { ascending: false })
      ]);

      if (retreatResult.error) {
        toast.error("Retreat not found");
        console.error("[useRetreatData] Retreat fetch error:", retreatResult.error);
        return;
      }
      setRetreat(retreatResult.data);

      if (participantsResult.error) {
        setParticipants([]);
        console.error("[useRetreatData] Participants fetch error:", participantsResult.error);
      } else if (participantsResult.data) {
        setParticipants(participantsResult.data.map(p => ({
          ...p,
          created_at: new Date(p.created_at),
          last_contacted: p.last_contacted ? new Date(p.last_contacted) : undefined
        })));
      }
    } catch (error) {
      console.error('[useRetreatData] General Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [session, retreatId]);

  useEffect(() => {
    if (!retreatId) return;
    
    fetchData();
    
    // Real-time subscription for retreat changes
    const channel = supabase
      .channel(`retreat-${retreatId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'retreats', 
        filter: `id=eq.${retreatId}` 
      }, () => {
        console.log("[useRetreatData] Realtime retreat update detected");
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, retreatId]);

  const updateRetreat = async (updates: Partial<Retreat>) => {
    if (!retreatId) return;
    
    const { data, error } = await supabase.from('retreats').update(updates).eq('id', retreatId).select().single();
    if (error) {
      toast.error("Update failed");
      console.error("[useRetreatData] Update retreat error:", error);
    } else {
      setRetreat(data);
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
    // Prevent duplicate updates for the same field
    const updateKey = `${id}-${Object.keys(updates).join('-')}`;
    if (pendingUpdates.current.has(updateKey)) {
      console.log(`[useRetreatData] Skipping duplicate update for ${updateKey}`);
      return;
    }
    
    pendingUpdates.current.add(updateKey);
    setIsUpdating(true);

    try {
      const { error } = await supabase.from('participants').update(updates).eq('id', id);
      
      if (error) {
        console.error(`[useRetreatData] Update failed for ${id}:`, error);
        throw new Error("Database update failed"); 
      }

      // Update local state immediately
      setParticipants(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, ...updates };
        }
        return p;
      }));
      
      console.log(`[useRetreatData] Participant ${id.substring(0, 4)} updated successfully`);
    } finally {
      pendingUpdates.current.delete(updateKey);
      setIsUpdating(false);
    }
  };

  const deleteParticipant = async (id: string) => {
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (error) {
      toast.error("Delete failed");
      console.error("[useRetreatData] Delete participant error:", error);
    } else {
      setParticipants(prev => prev.filter(p => p.id !== id));
      toast.success("Participant removed");
    }
  };

  return {
    retreat,
    participants,
    loading,
    isUpdating, // New: indicates when updates are in progress
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