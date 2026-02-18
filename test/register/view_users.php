<?php
// view_users.php - A simple page to display all registered users from the database.

// Include the database connection.
require_once 'database.php';

try {
    // Prepare and execute a query to select all users.
    // We select specific columns for clarity and security, avoiding showing the password hash.
    $stmt = $pdo->query("SELECT id, fullname, student_id, national_id, email, position, created_at FROM users ORDER BY id DESC");
    
    // Fetch all results into an associative array.
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    // If there is an error, display it.
    die("Error fetching users: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>จัดการข้อมูลผู้ใช้งาน</title>
    <link rel="stylesheet" href="style.css">
    <script defer src="fontawesome-free-6.2.0-web/js/all.min.js"></script>
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px 15px;
            border: 1px solid #ddd;
            text-align: left;
            vertical-align: middle;
        }
        th {
            background-color: #f8f8f8;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #fdfdfd;
        }
        .action-btn {
            padding: 5px 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            color: white;
            text-decoration: none;
            font-size: 0.9em;
            margin-right: 5px;
        }
        .edit-btn {
            background-color: #f0ad4e; /* Warning color */
        }
        .delete-btn {
            background-color: #d9534f; /* Danger color */
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="ตราวิลัย-removebg-preview.png" alt="Logo" class="logo">
        <h2>จัดการข้อมูลผู้ใช้งาน</h2>

        <?php if (count($users) > 0): ?>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>รหัสประจำตัว</th>
                        <th>ตำแหน่ง</th>
                        <th>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($users as $user): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($user['id']); ?></td>
                            <td><?php echo htmlspecialchars($user['fullname']); ?></td>
                            <td><?php echo htmlspecialchars($user['student_id']); ?></td>
                            <td><?php echo htmlspecialchars($user['position']); ?></td>
                            <td>
                                <a href="edit_user.php?id=<?php echo $user['id']; ?>" class="action-btn edit-btn"><i class="fa-solid fa-pen-to-square"></i> แก้ไข</a>
                                <a href="delete_user.php?id=<?php echo $user['id']; ?>" class="action-btn delete-btn" onclick="return confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?');"><i class="fa-solid fa-trash"></i> ลบ</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <p>ยังไม่มีผู้ใช้งานลงทะเบียนในระบบ</p>
        <?php endif; ?>

        <p style="margin-top: 30px;">
            <a href="index.html" class="btn">กลับไปหน้าแรก</a>
        </p>
    </div>
</body>
</html>
