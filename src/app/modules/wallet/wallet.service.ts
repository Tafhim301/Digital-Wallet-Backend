import AppError from "../../errorHandlers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { User } from "../user/user.model";
import { Wallet } from "./wallet.model";

const getAllWallets = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Wallet.find(), query);

  const users = await queryBuilder.filter().fields().sort().paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);

  return { meta: meta, data: data };
};
const myWallet = async (userId: string) => {
  const user = await User.findById(userId).populate("wallet");

  if(!user) {
    throw new AppError(404,"User Not Found")
  }

  return user;
};

const blockWallet = async (id: string) => {
  const wallet = await Wallet.findById(id);
  if (!wallet) {
    throw new AppError(404, "Wallet Not Found");
  }
  const updatedWallet = await Wallet.findByIdAndUpdate(
    id,
    { isBlocked: true },
    { new: true }
  );

  return updatedWallet;
};

export const walletServices = {
  getAllWallets,
  blockWallet,
  myWallet
};
