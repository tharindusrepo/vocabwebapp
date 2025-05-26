// Global Variables
let words = [];
let currentWordIndex = 0;
let quizWords = [];
let currentQuizWordIndex = 0;
let quizScore = 0;
let quizActive = false;
const NUM_QUIZ_QUESTIONS = 10;
const NUM_ANSWER_OPTIONS = 4; // e.g., 1 correct, 3 distractors

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

// References to main sections to hide/show
const flashcardSection = document.getElementById('flashcard-section');
const navigationControls = document.getElementById('navigation-controls');
const progressDisplay = document.getElementById('progress-display'); // Main progress, not quiz
const searchSection = document.getElementById('search-section');


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

    // Hide main view sections
    if (flashcardSection) flashcardSection.style.display = 'none';
    if (navigationControls) navigationControls.style.display = 'none';
    if (progressDisplay) progressDisplay.style.display = 'none';
    if (searchSection) searchSection.style.display = 'none';
    if (startQuizButton) startQuizButton.style.display = 'none'; // Hide start quiz button itself

    // Show quiz section and relevant parts
    quizSection.style.display = 'block';
    quizQuestionWordDisplay.style.display = 'flex'; // Since it has flex properties
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
    quizSection.style.display = 'none';

    // Show main view sections
    // Use 'flex' for flashcard-container like elements, 'block' for others
    if (flashcardSection) flashcardSection.style.display = 'block'; // Assuming main flashcard area is block
    if (navigationControls) navigationControls.style.display = 'block';
    if (progressDisplay) progressDisplay.style.display = 'block';
    if (searchSection) searchSection.style.display = 'block'; 
    if (startQuizButton) startQuizButton.style.display = 'inline-block'; // Show start quiz button again

    // Optionally reset main view to a default state, e.g., first word
    currentWordIndex = 0; // Reset main view index
    if(words.length > 0) { // Check if words are loaded
        displayWord();
        updateProgress();
    }
}

restartQuizButton.addEventListener('click', startQuiz);
exitQuizButton.addEventListener('click', exitQuiz);
startQuizButton.addEventListener('click', startQuiz);
