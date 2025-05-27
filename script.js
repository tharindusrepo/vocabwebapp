// Global Variables
let words = [];
let currentWordIndex = 0;
let quizWords = [];
let currentQuizWordIndex = 0;
let quizScore = 0;
let quizActive = false;
const NUM_QUIZ_QUESTIONS = 10;
const NUM_ANSWER_OPTIONS = 4; // e.g., 1 correct, 3 distractors

let sentenceSubjects = [];
let sentenceVerbs = [];
let sentenceObjects = [];
let sentencePracticeActive = false;

const flashcardFront = document.querySelector('.flashcard-front');
const flashcardBack = document.querySelector('.flashcard-back');
const flashcard = document.querySelector('.flashcard');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const progressContainer = document.getElementById('progress-container');
const searchInput = document.getElementById('search-input');
const wordImage = document.getElementById('word-image');

// Quiz DOM References
const startQuizButton = document.getElementById('start-quiz-button');
const quizSection = document.getElementById('quiz-section');
const quizProgressDisplay = document.getElementById('quiz-progress');
const quizQuestionWordDisplay = document.getElementById('quiz-question-word');
const quizOptionsContainer = document.getElementById('quiz-options-container');
const quizFeedbackDisplay = document.getElementById('quiz-feedback');
const nextQuizQuestionButton = document.getElementById('next-quiz-question');
const quizResultsDisplay = document.getElementById('quiz-results');
const restartQuizButton = document.getElementById('restart-quiz-button');
const exitQuizButton = document.getElementById('exit-quiz-button');
const homeButton = document.getElementById('home-button');

// Sidebar Navigation DOM References
const navFlashcards = document.getElementById('nav-flashcards');
const navQuiz = document.getElementById('nav-quiz');
const navSentencePractice = document.getElementById('nav-sentence-practice');
const sidebarLinks = [navFlashcards, navQuiz, navSentencePractice].filter(el => el != null);


// Sentence Practice DOM References
const startSentenceButton = document.getElementById('start-sentence-button');
const sentenceStructureSection = document.getElementById('sentence-structure-section');
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
const exitSentenceButton = document.getElementById('exit-sentence-button');


// References to main sections to hide/show
const flashcardSection = document.getElementById('flashcard-section');
const navigationControls = document.getElementById('navigation-controls');
const progressDisplay = document.getElementById('progress-display'); // Main progress, not quiz
const searchSection = document.getElementById('search-section');

// Group flashcard related elements for easier show/hide
const flashcardViewElements = [
    searchSection, flashcardSection, progressDisplay, navigationControls, 
    startQuizButton, startSentenceButton
].filter(el => el != null); // Filter out nulls if some elements don't exist


// Fetch Words
async function loadWords() {
    try {
        const response = await fetch('words.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        words = await response.json();
        if (words.length > 0) {
            displayWord();
            updateProgress();
        } else {
            progressContainer.textContent = 'No words loaded.';
            flashcardFront.textContent = 'N/A';
            flashcardBack.textContent = 'N/A';
            if (wordImage) wordImage.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading words:', error);
        progressContainer.textContent = 'Error loading words.';
        flashcardFront.textContent = 'Error';
        flashcardBack.textContent = 'Error';
        if (wordImage) wordImage.style.display = 'none';
    }
}

// Display Word Function
function displayWord() {
    if (words.length === 0 || currentWordIndex < 0 || currentWordIndex >= words.length) {
        // Clear previous search results if any, or handle empty words array
        if (words.length === 0) {
            flashcardFront.textContent = 'N/A';
            flashcardBack.textContent = 'N/A';
            progressContainer.textContent = 'No words loaded.';
        }
        // If currentWordIndex is invalid but words are present, it might be due to a search resetting it.
        // For now, this case is unlikely given current logic, but good to be mindful.
        return;
    }
    const wordData = words[currentWordIndex];
    flashcardFront.textContent = wordData.english;
    flashcardBack.textContent = wordData.sinhala;

    const imagePath = wordData.image_path;
    if (imagePath && imagePath.trim() !== "") {
        wordImage.src = imagePath;
        wordImage.style.display = 'block';
    } else {
        wordImage.src = '';
        wordImage.style.display = 'none';
    }

    flashcard.classList.remove('flipped');
}

// Flashcard Flip Functionality
flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
});

