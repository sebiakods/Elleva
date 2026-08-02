// ─── Core roles ───────────────────────────────────────────────────────────────
export type Role = "user" | "expert" | "institution" | "admin";

// ─── Users ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  language: "ar" | "fr" | "en";
}

// ─── Financing ────────────────────────────────────────────────────────────────
export interface FinancingProgram {
  slug: string;
  title: string;
  institution: string;
  category: "bank-loan" | "islamic-finance" | "government-grant" | "startup-funding";
  amountMin: number;
  amountMax: number;
  rate: string;
  description: string;
  eligibility: string[];
  documents: string[];
}

// ─── Business Plan ────────────────────────────────────────────────────────────
export interface BusinessPlan {
  id: string;
  title: string;
  status: "draft" | "submitted" | "reviewed" | "approved";
  updatedAt: string;
  progress: number;
}

export type BusinessPlanReviewStatus = "pending" | "in_review" | "completed";

export interface BusinessPlanReview {
  id: string;
  planTitle: string;
  entrepreneurName: string;
  entrepreneurAvatar?: string;
  submittedAt: string;
  status: BusinessPlanReviewStatus;
  score?: number;
  comments?: string;
}

// ─── Content ──────────────────────────────────────────────────────────────────
export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

// ─── Expert / Business Expert ─────────────────────────────────────────────────
export type ExpertSpecialty =
  | "financement"
  | "business-plan"
  | "marketing"
  | "juridique"
  | "comptabilite"
  | "tech"
  | "rh";

export interface Expert {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  specialties: ExpertSpecialty[];
  rating: number;
  reviewCount: number;
  sessionRate: number; // DA per hour
  sessionCount: number;
  verified: boolean;
  availableForBooking: boolean;
  linkedinUrl?: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: "débutant" | "intermédiaire" | "avancé";
  duration: string;
  lessonCount: number;
  enrolledCount: number;
  rating: number;
  published: boolean;
  coverUrl?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  entrepreneurName: string;
  entrepreneurAvatar?: string;
  date: string;
  time: string;
  duration: number; // minutes
  topic: string;
  status: "upcoming" | "completed" | "cancelled";
  meetingUrl?: string;
}

export interface QAQuestion {
  id: string;
  question: string;
  askedBy: string;
  askedAt: string;
  answered: boolean;
  answer?: string;
  answeredAt?: string;
  votes: number;
  category: string;
}

export interface ExpertReview {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  sessionType: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  views: number;
  published: boolean;
  thumbnailUrl?: string;
  createdAt: string;
  category: string;
}

export interface Resource {
  id: string;
  title: string;
  type: "pdf" | "template" | "spreadsheet" | "presentation" | "other";
  description: string;
  downloadCount: number;
  published: boolean;
  createdAt: string;
  fileSize: string;
}

// ─── Institution ──────────────────────────────────────────────────────────────
export type InstitutionType =
  | "bank"
  | "government"
  | "incubator"
  | "accelerator"
  | "ngo"
  | "investor";

export interface Institution {
  id: string;
  slug: string;
  name: string;
  type: InstitutionType;
  description: string;
  logoUrl?: string;
  city: string;
  website?: string;
  programCount: number;
  verified: boolean;
  contactEmail?: string;
}

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "waitlisted";

export interface Application {
  id: string;
  programTitle: string;
  entrepreneurName: string;
  entrepreneurAvatar?: string;
  submittedAt: string;
  status: ApplicationStatus;
  amount: number;
  notes?: string;
}

export interface InstitutionEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: "webinar" | "workshop" | "conference" | "info_session" | "other";
  registrationUrl?: string;
  capacity?: number;
  registeredCount: number;
  published: boolean;
}

export interface InstitutionDocument {
  id: string;
  name: string;
  type: "form" | "guide" | "template" | "report" | "other";
  description: string;
  fileSize: string;
  downloadCount: number;
  createdAt: string;
  required: boolean;
}
