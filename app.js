let words = JSON.parse(localStorage.getItem('my_vocab_v5')) || [];

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function updateFontSize(size) {
    document.getElementById('q-text').style.fontSize = size + 'px';
    document.getElementById('ar-val').innerText = size;
}

function setTheme(t) {
    document.body.className = t + '-mode';
    if(t === 'dark') {
        document.body.style.background = '#0f172a';
        document.body.style.color = '#f8fafc';
    } else {
        document.body.style.background = t === 'book' ? '#fdf6e3' : '#f8fafc';
        document.body.style.color = '#0f172a';
    }
}

function saveWord() {
    const ar = document.getElementById('word-ar').value.trim();
    const uz = document.getElementById('word-uz').value.trim();
    if (ar && uz) {
        words.push({ ar, uz, mistakes: 0 });
        localStorage.setItem('my_vocab_v5', JSON.stringify(words));
        document.getElementById('word-ar').value = '';
        document.getElementById('word-uz').value = '';
        generateTask();
    }
}

function generateTask() {
    if (words.length < 1) return;
    const question = words[Math.floor(Math.random() * words.length)];
    document.getElementById('q-text').innerText = question.ar;
    
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';

    let choices = [question.uz];
    while(choices.length < 3 && words.length > 2) {
        let r = words[Math.floor(Math.random() * words.length)].uz;
        if(!choices.includes(r)) choices.push(r);
    }
    choices.sort(() => Math.random() - 0.5);

    choices.forEach(c => {
        const b = document.createElement('button');
        b.innerText = c;
        b.className = "w-full p-4 bg-white border-2 border-slate-100 rounded-xl font-bold text-slate-700 active:bg-orange-50 active:border-orange-200";
        b.onclick = () => {
            if(c === question.uz) {
                b.className = "w-full p-4 bg-emerald-500 text-white rounded-xl font-bold";
                setTimeout(generateTask, 800);
            } else {
                b.className = "w-full p-4 bg-red-500 text-white rounded-xl font-bold";
            }
        };
        optionsDiv.appendChild(b);
    });
}

generateTask();