// Navigation
function handleNext() {
    currentWordIndex++;
    if (currentWordIndex >= words.length) {
        currentWordIndex = 0; // Loop to the beginning
    }
    displayWord();
    updateProgress();
}

function handlePrevious() {
    currentWordIndex--;
    if (currentWordIndex < 0) {
        currentWordIndex = words.length - 1; // Loop to the end
    }
    displayWord();
    updateProgress();
}

nextButton.addEventListener('click', handleNext);
prevButton.addEventListener('click', handlePrevious);

// Update Progress Function
function updateProgress() {
    if (words.length > 0) {
        progressContainer.textContent = `Word ${currentWordIndex + 1} of ${words.length}`;
    } else {
        progressContainer.textContent = 'No words to display.';
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', loadWords);

// Search Functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (!searchTerm) {
        // If search is cleared, display the current word based on currentWordIndex
        displayWord();
        updateProgress();
        return;
    }

    if (words.length === 0) { // Handle search when no words are loaded
        flashcardFront.textContent = 'No words to search';
        flashcardBack.textContent = '---';
        progressContainer.textContent = 'No words loaded.';
        flashcard.classList.remove('flipped');
        return;
    }

    const searchResults = words.filter(word =>
        word.english.toLowerCase().includes(searchTerm) ||
        word.sinhala.toLowerCase().includes(searchTerm)
    );

    if (searchResults.length > 0) {
        // Find the index of the first search result in the original words array
        const firstResult = searchResults[0];
        currentWordIndex = words.findIndex(word =>
            word.english.toLowerCase() === firstResult.english.toLowerCase() &&
            word.sinhala.toLowerCase() === firstResult.sinhala.toLowerCase()
        );
        displayWord(); // Display the found word
        updateProgress(); // Update progress to show the found word's position
    } else {
        flashcardFront.textContent = 'Word not found';
        flashcardBack.textContent = '---';
        progressContainer.textContent = 'No match found';
        if (wordImage) wordImage.style.display = 'none'; // Hide image on no match
        flashcard.classList.remove('flipped'); // Ensure front is showing
    }
}

searchInput.addEventListener('input', handleSearch);

// Quiz Functions

function startQuiz() {
    quizActive = true;
    quizScore = 0;
    currentQuizWordIndex = 0;
    quizWords = []; // Clear previous quiz words

    // showMainSection will handle hiding other sections
    if (startQuizButton) startQuizButton.style.display = 'none'; // Hide start quiz button itself
    
    // Show quiz section and relevant parts
    if (quizSection) quizSection.style.display = 'block';
    if (quizQuestionWordDisplay) quizQuestionWordDisplay.style.display = 'flex'; // Since it has flex properties
    quizOptionsContainer.style.display = 'flex'; // Since it's styled with flex
    quizProgressDisplay.style.display = 'block';
    quizFeedbackDisplay.style.display = 'block'; // Or 'none' initially, then shown with feedback
    quizFeedbackDisplay.textContent = ''; // Clear old feedback
    quizResultsDisplay.style.display = 'none';
    nextQuizQuestionButton.style.display = 'none';
    restartQuizButton.style.display = 'none';
    exitQuizButton.style.display = 'none';


    // Select NUM_QUIZ_QUESTIONS random words
    const allWordsCopy = [...words]; // Create a copy to shuffle
    if (allWordsCopy.length < NUM_QUIZ_QUESTIONS) {
        // Handle case where there aren't enough words for a full quiz
        // For now, just use all available words if fewer than NUM_QUIZ_QUESTIONS
        quizWords = allWordsCopy;
    } else {
        for (let i = 0; i < NUM_QUIZ_QUESTIONS; i++) {
            if (allWordsCopy.length === 0) break; // Should not happen if words.length >= NUM_QUIZ_QUESTIONS
            const randomIndex = Math.floor(Math.random() * allWordsCopy.length);
            quizWords.push(allWordsCopy.splice(randomIndex, 1)[0]);
        }
    }
    
    if (quizWords.length === 0) {
        quizQuestionWordDisplay.textContent = "Not enough words to start a quiz!";
        quizOptionsContainer.innerHTML = '';
        exitQuizButton.style.display = 'block';
        return;
    }

    displayQuizQuestion();
}

