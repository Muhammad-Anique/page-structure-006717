/**
 * Countdown Timer Script
 * 
 * Features:
 * - Real-time countdown updates
 * - Responsive time calculation
 * - Completion message display
 * - Celebration effects
 * - Error handling and validation
 * - Performance optimization
 */

// ==========================================================================
// Configuration
// ==========================================================================

// Target date configuration - Change this to set your countdown target
const targetDate = new Date('2024-12-31T23:59:59Z');

// Update interval (in milliseconds)
const UPDATE_INTERVAL = 1000;

// Animation settings
const CELEBRATION_DURATION = 3000;

// ==========================================================================
// DOM Elements
// ==========================================================================

const elements = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    countdown: document.getElementById('countdown'),
    completion: document.getElementById('completion')
};

// ==========================================================================
// State Management
// ==========================================================================

let countdownInterval = null;
let isCountdownComplete = false;
let lastUpdateTime = 0;

// ==========================================================================
// Utility Functions
// ==========================================================================

/**
 * Validates the target date
 * @param {Date} date - Date to validate
 * @returns {boolean} - Whether the date is valid
 */
function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Formats a number with leading zero if needed
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
    return num.toString().padStart(2, '0');
}

/**
 * Calculates time remaining until target date
 * @param {Date} targetDate - Target date
 * @returns {Object} - Object containing days, hours, minutes, seconds
 */
function calculateTimeRemaining(targetDate) {
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const difference = target - now;
    
    if (difference <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isComplete: true
        };
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return {
        days,
        hours,
        minutes,
        seconds,
        isComplete: false
    };
}

/**
 * Updates the countdown display with animation
 * @param {Object} timeData - Time data object
 */
function updateDisplay(timeData) {
    const updates = [
        { element: elements.days, value: timeData.days },
        { element: elements.hours, value: timeData.hours },
        { element: elements.minutes, value: timeData.minutes },
        { element: elements.seconds, value: timeData.seconds }
    ];
    
    updates.forEach(({ element, value }) => {
        const formattedValue = formatNumber(value);
        
        if (element && element.textContent !== formattedValue) {
            // Add update animation
            element.style.transform = 'scale(1.1)';
            element.textContent = formattedValue;
            
            // Reset animation
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 150);
        }
    });
}

/**
 * Shows the completion message with animation
 */
function showCompletionMessage() {
    if (elements.completion) {
        elements.completion.classList.remove('hidden');
        
        // Add celebration effect to body
        document.body.style.animation = 'completionCelebration 2s ease-in-out';
        
        // Play completion sound (if audio is enabled)
        playCompletionSound();
        
        // Trigger confetti effect
        triggerConfetti();
    }
}

/**
 * Plays completion sound (optional)
 */
function playCompletionSound() {
    try {
        // Create audio context for completion sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(520, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(780, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(520, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Audio not supported or blocked');
    }
}

/**
 * Creates confetti animation effect
 */
function triggerConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
    }
}

/**
 * Creates individual confetti piece
 * @param {string} color - Color of the confetti piece
 */
function createConfettiPiece(color) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
        position: fixed;
        top: -10px;
        left: ${Math.random() * 100}%;
        width: 10px;
        height: 10px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1001;
        animation: confettiFall 3s linear forwards;
    `;
    
    document.body.appendChild(confetti);
    
    // Remove confetti after animation
    setTimeout(() => {
        if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
        }
    }, 3000);
}

/**
 * Main countdown update function
 */
function updateCountdown() {
    // Performance optimization: throttle updates
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime < 100) {
        return;
    }
    lastUpdateTime = currentTime;
    
    try {
        const timeRemaining = calculateTimeRemaining(targetDate);
        
        if (timeRemaining.isComplete && !isCountdownComplete) {
            isCountdownComplete = true;
            clearInterval(countdownInterval);
            showCompletionMessage();
            
            // Optional: Send analytics event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'countdown_complete', {
                    event_category: 'engagement',
                    event_label: 'countdown_timer'
                });
            }
        } else if (!timeRemaining.isComplete) {
            updateDisplay(timeRemaining);
        }
    } catch (error) {
        console.error('Error updating countdown:', error);
        
        // Fallback: show error message
        if (elements.days) elements.days.textContent = '--';
        if (elements.hours) elements.hours.textContent = '--';
        if (elements.minutes) elements.minutes.textContent = '--';
        if (elements.seconds) elements.seconds.textContent = '--';
    }
}

/**
 * Initializes the countdown timer
 */
function initializeCountdown() {
    // Validate target date
    if (!isValidDate(targetDate)) {
        console.error('Invalid target date provided');
        return;
    }
    
    // Check if target date is in the past
    if (targetDate.getTime() <= Date.now()) {
        console.warn('Target date is in the past');
        showCompletionMessage();
        return;
    }
    
    // Verify required DOM elements exist
    const requiredElements = ['days', 'hours', 'minutes', 'seconds'];
    const missingElements = requiredElements.filter(id => !elements[id]);
    
    if (missingElements.length > 0) {
        console.error('Missing required DOM elements:', missingElements);
        return;
    }
    
    // Initial update
    updateCountdown();
    
    // Start interval
    countdownInterval = setInterval(updateCountdown, UPDATE_INTERVAL);
    
    console.log(`Countdown initialized. Target: ${targetDate.toLocaleString()}`);
}

/**
 * Celebration button click handler
 */
function celebrate() {
    // Create additional celebration effects
    triggerConfetti();
    
    // Add screen flash effect
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        pointer-events: none;
        z-index: 1002;
        animation: flashEffect 0.5s ease-out;
    `;
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
        }
    }, 500);
}

// ==========================================================================
// Event Listeners
// ==========================================================================

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', initializeCountdown);

// Page visibility change (pause/resume when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    } else {
        if (!isCountdownComplete && !countdownInterval) {
            countdownInterval = setInterval(updateCountdown, UPDATE_INTERVAL);
        }
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
});

// ==========================================================================
// CSS Animations (added dynamically)
// ==========================================================================

const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes completionCelebration {
        0%, 100% { filter: hue-rotate(0deg); }
        25% { filter: hue-rotate(90deg) brightness(1.2); }
        50% { filter: hue-rotate(180deg) brightness(1.4); }
        75% { filter: hue-rotate(270deg) brightness(1.2); }
    }
    
    @keyframes flashEffect {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }
`;

document.head.appendChild(style);

// ==========================================================================
// Global Functions (for external access)
// ==========================================================================

// Make celebrate function globally available
window.celebrate = celebrate;

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeCountdown,
        calculateTimeRemaining,
        celebrate
    };
}