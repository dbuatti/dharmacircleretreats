"use client";

import React, { useEffect, useState } from "react";
import { Plus, Calendar, MapPin, Users, Link as LinkIcon, ExternalLink } from "lucide-react";
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

export interface Retreat {
  id: string;
  name: string;
  dates: string;
  location: string;
  capacity: number;
  status: string;
}

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

  if (loading) return <div className="p-8 text-center">Loading retreats...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Retreats</h1>
          <p className="text-gray-500">Manage your upcoming events</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Retreat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Retreat</DialogTitle>
              <DialogDescription>Fill in the details for your upcoming retreat.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Summer Yoga Intensive" 
                  value={newRetreat.name}
                  onChange={(e) => setNewRetreat({...newRetreat, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dates">Dates</Label>
                <Input 
                  id="dates" 
                  placeholder="e.g. June 12-15, 2024" 
                  value={newRetreat.dates}
                  onChange={(e) => setNewRetreat({...newRetreat, dates: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="e.g. Bali, Indonesia" 
                  value={newRetreat.location}
                  onChange={(e) => setNewRetreat({...newRetreat, location: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input 
                  id="capacity" 
                  type="number"
                  value={newRetreat.capacity}
                  onChange={(e) => setNewRetreat({...newRetreat, capacity: parseInt(e.target.value) || 20})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Create Retreat</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {retreats.length === 0 ? (
        <Card className="p-12 text-center">
          <CardHeader>
            <CardTitle>No retreats yet</CardTitle>
            <CardDescription>Click the button above to create your first retreat.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {retreats.map((retreat) => (
            <Card key={retreat.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{retreat.name}</CardTitle>
                  <Badge variant={retreat.status === "open" ? "default" : "secondary"}>
                    {retreat.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1 mt-2">
                  <Calendar className="w-3 h-3" /> {retreat.dates}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {retreat.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Capacity: {retreat.capacity}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => copyRegLink(retreat.id)}>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Reg Link
                </Button>
                <Button size="sm" asChild>
                  <Link to={`/retreat/${retreat.id}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Retreats;