"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Participant } from "@/types";
import { Users, CheckCircle2, CreditCard, AlertCircle } from "lucide-react";

interface StatsCardsProps {
  participants: Participant[];
  capacity: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ participants, capacity }) => {
  const stats = {
    total: participants.length,
    confirmed: participants.filter(p => p.attendance_status === "confirmed").length,
    paid: participants.filter(p => p.payment_status === "paid_in_full").length,
    incomplete: participants.filter(p => p.registration_status === "incomplete" || p.registration_status === "not_sent").length,
    remaining: capacity - participants.filter(p => p.attendance_status === "confirmed").length
  };

  const cards = [
    {
      title: "Total Participants",
      value: stats.total,
      icon: Users,
      color: "text-gray-700",
      subtitle: `Capacity: ${capacity}`
    },
    {
      title: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle2,
      color: "text-green-600",
      subtitle: stats.remaining > 0 ? `${stats.remaining} spots left` : "At capacity"
    },
    {
      title: "Paid in Full",
      value: stats.paid,
      icon: CreditCard,
      color: "text-blue-600",
      subtitle: stats.confirmed > 0 ? `${Math.round((stats.paid / stats.confirmed) * 100)}% of confirmed` : "No confirmed yet"
    },
    {
      title: "Needs Info",
      value: stats.incomplete,
      icon: AlertCircle,
      color: "text-orange-600",
      subtitle: "Action required"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-gray-500 mt-1">{card.subtitle}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};