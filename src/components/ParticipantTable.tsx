"use client";

import React from "react";
import { 
  Mail, 
  Phone, 
  CheckCircle2, 
  Trash2,
  User,
  Calendar,
  Info
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
    
    const displayText = status.replace(/_/g, " ");
    return <Badge className={`${styles[type][status as keyof typeof styles[typeof type]]} capitalize`}>{displayText}</Badge>;
  };

  const toggleRegistrationStatus = (p: Participant) => {
    const newStatus = p.registration_status === "confirmed" ? "incomplete" : "confirmed";
    onUpdate(p.id, { registration_status: newStatus });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      onDelete(id);
    }
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[200px]">Participant</TableHead>
            <TableHead className="w-[180px]">Contact</TableHead>
            <TableHead>Registration</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Attendance</TableHead>
            <TableHead>Dietary</TableHead>
            <TableHead className="text-right w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((p) => (
            <TableRow key={p.id} className="hover:bg-gray-50/50">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">{p.full_name}</span>
                </div>
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
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(p.registration_status, "registration")}</TableCell>
              <TableCell>{getStatusBadge(p.payment_status, "payment")}</TableCell>
              <TableCell>{getStatusBadge(p.attendance_status, "attendance")}</TableCell>
              <TableCell>
                {p.dietary_requirements ? (
                  <Badge variant="outline" className="text-xs capitalize">{p.dietary_requirements}</Badge>
                ) : <span className="text-gray-400 text-sm italic">None</span>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                    onClick={() => toggleRegistrationStatus(p)}
                    title="Toggle confirmed status"
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
  );
};