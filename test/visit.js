document.addEventListener('DOMContentLoaded', () => {
    // Form Elements
    const visitForm = document.getElementById('visit-form');
    const studentIdInput = document.getElementById('student-id');
    const studentNameInput = document.getElementById('student-name');
    const parentNameInput = document.getElementById('parent-name');
    const parentPhoneInput = document.getElementById('parent-phone');
    const visitDateInput = document.getElementById('visit-date');
    const teacherNameInput = document.getElementById('teacher-name');
    const gpsCoordsInput = document.getElementById('gps-coords');
    const addressInput = document.getElementById('address');
    const fetchAddressBtn = document.getElementById('fetch-address-btn');
    const getCurrentLocationBtn = document.getElementById('get-current-location-btn');
    const detailsInput = document.getElementById('details');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const visitList = document.getElementById('visit-list');

    // Map Initialization
    const map = L.map('map').setView([14.9733, 103.5025], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let visits = JSON.parse(localStorage.getItem('visits')) || [];
    let savedMarkers = [];
    let newVisitMarker = null;

    const newVisitIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const clearSavedMarkers = () => {
        savedMarkers.forEach(marker => map.removeLayer(marker));
        savedMarkers = [];
    };

    const renderSavedMarkers = () => {
        clearSavedMarkers();
        visits.forEach(visit => {
            if (visit.gps) {
                const [lat, lng] = visit.gps.split(',').map(Number);
                if (!isNaN(lat) && !isNaN(lng)) {
                    const popupContent = `<b>${visit.studentName}</b><br>${visit.address || ''}`;
                    const marker = L.marker([lat, lng]).addTo(map).bindPopup(popupContent);
                    savedMarkers.push(marker);
                }
            }
        });
    };

    const renderVisits = () => {
        visitList.innerHTML = '';
        if (visits.length === 0) {
            visitList.innerHTML = '<p class="no-visits">ยังไม่มีข้อมูลการเยี่ยมบ้าน</p>';
            return;
        }
        visits.forEach((visit, index) => {
            const visitCard = document.createElement('div');
            visitCard.className = 'visit-card';
            visitCard.innerHTML = `
                <img src="${visit.image || 'https://via.placeholder.com/150'}" alt="รูปภาพการเยี่ยมบ้าน" class="visit-card-image">
                <div class="visit-card-content">
                    <div class="visit-card-header">
                        <h3>${visit.studentName} (${visit.studentId})</h3>
                        <p>วันที่: ${new Date(visit.visitDate).toLocaleDateString('th-TH')}</p>
                    </div>
                    <div class="visit-card-body">
                        <p><strong>ผู้ปกครอง:</strong> ${visit.parentName} (โทร: ${visit.parentPhone})</p>
                        <p><strong>ครูที่ปรึกษา:</strong> ${visit.teacherName}</p>
                        <p><strong>ที่อยู่:</strong><br>${visit.address || 'ไม่ได้ระบุ'}</p>
                        <p><strong>รายละเอียด:</strong> ${visit.details || '-'}</p>
                        ${visit.gps ? `<p><strong>พิกัด:</strong> ${visit.gps}</p>` : ''}
                    </div>
                    <div class="visit-card-footer">
                        ${visit.gps ? `<button class="map-btn" data-gps="${visit.gps}">ดูบนแผนที่</button>` : ''}
                        <button class="delete-btn" data-index="${index}">ลบ</button>
                    </div>
                </div>
            `;
            visitList.appendChild(visitCard);
        });
        addEventListeners();
    };

    const addEventListeners = () => {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                visits.splice(index, 1);
                localStorage.setItem('visits', JSON.stringify(visits));
                renderVisits();
                renderSavedMarkers();
            });
        });

        document.querySelectorAll('.map-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const gps = e.target.dataset.gps;
                const [lat, lng] = gps.split(',').map(Number);
                map.flyTo([lat, lng], 17);
                window.scrollTo(0, 0);
            });
        });
    };

    const triggerFetchAddress = async () => {
        const gpsValue = gpsCoordsInput.value.trim();
        if (!/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(gpsValue)) {
            addressInput.value = ''; // Clear address if GPS is invalid
            return;
        }

        const [lat, lng] = gpsValue.split(',');
        const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.trim()}&lon=${lng.trim()}&accept-language=th`;

        try {
            fetchAddressBtn.textContent = 'กำลังค้นหา...';
            fetchAddressBtn.disabled = true;
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data && data.display_name) {
                addressInput.value = data.display_name;
            } else {
                addressInput.value = 'ไม่พบที่อยู่สำหรับพิกัดนี้';
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            addressInput.value = 'เกิดข้อผิดพลาดในการค้นหาที่อยู่';
        } finally {
            fetchAddressBtn.textContent = 'ค้นหาที่อยู่';
            fetchAddressBtn.disabled = false;
        }
    };

    const updateMarkerAndAddress = (latlng) => {
        const formattedLat = latlng.lat.toFixed(5);
        const formattedLng = latlng.lng.toFixed(5);
        gpsCoordsInput.value = `${formattedLat}, ${formattedLng}`;

        if (newVisitMarker) {
            newVisitMarker.setLatLng(latlng);
        } else {
            newVisitMarker = L.marker(latlng, { icon: newVisitIcon, draggable: true }).addTo(map);
            newVisitMarker.on('dragend', function(event){
                const marker = event.target;
                updateMarkerAndAddress(marker.getLatLng());
            });
        }
        triggerFetchAddress();
    }

    fetchAddressBtn.addEventListener('click', triggerFetchAddress);
    
    getCurrentLocationBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('บราวเซอร์ของคุณไม่รองรับ Geolocation');
            return;
        }

        getCurrentLocationBtn.querySelector('i').classList.add('fa-spin'); // Loading animation

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latlng = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.flyTo(latlng, 17); // Zoom to current location
                updateMarkerAndAddress(L.latLng(latlng.lat, latlng.lng));
                getCurrentLocationBtn.querySelector('i').classList.remove('fa-spin');
            },
            (error) => {
                let errorMessage = 'เกิดข้อผิดพลาดในการดึงตำแหน่งปัจจุบัน';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "คุณปฏิเสธการเข้าถึงตำแหน่ง";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "ข้อมูลตำแหน่งไม่พร้อมใช้งาน";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "หมดเวลาในการร้องขอตำแหน่ง";
                        break;
                }
                alert(errorMessage);
                getCurrentLocationBtn.querySelector('i').classList.remove('fa-spin');
            }
        );
    });

    map.on('click', (e) => {
        updateMarkerAndAddress(e.latlng);
    });

    imageUpload.addEventListener('change', () => {
        const file = imageUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    visitForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newVisit = {
            studentId: studentIdInput.value,
            studentName: studentNameInput.value,
            parentName: parentNameInput.value,
            parentPhone: parentPhoneInput.value,
            visitDate: visitDateInput.value,
            teacherName: teacherNameInput.value,
            details: detailsInput.value,
            gps: gpsCoordsInput.value.trim(),
            address: addressInput.value,
            image: imagePreview.src.startsWith('data:image') ? imagePreview.src : null,
        };

        visits.unshift(newVisit);
        localStorage.setItem('visits', JSON.stringify(visits));
        
        if (newVisitMarker) {
            map.removeLayer(newVisitMarker);
            newVisitMarker = null;
        }

        renderVisits();
        renderSavedMarkers();
        visitForm.reset();
        addressInput.value = '';
        imagePreview.style.display = 'none';
        imagePreview.src = '';
    });

    // Initial Render
    renderVisits();
    renderSavedMarkers();
    setTimeout(() => map.invalidateSize(), 100);
});
