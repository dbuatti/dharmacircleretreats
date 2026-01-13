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
import { CheckCircle2, Calendar, MapPin, Loader2, AlertCircle } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const PublicRegistration = () => {
  const { id } = useParams<{ id: string }>();
  const [retreat, setRetreat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      try {
        const { data, error } = await supabase
          .from("retreats")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching retreat:", error);
          setError("Retreat not found or link is invalid.");
          toast.error("Retreat not found");
        } else if (data?.status === "closed" || data?.status === "archived") {
          setError("This retreat is no longer accepting registrations.");
        } else {
          setRetreat(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("An error occurred while loading the retreat.");
      } finally {
        setLoading(false);
      }
    };

    fetchRetreat();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.full_name || !formData.email) {
      setError("Name and Email are required fields.");
      toast.error("Please fill in all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      toast.error("Invalid email format");
      return;
    }

    setSubmitting(true);
    try {
      const insertData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        dietary_requirements: formData.dietary_requirements.trim() || null,
        notes: formData.notes.trim() || null,
        retreat_id: id,
        source: "public",
        registration_status: "received",
        payment_status: "not_paid",
        attendance_status: "interested",
        user_id: retreat?.user_id || null,
        tags: ["public-registration"]
      };

      const { error } = await supabase
        .from("participants")
        .insert([insertData]);

      if (error) {
        console.error("Submission error details:", error);
        // Check for specific constraint violations
        if (error.code === "23505") {
          setError("This email is already registered for this retreat.");
          toast.error("Already registered");
        } else {
          setError(`Registration failed: ${error.message}`);
          toast.error("Registration failed");
        }
      } else {
        setSubmitted(true);
        toast.success("Registration submitted successfully!");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2a5e]" />
      </div>
    );
  }

  if (error && !retreat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] p-4 text-center">
        <div className="space-y-4 max-w-md">
          <div className="flex justify-center">
            <BrandLogo className="w-16 h-16" />
          </div>
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-light text-[#1e2a5e]">Registration Unavailable</h1>
          <p className="text-gray-500 font-serif italic">{error}</p>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

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
                Your registration for <strong>{retreat?.name}</strong> has been received. We will be in touch shortly.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="mt-6 rounded-none uppercase tracking-[0.2em] text-[10px]"
              onClick={() => window.location.reload()}
            >
              Register Another
            </Button>
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
            <h1 className="text-4xl font-light tracking-widest text-[#1e2a5e] uppercase">{retreat?.name}</h1>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-[11px] uppercase tracking-[0.2em] text-gray-400 font-medium">
              <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {retreat?.dates}</span>
              <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {retreat?.location}</span>
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
                  <Label htmlFor="full_name" className="text-[10px] uppercase tracking-widest text-gray-500">Full Name *</Label>
                  <Input 
                    id="full_name" 
                    required 
                    className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10 transition-colors"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    disabled={submitting}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-gray-500">Email Address *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10 transition-colors"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest text-gray-500">Phone Number</Label>
                    <Input 
                      id="phone" 
                      className="border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-[#1e2a5e] px-0 h-10 transition-colors"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-none text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-[#1e2a5e] hover:bg-[#2b3a7a] text-white uppercase tracking-[0.2em] py-6 rounded-none shadow-md transition-all active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Registration"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <footer className="text-center pt-12 text-[10px] uppercase tracking-widest text-gray-400 font-medium pb-8">
          Dharma Circle — Yoga & Buddhist Meditation Centre
        </footer>
      </div>
    </div>
  );
};

export default PublicRegistration;