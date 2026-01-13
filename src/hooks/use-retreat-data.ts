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

    const channel = supabase
      .channel(`retreat-${retreatId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'participants', 
        filter: `retreat_id=eq.${retreatId}` 
      }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, retreatId]);

  const updateRetreat = async (updates: Partial<Retreat>) => {
    const { error } = await supabase.from('retreats').update(updates).eq('id', retreatId);
    if (error) {
      toast.error("Update failed");
      console.error("Update retreat error:", error);
    } else {
      toast.success("Retreat updated");
      fetchData();
    }
  };

  const addParticipant = async (data: Partial<Participant>) => {
    // Validate required fields
    if (!data.full_name || !data.email) {
      toast.error("Name and email are required");
      return;
    }

    const { error } = await supabase.from('participants').insert([{
      ...data,
      retreat_id: retreatId,
      user_id: session?.user.id,
      added_by: session?.user.email
    }]);
    
    if (error) {
      toast.error("Failed to add participant");
      console.error("Add participant error:", error);
    } else {
      toast.success("Participant added");
      fetchData();
    }
  };

  const updateParticipant = async (id: string, updates: Partial<Participant>) => {
    const { error } = await supabase.from('participants').update(updates).eq('id', id);
    if (error) {
      toast.error("Update failed");
      console.error("Update participant error:", error);
    } else {
      toast.success("Participant updated");
      fetchData();
    }
  };

  const deleteParticipant = async (id: string) => {
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (error) {
      toast.error("Delete failed");
      console.error("Delete participant error:", error);
    } else {
      toast.success("Participant removed");
      fetchData();
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