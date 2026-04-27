let words = JSON.parse(localStorage.getItem('vocab_v8')) || [];
let currentTopic = 'Umumiy';
let currentMode = 'test';
let selectedMatch = null;
let anagramAttempt = "";

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }
function toggleRightPanel() { renderTopics(); document.getElementById('right-panel').classList.toggle('active'); }

// TUN REJIMI TUZATILDI
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark_pref', isDark);
}

// SO'Z QO'SHISH
function addWord() {
    const topic = document.getElementById('topic-input').value.trim() || 'Umumiy';
    const ar = document.getElementById('ar-word').value.trim();
    const uz = document.getElementById('uz-word').value.trim();

    if(ar && uz) {
        words.push({ ar, uz, topic, mistakes: 0 });
        localStorage.setItem('vocab_v8', JSON.stringify(words));
        document.getElementById('ar-word').value = '';
        document.getElementById('uz-word').value = '';
        generateTask();
    }
}

function setMode(m) {
    currentMode = m;
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('m-' + m).classList.add('active');
    generateTask();
}

function generateTask() {
    const zone = document.getElementById('game-zone');
    const fb = document.getElementById('feedback');
    zone.innerHTML = ''; fb.innerText = '';

    let pool = (currentTopic === 'Haftalik Imtihon') ? words : words.filter(w => w.topic === currentTopic);
    if(pool.length < 2) {
        zone.innerHTML = `<p class="text-gray-400 text-center text-sm">Kamida 2 ta so'z kerak.</p>`;
        return;
    }

    const q = pool[Math.floor(Math.random() * pool.length)];

    if(currentMode === 'test') {
        zone.innerHTML = `<p class="arabic-font text-5xl mb-8 text-center">${q.ar}</p><div id="opts" class="grid gap-3"></div>`;
        [q.uz, ...getWrong(q.uz)].sort(() => 0.5-Math.random()).forEach(o => {
            const b = document.createElement('button');
            b.innerText = o;
            b.className = "p-4 border-2 border-blue-500/20 rounded-2xl font-bold text-sm hover:bg-blue-500 hover:text-white";
            b.onclick = () => check(o === q.uz);
            document.getElementById('opts').appendChild(b);
        });
    } 
    else if(currentMode === 'anagram') {
        anagramAttempt = "";
        let letters = q.ar.split('').filter(l => l !== ' ');
        let shuffled = [...letters].sort(() => 0.5-Math.random());
        zone.innerHTML = `
            <p class="text-sm text-gray-400 mb-2 uppercase text-center">${q.uz}</p>
            <div id="anagram-res" class="arabic-font text-4xl mb-8 text-center h-12 border-b-2 border-blue-500/20"></div>
            <div class="flex flex-wrap justify-center gap-2">
                ${shuffled.map(l => `<button class="letter-btn arabic-font text-xl" onclick="typeLetter(this, '${l}', '${q.ar}')">${l}</button>`).join('')}
            </div>
            <button onclick="generateTask()" class="mt-6 text-[10px] text-blue-400 uppercase">Tozalash</button>
        `;
    }
    // ... (boshqa rejimlarni qisqacha qo'shish)
    else if(currentMode === 'write') {
        zone.innerHTML = `<p class="text-xl font-bold mb-6 text-center">${q.uz}</p><input id="w-in" class="m-input arabic-font text-3xl text-center"><button onclick="check(document.getElementById('w-in').value.trim()==='${q.ar}')" class="w-full mt-4 p-3 bg-blue-600 text-white rounded-xl">TEKSHIRISH</button>`;
    }
    else if(currentMode === 'tf') {
        const isT = Math.random() > 0.5;
        const disp = isT ? q.uz : words.find(w => w.uz !== q.uz).uz;
        zone.innerHTML = `<p class="arabic-font text-5xl mb-2 text-center">${q.ar}</p><p class="text-center mb-8">== ${disp}?</p><div class="flex gap-2"><button onclick="check(${isT})" class="w-full p-4 bg-emerald-500 text-white rounded-xl">TO'G'RI</button><button onclick="check(${!isT})" class="w-full p-4 bg-red-500 text-white rounded-xl">NOTO'G'RI</button></div>`;
    }
    else if(currentMode === 'match') {
        let sub = pool.slice(-4);
        let l = sub.map(s => ({t: s.ar, id: s.ar}));
        let r = sub.map(s => ({t: s.uz, id: s.ar}));
        zone.innerHTML = `<div class="grid grid-cols-2 gap-2" id="m-grid"></div>`;
        [...l, ...r].sort(() => 0.5-Math.random()).forEach(x => {
            const d = document.createElement('div');
            d.innerText = x.t; d.className = "p-3 border rounded-xl text-center cursor-pointer text-xs font-bold";
            d.onclick = () => {
                if(!selectedMatch) { selectedMatch = {el:d, id:x.id}; d.classList.add('bg-blue-100'); }
                else { if(selectedMatch.id === x.id && selectedMatch.el !== d) check(true); else check(false); selectedMatch = null; }
            };
            document.getElementById('m-grid').appendChild(d);
        });
    }
}

function typeLetter(btn, char, correct) {
    btn.classList.add('used');
    anagramAttempt += char;
    document.getElementById('anagram-res').innerText = anagramAttempt;
    if(anagramAttempt.length === correct.length) check(anagramAttempt === correct);
}

function check(res) {
    const f = document.getElementById('feedback');
    f.innerText = res ? "BARAKALLA! ✨" : "XATO! ❌";
    f.className = `mt-6 text-center font-bold text-lg ${res ? 'text-emerald-500' : 'text-red-500'}`;
    if(res) setTimeout(generateTask, 1000);
}

function getWrong(c) { return words.filter(w => w.uz !== c).sort(() => 0.5-Math.random()).slice(0, 2).map(w => w.uz); }

function renderTopics() {
    const list = document.getElementById('topic-list'); list.innerHTML = '';
    [...new Set(words.map(w => w.topic))].forEach(t => {
        const d = document.createElement('div');
        d.className = "p-3 bg-blue-500/5 rounded-xl flex justify-between text-xs cursor-pointer";
        d.innerHTML = `<span>${t}</span> <span class="opacity-50">${words.filter(w => w.topic===t).length} ta</span>`;
        d.onclick = () => { currentTopic = t; document.getElementById('active-topic-name').innerText = t; toggleRightPanel(); generateTask(); };
        list.appendChild(d);
    });
}

window.onload = () => {
    if(localStorage.getItem('dark_pref') === 'true') toggleDarkMode();
    renderTopics(); generateTask();
};
