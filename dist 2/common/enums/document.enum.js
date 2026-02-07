"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectStatus = exports.DocumentAction = exports.DocumentType = void 0;
var DocumentType;
(function (DocumentType) {
    DocumentType["RAPPORT"] = "RAPPORT";
    DocumentType["CR_REUNION"] = "CR_REUNION";
    DocumentType["ADMINISTRATIF"] = "ADMINISTRATIF";
    DocumentType["PROJET"] = "PROJET";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentAction;
(function (DocumentAction) {
    DocumentAction["UPLOAD"] = "UPLOAD";
    DocumentAction["UPDATE"] = "UPDATE";
    DocumentAction["DOWNLOAD"] = "DOWNLOAD";
    DocumentAction["DELETE"] = "DELETE";
})(DocumentAction || (exports.DocumentAction = DocumentAction = {}));
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["ACTIVE"] = "ACTIVE";
    ProjectStatus["COMPLETED"] = "COMPLETED";
    ProjectStatus["ARCHIVED"] = "ARCHIVED";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
//# sourceMappingURL=document.enum.js.map