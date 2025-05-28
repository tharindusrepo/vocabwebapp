// Global Variables
let words = [];
let currentWordIndex = 0;

let quizWords = []; 
let currentQuizWordIndex = 0;
let quizScore = 0; 

let sentenceSubjects = [];
let sentenceVerbs = [];  
let sentenceObjects = [];

// --- DOM REFERENCES FOR NEW TAILWIND UI ---
// View containers
const flashcardView = document.getElementById('flashcard-view');
const quizView = document.getElementById('quiz-view'); 
const sentencePracticeView = document.getElementById('sentence-practice-view'); 
const allViews = [flashcardView, quizView, sentencePracticeView].filter(el => el != null);

// "Back to Flashcards" buttons (updated from "Back to Menu")
const backToFlashcardsQuizButton = document.getElementById('back-to-flashcards-quiz');
const backToFlashcardsSentenceButton = document.getElementById('back-to-flashcards-sentence');

// Flashcard View Elements
const searchInput = document.getElementById('search-input');
const flashcardContent = document.getElementById('flashcard-content'); 
const flashcardTranslation = document.getElementById('flashcard-translation'); 
const flashcardInteractiveArea = document.getElementById('flashcard-interactive-area');
const progressText = document.getElementById('progress-text'); 
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const startQuizButton = document.getElementById('start-quiz-button'); // Now in flashcard view
const startSentenceButton = document.getElementById('start-sentence-button'); // Now in flashcard view

// Quiz View Elements
const quizProgressDisplay = document.getElementById('quiz-progress'); // Example, ensure these IDs exist in your #quiz-view HTML when built
const quizQuestionWordDisplay = document.getElementById('quiz-question-word');
const quizOptionsContainer = document.getElementById('quiz-options-container');
const quizFeedbackDisplay = document.getElementById('quiz-feedback');
const nextQuizQuestionButton = document.getElementById('next-quiz-question');
const quizResultsDisplay = document.getElementById('quiz-results');
const restartQuizButton = document.getElementById('restart-quiz-button');

// Sentence Practice View Elements
const subjectEnSelect = document.getElementById('subject-en');
const verbEnSelect = document.getElementById('verb-en');
const objectEnSelect = document.getElementById('object-en');
const constructedSentenceEn = document.getElementById('constructed-sentence-en');
const subjectSiSelect = document.getElementById('subject-si');
const verbSiSelect = document.getElementById('verb-si');
const objectSiSelect = document.getElementById('object-si');
const constructedSentenceSi = document.getElementById('constructed-sentence-si');
const checkSentenceButton = document.getElementById('check-sentence-button');
const sentenceFeedback = document.getElementById('sentence-feedback');

// --- VIEW SWITCHING ---
function showView(viewIdToShow) {
    allViews.forEach(view => {
        if (view) { 
            view.classList.add('hidden');
            view.classList.remove('flex', 'block'); 
        }
    });

    const viewToShow = document.getElementById(viewIdToShow);
    if (viewToShow) {
        viewToShow.classList.remove('hidden');
        viewToShow.classList.add('flex'); 
        console.log("Showing view:", viewIdToShow);

        if (viewIdToShow === 'flashcard-view') {
            // Ensure start buttons are visible when flashcard view is shown
            if (startQuizButton) startQuizButton.style.display = 'block'; // Or 'inline-block' or Tailwind class for visibility
            if (startSentenceButton) startSentenceButton.style.display = 'block'; // Or 'inline-block'

            if (words.length === 0 && typeof loadWords === "function") { 
                loadWords(); 
            } else if (words.length > 0) {
                displayWord(); 
                updateProgress();
            } else {
                if(flashcardContent) flashcardContent.innerHTML = '<h2>No words loaded.</h2>';
                if(progressText) progressText.textContent = '';
            }
        } else if (viewIdToShow === 'quiz-view') {
            if (typeof startQuiz === "function") startQuiz(); 
        } else if (viewIdToShow === 'sentence-practice-view') {
            if (typeof startSentencePractice === "function") startSentencePractice();
        }
    } else {
        console.error("View not found:", viewIdToShow);
    }
}

