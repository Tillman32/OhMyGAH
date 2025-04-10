"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = void 0;
const tsyringe_1 = require("tsyringe");
let List = class List {
    async run() {
        const workflowService = tsyringe_1.container.resolve("ActionsWorkflowService");
        const workflows = workflowService.findAllActionsWorkflows();
        workflows.forEach(workflow => {
            console.log(`File: ${workflow.fileName}`);
            workflow.actions.forEach(a => {
                console.log(`  -L${a.lineNumber}: ${workflow.path}`);
            });
        });
    }
};
exports.List = List;
exports.List = List = __decorate([
    (0, tsyringe_1.injectable)()
], List);
exports.default = List;
