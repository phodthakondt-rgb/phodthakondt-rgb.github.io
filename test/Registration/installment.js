document.addEventListener('DOMContentLoaded', () => {
    const studentId = sessionStorage.getItem('currentStudentId');
    const student = students[studentId];

    if (!student) {
        document.querySelector('.student-payment-container').innerHTML = '<h2>ไม่พบข้อมูลนักเรียน</h2><p>กรุณากลับไปหน้าแรกและค้นหาด้วยรหัสนักเรียนอีกครั้ง</p>';
        return;
    }

    // Function to get latest bank settings (from session storage or default)
    function getLatestBankSettings() {
        const storedSettings = sessionStorage.getItem('updatedBankSettings');
        return storedSettings ? JSON.parse(storedSettings) : bankSettings;
    }

    const currentBankSettings = getLatestBankSettings();
    const totalDue = student.tuition + student.insurance;

    function getStatusInfo() {
        const balance = totalDue - student.paid;
        if (balance <= 0) {
            return { text: 'จ่ายครบแล้ว', className: 'status-paid' };
        } else if (student.paid > 0) {
            return { text: `ค้างชำระ ${balance.toLocaleString()} ฿`, className: 'status-partial' };
        } else {
            return { text: 'ยังไม่จ่าย', className: 'status-unpaid' };
        }
    }

    // Populate student data
    document.getElementById('student-details').innerHTML = `<h2>${student.name}</h2><p>${studentId} | ${student.department} | ${student.class}</p>`;
    const statusInfo = getStatusInfo();
    const statusBadge = document.getElementById('payment-status-badge');
    statusBadge.textContent = statusInfo.text;
    statusBadge.className = `status-badge ${statusInfo.className}`;

    document.getElementById('tuition-fee-display').textContent = `${student.tuition.toLocaleString()} ฿`;
    document.getElementById('insurance-fee-display').textContent = `${student.insurance.toLocaleString()} ฿`;
    document.getElementById('total-due-display').textContent = `${totalDue.toLocaleString()} ฿`;
    document.getElementById('paid-amount-display').textContent = `${student.paid.toLocaleString()} ฿`;

    // Populate bank and QR info from the latest settings
    document.getElementById('qr-code-img').src = currentBankSettings.qrCode;
    document.getElementById('bank-account-name').textContent = currentBankSettings.accountName;
    document.getElementById('bank-name-display').textContent = currentBankSettings.bankName;
    document.getElementById('bank-account-number').textContent = currentBankSettings.accountNumber;

    // Form submission
    const form = document.getElementById('installment-payment-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('installment-amount').value);
        const date = document.getElementById('installment-date').value;
        const slip = document.getElementById('installment-slip').files[0];

        if (!amount || !date || !slip) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        
        if (amount > (totalDue - student.paid)) {
            alert('จำนวนเงินที่กรอกมากกว่ายอดค้างชำระ');
            return;
        }

        const slipUrl = URL.createObjectURL(slip);

        student.paid += amount;
        student.paymentHistory.push({ date, amount, slip: slipUrl });

        alert('ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว!\nสถานะของคุณจะถูกอัปเดตหลังเจ้าหน้าที่ตรวจสอบ');

        location.reload();
    });
});
