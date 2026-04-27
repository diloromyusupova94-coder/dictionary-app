let words = JSON.parse(localStorage.getItem('arabic_vocab')) || [];

// Sidebar boshqaruvi
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('hidden');
}

// Rejimni o'zgartirish (Smooth transition)
function setTheme(theme) {
    document.body.className = theme + '-mode min-h-screen';
    localStorage.setItem('app_theme', theme);
    toggleSidebar(); // Mavzu tanlangach sidebar yopiladi
}

// Shrift o'lchamini yangilash
function updateFontSize(lang, size) {
    if (lang === 'ar') {
        document.getElementById('q-text').style.fontSize = size + 'px';
        document.getElementById('ar-size-val').innerText = size + 'px';
    } else {
        document.getElementById('uz-size-val').innerText = size + 'px';
    }
    localStorage.setItem(`font_size_${lang}`, size);
}

// So'zni saqlash (SweetAlert o'rniga oddiy premium xabar)
function saveWord() {
    const ar = document.getElementById('word-ar').value.trim();
    const uz = document.getElementById('word-uz').value.trim();

    if (ar && uz) {
        words.push({ ar, uz, mistakes: 0, score: 0 });
        localStorage.setItem('arabic_vocab', JSON.stringify(words));
        document.getElementById('word-ar').value = '';
        document.getElementById('word-uz').value = '';
        generateTask();
        
        // Premium ko'rinishdagi tasdiqlash
        const fb = document.getElementById('feedback');
        fb.innerText = "Muvaffaqiyatli saqlandi! ✨";
        fb.style.color = "#c9a063";
        setTimeout(() => fb.innerText = "", 1500);
    }
}

// Test yaratish (Premium UI elementlari bilan)
function generateTask() {
    if (words.length < 2) return;

    // Xatosi ko'p so'zlarga ustunlik berish
    const sorted = [...words].sort((a, b) => b.mistakes - a.mistakes);
    const question = Math.random() < 0.7 ? sorted[0] : words[Math.floor(Math.random() * words.length)];

    document.getElementById('q-text').innerText = question.ar;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';

    let choices = [question.uz];
    while(choices.length < 3) {
        let rand = words[Math.floor(Math.random() * words.length)].uz;
        if(!choices.includes(rand)) choices.push(rand);
    }
    choices.sort(() => Math.random() - 0.5);

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.innerText = choice;
        // Premium Option Button Dizayni
        btn.className = "p-5 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-semibold shadow-inner hover:border-primary/50 hover:bg-orange-50/50 transition active:scale-95 text-xl text-black dark:text-white poppins-font";
        btn.style.fontSize = document.getElementById('uz-size-val').innerText;
        btn.onclick = () => checkAnswer(choice, question);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected, question) {
    const fb = document.getElementById('feedback');
    if (selected === question.uz) {
        fb.innerText = "Barakalla! ✅";
        fb.style.color = "#10b981";
        question.score++;
    } else {
        fb.innerText = "To'g'risi: " + question.uz;
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
