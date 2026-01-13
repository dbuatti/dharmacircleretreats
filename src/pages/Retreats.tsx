"use client";

import React, { useEffect, useState } from "react";
import { Plus, Calendar, MapPin, Users, Link as LinkIcon, ExternalLink, Archive, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/BrandLogo";
import { Retreat } from "@/types";

const Retreats = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRetreat, setNewRetreat] = useState({
    name: "",
    dates: "",
    location: "",
    capacity: 20
  });

  const fetchRetreats = async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("retreats")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load retreats");
    } else {
      setRetreats(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRetreats();
  }, [session]);

  const handleCreate = async () => {
    if (!newRetreat.name) {
      toast.error("Retreat name is required");
      return;
    }

    const { data, error } = await supabase
      .from("retreats")
      .insert([
        { 
          ...newRetreat, 
          user_id: session?.user.id,
          status: "open"
        }
      ])
      .select();

    if (error) {
      toast.error("Failed to create retreat");
    } else {
      toast.success("Retreat created!");
      setIsCreateOpen(false);
      fetchRetreats();
      if (data && data[0]) {
        navigate(`/retreat/${data[0].id}`);
      }
    }
  };

  const copyRegLink = (id: string) => {
    const link = `${window.location.origin}/register/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Registration link copied!");
  };

  if (loading) return <div className="p-12 text-center font-serif italic text-gray-400">Loading retreats...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-gray-100 pb-12">
        <div className="flex items-center gap-6">
          <BrandLogo className="w-16 h-16" />
          <div>
            <h2 className="brand-script text-[#1e2a5e]/60 text-lg italic tracking-normal">Space for awakening</h2>
            <h1 className="text-4xl font-light tracking-[0.2em] uppercase text-[#1e2a5e]">My Retreats</h1>
          </div>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1e2a5e] hover:bg-[#2b3a7a] rounded-none uppercase tracking-[0.2em] text-[10px] h-12 px-8">
              <Plus className="w-4 h-4 mr-2" />
              New Retreat
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-none border-none">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-xl uppercase tracking-widest text-[#1e2a5e]">Create Retreat</DialogTitle>
              <DialogDescription className="font-serif italic">Enter the details for your upcoming sangha gathering.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] uppercase tracking-widest text-gray-500">Retreat Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Summer Yoga Intensive" 
                  className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10"
                  value={newRetreat.name}
                  onChange={(e) => setNewRetreat({...newRetreat, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dates" className="text-[10px] uppercase tracking-widest text-gray-500">Dates</Label>
                  <Input 
                    id="dates" 
                    placeholder="June 12-15" 
                    className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10"
                    value={newRetreat.dates}
                    onChange={(e) => setNewRetreat({...newRetreat, dates: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-[10px] uppercase tracking-widest text-gray-500">Max Capacity</Label>
                  <Input 
                    id="capacity" 
                    type="number"
                    className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10"
                    value={newRetreat.capacity}
                    onChange={(e) => setNewRetreat({...newRetreat, capacity: parseInt(e.target.value) || 20})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-[10px] uppercase tracking-widest text-gray-500">Location</Label>
                <Input 
                  id="location" 
                  placeholder="Bali, Indonesia" 
                  className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10"
                  value={newRetreat.location}
                  onChange={(e) => setNewRetreat({...newRetreat, location: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} className="w-full bg-[#1e2a5e] hover:bg-[#2b3a7a] rounded-none uppercase tracking-[0.2em] text-[10px] py-6">
                Initialize Retreat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {retreats.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-2 border-gray-200 shadow-none bg-transparent">
          <CardContent className="space-y-4">
            <h3 className="text-2xl font-light uppercase tracking-widest text-gray-300">Quiet Space</h3>
            <p className="font-serif italic text-gray-400">No retreats scheduled yet. Begin by creating your first event.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {retreats.map((retreat) => (
            <Card key={retreat.id} className="flex flex-col rounded-none border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
              <div className="h-1 bg-[#1e2a5e] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <CardHeader className="space-y-4">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="rounded-none border-gray-200 text-[9px] uppercase tracking-widest font-medium py-1 px-2">
                    {retreat.status === "open" ? (
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-2.5 h-2.5" /> Registration Open</span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400"><Archive className="w-2.5 h-2.5" /> Archived</span>
                    )}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-light uppercase tracking-[0.15em] leading-tight min-h-[3rem] text-[#1e2a5e]">
                  {retreat.name}
                </CardTitle>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" /> {retreat.dates}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                    <MapPin className="w-3.5 h-3.5" /> {retreat.location}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 border-t border-gray-50 mt-4 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">
                    <Users className="w-3.5 h-3.5" /> Space for {retreat.capacity}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="grid grid-cols-2 border-t border-gray-50 p-0">
                <Button 
                  variant="ghost" 
                  className="rounded-none h-14 uppercase tracking-widest text-[9px] border-r border-gray-50 text-gray-500 hover:bg-[#1e2a5e] hover:text-white transition-colors" 
                  onClick={() => copyRegLink(retreat.id)}
                >
                  <LinkIcon className="w-3.5 h-3.5 mr-2" />
                  Copy Link
                </Button>
                <Button 
                  asChild
                  className="rounded-none h-14 uppercase tracking-widest text-[9px] bg-transparent text-[#1e2a5e] hover:bg-[#1e2a5e] hover:text-white transition-colors"
                >
                  <Link to={`/retreat/${retreat.id}`}>
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    Open Dashboard
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <footer className="text-center pt-24 text-[10px] uppercase tracking-[0.3em] text-gray-300 font-medium pb-12">
        Dharma Circle — Yoga & Buddhist Meditation Centre
      </footer>
    </div>
  );
};

export default Retreats;