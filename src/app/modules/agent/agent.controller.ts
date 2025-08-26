/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";
import { agentServices } from "./agent.service";
import { sendResponse } from "../../utils/sendResponse";


const agentApplication = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.userId
    const result = await agentServices.agentApplication(userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Applied for agent successfully",
      data: result
      
    });
  }
);
const getAgentApplications = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query
    const result = await agentServices.getAgentApplications(query as Record<string,string>);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Agent Applications retrieved successfully",
      data: result
      
    });
  }
);
const approveAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await agentServices.approveAgent(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Agent Application approved successfully",
      data: result
      
    });
  }
);
const rejectAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await agentServices.rejectAgent(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Agent Application rejected",
      data: result
      
    });
  }
);

const suspendAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await agentServices.suspendAgent(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Agent suspended successfully",
      data: result
      
    });
  }
);

const getAllAgents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query
    const result = await agentServices.getAllAgents(query as Record<string,string>);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Agents retrieved successfully",
      data: result
      
    });
  }
);
const CashInAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
 
    const result = await agentServices.cashInAgent(req.params.id,req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Cash In to agent successfull",
      data: result
      
    });
  }
);




export const agentController = {
    agentApplication,
    getAgentApplications,
    approveAgent,
    getAllAgents,
    suspendAgent,
    CashInAgent,
    rejectAgent
}