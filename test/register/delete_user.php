<?php
// delete_user.php - Deletes a user from the database.

require_once 'database.php';

// 1. Check if an ID is provided in the URL.
if (!isset($_GET['id']) || empty($_GET['id'])) {
    // If no ID, redirect back to the user list.
    header("Location: view_users.php");
    exit;
}

$user_id = $_GET['id'];

// 2. Prepare and execute the DELETE statement.
try {
    $sql = "DELETE FROM users WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id', $user_id);
    $stmt->execute();

    // 3. Redirect back to the user list page after deletion.
    // We can add a success message in the session/URL if needed, but for simplicity, we'll just redirect.
    header("Location: view_users.php?deleted=success");
    exit;

} catch (PDOException $e) {
    // If there is an error, display it.
    // In a real application, you might want to log this error and show a user-friendly message.
    die("เกิดข้อผิดพลาดในการลบข้อมูล: " . $e->getMessage());
}

?>
