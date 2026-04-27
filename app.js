let words = JSON.parse(localStorage.getItem('my_vocab_v3_premium')) || [];

// Sidebar boshqaruvi
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Rejimni o'zgartirish (Smooth transition)
function setTheme(theme) {
    document.body.className = theme + '-mode';
    localStorage.setItem('pref_theme', theme);
}

// Shrift o'lchamini yangilash - QO'ShILDI ✅
function updateFontSize(lang, size) {
    if (lang === 'ar') {
        document.getElementById('q-text').style.fontSize = size + 'px';
        document.getElementById('ar-val').innerText = size + 'px';
    } else {
        document.getElementById('uz-size-val').innerText = size + 'px';
    }
}

// So'zni saqlash
function saveWord() {
    const ar = document.getElementById('word-ar').value.trim();
    const uz = document.getElementById('word-uz').value.trim();

    if (ar && uz) {
        words.push({ ar, uz, mistakes: 0, score: 0 });
        localStorage.setItem('my_vocab_v3_premium', JSON.stringify(words));
        document.getElementById('word-ar').value = '';
        document.getElementById('word-uz').value = '';
        alert("Saqlandi!");
        generateTask();
    }
}

// Test yaratish (Premium UI elementlari bilan)
function generateTask() {
    if (words.length < 1) {
        document.getElementById('score-badge').innerText = `Jami: 0`;
        return;
    }
    document.getElementById('score-badge').innerText = `Jami: ${words.length}`;

    // Xatosi ko'p so'zlarga ustunlik berish
    const sorted = [...words].sort((a, b) => b.mistakes - a.mistakes);
    const question = Math.random() < 0.7 ? sorted[0] : words[Math.floor(Math.random() * words.length)];

    document.getElementById('q-text').innerText = question.ar;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';

    let choices = [question.uz];
    while(choices.length < 3 && words.length > 2) {
        let rand = words[Math.floor(Math.random() * words.length)].uz;
        if(!choices.includes(rand)) choices.push(rand);
    }
    choices.sort(() => Math.random() - 0.5);

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.innerText = choice;
        btn.className = "option-btn w-full py-4 rounded-xl text-lg shadow-sm active:scale-95";
        btn.onclick = () => checkAnswer(choice, question);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected, question) {
    const fb = document.getElementById('feedback');
    if (selected === question.uz) {
        fb.innerText = "BARAKALLA! ✨";
        fb.style.color = "#10b981";
        question.score++;
    } else {
        fb.innerText = "XATO! (To'g'risi: " + question.uz + ")";
        fb.style.color = "#ef4444";
        question.mistakes++;
    }
    localStorage.setItem('my_vocab_v3_premium', JSON.stringify(words));
    setTimeout(() => {
        fb.innerText = "";
        generateTask();
    }, 1500);
}

// Dastlabki yuklash
window.onload = () => {
    const savedTheme = localStorage.getItem('pref_theme') || 'light';
    setTheme(savedTheme);
    generateTask();
};
