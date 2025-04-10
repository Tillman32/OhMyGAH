#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const extra_typings_1 = require("@commander-js/extra-typings");
const tsyringe_1 = require("tsyringe");
const workflow_service_1 = require("./services/workflow-service");
const main_1 = require("./main");
const list_1 = require("./commands/list");
const swap_1 = require("./commands/swap");
// Create a new Command instance
const program = new extra_typings_1.Command();
// Register services
tsyringe_1.container.registerInstance("ActionsWorkflowService", new workflow_service_1.ActionsWorkflowService());
// Register commands
tsyringe_1.container.registerInstance("List", new list_1.List());
tsyringe_1.container.registerInstance("Swap", new swap_1.Swap());
(0, main_1.Main)(program)
    .then(() => process.exit(0))
    .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
