import { model, Schema } from "mongoose";
import { ApprovalStatus, IUser, Role } from "./user.interface";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isAgent: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ApprovalStatus,
      default: ApprovalStatus.UNAPPLIED,
    },
    wallet: { type: Schema.Types.ObjectId, ref: "Wallet", sparse: true , unique : true},
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", UserSchema);
