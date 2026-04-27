let words = JSON.parse(localStorage.getItem('vocab_pro_v7')) || [];
let currentTopic = 'Umumiy';
let currentMode = 'test';
let selectedMatch = null;

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }
function toggleRightPanel() { 
    renderTopics();
    document.getElementById('right-panel').classList.toggle('active'); 
}

function changeFontSize(val) {
    const el = document.getElementById('q-text');
    if(el) el.style.fontSize = val + 'px';
}

function addWord() {
    const topic = document.getElementById('topic-input').value.trim() || 'Umumiy';
    const ar = document.getElementById('ar-word').value.trim();
    const uz = document.getElementById('uz-word').value.trim();

    if(ar && uz) {
        words.push({ ar, uz, topic, mistakes: 0 });
        localStorage.setItem('vocab_pro_v7', JSON.stringify(words));
        document.getElementById('ar-word').value = '';
        document.getElementById('uz-word').value = '';
        renderTopics();
        alert("So'z qo'shildi!");
        generateTask();
    }
}

function renderTopics() {
    const list = document.getElementById('topic-list');
    list.innerHTML = '';
    const topics = [...new Set(words.map(w => w.topic))];
    
    topics.forEach(t => {
        const div = document.createElement('div');
        div.className = "p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex justify-between items-center cursor-pointer hover:bg-blue-100";
        div.innerHTML = `<span class="font-bold text-xs">${t}</span> <span class="text-[10px] text-blue-400">${words.filter(w => w.topic === t).length} ta</span>`;
        div.onclick = () => {
            currentTopic = t;
            document.getElementById('active-topic-name').innerText = t;
            toggleRightPanel();
            generateTask();
        };
        list.appendChild(div);
    });
}

function setMode(m) {
    currentMode = m;
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('m-' + m).classList.add('active');
    generateTask();
}

function setTopic(t) {
    currentTopic = t;
    document.getElementById('active-topic-name').innerText = t;
    toggleRightPanel();
    generateTask();
}

function generateTask() {
    const zone = document.getElementById('game-zone');
    zone.innerHTML = '';
    document.getElementById('feedback').innerText = '';

    let pool = (currentTopic === 'Haftalik Imtihon') ? words : words.filter(w => w.topic === currentTopic);
    if(pool.length < 2) {
        zone.innerHTML = `<p class="text-gray-400 text-sm text-center">Bu mavzuda mashq qilish uchun kamida 2 ta so'z bo'lishi kerak.</p>`;
        return;
    }

    const q = pool[Math.floor(Math.random() * pool.length)];

    if(currentMode === 'test') {
        zone.innerHTML = `<p id="q-text" class="arabic-font text-4xl mb-8 text-center font-bold">${q.ar}</p><div id="opts" class="grid gap-3"></div>`;
        let opts = shuffle([q.uz, ...getWrong(q.uz)]);
        opts.forEach(o => {
            const b = document.createElement('button');
            b.innerText = o;
            b.className = "p-4 bg-white border-2 border-blue-50 rounded-2xl font-bold text-sm shadow-sm";
            b.onclick = () => check(o === q.uz);
            document.getElementById('opts').appendChild(b);
        });
    } else if(currentMode === 'tf') {
        const isTrue = Math.random() > 0.5;
        const fake = words.find(w => w.uz !== q.uz).uz;
        zone.innerHTML = `
            <p id="q-text" class="arabic-font text-4xl mb-2 text-center font-bold">${q.ar}</p>
            <p class="text-blue-300 font-bold mb-8 text-center">== ${isTrue ? q.uz : fake}?</p>
            <div class="flex gap-3">
                <button onclick="check(${isTrue})" class="w-full p-4 bg-emerald-500 text-white font-bold rounded-2xl">TO'G'RI</button>
                <button onclick="check(${!isTrue})" class="w-full p-4 bg-red-500 text-white font-bold rounded-2xl">NOTO'G'RI</button>
            </div>`;
    } else if(currentMode === 'write') {
        zone.innerHTML = `
            <p class="text-xl font-bold mb-6 text-center">${q.uz}</p>
            <input id="w-ans" type="text" class="m-input arabic-font text-3xl text-center mb-4">
            <button onclick="check(document.getElementById('w-ans').value.trim() === '${q.ar}')" class="btn-main">TEKSHIRISH</button>
        `;
    } else if(currentMode === 'match') {
        let sub = pool.slice(-4);
        let left = shuffle(sub.map(s => ({txt: s.ar, id: s.ar})));
        let right = shuffle(sub.map(s => ({txt: s.uz, id: s.ar})));
        let grid = document.createElement('div');
        grid.className = 'match-grid';
        left.forEach((l, i) => {
            grid.innerHTML += `<div class="match-item arabic-font text-xl" onclick="match(this, '${l.id}')">${l.txt}</div>`;
            grid.innerHTML += `<div class="match-item text-xs" onclick="match(this, '${right[i].id}')">${right[i].txt}</div>`;
        });
        zone.appendChild(grid);
    }
}

function match(el, id) {
    if(!selectedMatch) {
        selectedMatch = { el, id };
        el.classList.add('selected');
    } else {
        if(selectedMatch.id === id && selectedMatch.el !== el) {
            check(true);
        } else {
            check(false);
        }
        selectedMatch = null;
    }
}

function check(res) {
    const f = document.getElementById('feedback');
    f.innerText = res ? "BARAKALLA! ✨" : "XATO! ❌";
    f.className = res ? "mt-6 text-center font-bold text-emerald-500 text-lg" : "mt-6 text-center font-bold text-red-500 text-lg";
    if(res) setTimeout(generateTask, 1000);
}

function getWrong(correct) {
    return words.filter(w => w.uz !== correct).sort(() => 0.5 - Math.random()).slice(0, 2).map(w => w.uz);
}

function shuffle(arr) { return arr.sort(() => 0.5 - Math.random()); }

window.onload = () => { renderTopics(); generateTask(); };
