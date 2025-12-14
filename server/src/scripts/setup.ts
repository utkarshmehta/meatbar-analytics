import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import db from '../database';
import { RunResult } from 'sqlite3';
import { RawCsvRow } from '../types/models';


const csvFilePath = path.resolve(__dirname, '../../data/data.csv');
const results: RawCsvRow[] = [];

console.log('Starting database setup...');

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(`CSV file processed. Found ${results.length} rows.`);
    if (results.length === 0) {
      console.error('No data found in CSV. Aborting.');
      return;
    }
    populateDatabase();
  });

function populateDatabase() {
  const createPeopleTable = `
    CREATE TABLE IF NOT EXISTS people (
      name TEXT PRIMARY KEY NOT NULL
    );
  `;

  const createMeatBarsTable = `
    CREATE TABLE IF NOT EXISTS meat_bars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_name TEXT NOT NULL,
      type TEXT NOT NULL,
      eaten_at TEXT NOT NULL,
      FOREIGN KEY (person_name) REFERENCES people (name),
      -- UNIQUE prevent duplicates --
      UNIQUE(person_name, type, eaten_at) 
    );
  `;

  db.serialize(() => {
    console.log('Creating tables...');
    db.run(createPeopleTable, (err) => {
      if (err) {
        return console.error('Error creating people table', err.message);
      }
      console.log('People table created.');

      db.run(createMeatBarsTable, (err) => {
        if (err) {
          return console.error('Error creating meat_bars table', err.message);
        }
        console.log('Meat_bars table created. Inserting data...');
        insertData();
      });
    });
  });
}

function insertData() {
  const personStmt = db.prepare(
    'INSERT OR IGNORE INTO people (name) VALUES (?)',
  );
  // ---'INSERT OR IGNORE' ---
  const meatBarStmt = db.prepare(
    'INSERT OR IGNORE INTO meat_bars (person_name, type, eaten_at) VALUES (?, ?, ?)',
  );

  let peopleInserted = 0;
  let barsInserted = 0;

  for (const row of results) {
    const personName = row['person'];
    const meatBarType = row['meat-bar-type'];
    const eatenAt = row['date'];

    if (personName && meatBarType && eatenAt) {
      personStmt.run(personName, function (this: RunResult) {
        if (this.changes > 0) peopleInserted++;
      });

      meatBarStmt.run(
        personName,
        meatBarType,
        eatenAt,
        function (this: RunResult) {
          if (this.changes > 0) barsInserted++;
        },
      );
    }
  }

  personStmt.finalize();
  meatBarStmt.finalize((err) => {
    if (err) {
      return console.error('Error finalizing meatBarStmt', err.message);
    }
    console.log(
      `Data insertion complete: ${peopleInserted} unique people, ${barsInserted} meat bars.`,
    );

    db.close((err) => {
      if (err) {
        return console.error('Error closing database', err.message);
      }
      console.log('Database connection closed.');
    });
  });
}
