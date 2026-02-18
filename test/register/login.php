<?php
// login.php - Handles user authentication.

// Start a session to store user login state.
session_start();

$error_message = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 1. INCLUDE DATABASE CONNECTION
    require_once 'database.php';

    // 2. RETRIEVE FORM DATA
    $username = trim($_POST['username']); // This can be either student_id or national_id
    $password = trim($_POST['password']); // This should be the national_id

    // 3. FIND THE USER IN THE DATABASE
    try {
        // Prepare a query to find the user by either student_id or national_id.
        $sql = "SELECT * FROM users WHERE student_id = :username OR national_id = :username LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        // Fetch the user record.
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // 4. VERIFY THE PASSWORD
        if ($user) {
            // If a user was found, use password_verify() to check the password.
            // This securely compares the submitted password against the stored hash.
            if (password_verify($password, $user['password_hash'])) {
                // Password is correct.
                // Store user info in the session (optional, but useful).
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_fullname'] = $user['fullname'];
                $_SESSION['user_student_id'] = $user['student_id'];


                // Redirect to the homeroom page with user info.
                $redirect_url = "../homeroom/index.html?fullname=" . urlencode($user['fullname']) . "&student_id=" . urlencode($user['student_id']);
                header("Location: " . $redirect_url);
                exit(); // Important to stop the script after a redirect.
            } else {
                // Password is not correct.
                $error_message = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
            }
        } else {
            // No user found with that username.
            $error_message = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        }

    } catch (PDOException $e) {
        // Database error.
        $error_message = "เกิดข้อผิดพลาดของระบบ โปรดลองอีกครั้งในภายหลัง";
        // In a real application, you should log this error: error_log($e->getMessage());
    }
}

// If the script reaches this point, it means login failed or the form wasn't submitted.
// We will redirect back to login.html and show an error message.
// To do this, we'll use a query parameter.

if (!empty($error_message)) {
    // URL-encode the message to pass it safely in the URL.
    header("Location: login.html?error=" . urlencode($error_message));
    exit();
}

// If the script is accessed directly without POST, just redirect to login.
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    header("Location: login.html");
    exit();
}
?>