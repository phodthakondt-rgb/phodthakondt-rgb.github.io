<?php
// database.php - Handles database connection and initialization.

// The path to the SQLite database file.
$db_path = __DIR__ . '/users.db';

try {
    // Create a new PDO instance to connect to the SQLite database.
    // PDO (PHP Data Objects) is a consistent interface for accessing databases in PHP.
    $pdo = new PDO("sqlite:" . $db_path);

    // Set the PDO error mode to exception to catch errors.
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // SQL statement to create the 'users' table if it doesn't exist.
    // This is executed every time, but CREATE TABLE IF NOT EXISTS prevents errors on subsequent runs.
    $create_table_query = "
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        student_id TEXT UNIQUE,
        national_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        position TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ";

    // Execute the query to create the table.
    $pdo->exec($create_table_query);

} catch (PDOException $e) {
    // If there is an error connecting to the database, stop the script and show an error message.
    // In a production environment, you would log this error instead of showing it to the user.
    die("Could not connect to the database: " . $e->getMessage());
}

// The $pdo variable now holds the database connection and can be used by any script that includes this file.
?>