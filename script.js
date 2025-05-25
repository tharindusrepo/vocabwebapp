// Global Variables
let words = [];
let currentWordIndex = 0;

const flashcardFront = document.querySelector('.flashcard-front');
const flashcardBack = document.querySelector('.flashcard-back');
const flashcard = document.querySelector('.flashcard');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const progressContainer = document.getElementById('progress-container');
const searchInput = document.getElementById('search-input');

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
        flashcard.classList.remove('flipped'); // Ensure front is showing
    }
}

searchInput.addEventListener('input', handleSearch);
