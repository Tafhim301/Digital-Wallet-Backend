import AppError from "../../errorHandlers/appError";
import { ApprovalStatus, IUser, Role } from "../user/user.interface";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import { QueryBuilder } from "../../utils/queryBuilder";
import { agentSearchableFields } from "./agent.constant";

const agentApplication = async(payload : Partial<IUser>) => {
    const {phone} = payload;
    if(!phone){
        throw new AppError(httpStatus.BAD_REQUEST, "Phone number is required for agent application")
    }

    const user = await User.findOne({phone});
    if(!user){
        throw new AppError(httpStatus.BAD_REQUEST, "User Does Not Exist. You Must Register As An User To Apply For Agent")

    }

    const agent = await User.findByIdAndUpdate(user?._id,{
        approvalStatus : ApprovalStatus.PENDING
},{new : true})


return {
   approvalStatus : agent?.approvalStatus
}



}
const getAgentApplications = async(query : Record<string,string>) => {
  const queryBuilder = new QueryBuilder(User.find({approvalStatus : ApprovalStatus.PENDING}), query);
  
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




}
const getAllAgents = async(query : Record<string,string>) => {
  const queryBuilder = new QueryBuilder(User.find({approvalStatus : Role.AGENT}), query);
  
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




}


const approveAgent = async(id : string) => {
    const approvedAgent = await User.findByIdAndUpdate(id, {
        approvalStatus :  ApprovalStatus.APPROVED,
        isAgent : true
    }, {new : true})

    return {
    ApprovalStatus : approvedAgent?.approvalStatus,
    isAgent : approvedAgent?.isAgent
}
}




export const agentServices = {
    agentApplication,
    getAgentApplications,
    approveAgent,
    getAllAgents
}