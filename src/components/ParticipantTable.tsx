"use client";

import React from "react";
import { 
  Mail, 
  Phone, 
  CheckCircle2, 
  Trash2
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
import { Participant } from "@/components/retreat-dashboard";

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
    
    return <Badge className={styles[type][status as keyof typeof styles[typeof type]]}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Registration</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Attendance</TableHead>
            <TableHead>Dietary</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">
                <div>{p.full_name}</div>
                {p.notes && <div className="text-xs text-gray-500 truncate max-w-[200px]">{p.notes}</div>}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {p.email && (
                    <div className="flex items-center gap-1 text-xs">
                      <Mail className="w-3 h-3" /> {p.email}
                    </div>
                  )}
                  {p.phone && (
                    <div className="flex items-center gap-1 text-xs">
                      <Phone className="w-3 h-3" /> {p.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(p.registration_status, "registration")}</TableCell>
              <TableCell>{getStatusBadge(p.payment_status, "payment")}</TableCell>
              <TableCell>{getStatusBadge(p.attendance_status, "attendance")}</TableCell>
              <TableCell>
                {p.dietary_requirements ? (
                  <Badge variant="outline" className="text-xs">{p.dietary_requirements}</Badge>
                ) : <span className="text-gray-400 text-sm">—</span>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={() => onUpdate(p.id, { 
                      registration_status: p.registration_status === "confirmed" ? "incomplete" : "confirmed" 
                    })}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(p.id)}
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