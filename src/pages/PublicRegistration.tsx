"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, Calendar, MapPin, Loader2, AlertCircle, LogIn, User as UserIcon, Shield } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useSession } from "@/contexts/SessionContext";

const PublicRegistration = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useSession();
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

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (session?.user) {
      const email = session.user.email || "";
      const fullName = session.user.user_metadata?.full_name || 
                      session.user.user_metadata?.name || 
                      email.split('@')[0];
      
      setFormData(prev => ({
        ...prev,
        email: email,
        full_name: prev.full_name || fullName
      }));
    }
  }, [session]);

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

  const handleLoginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/register/${id}`
      }
    });

    if (error) {
      toast.error("Login failed");
      console.error("Login error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.full_name || !formData.email) {
      setError("Name and Email are required fields.");
      toast.error("Please fill in all required fields");
      return;
    }

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
        tags: ["public-registration"],
        // Link to user if logged in
        ...(session?.user?.id && { user_id: session.user.id })
      };

      const { error } = await supabase
        .from("participants")
        .insert([insertData]);

      if (error) {
        console.error("Submission error details:", error);
        if (error.code === "23505") {
          setError("This email is already registered for this retreat.");
          toast.error("Already registered");
        } else if (error.code === "23503") {
          setError("Invalid retreat ID. Please check your registration link.");
          toast.error("Invalid retreat link");
        } else if (error.code === "23514") {
          setError("Invalid data format. Please check your inputs.");
          toast.error("Data validation error");
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    // Reset form
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      dietary_requirements: "",
      notes: ""
    });
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
        {/* Header */}
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

        {/* Login Status & Google Sign-In Section */}
        {session ? (
          <div className="bg-green-50 border border-green-200 rounded-none p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                Logged in as <strong>{session.user?.email}</strong>
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-100 rounded-none text-[10px] uppercase tracking-widest"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Large Google Sign-In Button */}
            <div className="bg-white border-2 border-[#1e2a5e] rounded-none p-6 text-center shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5 text-[#1e2a5e]" />
                  <h3 className="text-lg font-semibold text-[#1e2a5e] uppercase tracking-widest">
                    Save Your Information
                  </h3>
                </div>
                <p className="text-sm text-gray-600 font-serif italic">
                  Sign in with Google to save your details for faster future registrations
                </p>
                
                <Button 
                  onClick={handleLoginWithGoogle}
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-none h-14 shadow-sm transition-all hover:shadow-md"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-semibold">Continue with Google</span>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#fcfcfc] px-3 text-gray-500">OR</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 font-serif italic">
                  You can also fill out the form below without signing in
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <Card className="border-none shadow-sm p-4 md:p-8">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-light uppercase tracking-widest text-[#1e2a5e]">
              {session ? "Complete Your Registration" : "Register"}
            </CardTitle>
            <div className="h-px w-12 bg-gray-200 mx-auto" />
            <CardDescription className="font-serif italic text-base">
              {session 
                ? "Review your details below and submit to complete registration" 
                : "Please fill in your details to join our sangha for this retreat."}
            </CardDescription>
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
                      disabled={submitting || !!session} // Can't change if logged in
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