import { Types } from "mongoose";


export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  AGENT = "AGENT",
}

export enum isActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}
export enum ApprovalStatus {
  UNAPPLIED = "UNAPPLIED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
}

export interface IUser {
  _id ?: string
  name: string;
  phone: string;
  password: string;
  role?: Role;
  isActive?: isActive;
  isDeleted?: boolean;
  isAgent ?: boolean;
  approvalStatus ?: ApprovalStatus
  wallet ?: Types.ObjectId

}
