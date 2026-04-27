// 1. MA'LUMOTLAR VA O'ZGARUVCHILAR
let words = JSON.parse(localStorage.getItem('my_vocab_pro_v1')) || [];
let currentMode = 'test';
let selectedMatch = null;
let examData = { correct: 0, wrong: 0, active: false };

// 2. SIDEBAR VA INTERFEYS FUNKSIYALARI
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function updateFontSize(size) {
    const qText = document.getElementById('q-text');
    if (qText) qText.style.fontSize = size + 'px';
    document.getElementById('ar-val').innerText = size;
    localStorage.setItem('pref_font_size', size);
}

function setTheme(theme) {
    document.body.className = theme + '-mode';
    localStorage.setItem('pref_theme', theme);
    
    // Ranglarni dinamik o'zgartirish
    if (theme === 'dark') {
        document.body.style.background = '#0f172a';
        document.body.style.color = '#f8fafc';
    } else if (theme === 'book') {
        document.body.style.background = '#fdf6e3';
        document.body.style.color = '#433422';
    } else {
        document.body.style.background = '#f0f9ff';
        document.body.style.color = '#1e293b';
    }
}

// 3. SO'Z QO'SHISH
function saveWord() {
    const arInput = document.getElementById('word-ar');
    const uzInput = document.getElementById('word-uz');
    const ar = arInput.value.trim();
    const uz = uzInput.value.trim();

    if (ar && uz) {
        words.push({ 
            ar, 
            uz, 
            mistakes: 0, 
            addedDate: new Date().getTime() 
        });
        localStorage.setItem('my_vocab_pro_v1', JSON.stringify(words));
        arInput.value = '';
        uzInput.value = '';
        generateTask();
        alert("Muvaffaqiyatli qo'shildi!");
    } else {
        alert("Iltimos, ikkala maydonni ham to'ldiring!");
    }
}

// 4. MASHQLARNI BOSHQARISH
function setGameMode(mode) {
    currentMode = mode;
    // Tablar vizual holatini yangilash
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.id === 'tab-' + mode) tab.classList.add('active');
    });
    generateTask();
}

function generateTask() {
    const zone = document.getElementById('game-zone');
    const feedback = document.getElementById('feedback');
    feedback.innerText = '';
    zone.innerHTML = '';

    if (words.length < 2) {
        zone.innerHTML = `<p class="text-gray-400 font-bold">Mashq qilish uchun kamida 2 ta so'z kiriting!</p>`;
        return;
    }

    // Savol tanlash (Xatosi ko'p so'zlarga 70% ehtimollik)
    const sortedByMistakes = [...words].sort((a, b) => b.mistakes - a.mistakes);
    const q = Math.random() < 0.7 ? sortedByMistakes[0] : words[Math.floor(Math.random() * words.length)];

    // Rejimga qarab render qilish
    switch(currentMode) {
        case 'test': renderTest(q, zone); break;
        case 'truefalse': renderTrueFalse(q, zone); break;
        case 'write': renderWrite(q, zone); break;
        case 'match': renderMatch(zone); break;
    }
}

// --- REJIMLAR LOGIKASI ---

function renderTest(q, div) {
    div.innerHTML = `<p id="q-text" class="arabic-font text-5xl mb-8">${q.ar}</p><div id="opts" class="grid gap-3"></div>`;
    let choices = shuffle([q.uz, ...getWrongAnswers(q.uz)]);
    choices.forEach(c => {
        const btn = createOptionBtn(c, () => checkResult(c === q.uz, q));
        document.getElementById('opts').appendChild(btn);
    });
}

function renderTrueFalse(q, div) {
    const isCorrect = Math.random() > 0.5;
    const displayUz = isCorrect ? q.uz : words.find(w => w.uz !== q.uz).uz;
    div.innerHTML = `
        <p class="arabic-font text-5xl mb-2">${q.ar}</p>
        <p class="text-xl font-bold text-blue-400 mb-8">== ${displayUz}?</p>
        <div class="flex gap-4">
            <button onclick="checkResult(${isCorrect}, null)" class="btn-blue w-full !bg-emerald-500 shadow-emerald-200">TO'G'RI</button>
            <button onclick="checkResult(${!isCorrect}, null)" class="btn-blue w-full !bg-red-500 shadow-red-200">NOTO'G'RI</button>
        </div>`;
}

function renderWrite(q, div) {
    div.innerHTML = `
        <p class="text-2xl font-bold text-blue-900 mb-6">${q.uz}</p>
        <input id="write-input" type="text" placeholder="Arabchasini yozing..." class="m-input text-center arabic-font text-3xl mb-6 border-2 border-blue-100">
        <button onclick="validateWrite('${q.ar}')" class="btn-blue w-full">TEKSHIRISH</button>
    `;
}

function renderMatch(div) {
    let items = words.slice(-4); 
    let arSide = shuffle(items.map(i => ({txt: i.ar, id: i.ar})));
    let uzSide = shuffle(items.map(i => ({txt: i.uz, id: i.ar})));
    
    let grid = document.createElement('div');
    grid.className = 'match-grid';
    arSide.forEach((item, i) => {
        grid.innerHTML += `<div class="match-box arabic-font text-2xl" onclick="handleMatch(this, '${item.id}')">${item.txt}</div>`;
        grid.innerHTML += `<div class="match-box text-sm" onclick="handleMatch(this, '${uzSide[i].id}')">${uzSide[i].txt}</div>`;
    });
    div.appendChild(grid);
}

// --- YORDAMCHI FUNKSIYALAR ---

function validateWrite(correctAr) {
    const val = document.getElementById('write-input').value.trim();
    checkResult(val === correctAr, null);
}

function handleMatch(el, id) {
    if(!selectedMatch) {
        selectedMatch = { el, id };
        el.classList.add('selected');
    } else {
        if(selectedMatch.id === id && selectedMatch.el !== el) {
            el.style.borderColor = '#10b981'; el.style.background = '#ecfdf5';
            selectedMatch.el.style.borderColor = '#10b981'; selectedMatch.el.style.background = '#ecfdf5';
            checkResult(true, null);
        } else {
            selectedMatch.el.classList.remove('selected');
            checkResult(false, null);
        }
        selectedMatch = null;
    }
}

function checkResult(isCorrect, wordObj) {
    const fb = document.getElementById('feedback');
    if (isCorrect) {
        fb.innerText = "BARAKALLA! ✨";
        fb.className = "mt-6 text-center font-bold text-emerald-500 text-xl";
        setTimeout(generateTask, 1000);
    } else {
        fb.innerText = "XATO! QAYTA URINING ❌";
        fb.className = "mt-6 text-center font-bold text-red-500 text-xl";
        if(wordObj) wordObj.mistakes++;
        localStorage.setItem('my_vocab_pro_v1', JSON.stringify(words));
    }
}

function getWrongAnswers(correctUz) {
    return words
        .filter(w => w.uz !== correctUz)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map(w => w.uz);
}

function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

function createOptionBtn(txt, callback) {
    const btn = document.createElement('button');
    btn.innerText = txt;
    btn.className = "w-full p-4 bg-white border-2 border-blue-50 rounded-2xl font-bold text-blue-900 hover:border-blue-300 transition-all shadow-sm";
    btn.onclick = callback;
    return btn;
}

// --- INITIALIZATION ---
window.onload = () => {
    const savedTheme = localStorage.getItem('pref_theme') || 'light';
    const savedSize = localStorage.getItem('pref_font_size') || '45';
    setTheme(savedTheme);
    updateFontSize(savedSize);
    document.querySelector('input[type="range"]').value = savedSize;
    generateTask();
};
