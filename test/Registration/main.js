document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const searchSection = document.getElementById('search-section');
    const paymentSection = document.getElementById('payment-section');
    const searchInput = document.getElementById('student-id-input');
    const searchBtn = document.getElementById('search-btn');
    const backBtn = document.getElementById('back-to-search');
    const exampleIdBtns = document.querySelectorAll('.id-example');
    const paymentForm = document.getElementById('payment-form');
    const paymentAmountInput = document.getElementById('payment-amount');
    const slipUploadInput = document.getElementById('slip-upload');
    const slipPreview = document.getElementById('slip-preview');
    let currentStudentId = null;

    // --- Event Listeners ---
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
    exampleIdBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            searchInput.value = btn.textContent;
            handleSearch();
        });
    });
    backBtn.addEventListener('click', () => {
        searchSection.classList.remove('hidden');
        paymentSection.classList.add('hidden');
        currentStudentId = null;
        searchInput.value = '';
        paymentForm.reset();
        slipPreview.classList.add('hidden');
    });
    slipUploadInput.addEventListener('change', handleSlipPreview);
    paymentForm.addEventListener('submit', handlePaymentSubmit);

    // --- Functions ---
    function handleSearch() {
        const studentId = searchInput.value.trim();
        if (!studentId) {
            alert('กรุณากรอกรหัสนักเรียน');
            return;
        }
        const allStudents = getStudentsFromStorage();
        const student = allStudents[studentId];
        if (student) {
            currentStudentId = studentId;
            displayStudentData(studentId, student);
            searchSection.classList.add('hidden');
            paymentSection.classList.remove('hidden');
        } else {
            alert('ไม่พบข้อมูลนักเรียน กรุณาตรวจสอบรหัสอีกครั้ง');
        }
    }

    function getStudentsFromStorage() {
        const stored = localStorage.getItem('allStudentData');
        // Initialize localStorage if it's empty
        if (!stored) {
            localStorage.setItem('allStudentData', JSON.stringify(students));
            return students;
        }
        return JSON.parse(stored);
    }

    function displayStudentData(studentId, student) {
        document.getElementById('student-name').textContent = student.name;
        document.getElementById('student-id-display').textContent = `รหัสนักเรียน: ${studentId}`;
        const totalDue = student.tuition + student.insurance;
        const remaining = totalDue - student.paid;
        document.getElementById('tuition-display').textContent = `${student.tuition.toLocaleString()} ฿`;
        document.getElementById('insurance-display').textContent = `${student.insurance.toLocaleString()} ฿`;
        document.getElementById('total-due-display').textContent = `${totalDue.toLocaleString()} ฿`;
        document.getElementById('paid-display').textContent = `${student.paid.toLocaleString()} ฿`;
        document.getElementById('remaining-display').textContent = `${remaining.toLocaleString()} ฿`;
        renderStudentHistory(student.paymentHistory);
        const bankInfo = getBankSettingsFromStorage();
        document.getElementById('bank-name-display').textContent = bankInfo.bankName;
        document.getElementById('account-number-display').textContent = bankInfo.accountNumber;
        document.getElementById('account-name-display').textContent = bankInfo.accountName;
        document.getElementById('qr-code-display').src = bankInfo.qrCode;
    }

    function renderStudentHistory(history) {
        const studentHistoryEl = document.getElementById('student-history');
        studentHistoryEl.innerHTML = '';
        if (!history || history.length === 0) {
            studentHistoryEl.innerHTML = '<p>ยังไม่มีประวัติการชำระเงิน</p>';
            return;
        }
        const table = document.createElement('table');
        table.innerHTML = `
            <thead><tr><th>วันที่โอน</th><th>จำนวนเงิน</th></tr></thead>
            <tbody>
                ${history.map(rec => `<tr><td>${new Date(rec.date).toLocaleDateString('th-TH')}</td><td>${rec.amount.toLocaleString()} ฿</td></tr>`).join('')}
            </tbody>`;
        studentHistoryEl.appendChild(table);
    }

    function getBankSettingsFromStorage() {
        const stored = localStorage.getItem('updatedBankSettings');
        return stored ? JSON.parse(stored) : bankSettings;
    }

    function handleSlipPreview() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                slipPreview.src = e.target.result;
                slipPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            slipPreview.classList.add('hidden');
        }
    }

    function handlePaymentSubmit(e) {
        e.preventDefault();
        const amount = parseFloat(paymentAmountInput.value);
        const slipFile = slipUploadInput.files[0];
        if (isNaN(amount) || amount <= 0 || !slipFile) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const slipUrl = e.target.result;
            let allStudents = getStudentsFromStorage();
            let student = allStudents[currentStudentId];
            student.paid += amount;
            const newHistoryRecord = {
                date: new Date().toISOString().split('T')[0],
                amount: amount,
                slip: slipUrl,
                submissionTimestamp: new Date().toISOString()
            };
            student.paymentHistory.push(newHistoryRecord);
            localStorage.setItem('allStudentData', JSON.stringify(allStudents));
            alert('ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว ระบบจะอัปเดตข้อมูลให้เจ้าหน้าที่อัตโนมัติ');
            displayStudentData(currentStudentId, student);
            paymentForm.reset();
            slipPreview.classList.add('hidden');
        };
        reader.readAsDataURL(slipFile);
    }
});
