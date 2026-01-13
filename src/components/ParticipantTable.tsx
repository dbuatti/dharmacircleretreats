"use client";

import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  CheckCircle2, 
  Trash2,
  User,
  Calendar,
  Info,
  UserCheck,
  Edit,
  Home,
  Car,
  Tag,
  Clock,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Participant } from "@/types";
import { format } from "date-fns";
import { EditParticipantDialog } from "./EditParticipantDialog";

interface ParticipantTableProps {
  participants: Participant[];
  onUpdate: (id: string, updates: Partial<Participant>) => void;
  onDelete: (id: string) => void;
}

export const ParticipantTable: React.FC<ParticipantTableProps> = ({ 
  participants, 
  onUpdate,
  onDelete 
}) => {
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const getStatusBadge = (status: string, type: "registration" | "payment" | "attendance" | "whatsapp") => {
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
      },
      whatsapp: {
        joined: "bg-green-100 text-green-800",
        invited: "bg-blue-100 text-blue-800",
        not_invited: "bg-gray-100 text-gray-600",
        not_applicable: "bg-gray-50 text-gray-400"
      }
    };
    
    const displayText = status.replace(/_/g, " ");
    const typeKey = type === 'whatsapp' ? 'whatsapp' : type;
    const statusKey = status as keyof typeof styles[typeof typeKey];

    return <Badge className={`${styles[typeKey][statusKey] || 'bg-gray-100 text-gray-600'} capitalize`}>{displayText}</Badge>;
  };

  const formatLogistics = (value: string | undefined) => {
    if (!value || value === 'unknown') {
      return <span className="text-gray-400 italic">N/A</span>;
    }
    return value.replace(/-/g, ' ');
  };

  const toggleRegistrationStatus = (p: Participant) => {
    const newStatus = p.registration_status === "confirmed" ? "incomplete" : "confirmed";
    onUpdate(p.id, { registration_status: newStatus });
  };

  const handleEdit = (p: Participant) => {
    setEditingParticipant(p);
    setShowEditDialog(true);
  };

  const handleSave = (id: string, updates: Partial<Participant>) => {
    onUpdate(id, updates);
    setEditingParticipant(null);
    setShowEditDialog(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      onDelete(id);
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[200px]">Participant</TableHead>
              <TableHead className="w-[180px]">Contact</TableHead>
              <TableHead>Accommodation</TableHead>
              <TableHead>Transport</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead className="text-right w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p) => (
              <TableRow key={p.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">{p.full_name}</span>
                    {p.user_id && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        Account Linked
                      </span>
                    )}
                  </div>
                  
                  {/* Tags and Source */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.source && (
                      <Badge variant="secondary" className="text-[9px] uppercase tracking-widest font-medium bg-gray-100 text-gray-600">
                        Source: {p.source}
                      </Badge>
                    )}
                    {p.tags && p.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[9px] uppercase tracking-widest font-medium text-blue-600 border-blue-200">
                        <Tag className="w-2.5 h-2.5 mr-1" /> {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Notes and Dates */}
                  {p.notes && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Info className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{p.notes}</span>
                    </div>
                  )}
                  {p.created_at && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {format(p.created_at, "MMM d, yyyy")}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {p.email && (
                      <div className="flex items-center gap-1 text-xs">
                        <Mail className="w-3 h-3 text-gray-400" /> 
                        <span className="truncate max-w-[120px]">{p.email}</span>
                      </div>
                    )}
                    {p.phone && (
                      <div className="flex items-center gap-1 text-xs">
                        <Phone className="w-3 h-3 text-gray-400" /> 
                        {p.phone}
                      </div>
                    )}
                    {p.dietary_requirements && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-gray-500 font-medium text-xs">Diet:</span>
                        {p.dietary_requirements.split(',').map((req, index) => (
                          <Badge key={index} variant="outline" className="text-[10px] uppercase tracking-widest font-medium text-purple-600 border-purple-200">
                            {req.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                {/* Logistics Columns */}
                <TableCell>
                  <div className="flex items-center gap-1 text-xs capitalize">
                    <Home className="w-3 h-3 text-gray-400" />
                    {formatLogistics(p.accommodation_plan)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs capitalize">
                    <Car className="w-3 h-3 text-gray-400" />
                    {formatLogistics(p.transportation_plan)}
                  </div>
                </TableCell>

                {/* ETA Column */}
                <TableCell>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {p.eta || <span className="text-gray-400 italic">N/A</span>}
                  </div>
                </TableCell>

                {/* WhatsApp Status Column */}
                <TableCell>
                  {getStatusBadge(p.whatsapp_status || 'not_invited', "whatsapp")}
                </TableCell>

                <TableCell>{getStatusBadge(p.registration_status, "registration")}</TableCell>
                <TableCell>{getStatusBadge(p.payment_status, "payment")}</TableCell>
                <TableCell>{getStatusBadge(p.attendance_status, "attendance")}</TableCell>
                
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => handleEdit(p)}
                      title="Edit all details"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                      onClick={() => toggleRegistrationStatus(p)}
                      title="Quick toggle confirmed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(p.id, p.full_name)}
                      title="Delete participant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <EditParticipantDialog
        participant={editingParticipant}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleSave}
      />
    </>
  );
};