function displayQuizQuestion() {
    if (currentQuizWordIndex >= quizWords.length) {
        // Should be handled by calling displayQuizResults, but as a safeguard:
        displayQuizResults(); 
        return;
    }

    const currentWordPair = quizWords[currentQuizWordIndex];
    let question, correctAnswer;

    // Randomly ask English -> Sinhala or Sinhala -> English
    if (Math.random() < 0.5) {
        question = currentWordPair.english;
        correctAnswer = currentWordPair.sinhala;
    } else {
        question = currentWordPair.sinhala;
        correctAnswer = currentWordPair.english;
    }

    quizQuestionWordDisplay.textContent = question;
    quizOptionsContainer.innerHTML = ''; // Clear previous options
    quizFeedbackDisplay.textContent = '';
    quizFeedbackDisplay.className = ''; // Reset feedback class
    nextQuizQuestionButton.style.display = 'none';

    // Prepare answer options
    const options = [correctAnswer];
    const distractors = [];
    const allWordsCopy = [...words]; // Use full word list for distractors

    while (options.length < Math.min(NUM_ANSWER_OPTIONS, words.length)) {
        const randomIndex = Math.floor(Math.random() * allWordsCopy.length);
        const distractorWord = allWordsCopy.splice(randomIndex, 1)[0];
        
        let distractorAnswer;
        // Ensure distractor is in the same language as the correct answer
        if (question === currentWordPair.english) { // Question is English, answer is Sinhala
            distractorAnswer = distractorWord.sinhala;
        } else { // Question is Sinhala, answer is English
            distractorAnswer = distractorWord.english;
        }

        if (distractorAnswer !== correctAnswer && !options.includes(distractorAnswer)) {
            options.push(distractorAnswer);
        }
        if(allWordsCopy.length === 0 && options.length < Math.min(NUM_ANSWER_OPTIONS, words.length)) {
            // Not enough unique words for distractors, break to avoid infinite loop
            break;
        }
    }

    // Shuffle options (Fisher-Yates shuffle)
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    options.forEach(optionText => {
        const optionButton = document.createElement('button');
        optionButton.textContent = optionText;
        optionButton.classList.add('quiz-answer-option'); // From CSS
        optionButton.addEventListener('click', handleQuizAnswer);
        quizOptionsContainer.appendChild(optionButton);
    });

    quizProgressDisplay.textContent = `Question ${currentQuizWordIndex + 1} of ${quizWords.length} | Score: ${quizScore}`;
}

function handleQuizAnswer(event) {
    const selectedButton = event.target;
    const selectedAnswer = selectedButton.textContent;
    const currentWordPair = quizWords[currentQuizWordIndex];
    let correctAnswer;

    // Determine the correct answer based on what was asked
    // This logic needs to reliably know if English or Sinhala was the question.
    // We can infer this by checking if quizQuestionWordDisplay.textContent matches the English or Sinhala part of currentWordPair
    if (quizQuestionWordDisplay.textContent === currentWordPair.english) {
        correctAnswer = currentWordPair.sinhala;
    } else {
        correctAnswer = currentWordPair.english;
    }

    if (selectedAnswer === correctAnswer) {
        quizScore++;
        quizFeedbackDisplay.textContent = "Correct!";
        quizFeedbackDisplay.className = 'correct'; // For CSS styling
    } else {
        quizFeedbackDisplay.textContent = `Incorrect. The correct answer was: ${correctAnswer}`;
        quizFeedbackDisplay.className = 'incorrect'; // For CSS styling
    }

    // Disable all option buttons
    const optionButtons = quizOptionsContainer.querySelectorAll('.quiz-answer-option');
    optionButtons.forEach(button => {
        button.disabled = true;
        // Optionally, add styling to show correct/incorrect answers visually on buttons
        if (button.textContent === correctAnswer) {
            button.style.backgroundColor = '#d4edda'; // Light green for correct
        } else if (button.textContent === selectedAnswer) {
            button.style.backgroundColor = '#f8d7da'; // Light red for selected incorrect
        }
    });

    quizProgressDisplay.textContent = `Question ${currentQuizWordIndex + 1} of ${quizWords.length} | Score: ${quizScore}`; // Update score in progress

    if (currentQuizWordIndex < quizWords.length - 1) {
        nextQuizQuestionButton.style.display = 'inline-block'; // Show next button
    } else {
        // This is the last question
        nextQuizQuestionButton.textContent = 'View Results'; // Change button text
        nextQuizQuestionButton.style.display = 'inline-block';
    }
}

