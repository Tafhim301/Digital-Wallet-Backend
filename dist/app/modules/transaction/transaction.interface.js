"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.TransactionType = void 0;
var TransactionType;
(function (TransactionType) {
    TransactionType["CASH_IN"] = "CASH_IN";
    TransactionType["CASH_OUT"] = "CASH_OUT";
    TransactionType["TOP_UP"] = "TOP_UP";
    TransactionType["WITHDRAW"] = "WITHDRAW";
    TransactionType["SEND_MONEY"] = "SEND_MONEY";
    TransactionType["ADMIN_CASH_IN"] = "ADMIN_CASH_IN";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var Status;
(function (Status) {
    Status["PENDING"] = "PENDING";
    Status["SUCCESSFUL"] = "SUCCESSFUL";
    Status["DISMISSED"] = "DISMISSED";
    Status["FAILED"] = "FAILED";
})(Status || (exports.Status = Status = {}));
