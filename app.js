let words = JSON.parse(localStorage.getItem('vocab_v4')) || [];

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function setTheme(theme) {
    document.body.className = theme + '-mode';
    localStorage.setItem('pref_theme', theme);
    toggleSidebar();
}

function saveWord() {
    const ar = document.getElementById('word-ar').value.trim();
    const uz = document.getElementById('word-uz').value.trim();

    if (ar && uz) {
        words.push({ ar, uz, mistakes: 0 });
        localStorage.setItem('vocab_v4', JSON.stringify(words));
        document.getElementById('word-ar').value = '';
        document.getElementById('word-uz').value = '';
        generateTask();
    }
}

function generateTask() {
    if (words.length < 1) {
        document.getElementById('q-text').innerText = "Hali so'z yo'q";
        return;
    }

    const sorted = [...words].sort((a, b) => b.mistakes - a.mistakes);
    const question = Math.random() < 0.7 ? sorted[0] : words[Math.floor(Math.random() * words.length)];

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
        b.className = "w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold hover:border-emerald-500 hover:bg-emerald-50 transition-all text-lg shadow-sm";
        b.onclick = () => {
            const fb = document.getElementById('feedback');
            if(c === question.uz) {
                fb.innerText = "To'g'ri! ✨";
                fb.className = "mt-6 text-center font-bold text-emerald-500";
                setTimeout(generateTask, 800);
            } else {
                fb.innerText = "Xato! ❌";
                fb.className = "mt-6 text-center font-bold text-red-500";
                question.mistakes++;
                localStorage.setItem('vocab_v4', JSON.stringify(words));
            }
        };
        optionsDiv.appendChild(b);
    });
}

window.onload = () => {
    setTheme(localStorage.getItem('pref_theme') || 'light');
    generateTask();
};