function displayQuizResults() {
    quizQuestionWordDisplay.style.display = 'none';
    quizOptionsContainer.style.display = 'none';
    quizFeedbackDisplay.style.display = 'none';
    nextQuizQuestionButton.style.display = 'none';
    quizProgressDisplay.style.display = 'none'; // Hide progress during results

    quizResultsDisplay.style.display = 'block';
    quizResultsDisplay.textContent = `Quiz Complete! Your final score: ${quizScore} out of ${quizWords.length}.`;

    restartQuizButton.style.display = 'inline-block';
    exitQuizButton.style.display = 'inline-block';
}

// Event Listeners for Quiz
nextQuizQuestionButton.addEventListener('click', () => {
    // Reset button styles for options from previous question
    const optionButtons = quizOptionsContainer.querySelectorAll('.quiz-answer-option');
    optionButtons.forEach(button => {
        button.style.backgroundColor = ''; // Reset background
    });

    currentQuizWordIndex++;
    if (currentQuizWordIndex < quizWords.length) {
        displayQuizQuestion();
        nextQuizQuestionButton.textContent = 'Next Question'; // Ensure it's reset if it was 'View Results'
    } else {
        displayQuizResults();
    }
});

function exitQuiz() {
    quizActive = false;
    // quizSection.style.display = 'none'; // showMainSection will handle this

    showMainSection('flashcards');
}

restartQuizButton.addEventListener('click', startQuiz);
exitQuizButton.addEventListener('click', exitQuiz);
startQuizButton.addEventListener('click', startQuiz);

// Home Button Functionality
function goHome() {
    showMainSection('flashcards');
}

if (homeButton) homeButton.addEventListener('click', goHome);


// Section Navigation Logic
function showMainSection(sectionIdToShow) {
    // First, ensure any active modes are properly exited to reset their states
    if (quizActive && sectionIdToShow !== 'quiz') {
        // No direct call to exitQuiz() here to avoid loops if called from exitQuiz itself.
        // Instead, ensure quiz section is hidden if we are not explicitly showing it.
        if (quizSection) quizSection.style.display = 'none';
        quizActive = false; // Assume exiting quiz if navigating away
    }
    if (sentencePracticeActive && sectionIdToShow !== 'sentencePractice') {
        if (sentenceStructureSection) sentenceStructureSection.style.display = 'none';
        sentencePracticeActive = false; // Assume exiting sentence practice
    }

    // Hide all main content sections first
    flashcardViewElements.forEach(el => el.style.display = 'none');
    if (quizSection) quizSection.style.display = 'none';
    if (sentenceStructureSection) sentenceStructureSection.style.display = 'none';

    // Update active class on sidebar
    sidebarLinks.forEach(link => {
        if (link) link.classList.remove('active');
    });

    // Show the requested section
    if (sectionIdToShow === 'flashcards') {
        flashcardViewElements.forEach(el => {
            if (el.tagName === 'BUTTON') {
                el.style.display = 'inline-block'; // Or its specific default like 'block' if it's full-width
            } else {
                 // Check if the element is part of #navigation-controls and set to flex
                if (el.id === 'navigation-controls') {
                    el.style.display = 'flex'; 
                } else {
                    el.style.display = 'block';
                }
            }
        });
        // Explicitly set display for elements if the loop isn't specific enough
        // e.g., navigationControls might be 'flex'
        if(searchSection) searchSection.style.display = 'block';
        if(flashcardSection) flashcardSection.style.display = 'block'; 
        if(progressDisplay) progressDisplay.style.display = 'block';
        if(navigationControls) navigationControls.style.display = 'flex'; // Ensure flex for nav controls
        if(startQuizButton) startQuizButton.style.display = 'inline-block';
        if(startSentenceButton) startSentenceButton.style.display = 'inline-block';
        
        if (navFlashcards) navFlashcards.classList.add('active');
        // Reset to first word if navigating to flashcards view
        currentWordIndex = 0;
        if (words.length > 0) {
            displayWord();
            updateProgress();
        }
    } else if (sectionIdToShow === 'quiz') {
        if (navQuiz) navQuiz.classList.add('active');
        startQuiz(); // startQuiz will handle showing quizSection
    } else if (sectionIdToShow === 'sentencePractice') {
        if (navSentencePractice) navSentencePractice.classList.add('active');
        startSentencePractice(); // startSentencePractice will handle its section
    }
}


