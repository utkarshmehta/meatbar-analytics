# MeatBar Analytics Backend

This is a Node.js, TypeScript, and SQLite backend API built as a technical assignment for Renaissance. The API provides RESTful endpoints to process and expose data about meat bar consumption.

## Tech Stack

* **Backend:** Node.js, Express, TypeScript
* **Database:** SQLite
* **Testing:** Jest, ts-jest

## How to Set Up and Run

### Prerequisites

* Node.js (v16 or newer recommended)

### 1. Clone & Install

    # 1. Clone the repository
    git clone https://github.com/utkarshmehta/meatbar-analytics.git

    # 2. Navigate to the server directory
    cd meatbar-analytics/server

    # 3. Install all dependencies
    npm install

### 2. Build the Database

The project includes a setup script to parse the data.csv file and populate the database.db file. This only needs to be run once.

    # From the /server directory
    npx ts-node src/scripts/setup.ts

### 3. Run the Application

Once the database is built, you can start the server.

    # Run in development mode (with auto-reload)
    npm run dev

The server will be running on `http://localhost:3001`

### 4. Run Tests

All critical logic is unit-tested with Jest.

    # Run all tests
    npm run test

## API Endpoints

### People

* `GET /api/v1/people`
    * Returns a JSON array of all people in the database.

### Consumptions

* `GET /api/v1/consumptions`
    * Returns a JSON array of all meat bar consumption events.

* `POST /api/v1/consumptions`
    * Adds a new meat bar consumption event.
    * **Body (JSON):**
        {
          "person_name": "ashton",
          "type": "bison",
          "eaten_at": "2025-01-01T12:00:00.000Z"
        }

### Analytics

* `GET /api/v1/analytics/streaks`
    * Returns all consumption streaks, defined as consecutive days (ignoring gaps) of *increasing* daily consumption.

* `GET /api/v1/analytics/monthly-most`
    * For each month, returns the day of the month that had the highest number of consumptions.