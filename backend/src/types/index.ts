import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { Role } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Prisma Role — single source of truth
// ─────────────────────────────────────────────────────────────────────────────

export { Role };

// ─────────────────────────────────────────────────────────────────────────────
// Application enums
// ─────────────────────────────────────────────────────────────────────────────

export enum Language {
  AR = "AR",
  FR = "FR",
  EN = "EN",
}

export enum BusinessPlanStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ApplicationStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  WAITLISTED = "WAITLISTED",
}

export enum ProgramCategory {
  BANK_LOAN = "BANK_LOAN",
  ISLAMIC_FINANCE = "ISLAMIC_FINANCE",
  GOVERNMENT_GRANT = "GOVERNMENT_GRANT",
  STARTUP_FUNDING = "STARTUP_FUNDING",
}

export enum InstitutionType {
  BANK = "BANK",
  GOVERNMENT = "GOVERNMENT",
  INCUBATOR = "INCUBATOR",
  ACCELERATOR = "ACCELERATOR",
  NGO = "NGO",
  INVESTOR = "INVESTOR",
}

export enum EventType {
  WEBINAR = "WEBINAR",
  WORKSHOP = "WORKSHOP",
  CONFERENCE = "CONFERENCE",
  INFO_SESSION = "INFO_SESSION",
  OTHER = "OTHER",
}

export enum NotificationType {
  SESSION_BOOKED = "SESSION_BOOKED",
  BUSINESS_PLAN_SUBMITTED = "BUSINESS_PLAN_SUBMITTED",
  BUSINESS_PLAN_REVIEWED = "BUSINESS_PLAN_REVIEWED",
  NEW_MESSAGE = "NEW_MESSAGE",
  NEW_QUESTION = "NEW_QUESTION",
  NEW_REVIEW = "NEW_REVIEW",
  APPLICATION_STATUS_CHANGED = "APPLICATION_STATUS_CHANGED",
  PROGRAM_PUBLISHED = "PROGRAM_PUBLISHED",
  GENERAL = "GENERAL",
}

export enum SessionStatus {
  UPCOMING = "UPCOMING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum MessageThreadStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export enum AccountRequestType {
  EXPERT = "EXPERT",
  INSTITUTION = "INSTITUTION",
}

export enum AccountRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ReviewStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Request
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface AuthenticatedRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthenticatedUser;
}

// ─────────────────────────────────────────────────────────────────────────────
// JWT Payloads
// ─────────────────────────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  name: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Responses
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> =
  | ApiSuccess<T>
  | ApiError;

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}