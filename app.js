let words = JSON.parse(localStorage.getItem('arabic_vocab')) || [];

// Sidebar boshqaruvi
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

// Rejimni o'zgartirish
function setTheme(theme) {
    document.body.className = theme + '-mode min-h-screen';
    localStorage.setItem('app_theme', theme);
}

// Shrift o'lchamini yangilash
function updateFontSize(lang, size) {
    if (lang === 'ar') {
        document.querySelectorAll('.arabic-text').forEach(el => el.style.fontSize = size + 'px');
        document.getElementById('ar-size-val').innerText = size;
    } else {
        document.getElementById('options').style.fontSize = size + 'px';
        document.getElementById('uz-size-val').innerText = size;
    }
    localStorage.setItem(`font_size_${lang}`, size);
}

// So'zni saqlash
function saveWord() {
    const ar = document.getElementById('word-ar').value.trim();
    const uz = document.getElementById('word-uz').value.trim();

    if (ar && uz) {
        words.push({ ar, uz, mistakes: 0, score: 0 });
        localStorage.setItem('arabic_vocab', JSON.stringify(words));
        document.getElementById('word-ar').value = '';
        document.getElementById('word-uz').value = '';
        alert("Muvaffaqiyatli qo'shildi!");
        generateTask();
    }
}

// Test yaratish (Aqlli algoritm)
function generateTask() {
    if (words.length < 1) return;

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
        btn.className = "w-full p-4 border-2 rounded-2xl font-semibold hover:border-blue-500 transition active:scale-95";
        btn.style.fontSize = document.getElementById('uz-size-val').innerText + 'px';
        btn.onclick = () => checkAnswer(choice, question);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected, question) {
    const fb = document.getElementById('feedback');
    if (selected === question.uz) {
        fb.innerText = "To'g'ri! ✅";
        fb.style.color = "#10b981";
        question.score++;
    } else {
        fb.innerText = "Xato! ❌";
        fb.style.color = "#ef4444";
        question.mistakes++;
    }
    localStorage.setItem('arabic_vocab', JSON.stringify(words));
    setTimeout(() => {
        fb.innerText = "";
        generateTask();
    }, 1200);
}

// Dastlabki yuklash
window.onload = () => {
    const savedTheme = localStorage.getItem('app_theme') || 'light';
    setTheme(savedTheme);
    generateTask();
};