// Sentence Structure Practice Functions

async function loadSentenceComponents() {
    try {
        const response = await fetch('sentence_components.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        sentenceSubjects = data.subjects || [];
        sentenceVerbs = data.verbs || [];
        sentenceObjects = data.objects || [];
        
        // Initial population after loading
        populateDropdowns(); 
        
    } catch (error) {
        console.error('Error loading sentence components:', error);
        sentenceStructureSection.innerHTML = '<p style="color:red; text-align:center;">Error loading sentence practice components. Please try again later.</p>';
    }
}

function populateDropdowns() {
    // Helper to populate a single dropdown
    const populateSelect = (selectElement, items, lang) => {
        if (!selectElement) return; // Guard against null elements if HTML is missing
        selectElement.innerHTML = '<option value="">--Select--</option>'; // Default empty option
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item[lang]; // 'english' or 'sinhala'
            selectElement.appendChild(option);
        });
    };

    populateSelect(subjectEnSelect, sentenceSubjects, 'english');
    populateSelect(verbEnSelect, sentenceVerbs, 'english');
    populateSelect(objectEnSelect, sentenceObjects, 'english');

    populateSelect(subjectSiSelect, sentenceSubjects, 'sinhala');
    populateSelect(verbSiSelect, sentenceVerbs, 'sinhala');
    populateSelect(objectSiSelect, sentenceObjects, 'sinhala');
    
    // After populating, clear any initially constructed sentences
    if(constructedSentenceEn) constructedSentenceEn.textContent = '';
    if(constructedSentenceSi) constructedSentenceSi.textContent = '';
    
    updateConstructedSentences(); // Initialize sentence display
}

function updateConstructedSentences() {
    const getSelectedText = (selectElement) => {
        if (!selectElement || selectElement.selectedIndex === 0 || selectElement.value === "") return ""; // Guard against null and "--Select--"
        return selectElement.options[selectElement.selectedIndex].text;
    };

    // English sentence
    const enSub = getSelectedText(subjectEnSelect);
    const enVerb = getSelectedText(verbEnSelect);
    const enObj = getSelectedText(objectEnSelect);
    let enSentence = `${enSub} ${enVerb} ${enObj}.`.replace(/\s\s+/g, ' ').trim();
    if (enSentence === '.') enSentence = ''; // Clear if only period
    constructedSentenceEn.textContent = enSentence;

    // Sinhala sentence
    const siSub = getSelectedText(subjectSiSelect);
    const siVerb = getSelectedText(verbSiSelect);
    const siObj = getSelectedText(objectSiSelect);
    // Standard Sinhala sentence order: Subject + Object + Verb
    let siSentence = `${siSub} ${siObj} ${siVerb}.`.replace(/\s\s+/g, ' ').trim();
    if (siSentence === '.') siSentence = ''; // Clear if only period
    constructedSentenceSi.textContent = siSentence;
}


function startSentencePractice() {
    sentencePracticeActive = true;

    // showMainSection will handle hiding other sections
    if (startSentenceButton) startSentenceButton.style.display = 'none';

    // Show sentence structure section
    if (sentenceStructureSection) sentenceStructureSection.style.display = 'block';
    if(sentenceFeedback) sentenceFeedback.textContent = ''; // Clear previous feedback

    // Load components (which will then populate dropdowns)
    // Check if data is already loaded to avoid multiple fetches if desired,
    // but for now, always reload for simplicity on start.
    loadSentenceComponents(); 
}

function exitSentencePractice() {
    sentencePracticeActive = false;
    // if(sentenceStructureSection) sentenceStructureSection.style.display = 'none'; // showMainSection handles this
    
    showMainSection('flashcards');
}

// Event Listeners for Sentence Practice
if (startSentenceButton) startSentenceButton.addEventListener('click', startSentencePractice);
if (exitSentenceButton) exitSentenceButton.addEventListener('click', exitSentencePractice);

// Sidebar Navigation Event Listeners
if (navFlashcards) navFlashcards.addEventListener('click', (e) => { e.preventDefault(); showMainSection('flashcards'); });
if (navQuiz) navQuiz.addEventListener('click', (e) => { e.preventDefault(); showMainSection('quiz'); });
if (navSentencePractice) navSentencePractice.addEventListener('click', (e) => { e.preventDefault(); showMainSection('sentencePractice'); });

// Helper function to find an item by ID in one of the component arrays
function findComponentById(id, componentType) {
    let arrayToSearch;
    if (componentType === 'subject') arrayToSearch = sentenceSubjects;
    else if (componentType === 'verb') arrayToSearch = sentenceVerbs;
    else if (componentType === 'object') arrayToSearch = sentenceObjects;
    else return null;
    return arrayToSearch.find(item => item.id === id);
}

// Synchronization logic function
function syncDropdowns(sourceSelect, targetSelect, componentType) {
    const selectedId = sourceSelect.value;
    if (selectedId) {
        targetSelect.value = selectedId;
    } else {
        targetSelect.value = ""; // Reset target if source is "--Select--"
    }
    updateConstructedSentences(); // Update sentences after any sync
}

function handleCheckSentence() {
    const selectedSubjectId = subjectEnSelect.value;
    const selectedVerbId = verbEnSelect.value;
    // Object ID is not needed for this grammar check
    // const selectedObjectId = objectEnSelect.value; 

    if (!selectedSubjectId || !selectedVerbId) {
        sentenceFeedback.textContent = "Please select a subject and a verb to check grammar.";
        sentenceFeedback.className = 'incorrect'; // Or a neutral class
        return;
    }

    // Define which subjects require base verb forms vs. 3rd person singular (-s) forms
    const subjectsRequiringBaseForm = ["s01", "s02", "s03", "s04"]; // I, we, you, they
    const subjectsRequiring3psForm = ["s05", "s06", "s07", "s08", "s09"]; // He, She, it, The Cat, Amila

    let requiredVerbFormType = "";
    if (subjectsRequiringBaseForm.includes(selectedSubjectId)) {
        requiredVerbFormType = "_base";
    } else if (subjectsRequiring3psForm.includes(selectedSubjectId)) {
        requiredVerbFormType = "_3ps";
    } else {
        // Should not happen if all subjects are categorized
        sentenceFeedback.textContent = "Error: Subject category not recognized.";
        sentenceFeedback.className = 'incorrect';
        return;
    }

    // Check if the selected verb ID contains the required form type
    if (selectedVerbId.endsWith(requiredVerbFormType)) {
        sentenceFeedback.textContent = "Correct! The subject and verb agree for Simple Present Tense.";
        sentenceFeedback.className = 'correct';
    } else {
        sentenceFeedback.textContent = "තෝරාගත් ක්‍රියා පද අවස්ථාව සරල වර්තමාන කාලයෙහිදී කතෘ සමඟ එකඟ වෙන්නේ නෑ. අනෙක් අවස්ථාව තෝරා නැවත උත්සාහ කරන්න.";
        sentenceFeedback.className = 'incorrect';
    }
}

// Attach event listeners for dropdown synchronization
// English dropdowns
if (subjectEnSelect) subjectEnSelect.addEventListener('change', () => syncDropdowns(subjectEnSelect, subjectSiSelect, 'subject'));
if (verbEnSelect) verbEnSelect.addEventListener('change', () => syncDropdowns(verbEnSelect, verbSiSelect, 'verb'));
if (objectEnSelect) objectEnSelect.addEventListener('change', () => syncDropdowns(objectEnSelect, objectSiSelect, 'object'));

// Sinhala dropdowns
if (subjectSiSelect) subjectSiSelect.addEventListener('change', () => syncDropdowns(subjectSiSelect, subjectEnSelect, 'subject'));
if (verbSiSelect) verbSiSelect.addEventListener('change', () => syncDropdowns(verbSiSelect, verbEnSelect, 'verb'));
if (objectSiSelect) objectSiSelect.addEventListener('change', () => syncDropdowns(objectSiSelect, objectEnSelect, 'object'));

if (checkSentenceButton) checkSentenceButton.addEventListener('click', handleCheckSentence);

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadWords(); // Existing call
    // Any other init calls
    showMainSection('flashcards'); // Set initial view
});
