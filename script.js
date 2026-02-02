document.addEventListener("DOMContentLoaded", function () {

    // ============================================================
    // 1. KHÔI PHỤC TÍNH NĂNG ĐỔI MÀU (COLOR EDITOR)
    // ============================================================
    const root = document.documentElement;

    function updateColor(variable, value) {
        root.style.setProperty(variable, value);
    }

    // Hàm phụ: Đổi màu mũi tên trong ô Select khi đổi màu chính
    function updateSelectArrowColor(hexColor) {
        const cleanHex = hexColor.replace('#', '');
        const svgUrl = `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${cleanHex}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`;

        document.querySelectorAll('select.booking-input-reset').forEach(sel => {
            sel.style.backgroundImage = svgUrl;
        });
    }

    // Lắng nghe sự kiện input từ các ô chọn màu
    const pBgSection = document.getElementById('pickerBgSection');
    if (pBgSection) pBgSection.addEventListener('input', e => updateColor('--bg-section', e.target.value));

    const pPrimary = document.getElementById('pickerPrimary');
    if (pPrimary) pPrimary.addEventListener('input', e => {
        updateColor('--primary', e.target.value);
        updateSelectArrowColor(e.target.value); // Cập nhật cả mũi tên
    });

    const pTextDark = document.getElementById('pickerTextDark');
    if (pTextDark) pTextDark.addEventListener('input', e => updateColor('--text-dark', e.target.value));

    const pBgCard = document.getElementById('pickerBgCard');
    if (pBgCard) pBgCard.addEventListener('input', e => updateColor('--bg-card', e.target.value));

    const pBgInput = document.getElementById('pickerBgInput');
    if (pBgInput) pBgInput.addEventListener('input', e => updateColor('--bg-input', e.target.value));


    // ============================================================
    // 2. CẤU HÌNH & LUỒNG ĐẶT BÀN (BOOKING FLOW)
    // ============================================================

    let IS_SINGLE_BRANCH = false; // Mặc định là CÓ chọn chi nhánh (False)

    function initReservationFlow() {
        const step1Ind = document.getElementById('step1-indicator');
        const step2Ind = document.getElementById('step2-indicator');
        const step3Ind = document.getElementById('step3-indicator');

        const step1Container = document.getElementById('step1-container');
        const step2Container = document.getElementById('step2-container');
        const step3Container = document.getElementById('step3-container');
        const step4Container = document.getElementById('step4-container');

        const backBtnStep2 = document.querySelector('#step2-container .back-link');

        // Reset hiển thị: Ẩn hết các container
        if (step1Container) step1Container.style.display = 'none';
        if (step2Container) step2Container.style.display = 'none';
        if (step3Container) step3Container.style.display = 'none';
        if (step4Container) step4Container.style.display = 'none';

        // Hiện lại tiêu đề chính
        const mainTitle = document.querySelector('.reservation-title');
        if (mainTitle) mainTitle.style.display = 'block';

        // Reset trạng thái các vòng tròn (Indicators)
        [step1Ind, step2Ind, step3Ind].forEach(el => {
            if (el) {
                el.classList.remove('active');
                const circle = el.querySelector('.step-circle');
                // Reset số và icon check
                if (el.id === 'step1-indicator') circle.innerHTML = '1';
                if (el.id === 'step2-indicator') circle.innerHTML = '2';
                if (el.id === 'step3-indicator') circle.innerHTML = '3';
            }
        });

        // --- XỬ LÝ LOGIC HIỂN THỊ THEO CHẾ ĐỘ ---
        if (IS_SINGLE_BRANCH) {
            // Chế độ 1 chi nhánh: Ẩn bước 1, bắt đầu từ bước 2
            if (step1Ind) step1Ind.style.display = 'none';

            // Biến Bước 2 thành Bước 1
            if (step2Ind) {
                step2Ind.querySelector('.step-circle').innerHTML = '1';
                step2Ind.classList.add('active');
            }
            // Biến Bước 3 thành Bước 2
            if (step3Ind) {
                step3Ind.querySelector('.step-circle').innerHTML = '2';
            }

            // Hiển thị ngay Step 2 Container
            if (step2Container) step2Container.style.display = 'block';

            // Ẩn nút "Back to Location"
            if (backBtnStep2) backBtnStep2.style.display = 'none';

        } else {
            // Chế độ nhiều chi nhánh (Mặc định)
            if (step1Ind) {
                step1Ind.style.display = 'flex';
                step1Ind.classList.add('active');
            }
            if (step1Container) step1Container.style.display = 'block';

            if (backBtnStep2) backBtnStep2.style.display = 'inline-block';
        }
    }

    // Khởi chạy lần đầu
    window.initReservationFlow = initReservationFlow;
    initReservationFlow();

    // --- XỬ LÝ NÚT TOGGLE (NÚT TRÒN) ---
    const toggleBtn = document.getElementById('toggleBranchModeBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            IS_SINGLE_BRANCH = !IS_SINGLE_BRANCH;
            this.style.transform = this.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';

            // Reset lại Form và Luồng
            const form = document.getElementById('bookingForm');
            if (form) form.reset();
            const timeContainer = document.getElementById('availableTimes');
            if (timeContainer) timeContainer.innerHTML = '';

            initReservationFlow();
        });
    }

    // --- CÁC THÀNH PHẦN KHÁC (Datepicker, Selects) ---
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#datePicker", {
            dateFormat: "d M Y", defaultDate: "today", minDate: "today", disableMobile: "true", clickOpens: false,
            onReady: function (selectedDates, dateStr, instance) {
                instance.input.addEventListener("click", function () { instance.toggle(); });
            }
        });
    }

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
        peopleSelect.options[1].selected = true;
    }

    // --- NÚT CHECK AVAILABILITY ---
    const btnCheck = document.getElementById('btnCheck');
    const availableTimesContainer = document.getElementById('availableTimes');
    const summaryText = document.getElementById('summaryText');
    const locSelect = document.getElementById('locationPicker');
    const occasionSelect = document.getElementById('occasionPicker');
    const datePicker = document.getElementById('datePicker');

    if (btnCheck) {
        btnCheck.addEventListener('click', function (e) {
            e.preventDefault();
            const selectedVal = timeSelect.value;
            if (!selectedVal) { alert("Please select a time first"); return; }

            const hour = parseInt(selectedVal.split(':')[0]);

            availableTimesContainer.innerHTML = '';

            // Tạo tiêu đề
            const header = document.createElement('div');
            header.className = 'w-100 text-center mb-2';
            header.style.cssText = "font-family:'Bricolage Grotesque'; font-size:15px; color:#666; width: 100%; margin-bottom: 10px;";
            header.innerText = 'Select a specific time:';
            availableTimesContainer.appendChild(header);

            const minutes = [0, 15, 30, 45, 60];
            minutes.forEach(min => {
                let displayHour = hour;
                let displayMin = min;
                if (min === 60) { displayHour = hour + 1; displayMin = 0; }
                const timeStr = `${displayHour}:${displayMin.toString().padStart(2, '0')}`;

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'time-slot-btn';
                btn.innerText = timeStr;

                // Sự kiện khi bấm vào nút giờ con
                btn.addEventListener('click', function () {
                    const selectedDate = datePicker.value;
                    const selectedPeople = peopleSelect.options[peopleSelect.selectedIndex].text;
                    const selectedLoc = IS_SINGLE_BRANCH ? 'Our Restaurant' : (locSelect ? locSelect.options[locSelect.selectedIndex].text : '');
                    const selectedOccasion = occasionSelect.value;

                    // --- TÍNH TIỀN CỌC CỐ ĐỊNH $10 ---
                    const formattedDeposit = "$10";
                    const depositEl = document.getElementById('depositTotal');
                    if (depositEl) depositEl.innerText = formattedDeposit;

                    let summary = `Booking at ${selectedLoc} for ${selectedPeople} on ${selectedDate} at ${timeStr}`;
                    if (selectedOccasion) summary += ` (${selectedOccasion})`;

                    if (summaryText) summaryText.innerText = summary;

                    // Chuyển bước
                    window.goToStep3();
                });
                availableTimesContainer.appendChild(btn);
            });

            availableTimesContainer.style.display = 'flex';
            availableTimesContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    // --- HÀM CHUYỂN BƯỚC (NAVIGATION) ---

    // Sang bước 2
    window.goToStep2 = function () {
        document.getElementById('step1-container').style.display = 'none';
        document.getElementById('step2-container').style.display = 'block';

        const i1 = document.getElementById('step1-indicator');
        const i2 = document.getElementById('step2-indicator');

        if (!IS_SINGLE_BRANCH && i1) {
            i1.classList.remove('active');
            i1.querySelector('.step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';
        }
        if (i2) i2.classList.add('active');
    }

    // Sang bước 3
    window.goToStep3 = function () {
        document.getElementById('step2-container').style.display = 'none';
        document.getElementById('step3-container').style.display = 'block';

        const i2 = document.getElementById('step2-indicator');
        const i3 = document.getElementById('step3-indicator');

        if (i2) {
            i2.classList.remove('active');
            i2.querySelector('.step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';
        }
        if (i3) i3.classList.add('active');

        const card = document.querySelector('.reservation-card');
        if (card) card.scrollIntoView({ behavior: 'smooth' });
    }

    // Sang bước 4
    window.goToStep4 = function () {
        document.getElementById('step3-container').style.display = 'none';
        document.getElementById('step4-container').style.display = 'block';

        const i3 = document.getElementById('step3-indicator');
        if (i3) {
            i3.classList.remove('active');
            i3.querySelector('.step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';
        }
        const mainTitle = document.querySelector('.reservation-title');
        if (mainTitle) mainTitle.style.display = 'none';
    }

    // Quay lại
    window.goBackToStep1 = function () {
        if (IS_SINGLE_BRANCH) return;
        document.getElementById('step2-container').style.display = 'none';
        document.getElementById('step1-container').style.display = 'block';

        const i1 = document.getElementById('step1-indicator');
        const i2 = document.getElementById('step2-indicator');
        if (i1) { i1.classList.add('active'); i1.querySelector('.step-circle').innerHTML = '1'; }
        if (i2) { i2.classList.remove('active'); i2.querySelector('.step-circle').innerHTML = '2'; }
    }

    window.goBackToStep2 = function () {
        document.getElementById('step3-container').style.display = 'none';
        document.getElementById('step2-container').style.display = 'block';

        const i2 = document.getElementById('step2-indicator');
        const i3 = document.getElementById('step3-indicator');

        if (i2) {
            i2.classList.add('active');
            i2.querySelector('.step-circle').innerHTML = IS_SINGLE_BRANCH ? '1' : '2';
        }
        if (i3) {
            i3.classList.remove('active');
            i3.querySelector('.step-circle').innerHTML = IS_SINGLE_BRANCH ? '2' : '3';
        }
    }

    // Hoàn thành & Reset
    const btnComplete = document.getElementById('btnComplete');
    if (btnComplete) {
        btnComplete.addEventListener('click', function () {
            // 1. Lấy thông tin cơ bản
            const fname = document.getElementById('inputFName').value.trim();
            const phone = document.getElementById('inputPhone').value.trim();
            const termsCheckbox = document.getElementById('agreeTerms');

            // 2. Lấy thông tin thanh toán (Kiểm tra xem có ô nào đang được check không)
            const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');

            // 3. Validate (Kiểm tra dữ liệu)
            if (!fname || !phone) {
                alert("Please fill in your Name and Phone Number.");
                return;
            }

            // --- BẮT BUỘC CHỌN PHƯƠNG THỨC THANH TOÁN ---
            if (!selectedPayment) {
                alert("Please select a Payment Method for the deposit.");
                return; // Dừng lại, không cho qua
            }
            // ---------------------------------------------

            if (termsCheckbox && !termsCheckbox.checked) {
                alert("Please agree to the Terms of Use.");
                return;
            }

            // 4. Nếu đủ hết thì chuyển sang bước Success
            const successNameSpan = document.getElementById('successName');
            if (successNameSpan) successNameSpan.innerText = fname;

            window.goToStep4();
        });
    }
});