// --- CORE FUNCTIONS ---
async function loadWords() {
    try {
        const response = await fetch('words.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        words = await response.json();
        
        if (flashcardView && !flashcardView.classList.contains('hidden')) {
            if (words.length > 0) {
                currentWordIndex = 0; 
                displayWord();
                updateProgress();
            } else {
                if(flashcardContent) flashcardContent.innerHTML = '<h2>No words loaded.</h2>';
                if(progressText) progressText.textContent = 'No words loaded.';
            }
        }
    } catch (error) {
        console.error('Error loading words:', error);
        if(flashcardContent && flashcardView && !flashcardView.classList.contains('hidden')) {
            flashcardContent.innerHTML = '<h2>Error loading words.</h2>';
        }
        if(progressText && flashcardView && !flashcardView.classList.contains('hidden')) {
            progressText.textContent = 'Error loading words.';
        }
    }
}

function displayWord() {
    if (!flashcardContent || !flashcardTranslation) return; 
    if (words.length === 0 || currentWordIndex < 0 || currentWordIndex >= words.length) {
        flashcardContent.innerHTML = '<h2 class="text-2xl font-semibold text-gray-800">No words available</h2>';
        flashcardTranslation.classList.add('hidden'); // Ensure translation is hidden
        return;
    }
    const wordData = words[currentWordIndex];
    flashcardContent.innerHTML = `<h2 class="text-2xl font-semibold text-gray-800">${wordData.english}</h2>`;
    
    flashcardTranslation.innerHTML = `<h2 class="text-2xl font-semibold text-gray-800">${wordData.sinhala}</h2>`;

    if (flashcardInteractiveArea) {
        flashcardInteractiveArea.classList.remove('is-flipped');
    }
    // Ensure both faces are not 'hidden' by JS, CSS will handle visibility.
    if (flashcardContent) flashcardContent.classList.remove('hidden');
    if (flashcardTranslation) flashcardTranslation.classList.remove('hidden');
}

function updateProgress() { 
    if (progressText) {
        if (words.length > 0) {
            progressText.textContent = `Word ${currentWordIndex + 1} of ${words.length}`;
        } else {
            progressText.textContent = 'No words to display.';
        }
    }
}
function handleNext() { 
    if (words.length === 0) return;
    currentWordIndex++;
    if (currentWordIndex >= words.length) currentWordIndex = 0;
    displayWord(); updateProgress();
}
function handlePrevious() { 
    if (words.length === 0) return;
    currentWordIndex--;
    if (currentWordIndex < 0) currentWordIndex = words.length - 1;
    displayWord(); updateProgress();
}
function handleSearch() { 
    if (!searchInput || !flashcardContent || !progressText) return;
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
        if (words.length > 0) { displayWord(); updateProgress(); }
        return;
    }
    if (words.length === 0) { 
        flashcardContent.innerHTML = '<h2>No words to search</h2>';
        if (flashcardTranslation) flashcardTranslation.classList.add('hidden');
        progressText.textContent = 'No words loaded.'; return;
    }
    const results = words.filter(w => w.english.toLowerCase().includes(searchTerm) || w.sinhala.toLowerCase().includes(searchTerm));
    if (results.length > 0) {
        currentWordIndex = words.indexOf(results[0]);
        displayWord(); updateProgress();
    } else {
        flashcardContent.innerHTML = '<h2>Word not found</h2>';
        if (flashcardTranslation) flashcardTranslation.classList.add('hidden');
        progressText.textContent = 'No match found.';
    }
}

// --- QUIZ STUBS ---
function startQuiz() {
    console.log("Quiz started (UI adaptation pending for quiz elements)");
    if(quizView && quizQuestionWordDisplay) quizQuestionWordDisplay.textContent = "Quiz UI will be built here!";
    // Hide start buttons from flashcard view IF they are not already hidden by flashcardView being hidden
    // This is slightly redundant if showView correctly hides flashcardView, but safe.
    if (startQuizButton) startQuizButton.style.display = 'none';
    if (startSentenceButton) startSentenceButton.style.display = 'none';
}

// --- SENTENCE PRACTICE STUBS / SKELETON ---
async function startSentencePractice() {
    console.log("Sentence Practice started");
    if(sentencePracticeView && constructedSentenceEn) constructedSentenceEn.textContent = "Sentence UI loading...";
    if (startQuizButton) startQuizButton.style.display = 'none';
    if (startSentenceButton) startSentenceButton.style.display = 'none';
    await loadSentenceComponents();
}

