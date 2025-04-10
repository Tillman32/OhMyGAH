#!/usr/bin/env node
import "reflect-metadata";
import { Command } from "@commander-js/extra-typings";
import { container } from "tsyringe";
import { ActionsWorkflowService } from "./services/workflow-service";
import { Main }  from "./main";
import { List } from "./commands/list";
import { Swap } from "./commands/swap";

// Create a new Command instance
const program = new Command();

// Register services
container.registerInstance("ActionsWorkflowService", new ActionsWorkflowService());

// Register commands
container.registerInstance("List", new List());
container.registerInstance("Swap", new Swap());

Main(program)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });