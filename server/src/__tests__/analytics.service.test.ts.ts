import { getConsumptionStreaks } from '../services/analytics.service';
import db from '../database';

jest.mock('../database', () => ({
  all: jest.fn(),
}));

const mockedDb = db as jest.Mocked<typeof db>;

describe('Analytics Service: getConsumptionStreaks', () => {
  beforeEach(() => {
    mockedDb.all.mockReset();
  });

  it('should correctly find a simple 2-day streak', async () => {
    const mockDbRows = [
      { streak_id: 1, streak_length: 2, streak_start: '2025-01-01', streak_end: '2025-01-02', streak_counts: '1, 2' }
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
    // 1. Create a "spy" to watch console.error
    const consoleErrorSpy = jest.spyOn(console, 'error')
      .mockImplementation(() => {}); // Mute it

    // 2. Setup: Fake the database error
    const mockError = new Error('SQLITE_ERROR');
    mockedDb.all.mockImplementation((sql, params, callback) => {
      callback(mockError, []);
      return db;
    });

    // 3. Act & Assert
    await expect(getConsumptionStreaks()).rejects.toThrow('SQLITE_ERROR');

    // 4. Check that the function DID try to log the error
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // 5. Restore the original console.error function
    consoleErrorSpy.mockRestore();
  });
});