document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.querySelector('.save-btn');
    const editableFields = document.querySelectorAll('[contenteditable="false"]');
    const individualEditBtns = document.querySelectorAll('.edit-field-btn, .edit-section-btn');

    let isEditMode = false;

    const toggleEditMode = () => {
        isEditMode = !isEditMode;
        editableFields.forEach(field => {
            // Don't make the ID field editable
            if (field.id === 'student-id') return;

            field.setAttribute('contenteditable', isEditMode);
            if (isEditMode) {
                if (field.textContent.trim() === 'N/A') {
                    field.textContent = '';
                }
                field.style.outline = '2px solid var(--primary-color)';
                 field.style.backgroundColor = '#f0f8ff';
            } else {
                if (field.textContent.trim() === '') {
                    field.textContent = 'N/A';
                }
                field.style.outline = 'none';
                field.style.backgroundColor = 'transparent';
            }
        });

        saveBtn.textContent = isEditMode ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูลทั้งหมด';
        saveBtn.classList.toggle('edit-mode', isEditMode);

        const editIcons = document.querySelectorAll('.edit-section-btn, .edit-field-btn');
        editIcons.forEach(icon => {
            icon.style.visibility = isEditMode ? 'hidden' : 'visible';
        });
    };

    saveBtn.addEventListener('click', toggleEditMode);

    individualEditBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const fieldId = btn.getAttribute('data-field') || btn.getAttribute('data-section');
            const field = document.getElementById(fieldId);

            const isFieldEditable = field.getAttribute('contenteditable') === 'true';

            field.setAttribute('contenteditable', !isFieldEditable);

             if (!isFieldEditable) {
                 if (field.textContent.trim() === 'N/A') {
                    field.textContent = '';
                }
                field.focus();
                field.style.outline = '2px solid var(--primary-color)';
                field.style.backgroundColor = '#f0f8ff';
                btn.innerHTML = '<i class="fas fa-check"></i>'; 
            } else {
                 if (field.textContent.trim() === '') {
                    field.textContent = 'N/A';
                }
                field.style.outline = 'none';
                 field.style.backgroundColor = 'transparent';
                btn.innerHTML = '<i class="fas fa-pencil-alt"></i>'; 
            }
        });
    });
    
    const backBtn = document.querySelector('.back-btn');
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
