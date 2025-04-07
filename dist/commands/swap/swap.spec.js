"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const swap_1 = require("./swap");
const fs_1 = __importDefault(require("fs"));
const inquirer_1 = __importDefault(require("inquirer"));
const glob_1 = require("glob");
jest.mock('fs');
jest.mock('inquirer');
jest.mock('glob');
jest.mock('process', () => ({
    exit: jest.fn(),
}));
jest.mock('./swap', () => ({
    ...jest.requireActual('./swap')
}));
describe('swap', () => {
    let program;
    beforeEach(() => {
        program = new commander_1.Command();
        jest.clearAllMocks();
    });
    it('should prompt for action and version if not provided', async () => {
        const mockPrompt = jest.spyOn(inquirer_1.default, 'prompt').mockResolvedValue({
            action: 'actions/checkout',
            version: 'v2.3.4',
        });
        const mockGlob = jest.spyOn(glob_1.glob, 'glob').mockResolvedValue(['file1.yml', 'file2.yaml']);
        const mockPromptUserToSelectFiles = jest.fn().mockResolvedValue(['file1.yml']);
        const mockReplaceActionVersionInFiles = jest.fn();
        jest.mock('./swap', () => ({
            ...jest.requireActual('./swap'),
            promptUserToSelectFiles: mockPromptUserToSelectFiles,
            replaceActionVersionInFiles: mockReplaceActionVersionInFiles,
        }));
        await (0, swap_1.swap)(program);
        await program.parseAsync(['swap actions/checkout v2.3.4']);
        expect(mockPrompt).toHaveBeenCalled();
        expect(mockGlob).toHaveBeenCalledWith(['**/*.yml', '**/*.yaml'], { ignore: 'node_modules/**', dot: true });
        expect(mockPromptUserToSelectFiles).toHaveBeenCalledWith(['file1.yml', 'file2.yaml']);
        expect(mockReplaceActionVersionInFiles).toHaveBeenCalledWith(['file1.yml'], 'actions/checkout', 'v2.3.4');
    });
    it('should exit if no YAML files are found', async () => {
        const mockGlob = jest.spyOn(glob_1.glob, 'glob').mockResolvedValue([]);
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('process.exit called');
        });
        await (0, swap_1.swap)(program);
        await expect(program.parseAsync(['node', 'swap', 'actions/checkout', 'v2.3.4'])).rejects.toThrow('process.exit called');
        expect(mockGlob).toHaveBeenCalled();
        expect(mockExit).toHaveBeenCalledWith(1);
    });
    it('should replace action version in selected files', async () => {
        const mockGlob = jest.spyOn(glob_1.glob, 'glob').mockResolvedValue(['file1.yml', 'file2.yaml']);
        const mockPromptUserToSelectFiles = jest.fn().mockResolvedValue(['file1.yml']);
        const mockReadFileSync = jest.spyOn(fs_1.default, 'readFileSync').mockReturnValue('uses: actions/checkout@v1');
        const mockWriteFileSync = jest.spyOn(fs_1.default, 'writeFileSync').mockImplementation();
        swap_1.swap.__set__('promptUserToSelectFiles', mockPromptUserToSelectFiles);
        await (0, swap_1.swap)(program);
        await program.parseAsync(['node', 'swap', 'actions/checkout', 'v2.3.4']);
        expect(mockGlob).toHaveBeenCalled();
        expect(mockPromptUserToSelectFiles).toHaveBeenCalledWith(['file1.yml', 'file2.yaml']);
        expect(mockReadFileSync).toHaveBeenCalledWith('file1.yml', 'utf-8');
        expect(mockWriteFileSync).toHaveBeenCalledWith('file1.yml', 'uses: actions/checkout@v2.3.4', 'utf-8');
    });
    it('should log a message if no files are selected', async () => {
        const mockGlob = jest.spyOn(glob_1.glob, 'glob').mockResolvedValue(['file1.yml', 'file2.yaml']);
        const mockPromptUserToSelectFiles = jest.fn().mockResolvedValue([]);
        const mockLog = jest.spyOn(console, 'log').mockImplementation();
        swap_1.swap.__set__('promptUserToSelectFiles', mockPromptUserToSelectFiles);
        await (0, swap_1.swap)(program);
        await program.parseAsync(['node', 'swap', 'actions/checkout', 'v2.3.4']);
        expect(mockGlob).toHaveBeenCalled();
        expect(mockPromptUserToSelectFiles).toHaveBeenCalledWith(['file1.yml', 'file2.yaml']);
        expect(mockLog).toHaveBeenCalledWith('No files selected.');
    });
});
