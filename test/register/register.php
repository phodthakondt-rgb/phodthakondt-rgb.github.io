<?php
// register.php - Handles user registration and inserts data into the database.

$message = ''; // A variable to store success or error messages.

// Check if the form was submitted using POST method
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // 1. INCLUDE THE DATABASE CONNECTION
    // This makes the $pdo variable from database.php available here.
    require_once 'database.php';

    // 2. RETRIEVE AND SANITIZE FORM DATA
    $fullname = trim($_POST['fullname']);
    $student_id = trim($_POST['student_id']);
    $national_id = trim($_POST['national_id']);
    $email = trim($_POST['email']);
    $position = trim($_POST['position']);

    // For this system, the password is the national ID.
    $password = $national_id;

    // 3. SECURELY HASH THE PASSWORD
    // It is critical to hash passwords before storing them.
    // password_hash() creates a strong, salted hash.
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // 4. PREPARE AND EXECUTE THE DATABASE INSERTION
    try {
        // Prepare the SQL statement to prevent SQL injection.
        $sql = "INSERT INTO users (fullname, student_id, national_id, email, position, password_hash) VALUES (:fullname, :student_id, :national_id, :email, :position, :password_hash)";
        $stmt = $pdo->prepare($sql);

        // Bind the parameters to the statement.
        $stmt->bindParam(':fullname', $fullname);
        $stmt->bindParam(':student_id', $student_id);
        $stmt->bindParam(':national_id', $national_id);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':position', $position);
        $stmt->bindParam(':password_hash', $password_hash);

        // Execute the statement.
        $stmt->execute();

        $message = "ลงทะเบียนสำเร็จแล้ว! ตอนนี้คุณสามารถเข้าสู่ระบบได้ <a href='login.html'>ที่นี่</a>";

    } catch (PDOException $e) {
        // Handle potential errors, such as a duplicate entry.
        if ($e->getCode() == 23000) { // Integrity constraint violation (e.g., duplicate unique key)
            $message = "ข้อมูลซ้ำกัน! รหัสประจำตัว, เลขบัตรประชาชน หรืออีเมลนี้อาจมีผู้ใช้งานแล้ว";
        } else {
            $message = "เกิดข้อผิดพลาดในการลงทะเบียน: " . $e->getMessage();
        }
    }
} else {
    // If accessed directly, redirect to the registration form.
    header("Location: register.html");
    exit();
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ผลการลงทะเบียน</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <img src="ตราวิลัย-removebg-preview.png" alt="Logo" class="logo">
        <h2>ผลการลงทะเบียน</h2>
        <div class="message-container">
            <p><?php echo $message; ?></p>
        </div>
    </div>
</body>
</html>
