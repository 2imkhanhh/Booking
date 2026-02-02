document.addEventListener("DOMContentLoaded", function () {

    // --- 1. XỬ LÝ ĐỔI MÀU (COLOR PICKER) ---
    const root = document.documentElement;

    function updateColor(variable, value) {
        root.style.setProperty(variable, value);
    }

    // Update SVG arrow color in Select boxes dynamically
    function updateSelectArrowColor(hexColor) {
        const cleanHex = hexColor.replace('#', '');
        const svgUrl = `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${cleanHex}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`;

        const selects = document.querySelectorAll('select.booking-input-reset');
        selects.forEach(sel => sel.style.backgroundImage = svgUrl);
    }

    // Event Listeners for Color Inputs
    const pickerBgSection = document.getElementById('pickerBgSection');
    if (pickerBgSection) pickerBgSection.addEventListener('input', e => updateColor('--bg-section', e.target.value));

    const pickerBgCard = document.getElementById('pickerBgCard');
    if (pickerBgCard) pickerBgCard.addEventListener('input', e => updateColor('--bg-card', e.target.value));

    const pickerTextDark = document.getElementById('pickerTextDark');
    if (pickerTextDark) pickerTextDark.addEventListener('input', e => updateColor('--text-dark', e.target.value));

    const pickerBgInput = document.getElementById('pickerBgInput');
    if (pickerBgInput) pickerBgInput.addEventListener('input', e => updateColor('--bg-input', e.target.value));

    const pickerPrimary = document.getElementById('pickerPrimary');
    if (pickerPrimary) {
        pickerPrimary.addEventListener('input', e => {
            updateColor('--primary', e.target.value);
            updateSelectArrowColor(e.target.value);
        });
    }


    // --- 2. LOGIC BOOKING FORM ---

    // Init Flatpickr
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#datePicker", {
            dateFormat: "d M Y", defaultDate: "today", minDate: "today", disableMobile: "true"
        });
    }

    // Init Time & People Options
    const timeSelect = document.getElementById('timePicker');
    if (timeSelect) {
        for (let h = 10; h <= 22; h++) {
            timeSelect.add(new Option(`${h}:00`, `${h}:00`));
            if (h < 22) timeSelect.add(new Option(`${h}:30`, `${h}:30`));
        }
    }

    const peopleSelect = document.getElementById('peoplePicker');
    if (peopleSelect) {
        for (let i = 1; i <= 20; i++) {
            peopleSelect.add(new Option(i === 1 ? `${i} Person` : `${i} Persons`, i));
        }
        peopleSelect.selectedIndex = 1;
    }

    // Navigation Functions
    window.goToStep = function (step) {
        document.querySelectorAll('[id$="-container"]').forEach(el => el.style.display = 'none');
        const nextContainer = document.getElementById(`step${step}-container`);
        if (nextContainer) nextContainer.style.display = 'block';

        // Update Indicators
        for (let i = 1; i <= 3; i++) {
            const ind = document.getElementById(`step${i}-indicator`);
            if (ind) {
                const circle = ind.querySelector('.step-circle');
                ind.classList.remove('active');
                circle.innerHTML = i;

                if (i < step) {
                    circle.innerHTML = '<i class="fa-solid fa-check"></i>';
                    ind.classList.add('active'); // Keep previous steps styled
                }
            }
        }
        const currentInd = document.getElementById(`step${step}-indicator`);
        if (currentInd && step <= 3) currentInd.classList.add('active');

        // Hide Title & Header on Success Step
        // const title = document.querySelector('.reservation-title');
        // const header = document.querySelector('.steps-header');

        // if (step === 4) {
        //     if (title) title.style.display = 'none';
        //     if (header) header.style.display = 'none';
        // } else {
        //     if (title) title.style.display = 'block';
        //     if (header) header.style.display = 'flex';
        // }
    };

    // Check Availability
    const btnCheck = document.getElementById('btnCheck');
    const availableTimesContainer = document.getElementById('availableTimes');

    // Các biến cần lấy để update thông tin (đảm bảo code bạn đã khai báo các biến này ở trên)
    const datePicker = document.getElementById('datePicker');
    const locSelect = document.getElementById('locationPicker');
    const occasionSelect = document.getElementById('occasionPicker');
    const summaryText = document.getElementById('summaryText');
    let IS_SINGLE_BRANCH = false; // Biến này nếu chưa có thì khai báo, hoặc lấy từ scope ngoài

    if (btnCheck) {
        btnCheck.addEventListener('click', function (e) {
            e.preventDefault();

            const selectedVal = timeSelect.value;
            if (!selectedVal) {
                alert("Please select a time first");
                return;
            }

            // 1. Lấy giờ người dùng chọn (VD: 10:00 -> lấy số 10)
            const hour = parseInt(selectedVal.split(':')[0]);

            // 2. Xóa nội dung cũ
            availableTimesContainer.innerHTML = '';

            // 3. TẠO TIÊU ĐỀ BẰNG JS (Theo đúng logic code cũ)
            const header = document.createElement('div');
            header.className = 'w-100 text-center mb-2';
            header.style.cssText = "font-family:'Bricolage Grotesque'; font-size:16px; color:#666; width: 100%;";
            header.innerText = 'Select a time slot:';
            availableTimesContainer.appendChild(header);

            // 4. Tạo mảng 5 mốc phút: 00, 15, 30, 45, 60
            const minutes = [0, 15, 30, 45, 60];

            minutes.forEach(min => {
                let displayHour = hour;
                let displayMin = min;

                // Xử lý logic khi phút là 60 -> Tăng 1 giờ, phút về 0
                if (min === 60) {
                    displayHour = hour + 1;
                    displayMin = 0;
                }

                // Format chuỗi giờ (VD: 10:00)
                const timeStr = `${displayHour}:${displayMin.toString().padStart(2, '0')}`;

                // Tạo nút bấm
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'time-slot-btn'; // Class để CSS style
                btn.innerText = timeStr;

                // Sự kiện click vào nút giờ con
                btn.addEventListener('click', function () {
                    const selectedDate = datePicker.value;
                    const selectedPeople = peopleSelect.options[peopleSelect.selectedIndex].text;
                    // Logic lấy tên chi nhánh
                    const selectedLoc = (typeof IS_SINGLE_BRANCH !== 'undefined' && IS_SINGLE_BRANCH)
                        ? 'Main Branch'
                        : (locSelect ? locSelect.options[locSelect.selectedIndex].text : '');
                    const selectedOccasion = occasionSelect.value;

                    // Cập nhật text tóm tắt
                    let summary = `Booking at ${selectedLoc} for ${selectedPeople} on ${selectedDate} at ${timeStr}`;
                    if (selectedOccasion) summary += ` (${selectedOccasion})`;

                    if (summaryText) summaryText.innerText = summary;

                    // Chuyển bước
                    if (typeof window.goToStep === 'function') {
                        window.goToStep(3); // Gọi hàm goToStep với tham số là 3
                    }
                });

                availableTimesContainer.appendChild(btn);
            });

            // 5. Hiển thị container dạng Flex (để khớp với CSS Flexbox)
            availableTimesContainer.style.display = 'flex';

            // Cuộn xuống
            availableTimesContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    // Complete Reservation
    const btnComplete = document.getElementById('btnComplete');
    if (btnComplete) {
        btnComplete.addEventListener('click', function () {
            const name = document.getElementById('inputFName').value;
            const terms = document.getElementById('agreeTerms').checked;

            if (!name) { alert("Please enter First Name"); return; }
            if (!terms) { alert("Please agree to Terms"); return; }

            document.getElementById('successName').innerText = name;
            goToStep(4);
        });
    }
});