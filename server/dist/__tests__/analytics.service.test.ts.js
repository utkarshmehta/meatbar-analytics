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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const analytics_service_1 = require("../services/analytics.service");
const database_1 = __importDefault(require("../database"));
// --- Mock the Database ---
jest.mock('../database', () => ({
    all: jest.fn(),
    run: jest.fn(), // --- Add 'run' to mock
}));
const mockedDb = database_1.default;
describe('Analytics Service: getConsumptionStreaks', () => {
    beforeEach(() => {
        mockedDb.all.mockReset();
    });
    it('should correctly find a simple 2-day streak', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockDbRows = [
            { streak_id: 1, streak_length: 2, streak_start: '2025-01-01', streak_end: '2025-01-02', streak_counts: '1, 2' }
        ];
        mockedDb.all.mockImplementation((sql, params, callback) => {
            callback(null, mockDbRows);
            return database_1.default;
        });
        const streaks = yield (0, analytics_service_1.getConsumptionStreaks)();
        expect(streaks).toHaveLength(1);
        expect(streaks[0].streak_counts).toBe('1, 2');
    }));
    it('should return an empty array if no streaks are found', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockDbRows = [];
        mockedDb.all.mockImplementation((sql, params, callback) => {
            callback(null, mockDbRows);
            return database_1.default;
        });
        const streaks = yield (0, analytics_service_1.getConsumptionStreaks)();
        expect(streaks).toHaveLength(0);
    }));
    it('should handle a database error without logging to console', () => __awaiter(void 0, void 0, void 0, function* () {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const mockError = new Error('SQLITE_ERROR');
        mockedDb.all.mockImplementation((sql, params, callback) => {
            callback(mockError, []);
            return database_1.default;
        });
        yield expect((0, analytics_service_1.getConsumptionStreaks)()).rejects.toThrow('SQLITE_ERROR');
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    }));
});
// --- tests for addConsumption ---
describe('Analytics Service: addConsumption', () => {
    beforeEach(() => {
        mockedDb.run.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        console.error.mockRestore();
    });
    it('should resolve with the new ID on successful insert', () => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Setup: Define the fake 'this' context the mock will have
        const mockRunResult = { lastID: 33 };
        // Tell the mock 'db.run' to succeed
        mockedDb.run.mockImplementation(function (sql, params, callback) {
            // 'this' is bound to mockRunResult, 'callback' is called with no error
            callback.call(mockRunResult, null);
            return database_1.default;
        });
        // 2. Act: Call the function
        const result = yield (0, analytics_service_1.addConsumption)('bob', 'bison', '2025-01-01');
        // 3. Assert: Check that the correct SQL was called and the ID is returned
        expect(mockedDb.run).toHaveBeenCalledWith('INSERT INTO meat_bars (person_name, type, eaten_at) VALUES (?, ?, ?)', ['bob', 'bison', '2025-01-01'], expect.any(Function));
        expect(result).toEqual({ id: 33 });
    }));
    it('should reject if the database insert fails', () => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Setup: Fake an error
        const mockError = new Error('SQLITE_CONSTRAINT');
        mockedDb.run.mockImplementation((sql, params, callback) => {
            callback(mockError);
            return database_1.default;
        });
        // 2. Act & 3. Assert
        yield expect((0, analytics_service_1.addConsumption)('bob', 'bison', '2025-01-01'))
            .rejects.toThrow('SQLITE_CONSTRAINT');
        // Also assert that error is logged
        expect(console.error).toHaveBeenCalled();
    }));
});
