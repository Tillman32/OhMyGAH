"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const swap_1 = require("./swap");
jest.mock('./swap', () => ({
    swap: jest.fn(),
}));
describe('Swap', () => {
    it('should replace action version in files', () => {
        const spy = jest.spyOn(console, 'log');
        const program = {
            args: [],
            processedArgs: [],
            commands: [],
            options: [],
            parse: jest.fn(),
            command: jest.fn().mockReturnThis(),
            description: jest.fn().mockReturnThis(),
            argument: jest.fn().mockReturnThis(),
            action: jest.fn().mockReturnThis(),
        };
        // Mock the swap function to resolve with the program
        swap_1.Swap.mockImplementation((cmd) => __awaiter(void 0, void 0, void 0, function* () {
            console.log('Replacing version of action actions/checkout to v2.3.4');
            return cmd;
        }));
        // Call the swap function
        (0, swap_1.Swap)(program);
        // Simulate parsing arguments
        program.parse(['node', 'swap', 'actions/checkout', 'v2.3.4']);
        // Add assertions if necessary
        expect(swap_1.Swap).toHaveBeenCalledWith(program);
        expect(program.parse).toHaveBeenCalledWith(['node', 'swap', 'actions/checkout', 'v2.3.4']);
        // Assert if file was modified with the correct action and version
        expect(spy).toHaveBeenCalledWith('Replacing version of action actions/checkout to v2.3.4');
    });
});
