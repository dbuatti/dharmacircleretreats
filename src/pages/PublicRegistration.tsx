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
import { BrandLogo } from "@/components/BrandLogo";

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
          source: "public",
          registration_status: "received",
          payment_status: "not_paid",
          attendance_status: "interested",
          user_id: retreat.user_id,
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
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center py-12 border-none shadow-sm">
          <CardContent className="space-y-6">
            <div className="flex justify-center mb-4">
               <BrandLogo className="w-16 h-16" />
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-light uppercase tracking-widest text-[#1e2a5e]">Thank You</h2>
              <p className="text-gray-500 font-serif italic">
                Your registration for {retreat.name} has been received. We will be in touch shortly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-8">
            <BrandLogo className="w-20 h-20" />
          </div>
          <div className="space-y-2">
            <h2 className="brand-script text-[#1e2a5e]/60 text-2xl italic tracking-normal">Space for awakening</h2>
            <h1 className="text-4xl font-light tracking-widest text-[#1e2a5e] uppercase">{retreat.name}</h1>
            <div className="flex justify-center gap-8 text-[11px] uppercase tracking-[0.2em] text-gray-400 font-medium">
              <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {retreat.dates}</span>
              <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {retreat.location}</span>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-sm p-4 md:p-8">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-light uppercase tracking-widest text-[#1e2a5e]">Register</CardTitle>
            <div className="h-px w-12 bg-gray-200 mx-auto" />
            <CardDescription className="font-serif italic text-base">Please fill in your details to join our sangha for this retreat.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-[10px] uppercase tracking-widest text-gray-500">Full Name</Label>
                  <Input 
                    id="full_name" 
                    required 
                    className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10 transition-colors"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-gray-500">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10 transition-colors"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest text-gray-500">Phone Number</Label>
                    <Input 
                      id="phone" 
                      className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10 transition-colors"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dietary" className="text-[10px] uppercase tracking-widest text-gray-500">Dietary Requirements</Label>
                  <Input 
                    id="dietary" 
                    placeholder="Vegan, Gluten-free, etc."
                    className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10 transition-colors placeholder:text-gray-300 placeholder:italic"
                    value={formData.dietary_requirements}
                    onChange={(e) => setFormData({...formData, dietary_requirements: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-[10px] uppercase tracking-widest text-gray-500">Additional Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Anything else you'd like to share..."
                    className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 min-h-[100px] transition-colors resize-none placeholder:text-gray-300 placeholder:italic"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#1e2a5e] hover:bg-[#2b3a7a] text-white uppercase tracking-[0.2em] py-6 rounded-none shadow-md transition-all active:scale-[0.98]">
                Submit Registration
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <footer className="text-center pt-12 text-[10px] uppercase tracking-widest text-gray-400 font-medium">
          Dharma Circle — Yoga & Buddhist Meditation Centre
        </footer>
      </div>
    </div>
  );
};

export default PublicRegistration;