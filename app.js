// Ma'lumotlarni saqlash va yuklash
let words = JSON.parse(localStorage.getItem('lugat_v10')) || [];
let currentTopic = 'Umumiy';
let currentMode = 'test';
let selectedMatch = null;

// Interfeys boshqaruvi
function toggleSidebar() { 
    document.getElementById('sidebar').classList.toggle('active'); 
}

function toggleRightPanel() { 
    renderTopics(); 
    document.getElementById('right-panel').classList.toggle('active'); 
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Yangi so'z qo'shish
function addWord() {
    const topicInput = document.getElementById('topic-input');
    const arInput = document.getElementById('ar-word');
    const uzInput = document.getElementById('uz-word');
    
    const topic = topicInput.value.trim() || 'Umumiy';
    const ar = arInput.value.trim();
    const uz = uzInput.value.trim();

    if(ar && uz) {
        words.push({ ar, uz, topic });
        localStorage.setItem('lugat_v10', JSON.stringify(words));
        
        // Inputlarni tozalash
        arInput.value = '';
        uzInput.value = '';
        
        // Agar birinchi marta so'z qo'shilsa, mavzuni yangilash
        if (currentTopic === 'Umumiy') currentTopic = topic;
        document.getElementById('active-topic-name').innerText = currentTopic;
        
        generateTask();
    } else {
        alert("Iltimos, barcha maydonlarni to'ldiring!");
    }
}

// Rejimni o'zgartirish
function setMode(m) {
    currentMode = m;
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.getElementById('m-' + m);
    if (activeTab) activeTab.classList.add('active');
    generateTask();
}

// Topshiriq yaratish algoritmi
function generateTask() {
    const zone = document.getElementById('game-zone');
    const tabs = document.getElementById('mode-tabs');
    const fb = document.getElementById('feedback');
    fb.innerText = ''; 
    zone.innerHTML = '';

    // Mavzu bo'yicha so'zlarni filtrlash (Imtihon bo'lsa hamma so'zni olish)
    let pool = (currentTopic === 'Haftalik Imtihon') ? words : words.filter(w => w.topic === currentTopic);

    if(pool.length < 2) {
        tabs.classList.add('hidden');
        zone.innerHTML = `<p class="opacity-50 italic px-4">Ushbu mavzuda topshiriqlar chiqishi uchun kamida 2 ta so'z qo'shing.</p>`;
        return;
    }

    tabs.classList.remove('hidden');
    const q = pool[Math.floor(Math.random() * pool.length)];

    // REJIMLAR LOGIKASI
    if(currentMode === 'test') {
        zone.innerHTML = `<p class="arabic-font text-5xl mb-8 animate-fade-in">${q.ar}</p><div id="opts" class="grid gap-2 w-full px-4"></div>`;
        const options = [q.uz, ...getWrongAnswers(q.uz, pool)].sort(() => 0.5 - Math.random());
        options.forEach(o => {
            const b = document.createElement('button');
            b.innerText = o;
            b.className = "p-4 border-2 border-blue-100 rounded-2xl font-bold hover:bg-blue-50 active:scale-95 transition-all text-sm";
            b.onclick = () => checkResult(o === q.uz);
            document.getElementById('opts').appendChild(b);
        });
    }
    else if(currentMode === 'tf') {
        const isTrue = Math.random() > 0.5;
        const displayWord = isTrue ? q.uz : (pool.find(w => w.uz !== q.uz).uz);
        zone.innerHTML = `
            <p class="arabic-font text-5xl mb-4">${q.ar}</p>
            <p class="mb-8 font-bold text-lg text-blue-400">== ${displayWord}?</p>
            <div class="flex gap-4 w-full px-4">
                <button onclick="checkResult(${isTrue})" class="w-full p-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200">TO'G'RI</button>
                <button onclick="checkResult(${!isTrue})" class="w-full p-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200">XATO</button>
            </div>`;
    }
    else if(currentMode === 'write') {
        zone.innerHTML = `
            <p class="text-xl font-bold mb-6">${q.uz}</p>
            <input id="write-input" class="m-input arabic-font text-3xl text-center mb-6" autofocus placeholder="... اكتب">
            <button onclick="handleWriteCheck('${q.ar}')" class="w-full p-4 bg-blue-600 text-white font-bold rounded-2xl">TEKSHIRISH</button>`;
    }
    else if(currentMode === 'match') {
        let subPool = pool.length >= 4 ? pool.slice(-4) : pool;
        let items = [
            ...subPool.map(s => ({ text: s.ar, id: s.ar })),
            ...subPool.map(s => ({ text: s.uz, id: s.ar }))
        ].sort(() => 0.5 - Math.random());

        zone.innerHTML = `<div class="grid grid-cols-2 gap-3 p-4" id="match-grid"></div>`;
        items.forEach(item => {
            const div = document.createElement('div');
            div.innerText = item.text;
            div.className = "p-4 border-2 border-blue-50 rounded-2xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center text-center h-16";
            div.onclick = () => handleMatch(div, item.id);
            document.getElementById('match-grid').appendChild(div);
        });
    }
    else if(currentMode === 'anagram') {
        let letters = q.ar.split('').sort(() => 0.5 - Math.random());
        zone.innerHTML = `
            <p class="text-sm opacity-50 mb-4">${q.uz}</p>
            <div id="an-res" class="arabic-font text-4xl mb-8 h-12 border-b-2 border-blue-100 flex items-center justify-center tracking-widest text-blue-600"></div>
            <div class="flex flex-wrap justify-center gap-2 p-2">
                ${letters.map(l => `<button class="w-10 h-10 bg-white border-2 border-blue-50 rounded-xl font-bold text-xl active:bg-blue-600 active:text-white" onclick="addLetter('${l}', '${q.ar}')">${l}</button>`).join('')}
                <button class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center" onclick="document.getElementById('an-res').innerText = ''">❌</button>
            </div>`;
    }
}

// Yordamchi funksiyalar
function handleWriteCheck(correctAr) {
    const val = document.getElementById('write-input').value.trim();
    checkResult(val === correctAr);
}

function addLetter(letter, correct) {
    const res = document.getElementById('an-res');
    res.innerText += letter;
    if(res.innerText.length >= correct.length) {
        checkResult(res.innerText === correct);
    }
}

function handleMatch(el, id) {
    if(!selectedMatch) {
        selectedMatch = { el, id };
        el.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
    } else {
        if(selectedMatch.id === id && selectedMatch.el !== el) {
            el.classList.add('opacity-0', 'pointer-events-none');
            selectedMatch.el.classList.add('opacity-0', 'pointer-events-none');
            checkResult(true, false); // Faqat ovoz yoki effekt uchun
        } else {
            selectedMatch.el.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
        }
        selectedMatch = null;
        // Agar hamma topilgan bo'lsa, yangilash
        const left = Array.from(document.querySelectorAll('#match-grid div')).filter(d => !d.classList.contains('opacity-0'));
        if(left.length === 0) setTimeout(generateTask, 1000);
    }
}

function checkResult(isCorrect, autoNext = true) {
    const fb = document.getElementById('feedback');
    fb.innerText = isCorrect ? "BARAKALLA! ✨" : "QAYTADAN KO'RING ❌";
    fb.className = `mt-6 text-center font-bold text-lg ${isCorrect ? 'text-emerald-500' : 'text-rose-500'} animate-bounce`;
    
    if(isCorrect && autoNext) {
        setTimeout(generateTask, 1200);
    }
}

function getWrongAnswers(correctUz, pool) {
    return pool
        .filter(w => w.uz !== correctUz)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map(w => w.uz);
}

// Mavzular va Haftalik Imtihon paneli
function renderTopics() {
    const list = document.getElementById('topic-list'); 
    list.innerHTML = '';
    
    let topics = [...new Set(words.map(w => w.topic))];
    
    // Mavzularni chiqarish
    topics.forEach(t => {
        const d = document.createElement('div');
        d.className = "p-4 bg-blue-50/50 rounded-2xl flex justify-between items-center cursor-pointer font-bold text-xs hover:bg-blue-100 mb-2 transition-all";
        d.innerHTML = `
            <span class="flex items-center gap-2">📂 ${t}</span> 
            <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px]">${words.filter(w => w.topic===t).length}</span>`;
        d.onclick = () => { 
            currentTopic = t; 
            document.getElementById('active-topic-name').innerText = t; 
            toggleRightPanel(); 
            generateTask(); 
        };
        list.appendChild(d);
    });

    // Haftalik Imtihon Tugmasi
    if (words.length >= 2) {
        const examBtn = document.createElement('div');
        examBtn.className = "mt-8 p-4 bg-emerald-600 text-white font-bold rounded-2xl text-center cursor-pointer shadow-lg shadow-emerald-200 active:scale-95 transition-all";
        examBtn.innerHTML = "🏆 HAFTALIK IMTIHON";
        examBtn.onclick = () => {
            currentTopic = 'Haftalik Imtihon';
            document.getElementById('active-topic-name').innerText = "IMTIHON";
            toggleRightPanel();
            generateTask();
        };
        list.appendChild(examBtn);
    }
}

// Dasturni ishga tushirish
window.onload = () => {
    if(words.length > 0) generateTask();
};
