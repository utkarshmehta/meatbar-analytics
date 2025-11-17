import {
  getConsumptionStreaks,
  addConsumption,
} from '../services/analytics.service';
import db from '../database';

// --- Mock the Database ---
jest.mock('../database', () => ({
  all: jest.fn(),
  run: jest.fn(), // --- Add 'run' to mock
}));

const mockedDb = db as jest.Mocked<typeof db>;

describe('Analytics Service: getConsumptionStreaks', () => {
  beforeEach(() => {
    mockedDb.all.mockReset();
  });

  it('should correctly find a simple 2-day streak', async () => {
    const mockDbRows = [
      {
        streak_id: 1,
        streak_length: 2,
        streak_start: '2025-01-01',
        streak_end: '2025-01-02',
        streak_counts: '1, 2',
      },
    ];

    mockedDb.all.mockImplementation((sql, params, callback) => {
      callback(null, mockDbRows);
      return db;
    });

    const streaks = await getConsumptionStreaks();

    expect(streaks).toHaveLength(1);
    expect(streaks[0].streak_counts).toBe('1, 2');
  });

  it('should return an empty array if no streaks are found', async () => {
    const mockDbRows: any[] = [];

    mockedDb.all.mockImplementation((sql, params, callback) => {
      callback(null, mockDbRows);
      return db;
    });

    const streaks = await getConsumptionStreaks();

    expect(streaks).toHaveLength(0);
  });

  it('should handle a database error without logging to console', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mockError = new Error('SQLITE_ERROR');

    mockedDb.all.mockImplementation((sql, params, callback) => {
      callback(mockError, []);
      return db;
    });

    await expect(getConsumptionStreaks()).rejects.toThrow('SQLITE_ERROR');
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

// --- tests for addConsumption ---

describe('Analytics Service: addConsumption', () => {
  beforeEach(() => {
    mockedDb.run.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('should resolve with the new ID on successful insert', async () => {
    // 1. Setup: Define the fake 'this' context the mock will have
    const mockRunResult = { lastID: 33 };

    // Tell the mock 'db.run' to succeed
    mockedDb.run.mockImplementation(function (
      this: any,
      sql,
      params,
      callback,
    ) {
      // 'this' is bound to mockRunResult, 'callback' is called with no error
      callback.call(mockRunResult, null);
      return db;
    });

    // 2. Act: Call the function
    const result = await addConsumption('bob', 'bison', '2025-01-01');

    // 3. Assert: Check that the correct SQL was called and the ID is returned
    expect(mockedDb.run).toHaveBeenCalledWith(
      'INSERT INTO meat_bars (person_name, type, eaten_at) VALUES (?, ?, ?)',
      ['bob', 'bison', '2025-01-01'],
      expect.any(Function),
    );
    expect(result).toEqual({ id: 33 });
  });

  it('should reject if the database insert fails', async () => {
    // 1. Setup: Fake an error
    const mockError = new Error('SQLITE_CONSTRAINT');

    mockedDb.run.mockImplementation((sql, params, callback) => {
      callback(mockError);
      return db;
    });

    // 2. Act & 3. Assert
    await expect(addConsumption('bob', 'bison', '2025-01-01')).rejects.toThrow(
      'SQLITE_CONSTRAINT',
    );

    // Also assert that error is logged
    expect(console.error).toHaveBeenCalled();
  });
});
