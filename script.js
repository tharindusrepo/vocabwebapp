// Global Variables
let words = [];
let currentWordIndex = 0;

const flashcardFront = document.querySelector('.flashcard-front');
const flashcardBack = document.querySelector('.flashcard-back');
const flashcard = document.querySelector('.flashcard');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const progressContainer = document.getElementById('progress-container');

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
        }
    } catch (error) {
        console.error('Error loading words:', error);
        progressContainer.textContent = 'Error loading words.';
        flashcardFront.textContent = 'Error';
        flashcardBack.textContent = 'Error';
    }
}

// Display Word Function
function displayWord() {
    if (words.length === 0 || currentWordIndex < 0 || currentWordIndex >= words.length) {
        return; // Should not happen if loadWords and navigation are correct
    }
    const wordData = words[currentWordIndex];
    flashcardFront.textContent = wordData.english;
    flashcardBack.textContent = wordData.sinhala;
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
