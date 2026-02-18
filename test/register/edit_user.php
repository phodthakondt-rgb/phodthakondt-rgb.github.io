<?php
// edit_user.php - Page to edit an existing user's information.

require_once 'database.php';

$user = null;
$error_message = '';
$success_message = '';

// 1. Check if an ID is provided in the URL.
if (!isset($_GET['id']) || empty($_GET['id'])) {
    die('ไม่พบ ID ผู้ใช้');
}
$user_id = $_GET['id'];

// 2. Handle the form submission for updating the user.
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve form data
    $fullname = trim($_POST['fullname']);
    $student_id = trim($_POST['student_id']);
    $national_id = trim($_POST['national_id']);
    $email = trim($_POST['email']);
    $position = trim($_POST['position']);

    // Basic validation
    if (empty($fullname) || empty($student_id) || empty($national_id) || empty($email) || empty($position)) {
        $error_message = 'กรุณากรอกข้อมูลให้ครบถ้วน';
    } else {
        try {
            // Prepare an UPDATE statement.
            $sql = "UPDATE users SET fullname = :fullname, student_id = :student_id, national_id = :national_id, email = :email, position = :position WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            
            // Bind parameters and execute.
            $stmt->execute([
                ':fullname' => $fullname,
                ':student_id' => $student_id,
                ':national_id' => $national_id,
                ':email' => $email,
                ':position' => $position,
                ':id' => $user_id
            ]);

            $success_message = 'อัปเดตข้อมูลผู้ใช้สำเร็จแล้ว!';

        } catch (PDOException $e) {
            // Check for duplicate entry error.
            if ($e->getCode() == 23000) { // Integrity constraint violation
                $error_message = "ข้อมูลซ้ำกัน! รหัสประจำตัว, เลขบัตรประชาชน หรืออีเมลนี้อาจมีผู้ใช้งานแล้ว";
            } else {
                $error_message = "เกิดข้อผิดพลาดในการอัปเดตข้อมูล: " . $e->getMessage();
            }
        }
    }
}

// 3. Fetch the current user data to populate the form.
try {
    $sql = "SELECT * FROM users WHERE id = :id LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id', $user_id);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        die('ไม่พบผู้ใช้');
    }
} catch (PDOException $e) {
    die("เกิดข้อผิดพลาดในการดึงข้อมูล: " . $e->getMessage());
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>แก้ไขข้อมูลผู้ใช้</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h2>แก้ไขข้อมูลผู้ใช้ ID: <?php echo htmlspecialchars($user['id']); ?></h2>

        <?php if ($error_message): ?>
            <div class="error-message"><?php echo $error_message; ?></div>
        <?php endif; ?>
        <?php if ($success_message): ?>
            <div class="success-message"><?php echo $success_message; ?></div>
        <?php endif; ?>

        <form action="edit_user.php?id=<?php echo $user_id; ?>" method="post">
            <div class="form-group">
                <label for="fullname">ชื่อ-นามสกุล:</label>
                <input type="text" id="fullname" name="fullname" value="<?php echo htmlspecialchars($user['fullname']); ?>" required>
            </div>
            <div class="form-group">
                <label for="student_id">รหัสประจำตัว:</label>
                <input type="text" id="student_id" name="student_id" value="<?php echo htmlspecialchars($user['student_id']); ?>" required>
            </div>
            <div class="form-group">
                <label for="national_id">เลขบัตรประชาชน (ใช้เป็นรหัสผ่าน):</label>
                <input type="text" id="national_id" name="national_id" value="<?php echo htmlspecialchars($user['national_id']); ?>" required>
            </div>
            <div class="form-group">
                <label for="email">อีเมล:</label>
                <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($user['email']); ?>" required>
            </div>
            <div class="form-group">
                <label for="position">ตำแหน่ง:</label>
                <select id="position" name="position" required>
                    <option value="student" <?php echo ($user['position'] == 'student') ? 'selected' : ''; ?>>นักศึกษา</option>
                    <option value="teacher" <?php echo ($user['position'] == 'teacher') ? 'selected' : ''; ?>>อาจารย์</option>
                    <option value="parent" <?php echo ($user['position'] == 'parent') ? 'selected' : ''; ?>>ผู้ปกครอง</option>
                </select>
            </div>
            <div class="form-group">
                <button type="submit" class="btn">บันทึกการเปลี่ยนแปลง</button>
            </div>
        </form>
        <p style="margin-top: 20px;">
            <a href="view_users.php" class="btn-secondary">กลับไปหน้ารายชื่อ</a>
        </p>
    </div>
</body>
</html>
