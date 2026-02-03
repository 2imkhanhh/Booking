document.addEventListener("DOMContentLoaded", function () {

    // ============================================================
    // 1. TÍNH NĂNG ĐỔI MÀU (COLOR PICKER)
    // ============================================================
    const root = document.documentElement;

    function updateColor(variable, value) {
        root.style.setProperty(variable, value);
    }

    function updateSelectArrowColor(hexColor) {
        const cleanHex = hexColor.replace('#', '');
        const svgUrl = `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${cleanHex}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`;
        document.querySelectorAll('select.booking-input-reset').forEach(sel => {
            sel.style.backgroundImage = svgUrl;
        });
    }

    const pBgSection = document.getElementById('pickerBgSection');
    if(pBgSection) pBgSection.addEventListener('input', e => updateColor('--bg-section', e.target.value));

    const pPrimary = document.getElementById('pickerPrimary');
    if(pPrimary) pPrimary.addEventListener('input', e => {
        updateColor('--primary', e.target.value);
        updateSelectArrowColor(e.target.value);
    });

    const pTextDark = document.getElementById('pickerTextDark');
    if(pTextDark) pTextDark.addEventListener('input', e => updateColor('--text-dark', e.target.value));

    const pBgCard = document.getElementById('pickerBgCard');
    if(pBgCard) pBgCard.addEventListener('input', e => updateColor('--bg-card', e.target.value));

    const pBgInput = document.getElementById('pickerBgInput');
    if(pBgInput) pBgInput.addEventListener('input', e => updateColor('--bg-input', e.target.value));


    // ============================================================
    // 2. CẤU HÌNH & LUỒNG ĐẶT BÀN
    // ============================================================
    
    let IS_SINGLE_BRANCH = false; 

    function initReservationFlow() {
        const step1Ind = document.getElementById('step1-indicator');
        const step2Ind = document.getElementById('step2-indicator');
        const step3Ind = document.getElementById('step3-indicator');
        
        const step1Container = document.getElementById('step1-container');
        const step2Container = document.getElementById('step2-container');
        const step3Container = document.getElementById('step3-container');
        const step4Container = document.getElementById('step4-container');
        
        const backBtnStep2 = document.querySelector('#step2-container .back-link');

        // Reset hiển thị
        if(step1Container) step1Container.style.display = 'none';
        if(step2Container) step2Container.style.display = 'none';
        if(step3Container) step3Container.style.display = 'none';
        if(step4Container) step4Container.style.display = 'none';

        // Luôn hiện tiêu đề khi khởi tạo lại
        const mainTitle = document.querySelector('.reservation-title');
        if(mainTitle) mainTitle.style.display = 'block';

        // Reset indicators
        [step1Ind, step2Ind, step3Ind].forEach(el => {
            if(el) {
                el.classList.remove('active');
                const circle = el.querySelector('.step-circle');
                if(el.id === 'step1-indicator') circle.innerHTML = '1';
                if(el.id === 'step2-indicator') circle.innerHTML = '2';
                if(el.id === 'step3-indicator') circle.innerHTML = '3';
            }
        });

        // Xử lý chế độ
        if (IS_SINGLE_BRANCH) {
            // Chế độ 1 chi nhánh
            if(step1Ind) step1Ind.style.display = 'none'; 

            if(step2Ind) {
                step2Ind.querySelector('.step-circle').innerHTML = '1';
                step2Ind.classList.add('active'); 
            }
            if(step3Ind) {
                step3Ind.querySelector('.step-circle').innerHTML = '2';
            }

            if(step2Container) step2Container.style.display = 'block';
            if(backBtnStep2) backBtnStep2.style.display = 'none';

        } else {
            // Chế độ nhiều chi nhánh
            if(step1Ind) {
                step1Ind.style.display = 'flex'; 
                step1Ind.classList.add('active');
            }
            if(step1Container) step1Container.style.display = 'block';
            if(backBtnStep2) backBtnStep2.style.display = 'inline-block';
        }
    }

    // Init lần đầu
    window.initReservationFlow = initReservationFlow;
    initReservationFlow();

    // Nút chuyển chế độ (Tròn)
    const toggleBtn = document.getElementById('toggleBranchModeBtn');
    if(toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            IS_SINGLE_BRANCH = !IS_SINGLE_BRANCH;
            this.style.transform = this.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
            
            const form = document.getElementById('bookingForm');
            if(form) form.reset();
            const timeContainer = document.getElementById('availableTimes');
            if(timeContainer) timeContainer.innerHTML = ''; 
            
            initReservationFlow();
        });
    }

    // Flatpickr & Selects
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

    // Nút Check Availability
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
                
                btn.addEventListener('click', function () {
                    const selectedDate = datePicker.value;
                    const selectedPeople = peopleSelect.options[peopleSelect.selectedIndex].text;
                    const selectedLoc = IS_SINGLE_BRANCH ? 'Our Restaurant' : (locSelect ? locSelect.options[locSelect.selectedIndex].text : '');
                    const selectedOccasion = occasionSelect.value;

                    // Tiền cọc $10
                    const depositEl = document.getElementById('depositTotal');
                    if(depositEl) depositEl.innerText = "$10"; 
                    
                    let summary = `Booking at ${selectedLoc} for ${selectedPeople} on ${selectedDate} at ${timeStr}`;
                    if(selectedOccasion) summary += ` (${selectedOccasion})`;

                    if (summaryText) summaryText.innerText = summary;
                    
                    window.goToStep3();
                });
                availableTimesContainer.appendChild(btn);
            });

            availableTimesContainer.style.display = 'flex';
            availableTimesContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    // --- CÁC HÀM ĐIỀU HƯỚNG ---
    
    // Tiến tới bước 2
    window.goToStep2 = function () {
        document.getElementById('step1-container').style.display = 'none';
        document.getElementById('step2-container').style.display = 'block';
        
        const i1 = document.getElementById('step1-indicator');
        const i2 = document.getElementById('step2-indicator');
        
        if(!IS_SINGLE_BRANCH && i1) { 
            i1.classList.remove('active'); 
            i1.querySelector('.step-circle').innerHTML = '<i class="fa-solid fa-check"></i>'; 
        }
        if(i2) i2.classList.add('active');
    }

    // Tiến tới bước 3
    window.goToStep3 = function () {
        document.getElementById('step2-container').style.display = 'none';
        document.getElementById('step3-container').style.display = 'block';

        const i2 = document.getElementById('step2-indicator');
        const i3 = document.getElementById('step3-indicator');
        
        if(i2) { 
            i2.classList.remove('active'); 
            i2.querySelector('.step-circle').innerHTML = '<i class="fa-solid fa-check"></i>'; 
        }
        if(i3) i3.classList.add('active');
        
        const card = document.querySelector('.reservation-card');
        if(card) card.scrollIntoView({ behavior: 'smooth' });
    }

    // Tiến tới bước 4
    window.goToStep4 = function () {
        document.getElementById('step3-container').style.display = 'none';
        document.getElementById('step4-container').style.display = 'block';

        const i3 = document.getElementById('step3-indicator');
        if(i3) { 
            i3.classList.remove('active'); 
            i3.querySelector('.step-circle').innerHTML = '<i class="fa-solid fa-check"></i>'; 
        }
        
        const mainTitle = document.querySelector('.reservation-title');
        if(mainTitle) mainTitle.style.display = 'none';
    }

    // Lùi về bước 1
    window.goBackToStep1 = function () {
        if(IS_SINGLE_BRANCH) return; 
        document.getElementById('step2-container').style.display = 'none';
        document.getElementById('step1-container').style.display = 'block';
        
        const i1 = document.getElementById('step1-indicator');
        const i2 = document.getElementById('step2-indicator');
        if(i1) { i1.classList.add('active'); i1.querySelector('.step-circle').innerHTML = '1'; }
        if(i2) { i2.classList.remove('active'); i2.querySelector('.step-circle').innerHTML = '2'; }
    }

    // Lùi về bước 2
    window.goBackToStep2 = function () {
        document.getElementById('step3-container').style.display = 'none';
        document.getElementById('step2-container').style.display = 'block';

        const i2 = document.getElementById('step2-indicator');
        const i3 = document.getElementById('step3-indicator');
        
        if(i2) { 
            i2.classList.add('active'); 
            i2.querySelector('.step-circle').innerHTML = IS_SINGLE_BRANCH ? '1' : '2'; 
        }
        if(i3) { 
            i3.classList.remove('active'); 
            i3.querySelector('.step-circle').innerHTML = IS_SINGLE_BRANCH ? '2' : '3'; 
        }
    }

    // Nút Hoàn tất
    const btnComplete = document.getElementById('btnComplete');
    if (btnComplete) {
        btnComplete.addEventListener('click', function () {
            const fname = document.getElementById('inputFName').value.trim();
            const phone = document.getElementById('inputPhone').value.trim();
            const termsCheckbox = document.getElementById('agreeTerms'); 
            const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');

            if (!fname || !phone) { alert("Please fill in Name and Phone."); return; }
            if (!selectedPayment) { alert("Please select a Payment Method for the deposit."); return; }
            if (termsCheckbox && !termsCheckbox.checked) { alert("Please agree to Terms."); return; }

            const successNameSpan = document.getElementById('successName');
            if(successNameSpan) successNameSpan.innerText = fname;

            window.goToStep4();
        });
    }
});

// ============================================================
// FIX LỖI NAVIGATION (QUAN TRỌNG)
// Hàm này điều hướng đúng cho cả nút Next và Back
// ============================================================
window.goToStep = function(step) {
    if (step === 1) {
        // Nút Back ở Step 2 gọi goToStep(1)
        window.goBackToStep1();
    } else if (step === 2) {
        // Nếu đang ở Step 3 mà nhấn Back (về 2)
        const step3 = document.getElementById('step3-container');
        if (step3 && step3.style.display === 'block') {
            window.goBackToStep2();
        } else {
            // Nếu đang ở Step 1 mà nhấn Next (lên 2)
            window.goToStep2();
        }
    } else if (step === 3) {
        window.goToStep3();
    } else if (step === 4) {
        window.goToStep4();
    }
};