let words = JSON.parse(localStorage.getItem('arabic_vocab')) || [];
let currentTheme = 'light';

// 1. Rejimni boshqarish
function setTheme(theme) {
    document.body.className = theme + '-mode';
}

// 2. So'z saqlash (Xato balli bilan)
function saveWord() {
    const ar = document.getElementById('word-ar').value.trim();
    const uz = document.getElementById('word-uz').value.trim();

    if (ar && uz) {
        words.push({
            ar, uz, 
            score: 0, // Har bir to'g'ri javob +1
            mistakes: 0, // Har bir xato +1
            lastTested: Date.now()
        });
        localStorage.setItem('arabic_vocab', JSON.stringify(words));
        alert("Saqlandi!");
        document.getElementById('word-ar').value = '';
        document.getElementById('word-uz').value = '';
        updateUI();
        generateNextTask();
    }
}

// 3. Aqlli test generatsiyasi
function generateNextTask() {
    if (words.length < 2) return;

    // Eng ko'p xato qilingan so'zlarni saralab olish (Priority Queue simulyatsiyasi)
    let priorityWords = [...words].sort((a, b) => b.mistakes - a.mistakes);
    
    // 70% holatda qiynalgan so'zini, 30% holatda tasodifiy so'zni so'raymiz
    let question = Math.random() < 0.7 ? priorityWords[0] : words[Math.floor(Math.random() * words.length)];

    document.getElementById('q-text').innerText = question.ar;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';

    let choices = [question.uz];
    while(choices.length < 3) {
        let randomUz = words[Math.floor(Math.random() * words.length)].uz;
        if(!choices.includes(randomUz)) choices.push(randomUz);
    }
    choices.sort(() => Math.random() - 0.5);

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.innerText = choice;
        btn.className = "p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition text-black font-semibold";
        btn.onclick = () => checkAnswer(choice, question);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected, question) {
    const fb = document.getElementById('feedback');
    if (selected === question.uz) {
        fb.innerText = "Barakalla! ✅";
        fb.className = "mt-4 text-center font-bold text-green-500";
        question.score++;
    } else {
        fb.innerText = "Xato! To'g'risi: " + question.uz;
        fb.className = "mt-4 text-center font-bold text-red-500";
        question.mistakes++; // Xato ballini oshiramiz
    }
    localStorage.setItem('arabic_vocab', JSON.stringify(words));
    updateUI();
    setTimeout(generateNextTask, 1500);
}

// 4. Haftalik Imtihon Logikasi
function checkExamDay() {
    const lastExam = localStorage.getItem('last_exam_date');
    const now = new Date();
    const examBtn = document.getElementById('exam-btn');

    // Agar 7 kun o'tgan bo'lsa yoki dushanba bo'lsa (misol uchun)
    if (!lastExam || (now - new Date(lastExam)) > 7 * 24 * 60 * 60 * 1000) {
        examBtn.classList.remove('hidden');
    }
}

function startWeeklyExam() {
    alert("Haftalik imtihon boshlandi! Faqat eng ko'p xato qilgan so'zlaringiz so'raladi.");
    // Imtihon algoritmi: Faqat xatosi ko'p so'zlardan 20 talik test
    localStorage.setItem('last_exam_date', new Date().toISOString());
    document.getElementById('exam-btn').classList.add('hidden');
}

function updateUI() {
    document.getElementById('total-count').innerText = words.length;
    let totalMistakes = words.reduce((acc, w) => acc + w.mistakes, 0);
    document.getElementById('error-rate').innerText = totalMistakes;
    checkExamDay();
}

updateUI();
generateNextTask();
