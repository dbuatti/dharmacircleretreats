import { 
  RegistrationStatus, 
  PaymentStatus, 
  AttendanceStatus 
} from "@/types";

interface Option {
  value: string;
  label: string;
  badgeClass: string;
  color: string; // Added to match InlineSelect requirements
}

export const registrationOptions: Option[] = [
  { value: "not_sent", label: "Not Sent", badgeClass: "bg-gray-200 text-gray-800", color: "gray" },
  { value: "sent", label: "Sent", badgeClass: "bg-blue-100 text-blue-800", color: "blue" },
  { value: "received", label: "Received", badgeClass: "bg-purple-100 text-purple-800", color: "purple" },
  { value: "incomplete", label: "Incomplete", badgeClass: "bg-orange-100 text-orange-800", color: "orange" },
  { value: "confirmed", label: "Confirmed", badgeClass: "bg-green-100 text-green-800", color: "green" },
];

export const paymentOptions: Option[] = [
  { value: "not_paid", label: "Not Paid", badgeClass: "bg-red-100 text-red-800", color: "red" },
  { value: "deposit_paid", label: "Deposit Paid", badgeClass: "bg-yellow-100 text-yellow-800", color: "yellow" },
  { value: "paid_in_full", label: "Paid in Full", badgeClass: "bg-green-100 text-green-800", color: "green" },
];

export const attendanceOptions: Option[] = [
  { value: "interested", label: "Interested", badgeClass: "bg-gray-100 text-gray-800", color: "gray" },
  { value: "confirmed", label: "Confirmed", badgeClass: "bg-green-100 text-green-800", color: "green" },
  { value: "withdrawn", label: "Withdrawn", badgeClass: "bg-red-100 text-red-800", color: "red" },
  { value: "declined", label: "Declined", badgeClass: "bg-red-200 text-red-900", color: "red" },
];

export const whatsappOptions: Option[] = [
  { value: "joined", label: "Joined", badgeClass: "bg-green-100 text-green-800", color: "green" },
  { value: "invited", label: "Invited", badgeClass: "bg-blue-100 text-blue-800", color: "blue" },
  { value: "not_invited", label: "Not Invited", badgeClass: "bg-gray-100 text-gray-600", color: "gray" },
  { value: "not_applicable", label: "N/A", badgeClass: "bg-gray-50 text-gray-400", color: "gray" },
];

export const accommodationOptions: Option[] = [
  { value: "camping", label: "Camping (Tent)", badgeClass: "bg-blue-50 text-blue-700", color: "blue" },
  { value: "offsite", label: "Offsite", badgeClass: "bg-purple-50 text-purple-700", color: "purple" },
  { value: "courthouse", label: "Courthouse", badgeClass: "bg-indigo-50 text-indigo-700", color: "indigo" },
  { value: "unknown", label: "Unknown", badgeClass: "bg-gray-50 text-gray-400", color: "gray" },
];

export const transportationOptions: Option[] = [
  { value: "driving", label: "Driving (Own)", badgeClass: "bg-green-50 text-green-700", color: "green" },
  { value: "driving-lift", label: "Driving (Carpool OK)", badgeClass: "bg-yellow-50 text-yellow-700", color: "yellow" },
  { value: "need-lift", label: "Need Lift", badgeClass: "bg-red-50 text-red-700", color: "red" },
  { value: "unknown", label: "Unknown", badgeClass: "bg-gray-50 text-gray-400", color: "gray" },
];