import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import db from './index'; // Import our database connection

const csvFilePath = path.resolve(__dirname, '../../data/data.csv');
const results: any[] = [];

// 1. Read the CSV file
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // 2. Once CSV is read, process the data
    console.log('CSV file successfully processed. Starting database setup...');
    populateDatabase();
  });

function populateDatabase() {
  // 3. Define the SQL to create tables
  const createPeopleTable = `
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
  `;

  const createMeatBarsTable = `
    CREATE TABLE IF NOT EXISTS meat_bars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      eaten_at TEXT NOT NULL,
      FOREIGN KEY (person_id) REFERENCES people (id)
    );
  `;

  // 4. Run the SQL commands in order
  db.serialize(() => {
    console.log('Creating tables...');
    db.run(createPeopleTable);
    db.run(createMeatBarsTable, (err) => {
      if (err) {
        return console.error('Error creating meat_bars table', err.message);
      }
      console.log('Tables created successfully. Inserting data...');
      
      // 5. Prepare statements for inserting data
      const personStmt = db.prepare('INSERT OR IGNORE INTO people (id, name) VALUES (?, ?)');
      const meatBarStmt = db.prepare('INSERT INTO meat_bars (person_id, type, eaten_at) VALUES (?, ?, ?)');

      // 6. Loop through CSV data and insert into DB
      for (const row of results) {
        const personId = parseInt(row['Person ID'], 10);
        const personName = row['Person Name'];
        const meatBarType = row['Meat Bar Type'];
        const eatenAt = row['Eaten At'];

        if (!isNaN(personId) && personName) {
          personStmt.run(personId, personName);
        }

        if (!isNaN(personId) && meatBarType && eatenAt) {
          meatBarStmt.run(personId, meatBarType, eatenAt);
        }
      }

      // 7. Finalize the statements
      personStmt.finalize();
      meatBarStmt.finalize((err) => {
        if (err) {
          return console.error('Error finalizing meatBarStmt', err.message);
        }
        console.log('Data insertion complete.');

        // 8. CLOSE THE DATABASE 
        db.close((err) => {
          if (err) {
            return console.error('Error closing database', err.message);
          }
          console.log('Database connection closed.');
        });
      });
    });
  });
  
}