"use strict";
// This is a "smoke test" to make sure Jest is working.
describe('Smoke Test', () => {
    it('should pass a simple true === true test', () => {
        expect(true).toBe(true);
    });
    it('should add two numbers correctly', () => {
        expect(1 + 2).toBe(3);
    });
});
