document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DEFINE ALL FUNCTIONS FIRST ---

    let currentEditingStudentId = null;

    // --- Data Handlers ---
    const getStudentsFromStorage = () => {
        const stored = localStorage.getItem('allStudentData');
        if (stored) return JSON.parse(stored);
        if (typeof students !== 'undefined') {
            localStorage.setItem('allStudentData', JSON.stringify(students));
            return students;
        }
        return {};
    };

    const saveStudentsToStorage = (allStudents) => {
        localStorage.setItem('allStudentData', JSON.stringify(allStudents));
    };

    const getBankSettings = () => {
        const stored = localStorage.getItem('updatedBankSettings');
        if (stored) return JSON.parse(stored);
        if (typeof bankSettings !== 'undefined') {
            localStorage.setItem('updatedBankSettings', JSON.stringify(bankSettings));
            return bankSettings;
        }
        return { bankName: '', accountNumber: '', accountName: '', qrCode: '' };
    };

    // --- UI Rendering ---
    const renderAllTables = () => {
        renderStudentTable();
        renderManageStudentTable();
    };

    const renderStudentTable = () => {
        const allStudents = getStudentsFromStorage();
        const filter = document.getElementById('student-search').value.toLowerCase();
        const status = document.getElementById('status-filter').value;
        const studentTableBody = document.getElementById('student-table-body');
        studentTableBody.innerHTML = '';
        Object.keys(allStudents).forEach(id => {
            const student = allStudents[id];
            const studentStatus = getStatus(student);
            if ((student.name.toLowerCase().includes(filter) || id.includes(filter)) && (status === 'all' || studentStatus === status)) {
                const totalDue = student.tuition + student.insurance;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><b>${student.name}</b><br><small>${id}</small></td>
                    <td>${student.department}<br><small>${student.class}</small></td>
                    <td>${totalDue.toLocaleString()} ฿</td>
                    <td>${student.paid.toLocaleString()} ฿</td>
                    <td>${getStatusText(studentStatus)}</td>
                    <td class="actions">
                        <button class="btn-edit-paid" data-id="${id}">แก้ไขยอด</button>
                        <button class="btn-edit-fee" data-id="${id}">แก้ไขค่าเทอม</button>
                        <button class="btn-view-history" data-id="${id}">ดูประวัติ</button>
                    </td>
                `;
                studentTableBody.appendChild(row);
            }
        });
    };

    const renderManageStudentTable = () => {
        const allStudents = getStudentsFromStorage();
        const studentTableBody = document.getElementById('manage-student-table-body');
        studentTableBody.innerHTML = '';
        Object.keys(allStudents).forEach(id => {
            const student = allStudents[id];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${id}</td>
                <td>${student.name}</td>
                <td>${student.department} / ${student.class}</td>
                <td class="actions">
                    <button class="btn-edit-student" data-id="${id}">แก้ไข</button>
                    <button class="btn-delete-student" data-id="${id}">ลบ</button>
                </td>
            `;
            studentTableBody.appendChild(row);
        });
    };

    const updateSummaryCards = () => {
        const allStudents = getStudentsFromStorage();
        const studentIds = Object.keys(allStudents);
        const paidCount = studentIds.filter(id => getStatus(allStudents[id]) === 'paid').length;
        document.getElementById('total-students').textContent = studentIds.length;
        document.getElementById('paid-students').textContent = paidCount;
        document.getElementById('pending-students').textContent = studentIds.length - paidCount;
    };

    const populateSettingsForm = () => {
        const settings = getBankSettings();
        document.getElementById('bank-name').value = settings.bankName;
        document.getElementById('account-number').value = settings.accountNumber;
        document.getElementById('account-name').value = settings.accountName;
        document.getElementById('qr-code-preview').src = settings.qrCode;
    };

    const getStatus = (student) => {
        const totalDue = student.tuition + student.insurance;
        return student.paid >= totalDue ? 'paid' : (student.paid > 0 ? 'partial' : 'unpaid');
    };

    const getStatusText = (status) => ({
        paid: '<span class="status-badge status-paid">ชำระแล้ว</span>',
        partial: '<span class="status-badge status-partial">จ่ายบางส่วน</span>',
        unpaid: '<span class="status-badge status-unpaid">ยังไม่จ่าย</span>'
    }[status] || '');

    // --- Event Handlers ---
    const handleTabClick = (event) => {
        document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        event.currentTarget.classList.add('active');
        document.getElementById(event.currentTarget.dataset.tab).classList.add('active');
    };

    const handleStorageChange = (e) => {
        if (e.key === 'allStudentData' || e.key === 'updatedBankSettings') {
            renderAllTables();
            updateSummaryCards();
            populateSettingsForm();
        }
    };

    const handleAccountFormSubmit = (e) => {
        e.preventDefault();
        const settings = getBankSettings();
        settings.bankName = document.getElementById('bank-name').value;
        settings.accountNumber = document.getElementById('account-number').value;
        settings.accountName = document.getElementById('account-name').value;
        localStorage.setItem('updatedBankSettings', JSON.stringify(settings));
        alert('บันทึกข้อมูลบัญชีธนาคารเรียบร้อยแล้ว');
    };

    const handleQrCodeUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const newQrCodeUrl = event.target.result;
            document.getElementById('qr-code-preview').src = newQrCodeUrl;
            const settings = getBankSettings();
            settings.qrCode = newQrCodeUrl;
            localStorage.setItem('updatedBankSettings', JSON.stringify(settings));
            alert('อัปโหลด QR Code ใหม่เรียบร้อยแล้ว');
        }; 
        reader.readAsDataURL(file);
    }; 

    const handleTableActions = (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        currentEditingStudentId = target.dataset.id;
        if (target.classList.contains('btn-edit-paid')) openModal('edit-paid-amount-modal');
        else if (target.classList.contains('btn-edit-fee')) openModal('edit-fee-modal');
        else if (target.classList.contains('btn-view-history')) openModal('history-modal');
    };

    const handleManageStudentActions = (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const studentId = target.dataset.id;
        if (target.classList.contains('btn-edit-student')) {
            currentEditingStudentId = studentId;
            openModal('student-modal', studentId);
        } else if (target.classList.contains('btn-delete-student')) {
            if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบนักเรียนรหัส ${studentId}?`)) {
                const allStudents = getStudentsFromStorage();
                delete allStudents[studentId];
                saveStudentsToStorage(allStudents);
                renderAllTables();
                updateSummaryCards();
            }
        }
    };

    // --- Modal Handlers ---
    const openModal = (modalId, studentIdForEdit = null) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
    
        if (modalId === 'student-modal') {
            const studentForm = document.getElementById('student-form');
            const modalTitle = document.getElementById('student-modal-title');
            studentForm.reset();
            document.getElementById('student-id-hidden').value = '';
            document.getElementById('student-id').disabled = false;

            if (studentIdForEdit) {
                const student = getStudentsFromStorage()[studentIdForEdit];
                modalTitle.textContent = 'แก้ไขข้อมูลนักเรียน';
                document.getElementById('student-id-hidden').value = studentIdForEdit;
                document.getElementById('student-id').value = studentIdForEdit;
                document.getElementById('student-name').value = student.name;
                document.getElementById('student-department').value = student.department;
                const classParts = student.class.split('/');
                document.getElementById('student-year').value = classParts[0] || '';
                document.getElementById('student-room').value = classParts[1] || '';
                document.getElementById('student-tuition').value = student.tuition;
                document.getElementById('student-insurance').value = student.insurance;
            } else {
                modalTitle.textContent = 'เพิ่มนักเรียนใหม่';
            }
        } else {
             const student = getStudentsFromStorage()[currentEditingStudentId];
             if (!student) return;

            if (modalId === 'edit-fee-modal') {
                document.getElementById('modal-student-name').textContent = `${student.name} (${currentEditingStudentId})`;
                document.getElementById('tuition-fee').value = student.tuition;
                document.getElementById('insurance-fee').value = student.insurance;
                updateTotalFee();
            } else if (modalId === 'edit-paid-amount-modal') {
                document.getElementById('paid-amount-student-name').textContent = `${student.name} (${currentEditingStudentId})`;
                document.getElementById('paid-amount-input').value = student.paid;
            } else if (modalId === 'history-modal') {
                document.getElementById('history-student-name').textContent = `${student.name} (${currentEditingStudentId})`;
                const historyBody = document.getElementById('history-table-body');
                historyBody.innerHTML = (student.paymentHistory && student.paymentHistory.length > 0) ?
                    student.paymentHistory.map(rec => `<tr><td>${new Date(rec.date).toLocaleDateString('th-TH')}</td><td>${rec.amount.toLocaleString()} ฿</td><td>${new Date(rec.submissionTimestamp).toLocaleString('th-TH')}</td><td><button class="btn-view-slip" data-slip-url="${rec.slip}">ดูสลิป</button></td></tr>`).join('') :
                    '<tr><td colspan="4">ไม่มีประวัติ</td></tr>';
            }
        }
        modal.style.display = 'flex';
    };
    
    const handleEditFeeSubmit = (e) => {
        e.preventDefault();
        const allStudents = getStudentsFromStorage();
        allStudents[currentEditingStudentId].tuition = parseFloat(document.getElementById('tuition-fee').value) || 0;
        allStudents[currentEditingStudentId].insurance = parseFloat(document.getElementById('insurance-fee').value) || 0;
        saveStudentsToStorage(allStudents);
        renderAllTables();
        updateSummaryCards();
        document.getElementById('edit-fee-modal').style.display = 'none';
    };

    const updateTotalFee = () => {
        const tuition = parseFloat(document.getElementById('tuition-fee').value) || 0;
        const insurance = parseFloat(document.getElementById('insurance-fee').value) || 0;
        document.getElementById('total-fee-preview').textContent = (tuition + insurance).toLocaleString();
    };
    
    const handlePaidAmountSubmit = (e) => {
        e.preventDefault();
        const allStudents = getStudentsFromStorage();
        allStudents[currentEditingStudentId].paid = parseFloat(document.getElementById('paid-amount-input').value) || 0;
        saveStudentsToStorage(allStudents);
        renderAllTables();
        updateSummaryCards();
        document.getElementById('edit-paid-amount-modal').style.display = 'none';
    };

    const handleStudentFormSubmit = (e) => {
        e.preventDefault();
        const allStudents = getStudentsFromStorage();
        const newStudentId = document.getElementById('student-id').value.trim();
        const originalStudentId = document.getElementById('student-id-hidden').value;
    
        if (!newStudentId) {
            alert('รหัสนักเรียนห้ามว่าง');
            return;
        }
    
        // Check for ID collision
        if (originalStudentId && originalStudentId !== newStudentId && allStudents[newStudentId]) {
            alert('รหัสนักเรียนใหม่นี้มีอยู่แล้วในระบบ');
            return;
        }
        if (!originalStudentId && allStudents[newStudentId]) {
            alert('รหัสนักเรียนนี้มีอยู่แล้วในระบบ');
            return;
        }
    
        const year = document.getElementById('student-year').value;
        const room = document.getElementById('student-room').value;
        const studentClass = `${year}/${room}`;
    
        const studentData = (originalStudentId && allStudents[originalStudentId]) ? allStudents[originalStudentId] : { paid: 0, paymentHistory: [] };
    
        studentData.name = document.getElementById('student-name').value;
        studentData.department = document.getElementById('student-department').value;
        studentData.class = studentClass;
        studentData.tuition = parseFloat(document.getElementById('student-tuition').value) || 0;
        studentData.insurance = parseFloat(document.getElementById('student-insurance').value) || 0;
    
        if (originalStudentId && originalStudentId !== newStudentId) {
            delete allStudents[originalStudentId];
        }
    
        allStudents[newStudentId] = studentData;
        saveStudentsToStorage(allStudents);
    
        renderAllTables();
        updateSummaryCards();
        document.getElementById('student-modal').style.display = 'none';
    };

    const openSlipViewer = (slipUrl) => {
        document.getElementById('slip-viewer-image').src = slipUrl;
        document.getElementById('slip-viewer-modal').style.display = 'flex';
    };


    // --- 2. ATTACH EVENT LISTENERS ---
    document.querySelectorAll('.tab-link').forEach(tab => tab.addEventListener('click', handleTabClick));
    window.addEventListener('storage', handleStorageChange);
    document.getElementById('student-search').addEventListener('input', renderStudentTable);
    document.getElementById('status-filter').addEventListener('change', renderStudentTable);
    document.getElementById('student-table-body').addEventListener('click', handleTableActions);
    document.getElementById('manage-student-table-body').addEventListener('click', handleManageStudentActions);
    document.getElementById('add-student-btn').addEventListener('click', () => openModal('student-modal'));
    document.getElementById('account-form').addEventListener('submit', handleAccountFormSubmit);
    document.getElementById('qr-code-upload').addEventListener('change', handleQrCodeUpload);
    document.getElementById('edit-fee-form').addEventListener('submit', handleEditFeeSubmit);
    document.getElementById('paid-amount-form').addEventListener('submit', handlePaidAmountSubmit);
    document.getElementById('student-form').addEventListener('submit', handleStudentFormSubmit);
    document.getElementById('edit-fee-modal').addEventListener('input', updateTotalFee);
    document.getElementById('history-modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-view-slip')) {
            openSlipViewer(e.target.dataset.slipUrl);
        }
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target.classList.contains('close-button') || e.target.closest('.btn-secondary')) {
                modal.style.display = 'none';
            }
        });
    });

    // --- 3. INITIALIZE APP ---
    renderAllTables();
    updateSummaryCards();
    populateSettingsForm();

});