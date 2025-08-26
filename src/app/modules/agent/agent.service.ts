import AppError from "../../errorHandlers/appError";
import { ApprovalStatus,  Role } from "../user/user.interface";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import { QueryBuilder } from "../../utils/queryBuilder";
import { agentSearchableFields } from "./agent.constant";
import {  Status, TransactionType } from "../transaction/transaction.interface";
import { Wallet } from "../wallet/wallet.model";
import { isWalletBlocked } from "../../utils/checkTransactionValidity";
import mongoose from "mongoose";
import { Transaction } from "../transaction/transaction.model";

const agentApplication = async (userId : string) => {

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User Does Not Exist. You Must Register As An User To Apply For Agent"
    );
  }
  if (user.role === Role.AGENT) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You Are Already An Agent"
    );
  }
  if (user.approvalStatus === ApprovalStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already applied for agent role"
    );
  }

  const agent = await User.findByIdAndUpdate(
    user?._id,
    {
      approvalStatus: ApprovalStatus.PENDING,
    },
    { new: true }
  );

  return {
    approvalStatus: agent?.approvalStatus,
  };
};
const getAgentApplications = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    User.find({ approvalStatus: ApprovalStatus.PENDING }),
    query
  );

  const users = await queryBuilder
    .search(agentSearchableFields)
    .filter()
    .fields()
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);

  return { meta: meta, data: data };
};
const getAllAgents = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find({ role: Role.AGENT }).populate('wallet'), query);

  const users = await queryBuilder
    .search(agentSearchableFields)
    .filter()
    .fields()
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);

  return { meta: meta, data: data };
};

const approveAgent = async (id: string) => {
  const approvedAgent = await User.findByIdAndUpdate(
    id,
    {
      role: Role.AGENT,
      approvalStatus: ApprovalStatus.APPROVED,
      isAgent: true,
    },
    { new: true }
  );

  return {
    role: approvedAgent?.role,
    ApprovalStatus: approvedAgent?.approvalStatus,
    isAgent: approvedAgent?.isAgent,
  };
};
const rejectAgent = async (id: string) => {
  const rejectedAgent = await User.findByIdAndUpdate(
    id,
    {
      role: Role.USER,
      approvalStatus: ApprovalStatus.UNAPPLIED,
      isAgent: false,
    },
    { new: true }
  );

  return {
    role: rejectedAgent?.role,
    ApprovalStatus: rejectedAgent?.approvalStatus,
    isAgent: rejectedAgent?.isAgent,
  };
};
const suspendAgent = async (id: string) => {
  const suspendedAgent = await User.findByIdAndUpdate(
    id,
    {
      role: Role.AGENT,
      approvalStatus: ApprovalStatus.SUSPENDED,
      isAgent: false,
    },
    { new: true }
  );

  return {
    role: suspendedAgent?.role,
    ApprovalStatus: suspendedAgent?.approvalStatus,
    isAgent: suspendedAgent?.isAgent,
  };
};


const cashInAgent = async (payload: {receiver : string , amount : number}) => {
  const { receiver ,amount } = payload;


  if (!amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount is required");
  }

  if (typeof amount !== "number" || amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be a positive number");
  }


  const agent = await User.findOne({phone : receiver});
  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }

  if (agent.role !== Role.AGENT) {
    throw new AppError(httpStatus.BAD_REQUEST, "Target user is not an agent");
  }

  await isWalletBlocked(agent._id, "Agent");

 
  const agentWallet = await Wallet.findById(agent.wallet);
  if (!agentWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
  }


  const session = await mongoose.startSession();
  try {
    session.startTransaction();


    agentWallet.balance += amount;
    await agentWallet.save({ session });

    await Transaction.create(
      [
        {
          sender : "68ac71d0b0a11c3378e793c6",
          receiver : agent._id,
          amount : amount,
          transactionType : TransactionType.ADMIN_CASH_IN,
          status : Status.SUCCESSFUL

        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return { message: "Cash-in to agent successful" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


export const agentServices = {
  agentApplication,
  getAgentApplications,
  approveAgent,
  getAllAgents,
  suspendAgent,
  cashInAgent,
  rejectAgent
 
};
