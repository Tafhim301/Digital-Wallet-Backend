"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalStatus = exports.isActive = exports.Role = void 0;
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["ADMIN"] = "ADMIN";
    Role["AGENT"] = "AGENT";
})(Role || (exports.Role = Role = {}));
var isActive;
(function (isActive) {
    isActive["ACTIVE"] = "ACTIVE";
    isActive["INACTIVE"] = "INACTIVE";
    isActive["BLOCKED"] = "BLOCKED";
})(isActive || (exports.isActive = isActive = {}));
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["UNAPPLIED"] = "UNAPPLIED";
    ApprovalStatus["PENDING"] = "PENDING";
    ApprovalStatus["APPROVED"] = "APPROVED";
    ApprovalStatus["SUSPENDED"] = "SUSPENDED";
})(ApprovalStatus || (exports.ApprovalStatus = ApprovalStatus = {}));
