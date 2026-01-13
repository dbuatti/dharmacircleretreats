import { 
  RegistrationStatus, 
  PaymentStatus, 
  AttendanceStatus 
} from "@/types";

interface Option {
  value: string;
  label: string;
  badgeClass: string;
}

export const registrationOptions: Option[] = [
  { value: "not_sent", label: "Not Sent", badgeClass: "bg-gray-200 text-gray-800" },
  { value: "sent", label: "Sent", badgeClass: "bg-blue-100 text-blue-800" },
  { value: "received", label: "Received", badgeClass: "bg-purple-100 text-purple-800" },
  { value: "incomplete", label: "Incomplete", badgeClass: "bg-orange-100 text-orange-800" },
  { value: "confirmed", label: "Confirmed", badgeClass: "bg-green-100 text-green-800" },
];

export const paymentOptions: Option[] = [
  { value: "not_paid", label: "Not Paid", badgeClass: "bg-red-100 text-red-800" },
  { value: "deposit_paid", label: "Deposit Paid", badgeClass: "bg-yellow-100 text-yellow-800" },
  { value: "paid_in_full", label: "Paid in Full", badgeClass: "bg-green-100 text-green-800" },
];

export const attendanceOptions: Option[] = [
  { value: "interested", label: "Interested", badgeClass: "bg-gray-100 text-gray-800" },
  { value: "confirmed", label: "Confirmed", badgeClass: "bg-green-100 text-green-800" },
  { value: "withdrawn", label: "Withdrawn", badgeClass: "bg-red-100 text-red-800" },
  { value: "declined", label: "Declined", badgeClass: "bg-red-200 text-red-900" },
];

export const whatsappOptions: Option[] = [
  { value: "joined", label: "Joined", badgeClass: "bg-green-100 text-green-800" },
  { value: "invited", label: "Invited", badgeClass: "bg-blue-100 text-blue-800" },
  { value: "not_invited", label: "Not Invited", badgeClass: "bg-gray-100 text-gray-600" },
  { value: "not_applicable", label: "N/A", badgeClass: "bg-gray-50 text-gray-400" },
];

export const accommodationOptions: Option[] = [
  { value: "camping", label: "Camping (Tent)", badgeClass: "bg-blue-50 text-blue-700" },
  { value: "offsite", label: "Offsite", badgeClass: "bg-purple-50 text-purple-700" },
  { value: "courthouse", label: "Courthouse", badgeClass: "bg-indigo-50 text-indigo-700" },
  { value: "unknown", label: "Unknown", badgeClass: "bg-gray-50 text-gray-400" },
];

export const transportationOptions: Option[] = [
  { value: "driving", label: "Driving (Own)", badgeClass: "bg-green-50 text-green-700" },
  { value: "driving-lift", label: "Driving (Carpool OK)", badgeClass: "bg-yellow-50 text-yellow-700" },
  { value: "need-lift", label: "Need Lift", badgeClass: "bg-red-50 text-red-700" },
  { value: "unknown", label: "Unknown", badgeClass: "bg-gray-50 text-gray-400" },
];