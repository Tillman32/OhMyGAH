"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsWorkflowService = void 0;
const fs_1 = __importDefault(require("fs"));
const glob_1 = require("glob");
const tsyringe_1 = require("tsyringe");
let ActionsWorkflowService = class ActionsWorkflowService {
    constructor() { }
    findAllActionsWorkflows() {
        const yamlFiles = this.findAllYamlFiles();
        const workflows = [];
        yamlFiles.forEach(file => {
            const fileContent = fs_1.default.readFileSync(file, 'utf-8');
            const lines = fileContent.split('\n');
            const actions = [];
            lines.forEach((line, index) => {
                if (line.includes('uses:')) {
                    const action = line.split('uses:')[1].trim();
                    const details = action.split('@');
                    actions.push({ name: details[0], version: details[1], lineNumber: index + 1 });
                }
            });
            const fileParts = file.match(/([^\\/]+)$/);
            const fileName = fileParts ? fileParts[0] : '';
            workflows.push({ fileName: fileName, path: file, actions });
        });
        return workflows;
    }
    findAllYamlFiles() {
        const yamlFiles = glob_1.glob.sync(['**/*.yml', '**/*.yaml'], { ignore: 'node_modules/**', dot: true });
        if (yamlFiles.length === 0) {
            console.log("No .yml or .yaml files found in the current directory including subdirectories.");
            console.log("Please make sure you are in the correct directory and try again.");
            throw new Error("No YAML files found");
        }
        return yamlFiles;
    }
};
exports.ActionsWorkflowService = ActionsWorkflowService;
exports.ActionsWorkflowService = ActionsWorkflowService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], ActionsWorkflowService);
