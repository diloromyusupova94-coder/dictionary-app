let words = JSON.parse(localStorage.getItem('lugat_v10')) || [];
let currentTopic = 'Umumiy';
let currentMode = 'test';
let selectedMatch = null;

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }
function toggleRightPanel() { renderTopics(); document.getElementById('right-panel').classList.toggle('active'); }

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function addWord() {
    const topic = document.getElementById('topic-input').value.trim() || 'Umumiy';
    const ar = document.getElementById('ar-word').value.trim();
    const uz = document.getElementById('uz-word').value.trim();

    if(ar && uz) {
        words.push({ ar, uz, topic });
        localStorage.setItem('lugat_v10', JSON.stringify(words));
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
    const tabs = document.getElementById('mode-tabs');
    const fb = document.getElementById('feedback');
    fb.innerText = ''; zone.innerHTML = '';

    let pool = words.filter(w => w.topic === currentTopic);

    if(pool.length < 2) {
        tabs.classList.add('hidden');
        zone.innerHTML = `<p class="opacity-50 italic">Topshiriqlar chiqishi uchun kamida 2 ta so'z qo'shing.</p>`;
        return;
    }

    tabs.classList.remove('hidden');
    const q = pool[Math.floor(Math.random() * pool.length)];

    if(currentMode === 'test') {
        zone.innerHTML = `<p class="arabic-font text-5xl mb-8">${q.ar}</p><div id="opts" class="grid gap-2"></div>`;
        [q.uz, ...getWrong(q.uz)].sort(() => 0.5-Math.random()).forEach(o => {
            const b = document.createElement('button');
            b.innerText = o;
            b.className = "p-3 border rounded-xl font-bold hover:bg-blue-50";
            b.onclick = () => check(o === q.uz);
            document.getElementById('opts').appendChild(b);
        });
    }
    else if(currentMode === 'tf') {
        const isT = Math.random() > 0.5;
        const disp = isT ? q.uz : words.find(w => w.uz !== q.uz).uz;
        zone.innerHTML = `<p class="arabic-font text-5xl mb-4">${q.ar}</p><p class="mb-8 font-bold">== ${disp}?</p>
            <div class="flex gap-2"><button onclick="check(${isT})" class="w-full p-4 bg-green-500 text-white rounded-xl">TO'G'RI</button>
            <button onclick="check(${!isT})" class="w-full p-4 bg-red-500 text-white rounded-xl">XATO</button></div>`;
    }
    else if(currentMode === 'write') {
        zone.innerHTML = `<p class="text-xl font-bold mb-6">${q.uz}</p><input id="w-in" class="m-input arabic-font text-3xl text-center mb-4">
            <button onclick="check(document.getElementById('w-in').value.trim()==='${q.ar}')" class="w-full p-3 bg-blue-600 text-white rounded-xl">TEKSHIRISH</button>`;
    }
    else if(currentMode === 'match') {
        let sub = pool.slice(-3); 
        let items = [...sub.map(s=>({t:s.ar, id:s.ar})), ...sub.map(s=>({t:s.uz, id:s.ar}))].sort(()=>0.5-Math.random());
        zone.innerHTML = `<div class="grid grid-cols-2 gap-2" id="m-grid"></div>`;
        items.forEach(x => {
            const d = document.createElement('div');
            d.innerText = x.t; d.className = "p-3 border rounded-xl text-xs font-bold cursor-pointer transition-all";
            d.onclick = () => {
                if(!selectedMatch) { selectedMatch = {el:d, id:x.id}; d.classList.add('bg-blue-100', 'border-blue-500'); }
                else {
                    if(selectedMatch.id === x.id && selectedMatch.el !== d) {
                        d.style.visibility = 'hidden'; selectedMatch.el.style.visibility = 'hidden';
                    } else {
                        selectedMatch.el.classList.remove('bg-blue-100', 'border-blue-500');
                    }
                    selectedMatch = null;
                }
            };
            document.getElementById('m-grid').appendChild(d);
        });
    }
    else if(currentMode === 'anagram') {
        let letters = q.ar.split('').sort(() => 0.5-Math.random());
        zone.innerHTML = `<p class="text-sm opacity-50 mb-4">${q.uz}</p><div id="an-res" class="arabic-font text-4xl mb-6 h-10 border-b"></div>
            <div class="flex flex-wrap justify-center gap-2">${letters.map(l => `<button class="p-2 bg-gray-100 rounded-lg font-bold" onclick="document.getElementById('an-res').innerText += '${l}'; if(document.getElementById('an-res').innerText === '${q.ar}') check(true);">${l}</button>`).join('')}</div>`;
    }
}

function check(res) {
    const f = document.getElementById('feedback');
    f.innerText = res ? "BARAKALLA! ✨" : "XATO! ❌";
    f.className = `mt-6 text-center font-bold text-lg ${res ? 'text-green-500' : 'text-red-500'}`;
    if(res) setTimeout(generateTask, 1000);
}

function getWrong(c) { return words.filter(w => w.uz !== c).sort(() => 0.5-Math.random()).slice(0, 2).map(w => w.uz); }

function renderTopics() {
    const list = document.getElementById('topic-list'); list.innerHTML = '';
    let topics = [...new Set(words.map(w => w.topic))];
    topics.forEach(t => {
        const d = document.createElement('div');
        d.className = "p-3 bg-blue-50 rounded-xl flex justify-between cursor-pointer font-bold text-xs hover:bg-blue-100";
        d.innerHTML = `<span>${t}</span> <span class="bg-blue-500 text-white px-2 py-0.5 rounded-full">${words.filter(w => w.topic===t).length}</span>`;
        d.onclick = () => { currentTopic = t; document.getElementById('active-topic-name').innerText = t; toggleRightPanel(); generateTask(); };
        list.appendChild(d);
    });
}

window.onload = generateTask;
