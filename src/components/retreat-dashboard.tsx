"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search,
  ArrowUpCircle,
  Clock,
  Utensils,
  MessageCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

// Types
export interface Participant {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  source: "email" | "whatsapp" | "manual" | "forwarded";
  registration_status: "not_sent" | "sent" | "received" | "incomplete" | "confirmed";
  payment_status: "not_paid" | "deposit_paid" | "paid_in_full";
  attendance_status: "interested" | "confirmed" | "withdrawn" | "declined";
  dietary_requirements: string;
  notes: string;
  tags: string[];
  last_contacted?: Date;
  added_by: string;
  created_at: Date;
}

export interface Retreat {
  id: string;
  name: string;
  dates: string;
  location: string;
  capacity: number;
  whatsapp_link: string;
  status: "planning" | "open" | "closed" | "full" | "completed";
  organisers: string[];
}

interface RetreatDashboardProps {
  retreat: Retreat;
  participants: Participant[];
  onAddParticipant: (participant: Partial<Participant>) => void;
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => void;
  onSendEmails: (participantIds: string[], template: "registration" | "welcome" | "final") => void;
  onCopyWhatsApp: () => void;
}

export const RetreatDashboard: React.FC<RetreatDashboardProps> = ({
  retreat,
  participants,
  onAddParticipant,
  onUpdateParticipant,
  onSendEmails,
  onCopyWhatsApp
}) => {
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newParticipant, setNewParticipant] = useState<Partial<Participant>>({
    full_name: "",
    email: "",
    phone: "",
    source: "manual",
    registration_status: "not_sent",
    payment_status: "not_paid",
    attendance_status: "interested",
    dietary_requirements: "",
    notes: "",
    tags: []
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<"registration" | "welcome" | "final">("registration");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  // Stats
  const stats = {
    total: participants.length,
    confirmed: participants.filter(p => p.attendance_status === "confirmed").length,
    paid: participants.filter(p => p.payment_status === "paid_in_full").length,
    incomplete: participants.filter(p => p.registration_status === "incomplete" || p.registration_status === "not_sent").length,
    dietary: participants.filter(p => p.dietary_requirements).length,
    capacity: retreat.capacity,
    remaining: retreat.capacity - participants.filter(p => p.attendance_status === "confirmed").length
  };

  // Filtered participants
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
                          (filterStatus === "confirmed" && p.attendance_status === "confirmed") ||
                          (filterStatus === "incomplete" && (p.registration_status === "incomplete" || p.registration_status === "not_sent")) ||
                          (filterStatus === "paid" && p.payment_status === "paid_in_full") ||
                          (filterStatus === "dietary" && p.dietary_requirements);
    
    return matchesSearch && matchesFilter;
  });

  // Handlers
  const handleAddParticipant = () => {
    if (!newParticipant.full_name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    // Check for duplicates
    const duplicate = participants.find(p => 
      p.full_name.toLowerCase() === newParticipant.full_name?.toLowerCase() ||
      (p.email && newParticipant.email && p.email.toLowerCase() === newParticipant.email.toLowerCase()) ||
      (p.phone && newParticipant.phone && p.phone === newParticipant.phone)
    );

    if (duplicate) {
      toast({ 
        title: "Possible duplicate detected", 
        description: `Similar to: ${duplicate.full_name}. Please confirm before adding.`,
        variant: "destructive"
      });
      return;
    }

    onAddParticipant(newParticipant);
    setNewParticipant({
      full_name: "",
      email: "",
      phone: "",
      source: "manual",
      registration_status: "not_sent",
      payment_status: "not_paid",
      attendance_status: "interested",
      dietary_requirements: "",
      notes: "",
      tags: []
    });
    setShowAddDialog(false);
  };

  const handleSendEmails = () => {
    if (selectedParticipants.length === 0) {
      toast({ title: "No participants selected", variant: "destructive" });
      return;
    }

    onSendEmails(selectedParticipants, emailTemplate);
    setSelectedParticipants([]);
    setShowEmailDialog(false);
  };

  const getStatusBadge = (status: string, type: "registration" | "payment" | "attendance") => {
    const styles = {
      registration: {
        not_sent: "bg-gray-200 text-gray-800",
        sent: "bg-blue-100 text-blue-800",
        received: "bg-purple-100 text-purple-800",
        incomplete: "bg-orange-100 text-orange-800",
        confirmed: "bg-green-100 text-green-800"
      },
      payment: {
        not_paid: "bg-red-100 text-red-800",
        deposit_paid: "bg-yellow-100 text-yellow-800",
        paid_in_full: "bg-green-100 text-green-800"
      },
      attendance: {
        interested: "bg-gray-100 text-gray-800",
        confirmed: "bg-green-100 text-green-800",
        withdrawn: "bg-red-100 text-red-800",
        declined: "bg-red-200 text-red-900"
      }
    };
    
    return <Badge className={styles[type][status]}>{status.replace("_", " ")}</Badge>;
  };

  const getDietarySummary = () => {
    const counts: Record<string, number> = {};
    participants.forEach(p => {
      if (p.dietary_requirements) {
        const items = p.dietary_requirements.split(",").map(s => s.trim());
        items.forEach(item => {
          counts[item] = (counts[item] || 0) + 1;
        });
      }
    });
    return counts;
  };

  const dietarySummary = getDietarySummary();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{retreat.name}</h1>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {retreat.dates} • {retreat.location}
                <span className="text-gray-400">|</span>
                <span className="font-medium">
                  {stats.confirmed}/{retreat.capacity} confirmed
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Participant
              </Button>
              <Button variant="outline" onClick={onCopyWhatsApp}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Copy WhatsApp Link
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-xs text-gray-500 mt-1">Capacity: {retreat.capacity}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.remaining > 0 ? `${stats.remaining} spots left` : "At capacity"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Paid in Full</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.paid}</div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((stats.paid / stats.confirmed) * 100 || 0)}% of confirmed
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Needs Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.incomplete}</div>
              <div className="text-xs text-gray-500 mt-1">Action required</div>
            </CardContent>
          </Card>
        </div>

        {/* Dietary & Capacity Alerts */}
        <div className="grid md:grid-cols-2 gap-4">
          {stats.dietary > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Dietary Requirements ({stats.dietary})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dietarySummary).map(([item, count]) => (
                    <Badge key={item} variant="secondary">
                      {item} ({count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.remaining <= 3 && stats.remaining > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Capacity Warning
                </CardTitle>
              </CardHeader>
              <CardContent className="text-orange-700">
                Only {stats.remaining} spot{stats.remaining !== 1 ? "s" : ""} left. Consider closing registration soon.
              </CardContent>
            </Card>
          )}

          {stats.remaining === 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  At Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="text-red-700">
                Retreat is full. New participants should go to waitlist.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Participant Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Participants</CardTitle>
            <div className="flex gap-2">
              <Input 
                placeholder="Search name, email, phone..." 
                className="w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="border rounded px-2 py-1 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="confirmed">Confirmed</option>
                <option value="incomplete">Incomplete</option>
                <option value="paid">Paid</option>
                <option value="dietary">Dietary</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Dietary</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <div>{p.full_name}</div>
                        {p.notes && <div className="text-xs text-gray-500 mt-1">{p.notes}</div>}
                        {p.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {p.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {p.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {p.email}
                            </div>
                          )}
                          {p.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {p.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {p.source}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(p.registration_status, "registration")}</TableCell>
                      <TableCell>{getStatusBadge(p.payment_status, "payment")}</TableCell>
                      <TableCell>{getStatusBadge(p.attendance_status, "attendance")}</TableCell>
                      <TableCell>
                        {p.dietary_requirements ? (
                          <Badge className="bg-purple-100 text-purple-800">
                            {p.dietary_requirements}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => onUpdateParticipant(p.id, { 
                              registration_status: p.registration_status === "confirmed" ? "incomplete" : "confirmed" 
                            })}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => onUpdateParticipant(p.id, { 
                              payment_status: p.payment_status === "paid_in_full" ? "not_paid" : "paid_in_full" 
                            })}
                          >
                            <ArrowUpCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Email Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Communication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>Email Template</Label>
                <select 
                  className="border rounded px-3 py-2 w-full"
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value as any)}
                >
                  <option value="registration">Registration Form</option>
                  <option value="welcome">Welcome & Info Pack</option>
                  <option value="final">Final Details</option>
                </select>
              </div>
              <div className="flex-1 space-y-2">
                <Label>Recipients</Label>
                <div className="text-sm text-gray-600">
                  {selectedParticipants.length} selected
                </div>
              </div>
              <Button 
                onClick={() => {
                  if (selectedParticipants.length === 0) {
                    // Select all incomplete
                    const incomplete = participants
                      .filter(p => p.registration_status === "not_sent" || p.registration_status === "incomplete")
                      .map(p => p.id);
                    setSelectedParticipants(incomplete);
                    toast({ title: `Selected ${incomplete.length} incomplete participants` });
                  }
                  setShowEmailDialog(true);
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Send Emails
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              <strong>Quick Select:</strong> Click "Send Emails" without selection to auto-select all incomplete participants.
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {participants.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium">{p.full_name}</span>
                    <span className="text-gray-500 ml-2">added by {p.added_by}</span>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {p.created_at.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add Participant Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Participant</DialogTitle>
            <DialogDescription>
              Add someone with as little or as much info as you have. The system will help you complete it later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input 
                placeholder="e.g., Jordan Smith"
                value={newParticipant.full_name}
                onChange={(e) => setNewParticipant({...newParticipant, full_name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email"
                placeholder="jordan@email.com"
                value={newParticipant.email || ""}
                onChange={(e) => setNewParticipant({...newParticipant, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input 
                placeholder="+1-555-0123"
                value={newParticipant.phone || ""}
                onChange={(e) => setNewParticipant({...newParticipant, phone: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>How did they join?</Label>
              <select 
                className="border rounded px-3 py-2 w-full"
                value={newParticipant.source}
                onChange={(e) => setNewParticipant({...newParticipant, source: e.target.value as any})}
              >
                <option value="manual">Manually added</option>
                <option value="email">Email referral</option>
                <option value="whatsapp">WhatsApp link</option>
                <option value="forwarded">Forwarded invite</option>
              </select>
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label>Dietary Requirements</Label>
              <Input 
                placeholder="e.g., Vegan, gluten-free, nut allergy"
                value={newParticipant.dietary_requirements || ""}
                onChange={(e) => setNewParticipant({...newParticipant, dietary_requirements: e.target.value})}
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label>Notes (Private)</Label>
              <Textarea 
                placeholder="e.g., Friend of Sarah, might need payment plan"
                value={newParticipant.notes || ""}
                onChange={(e) => setNewParticipant({...newParticipant, notes: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddParticipant}>Add Participant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Send Emails</DialogTitle>
            <DialogDescription>
              Sending {selectedParticipants.length} {emailTemplate} email(s) to selected participants.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Template Preview:</strong>
              <div className="mt-2 text-gray-600">
                {emailTemplate === "registration" && "Subject: Please complete your registration for " + retreat.name}
                {emailTemplate === "welcome" && "Subject: Welcome to " + retreat.name + "!"}
                {emailTemplate === "final" && "Subject: Final details for " + retreat.name}
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              This will mark these participants as "sent" and update their last contacted date.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button>
            <Button onClick={handleSendEmails}>Send Emails</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};