async function loadSentenceComponents() { 
    try {
        const response = await fetch('sentence_components.json');
        if (!response.ok) throw new Error("FC: " + response.statusText); // FC: Failed to load Components
        const data = await response.json();
        sentenceSubjects = data.subjects || [];
        sentenceVerbs = data.verbs || [];
        sentenceObjects = data.objects || [];
        populateDropdowns();
    } catch(e) { 
        console.error(e); 
        if(sentencePracticeView) sentencePracticeView.innerHTML = `<p class="text-red-500 text-center">Error loading sentence components.</p>`;
    }
}
function populateDropdowns() { 
    const popSelect = (el, items, lang) => { if(el){ el.innerHTML = '<option value="">--Select--</option>'; items.forEach(i => { const o=document.createElement('option'); o.value=i.id; o.textContent=i[lang]; el.appendChild(o); });}};
    popSelect(subjectEnSelect, sentenceSubjects, 'english'); popSelect(verbEnSelect, sentenceVerbs, 'english'); popSelect(objectEnSelect, sentenceObjects, 'english');
    popSelect(subjectSiSelect, sentenceSubjects, 'sinhala'); popSelect(verbSiSelect, sentenceVerbs, 'sinhala'); popSelect(objectSiSelect, sentenceObjects, 'sinhala');
    updateConstructedSentences();
}
function updateConstructedSentences() { 
    const gt = (el) => (!el || el.selectedIndex <= 0 || !el.value) ? "" : el.options[el.selectedIndex].text;
    let enS=gt(subjectEnSelect), enV=gt(verbEnSelect), enO=gt(objectEnSelect);
    let siS=gt(subjectSiSelect), siV=gt(verbSiSelect), siO=gt(objectSiSelect);
    let enSent = (enS || enV || enO) ? `${enS} ${enV} ${enO}`.replace(/\s\s+/g, ' ').trim() : "";
    if (enS && enV && enO) enSent += ".";
    let siSent = (siS || siV || siO) ? `${siS} ${siO} ${siV}`.replace(/\s\s+/g, ' ').trim() : "";
    if (siS && siO && siV) siSent += ".";
    if (constructedSentenceEn) constructedSentenceEn.textContent = enSent;
    if (constructedSentenceSi) constructedSentenceSi.textContent = siSent;
}
function syncDropdowns(src, tgt) { 
    if (src && tgt) {
        tgt.value = src.value; 
    }
    updateConstructedSentences();
}
function handleCheckSentence() { 
    if (!subjectEnSelect || !verbEnSelect || !sentenceFeedback) return;
    const sId=subjectEnSelect.value, vId=verbEnSelect.value;
    if (!sId || !vId) { sentenceFeedback.textContent = "Please select a subject and a verb to check grammar."; sentenceFeedback.className = 'incorrect text-red-500 mt-2 text-center'; return; }
    const base=["s01","s02","s03","s04"], _3ps=["s05","s06","s07","s08","s09"];
    let req = base.includes(sId) ? "_base" : (_3ps.includes(sId) ? "_3ps" : "");
    if (req && vId.endsWith(req)) { sentenceFeedback.textContent = "Correct! The subject and verb agree for Simple Present Tense."; sentenceFeedback.className = 'correct text-green-500 mt-2 text-center'; }
    else { sentenceFeedback.textContent = "තෝරාගත් ක්‍රියා පද අවස්ථාව සරල වර්තමාන කාලයෙහිදී කතෘ සමඟ එකඟ වෙන්නේ නෑ. අනෙක් අවස්ථාව තෝරා නැවත උත්සාහ කරන්න."; sentenceFeedback.className = 'incorrect text-red-500 mt-2 text-center'; }
}

// Placeholder for Quiz functions that need full adaptation
// displayQuizQuestion, handleQuizAnswer, displayQuizResults etc.

// --- END OF STUBS ---

// --- DOMCONTENTLOADED ---
document.addEventListener('DOMContentLoaded', () => {
    loadWords(); 

    // Event listeners for buttons now in Flashcard View to switch to other modes
    if (startQuizButton) startQuizButton.addEventListener('click', () => showView('quiz-view'));
    if (startSentenceButton) startSentenceButton.addEventListener('click', () => showView('sentence-practice-view'));

    // "Back to Flashcards" button listeners (updated IDs)
    if (backToFlashcardsQuizButton) backToFlashcardsQuizButton.addEventListener('click', () => showView('flashcard-view'));
    if (backToFlashcardsSentenceButton) backToFlashcardsSentenceButton.addEventListener('click', () => showView('flashcard-view'));
    
    // Flashcard controls listeners
    if (nextButton) nextButton.addEventListener('click', handleNext);
    if (prevButton) prevButton.addEventListener('click', handlePrevious);
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    
    // Flashcard flip listener (assuming flashcardInteractiveArea is the clickable area)
    if (flashcardInteractiveArea) {
        flashcardInteractiveArea.addEventListener('click', () => {
            flashcardInteractiveArea.classList.toggle('is-flipped');
        });
    }
    
    // Quiz listeners (Placeholder - to be re-integrated with new UI)
    if (nextQuizQuestionButton) { // This and restartQuizButton are likely part of a more complex quiz UI
        nextQuizQuestionButton.addEventListener('click', () => {
            // Placeholder: Quiz logic for next question
        });
    }
    if (restartQuizButton) restartQuizButton.addEventListener('click', startQuiz); 

    // Sentence practice listeners
    if (subjectEnSelect) subjectEnSelect.addEventListener('change', () => syncDropdowns(subjectEnSelect, subjectSiSelect));
    if (verbEnSelect) verbEnSelect.addEventListener('change', () => syncDropdowns(verbEnSelect, verbSiSelect));
    if (objectEnSelect) objectEnSelect.addEventListener('change', () => syncDropdowns(objectEnSelect, objectSiSelect));
    if (subjectSiSelect) subjectSiSelect.addEventListener('change', () => syncDropdowns(subjectSiSelect, subjectEnSelect));
    if (verbSiSelect) verbSiSelect.addEventListener('change', () => syncDropdowns(verbSiSelect, verbEnSelect));
    if (objectSiSelect) objectSiSelect.addEventListener('change', () => syncDropdowns(objectSiSelect, objectEnSelect));
    if (checkSentenceButton) checkSentenceButton.addEventListener('click', handleCheckSentence);

    showView('flashcard-view'); // Show flashcards by default
});
