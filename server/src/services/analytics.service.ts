import db from '../database';

/**
 * Calculates streaks of days with increasing meat bar consumption.
 * A streak is a sequence of days where each day's consumption
 * is greater than the previous day's.
 */
export async function getConsumptionStreaks(): Promise<any[]> {
    // This is a complex SQL query. We'll explain it below.
    const sql = `
    WITH DailyConsumption AS (
      -- Step 1: Count consumptions for each day
      SELECT
        DATE(eaten_at) AS consumption_date,
        COUNT(id) AS daily_count
      FROM meat_bars
      GROUP BY consumption_date
    ),
    ConsumptionWithLag AS (
      -- Step 2: Compare each day's count to the previous day
      SELECT
        consumption_date,
        daily_count,
        LAG(daily_count, 1, 0) OVER (ORDER BY consumption_date) AS prev_day_count
      FROM DailyConsumption
    ),
    StreakGroups AS (
      -- Step 3: Identify the start of a new streak
      SELECT
        consumption_date,
        daily_count,
        (CASE WHEN daily_count > prev_day_count THEN 0 ELSE 1 END) AS is_new_streak
      FROM ConsumptionWithLag
    ),
    StreakIdentifiers AS (
      -- Step 4: Assign a unique ID to each streak
      SELECT
        consumption_date,
        daily_count,
        SUM(is_new_streak) OVER (ORDER BY consumption_date) AS streak_id
      FROM StreakGroups
    )
    -- Step 5: Select only the streaks (where count > 1)
    SELECT
      streak_id,
      COUNT(*) AS streak_length,
      MIN(consumption_date) AS streak_start,
      MAX(consumption_date) AS streak_end,
      GROUP_CONCAT(daily_count, ', ') AS streak_counts
    FROM StreakIdentifiers
    GROUP BY streak_id
    HAVING COUNT(*) > 1 -- A streak must be at least 2 days long
    ORDER BY streak_start;
  `;

    // use a Promise to handle the async database call
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err: Error | null, rows: any[]) => {
            if (err) {
                console.error('Error in getConsumptionStreaks:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}