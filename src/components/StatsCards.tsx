"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Participant } from "@/types";

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">Capacity: {capacity}</div>
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
  );
};