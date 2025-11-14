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
        if (workflows.length === 0) {
            console.log("No GitHub Actions workflows found.");
            return;
        }
        console.log(`Found ${workflows.length} workflow file(s):\n`);
        workflows.forEach(workflow => {
            console.log(`File: ${workflow.path}`);
            if (workflow.actions.length === 0) {
                console.log(`  No actions found in this workflow.`);
            }
            else {
                workflow.actions.forEach(a => {
                    console.log(`  Line ${a.lineNumber}: ${a.name}@${a.version}`);
                });
            }
            console.log('');
        });
    }
};
exports.List = List;
exports.List = List = __decorate([
    (0, tsyringe_1.injectable)()
], List);
exports.default = List;
