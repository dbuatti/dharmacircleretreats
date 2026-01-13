"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, Calendar, MapPin } from "lucide-react";

const PublicRegistration = () => {
  const { id } = useParams<{ id: string }>();
  const [retreat, setRetreat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    dietary_requirements: "",
    notes: ""
  });

  useEffect(() => {
    const fetchRetreat = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("retreats")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Retreat not found");
      } else {
        setRetreat(data);
      }
      setLoading(false);
    };

    fetchRetreat();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      toast.error("Name and Email are required");
      return;
    }

    const { error } = await supabase
      .from("participants")
      .insert([
        {
          ...formData,
          retreat_id: id,
          source: "manual",
          registration_status: "received",
          payment_status: "not_paid",
          attendance_status: "interested",
          user_id: retreat.user_id, // Link to the organiser
          tags: ["public-registration"]
        }
      ]);

    if (error) {
      toast.error("Failed to register. Please try again.");
    } else {
      setSubmitted(true);
      toast.success("Registration submitted!");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!retreat) return <div className="min-h-screen flex items-center justify-center">Retreat not found.</div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center py-8">
          <CardContent className="space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Registration Received!</h2>
            <p className="text-gray-600">
              Thank you for registering for {retreat.name}. The organisers will be in touch with you shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{retreat.name}</h1>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {retreat.dates}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {retreat.location}</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register Your Interest</CardTitle>
            <CardDescription>Please fill in your details below to join the retreat.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input 
                  id="full_name" 
                  required 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietary">Dietary Requirements</Label>
                <Input 
                  id="dietary" 
                  placeholder="e.g. Vegan, Gluten-free"
                  value={formData.dietary_requirements}
                  onChange={(e) => setFormData({...formData, dietary_requirements: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Anything else you'd like us to know?"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full">Submit Registration</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicRegistration;