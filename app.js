let words = JSON.parse(localStorage.getItem('my_vocab_v3')) || [];

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function updateFontSize(size) {
    document.getElementById('q-text').style.fontSize = size + 'px';
}

function saveWord() {
    const ar = document.getElementById('word-ar').value.trim();
    const uz = document.getElementById('word-uz').value.trim();

    if (ar && uz) {
        words.push({ ar, uz, mistakes: 0 });
        localStorage.setItem('my_vocab_v3', JSON.stringify(words));
        document.getElementById('word-ar').value = '';
        document.getElementById('word-uz').value = '';
        alert("Saqlandi!");
        generateTask();
    }
}

function generateTask() {
    if (words.length < 1) return;
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
        b.className = "option-btn border-2 text-emerald-900";
        b.onclick = () => {
            const fb = document.getElementById('feedback');
            if(c === question.uz) {
                fb.innerText = "TO'G'RI! ✨";
                fb.className = "mt-6 text-center font-black text-2xl text-green-600";
                setTimeout(generateTask, 1000);
            } else {
                fb.innerText = "XATO! ❌";
                fb.className = "mt-6 text-center font-black text-2xl text-red-600";
                question.mistakes++;
                localStorage.setItem('my_vocab_v3', JSON.stringify(words));
            }
        };
        optionsDiv.appendChild(b);
    });
}

generateTask();
