document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const body = document.body;

    // --- DOM ELEMENT SELECTORS --- //
    const menuItems = document.querySelectorAll(".sidebar .menu li");
    const pages = document.querySelectorAll(".main-content .page");
    const userAvatarInitial = document.getElementById("user-avatar-initial");
    const userProfileName = document.getElementById("user-profile-name");
    const userProfileId = document.getElementById("user-profile-id");
    const welcomeMessage = document.getElementById("welcome-message");
    const teacherAvatarDisplay = document.getElementById("teacher-avatar-display");
    const teacherNameDisplay = document.getElementById("teacher-name-display");
    const teacherTitleDisplay = document.getElementById("teacher-title-display");
    const teacherPhoneDisplay = document.getElementById("teacher-phone-display");
    const studentNameInput = document.getElementById("student-name-input");
    const studentIdInput = document.getElementById("student-id-input");
    const educationLevelSelect = document.getElementById("education-level-select");
    const teacherNameInput = document.getElementById("teacher-name-input");
    const teacherTitleInput = document.getElementById("teacher-title-input");
    const teacherPhoneInput = document.getElementById("teacher-phone-input");
    const teacherAvatarInput = document.getElementById("teacher-avatar-input");
    const teacherAvatarPreview = document.getElementById("teacher-avatar-preview");
    const bgTextureToggle = document.getElementById("bg-texture-toggle");
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    const checkInTodayBtn = document.getElementById("check-in-today-btn");
    const checkinModal = document.getElementById("checkin-modal");
    const modalClock = document.getElementById("modal-clock");
    const confirmCheckinBtn = document.getElementById("confirm-checkin-btn");
    const cancelCheckinBtn = document.getElementById("cancel-checkin-btn");
    const attendanceTableBody = document.getElementById("attendance-table-body");
    const notificationToast = document.getElementById("notification-toast");
    const attendanceSummaryText = document.getElementById("attendance-summary-text");

    // Profile Page Elements
    const saveProfileBtn = document.querySelector('.save-profile-btn');
    const editableFields = document.querySelectorAll('#profile [contenteditable="false"]');
    const individualEditBtns = document.querySelectorAll('#profile .edit-field-btn, #profile .edit-section-btn');
    const studentNameProfile = document.getElementById("student-name-profile");
    const studentIdProfile = document.getElementById("student-id-profile");
    const studentEducationLevelProfile = document.getElementById("student-education-level-profile");

    // Visit Page Elements
    const visitForm = document.getElementById('visit-form');
    const visitLogList = document.getElementById('visit-log-list');
    const visitMapContainer = document.getElementById('visits-main-map');
    const gpsCoordsInput = document.getElementById('visit-gps-coords');
    const getCurrentLocationBtn = document.getElementById('get-current-location-btn');
    let visitMap, visitMarker, visitMarkers = [];

    const colorPickers = {
        '--primary-color': document.getElementById("primary-color-picker"),
        '--present-color': document.getElementById("present-color-picker"),
        '--late-color': document.getElementById("late-color-picker"),
        '--absent-color': document.getElementById("absent-color-picker"),
        '--positive-color': document.getElementById("positive-color-picker"),
        '--negative-color': document.getElementById("negative-color-picker"),
    };

    let attendanceChart, attendanceTrendChart, clockInterval;
    let newAvatarData = null;
    let isProfileEditMode = false;

    const defaultSettings = {
        studentName: "กาญจน์ภูมิ รัชเวทย์",
        studentId: "65001214",
        educationLevel: "ปวช.",
        teacherName: "ครูอรอนงค์ รักเรียน",
        teacherTitle: "ครูฝ่ายปกครอง",
        teacherPhone: "081-234-5678",
        teacherAvatar: "https://i.pravatar.cc/150?img=3",
        profile: {
            name: "",
            studentId: "",
            about: "",
            class: "",
            major: "",
            phone: "",
            email: "",
            birthdate: "",
            address: "",
        },
        themeColors: { '--primary-color': '#4a86e8', '--present-color': '#27ae60', '--late-color': '#f39c12', '--absent-color': '#e74c3c', '--positive-color': '#27ae60', '--negative-color': '#e74c3c' },
        bgTextureActive: true,
        attendanceRecords: [],
        visitRecords: [],
    };

    let currentSettings = { ...defaultSettings };

    const applySettings = (settings) => {
        if(userProfileName) userProfileName.textContent = settings.studentName;
        if(userProfileId) userProfileId.textContent = `ID: ${settings.studentId}`;
        if(studentEducationLevelProfile) studentEducationLevelProfile.textContent = settings.educationLevel;
        if (userAvatarInitial && settings.studentName && settings.studentName !== "N/A") {
            userAvatarInitial.textContent = settings.studentName.charAt(0);
        }
        if(welcomeMessage) welcomeMessage.textContent = `ยินดีต้อนรับกลับมา, ${settings.studentName}`;
        if(teacherNameDisplay) teacherNameDisplay.textContent = settings.teacherName;
        if(teacherTitleDisplay) teacherTitleDisplay.textContent = settings.teacherTitle;
        if(teacherPhoneDisplay) teacherPhoneDisplay.textContent = settings.teacherPhone;
        if(teacherAvatarDisplay) teacherAvatarDisplay.src = settings.teacherAvatar;
        if(teacherAvatarPreview) teacherAvatarPreview.src = settings.teacherAvatar;
        
        Object.entries(settings.themeColors).forEach(([prop, value]) => {
            root.style.setProperty(prop, value);
            if (colorPickers[prop]) colorPickers[prop].value = value;
            if (prop === '--primary-color') {
                root.style.setProperty('--primary-glow', `${value}66`);
                root.style.setProperty('--secondary-color', `${value}1a`);
            }
        });
        body.classList.toggle("texture-active", settings.bgTextureActive);

        if(studentNameInput) studentNameInput.value = settings.studentName;
        if(studentIdInput) studentIdInput.value = settings.studentId;
        if(educationLevelSelect) educationLevelSelect.value = settings.educationLevel;
        if(teacherNameInput) teacherNameInput.value = settings.teacherName;
        if(teacherTitleInput) teacherTitleInput.value = settings.teacherTitle;
        if(teacherPhoneInput) teacherPhoneInput.value = settings.teacherPhone;
        if(bgTextureToggle) bgTextureToggle.checked = settings.bgTextureActive;
        
        if(attendanceTableBody) renderAttendanceTable();
        renderVisitLog(); // This now also updates the map
        updateAllChartColors();
        applyProfileData(settings.profile);
    };

    const applyProfileData = (profileData) => {
        if (studentNameProfile) studentNameProfile.textContent = currentSettings.studentName || 'N/A';
        if (studentIdProfile) studentIdProfile.textContent = currentSettings.studentId || 'N/A';
        document.getElementById('about-me-content').textContent = profileData.about || 'N/A';
        document.getElementById('student-class').textContent = profileData.class || 'N/A';
        document.getElementById('student-major').textContent = profileData.major || 'N/A';
        document.getElementById('student-phone').textContent = profileData.phone || 'N/A';
        document.getElementById('student-email').textContent = profileData.email || 'N/A';
        document.getElementById('student-birthdate').textContent = profileData.birthdate || 'N/A';
        document.getElementById('student-address').textContent = profileData.address || 'N/A';
    }

    const saveSettings = () => {
        const newSettings = {
            ...currentSettings,
            studentName: studentNameInput.value,
            studentId: studentIdInput.value,
            educationLevel: educationLevelSelect.value,
            teacherName: teacherNameInput.value,
            teacherTitle: teacherTitleInput.value,
            teacherPhone: teacherPhoneInput.value,
            teacherAvatar: newAvatarData || currentSettings.teacherAvatar,
            themeColors: { ...currentSettings.themeColors },
            bgTextureActive: bgTextureToggle.checked,
        };
        Object.keys(colorPickers).forEach(prop => { 
            if(colorPickers[prop]) newSettings.themeColors[prop] = colorPickers[prop].value; 
        });
        currentSettings = newSettings;
        localStorage.setItem('homeroomAppSettings', JSON.stringify(currentSettings));
        newAvatarData = null;
        applySettings(currentSettings);
        showToast("บันทึกการตั้งค่าเรียบร้อยแล้ว!", "success");
    };

    const loadSettings = () => {
        const savedSettingsJSON = localStorage.getItem('homeroomAppSettings');
        let savedSettings = {};
        if (savedSettingsJSON) {
            try { savedSettings = JSON.parse(savedSettingsJSON); } catch (e) { savedSettings = {}; }
        }

        currentSettings = {
            ...defaultSettings,
            ...savedSettings,
            themeColors: { ...defaultSettings.themeColors, ...(savedSettings.themeColors || {}) },
            attendanceRecords: Array.isArray(savedSettings.attendanceRecords) ? savedSettings.attendanceRecords : [],
            visitRecords: Array.isArray(savedSettings.visitRecords) ? savedSettings.visitRecords : [],
            profile: { ...defaultSettings.profile, ...(savedSettings.profile || {}) }
        };

        const urlParams = new URLSearchParams(window.location.search);
        const loggedInFullname = urlParams.get('fullname');
        const loggedInStudentId = urlParams.get('student_id');

        if (loggedInFullname && loggedInStudentId) {
            currentSettings.studentName = loggedInFullname;
            currentSettings.studentId = loggedInStudentId;
            localStorage.setItem('homeroomAppSettings', JSON.stringify(currentSettings));
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (currentSettings.attendanceRecords.length === 0 && attendanceTableBody) {
            currentSettings.attendanceRecords = Array.from({ length: 22 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (i + 1));
                if (d.getDay() === 0 || d.getDay() === 6) return null; 
                if (i % 5 === 1) return { date: d.toLocaleDateString('th-TH'), time: '-', status: 'absent', note: i === 1 ? 'ลาป่วย' : '-' };
                const hour = 7 + Math.floor(Math.random() * 2);
                const minute = Math.floor(Math.random() * 60);
                const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} น.`;
                const status = hour >= 8 && minute > 10 ? 'late' : 'present';
                return { date: d.toLocaleDateString('th-TH'), time, status, note: '-' };
            }).filter(Boolean);
        }
        
        if (currentSettings.visitRecords.length === 0 && visitLogList) {
            currentSettings.visitRecords = [
                {
                    date: '20/01/2026',
                    teacher: 'ครูอรอนงค์ รักเรียน',
                    notes: 'ผู้ปกครองแจ้งว่านักเรียนกลับบ้านดึกเพราะซ้อมกีฬา',
                    coords: '13.7563, 100.5018'
                },
                 {
                    date: '15/11/2025',
                    teacher: 'ครูสมชาย ใจดี',
                    notes: 'สอบถามเรื่องพฤติกรรมในห้องเรียน ไม่มีปัญหาอะไรเป็นพิเศษ',
                    coords: '13.7649, 100.5383'
                }
            ];
        }

        applySettings(currentSettings);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => { newAvatarData = e.target.result; teacherAvatarPreview.src = newAvatarData; };
        reader.readAsDataURL(file);
    };

    const openCheckinModal = () => {
        const today = new Date().toLocaleDateString('th-TH');
        const alreadyCheckedIn = currentSettings.attendanceRecords.some(r => r.date === today);
        if (alreadyCheckedIn) {
            showToast("คุณได้เช็คชื่อสำหรับวันนี้ไปแล้ว", "error");
            return;
        }
        checkinModal.classList.remove("hidden");
        modalClock.textContent = new Date().toLocaleTimeString('th-TH');
        clockInterval = setInterval(() => { modalClock.textContent = new Date().toLocaleTimeString('th-TH'); }, 1000);
    };
    
    const closeCheckinModal = () => {
        checkinModal.classList.add("hidden");
        clearInterval(clockInterval);
    };

    const confirmCheckin = () => {
        const now = new Date();
        const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
        const date = now.toLocaleDateString('th-TH');
        const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 10);
        const status = isLate ? 'late' : 'present';
        const statusText = isLate ? 'สาย' : 'มาทัน';

        currentSettings.attendanceRecords.unshift({ date, time, status, note: '-' });
        localStorage.setItem('homeroomAppSettings', JSON.stringify(currentSettings));
        renderAttendanceTable();
        closeCheckinModal();
        showToast(`เช็คชื่อสำเร็จ: ${statusText}`, isLate ? 'warning' : 'success');
    };

    const renderAttendanceTable = () => {
        if (!attendanceTableBody) return;
        attendanceTableBody.innerHTML = currentSettings.attendanceRecords.map(r => `
            <tr>
                <td>${r.date}</td>
                <td>${r.time}</td>
                <td><span class="status ${r.status}">${{present: 'มาทัน', late: 'สาย', absent: 'ขาดเรียน'}[r.status] || ''}</span></td>
                <td>${r.note}</td>
            </tr>
        `).join('');
        attendanceSummaryText.textContent = `แสดง ${currentSettings.attendanceRecords.length} จาก ${currentSettings.attendanceRecords.length} รายการ`;
    };
    
    const renderVisitLog = () => {
        if (!visitLogList || !visitMap) return;
        visitLogList.innerHTML = '';
        // Clear existing markers
        visitMarkers.forEach(m => m.remove());
        visitMarkers = [];

        currentSettings.visitRecords.forEach((v, index) => {
            // Add item to the log
            const logItem = document.createElement('div');
            logItem.className = 'visit-log-item';
            logItem.setAttribute('data-index', index);
            logItem.innerHTML = `
                <i class="fa-solid fa-map-marker-alt visit-log-icon"></i>
                <div class="visit-log-details">
                    <p>เยี่ยมบ้านวันที่ ${v.date}</p>
                    <small>โดย: ${v.teacher}</small>
                    <div class="visit-log-notes">${v.notes}</div>
                </div>
            `;
            visitLogList.appendChild(logItem);

            // Add marker to the map
            if (v.coords) {
                const coords = v.coords.split(',').map(c => parseFloat(c.trim()));
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    const marker = L.marker(coords).addTo(visitMap)
                        .bindPopup(`<b>เยี่ยมบ้านวันที่ ${v.date}</b><br>${v.notes}`);
                    visitMarkers.push(marker);
                    
                    logItem.addEventListener('click', () => {
                         // Highlight the active log item
                        document.querySelectorAll('.visit-log-item').forEach(item => item.classList.remove('active'));
                        logItem.classList.add('active');
                        
                        visitMap.flyTo(coords, 16);
                        marker.openPopup();
                    });
                }
            }
        });

        // Fit map to show all markers
        if (visitMarkers.length > 0) {
            const group = new L.featureGroup(visitMarkers);
            visitMap.fitBounds(group.getBounds().pad(0.3));
        }
    };

    const showToast = (message, type = 'success') => {
        if (!notificationToast) return;
        notificationToast.innerHTML = `<i class="toast-icon fa-solid fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'clock' : 'times-circle'}"></i><p>${message}</p>`;
        notificationToast.className = `toast show ${type}`;
        setTimeout(() => { notificationToast.classList.remove('show'); }, 4000);
    }

    menuItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            const page = item.getAttribute("data-page");

            document.querySelector(".sidebar .menu li.active").classList.remove("active");
            document.querySelector(".main-content .page.active").classList.remove("active");

            item.classList.add("active");
            document.getElementById(page).classList.add("active");
            
             if (page === 'visits') {
                initVisitMap(); 
            }
        });
    });

    // --- Profile Page Logic ---
    const toggleProfileEditMode = () => {
        isProfileEditMode = !isProfileEditMode;
        editableFields.forEach(field => {
            if (field.id === 'student-name-profile' || field.id === 'student-id-profile') return; 
            field.setAttribute('contenteditable', isProfileEditMode);
            if (isProfileEditMode) {
                if (field.textContent.trim() === 'N/A') field.textContent = '';
                field.style.outline = '2px solid var(--primary-color)';
                field.style.backgroundColor = '#f0f8ff';
            } else {
                if (field.textContent.trim() === '') field.textContent = 'N/A';
                field.style.outline = 'none';
                field.style.backgroundColor = 'transparent';
            }
        });

        saveProfileBtn.textContent = isProfileEditMode ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูลทั้งหมด';
        saveProfileBtn.classList.toggle('edit-mode', isProfileEditMode);
        individualEditBtns.forEach(icon => { icon.style.visibility = isProfileEditMode ? 'hidden' : 'visible'; });

        if (!isProfileEditMode) {
            const newProfileData = {
                about: document.getElementById('about-me-content').textContent,
                class: document.getElementById('student-class').textContent,
                major: document.getElementById('student-major').textContent,
                phone: document.getElementById('student-phone').textContent,
                email: document.getElementById('student-email').textContent,
                birthdate: document.getElementById('student-birthdate').textContent,
                address: document.getElementById('student-address').textContent,
            };
            currentSettings.profile = newProfileData;
            localStorage.setItem('homeroomAppSettings', JSON.stringify(currentSettings));
            showToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว', 'success');
        }
    };

    if(saveProfileBtn) saveProfileBtn.addEventListener('click', toggleProfileEditMode);

    individualEditBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const fieldId = btn.getAttribute('data-field') || btn.getAttribute('data-section');
            const field = document.getElementById(fieldId);
            const isFieldEditable = field.getAttribute('contenteditable') === 'true';
            field.setAttribute('contenteditable', !isFieldEditable);
            if (!isFieldEditable) {
                if (field.textContent.trim() === 'N/A') field.textContent = '';
                field.focus();
                field.style.outline = '2px solid var(--primary-color)';
                field.style.backgroundColor = '#f0f8ff';
                btn.innerHTML = '<i class="fas fa-check"></i>';
            } else {
                if (field.textContent.trim() === '') field.textContent = 'N/A';
                field.style.outline = 'none';
                field.style.backgroundColor = 'transparent';
                btn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                const newProfileData = {
                    about: document.getElementById('about-me-content').textContent,
                    class: document.getElementById('student-class').textContent,
                    major: document.getElementById('student-major').textContent,
                    phone: document.getElementById('student-phone').textContent,
                    email: document.getElementById('student-email').textContent,
                    birthdate: document.getElementById('student-birthdate').textContent,
                    address: document.getElementById('student-address').textContent,
                };
                currentSettings.profile = newProfileData;
                localStorage.setItem('homeroomAppSettings', JSON.stringify(currentSettings));
                showToast('บันทึกข้อมูลแล้ว', 'success');
            }
        });
    });

    // --- Visit Page Logic ---
    const initVisitMap = () => {
        if (!visitMapContainer) return;
        if (visitMap) {
            visitMap.invalidateSize();
            renderVisitLog();
            return;
        }
        visitMap = L.map(visitMapContainer).setView([13.7563, 100.5018], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(visitMap);
        visitMap.on('click', (e) => {
            const { lat, lng } = e.latlng;
            gpsCoordsInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            if (visitMarker) {
                visitMarker.setLatLng(e.latlng);
            } else {
                visitMarker = L.marker(e.latlng, { draggable: true }).addTo(visitMap);
            }
        });
        renderVisitLog();
        setTimeout(() => visitMap.invalidateSize(), 100);
    };

    if (getCurrentLocationBtn) {
        getCurrentLocationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const { latitude, longitude } = position.coords;
                    gpsCoordsInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    const latLng = [latitude, longitude];
                    visitMap.setView(latLng, 16);
                    if (visitMarker) {
                        visitMarker.setLatLng(latLng);
                    } else {
                        visitMarker = L.marker(latLng, { draggable: true }).addTo(visitMap);
                    }
                }, () => {
                    showToast('ไม่สามารถเข้าถึงตำแหน่งปัจจุบันได้', 'error');
                });
            } else {
                showToast('เบราว์เซอร์ของคุณไม่รองรับ Geolocation', 'error');
            }
        });
    }

    if (visitForm) {
        visitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newVisit = {
                date: document.getElementById('visit-date').value,
                teacher: document.getElementById('visit-teacher-name').value,
                notes: document.getElementById('visit-notes').value,
                coords: gpsCoordsInput.value,
            };
            currentSettings.visitRecords.unshift(newVisit);
            localStorage.setItem('homeroomAppSettings', JSON.stringify(currentSettings));
            renderVisitLog();
            visitForm.reset();
            if (visitMarker) {
                visitMarker.remove();
                visitMarker = null;
            }
            showToast('บันทึกการเยี่ยมบ้านเรียบร้อยแล้ว', 'success');
        });
    }

    const updateAllChartColors = () => {
        if (!attendanceChart || !attendanceTrendChart) return;
        const s = currentSettings.themeColors;
        attendanceChart.data.datasets[0].backgroundColor = [s['--present-color'], s['--late-color'], s['--absent-color']];
        attendanceChart.update();
        const primary = s['--primary-color'];
        const gradient = attendanceTrendChart.ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, `${primary}cc`); 
        gradient.addColorStop(1, `${primary}33`);
        attendanceTrendChart.data.datasets[0].backgroundColor = gradient;
        attendanceTrendChart.data.datasets[0].borderColor = primary;
        attendanceTrendChart.update();
    };

    const createCharts = () => {
        if (!document.getElementById('attendance-chart') || !document.getElementById('attendance-trend-chart')) {
            loadSettings();
            return;
        }
        Chart.defaults.font.family = "'Poppins', sans-serif"; 
        Chart.defaults.color = '#8a99a8';
        attendanceChart = new Chart(document.getElementById('attendance-chart').getContext('2d'), {
            type: 'doughnut', 
            data: { labels: ['มาเรียน', 'สาย', 'ขาด'], datasets: [{ data: [85, 10, 5], borderWidth: 5, hoverOffset: 8 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }
        });
        attendanceTrendChart = new Chart(document.getElementById('attendance-trend-chart').getContext('2d'), {
            type: 'bar', 
            data: { 
                labels: ['ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'], 
                datasets: [{ 
                    label: 'เปอร์เซ็นต์การมาเรียน', 
                    data: [97, 88, 94, 83, 96], 
                    borderWidth: 2, 
                    borderRadius: 12, 
                    barThickness: 35 
                }] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { display: false }, 
                    tooltip: { enabled: true, callbacks: { label: (c) => `${c.dataset.label}: ${c.raw}%` } } 
                }, 
                scales: { 
                    y: { beginAtZero: true, max: 100 }, 
                    x: { grid: { display: false } } 
                } 
            }
        });
        loadSettings();
    };

    if(saveSettingsBtn) saveSettingsBtn.addEventListener("click", saveSettings);
    if(teacherAvatarInput) teacherAvatarInput.addEventListener("change", handleAvatarChange);
    if(checkInTodayBtn) checkInTodayBtn.addEventListener("click", openCheckinModal);
    if(confirmCheckinBtn) confirmCheckinBtn.addEventListener("click", confirmCheckin);
    if(cancelCheckinBtn) cancelCheckinBtn.addEventListener("click", closeCheckinModal);

    createCharts();
});
