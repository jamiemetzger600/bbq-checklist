// BBQ Checklist App - Core Functionality
class BBQCalculator {
    constructor() {
        this.cookingFormulas = {
            225: { base: 1.75, wrap: { none: 1.0, butcher: 0.85, foil: 0.75 } },
            250: { base: 1.25, wrap: { none: 1.0, butcher: 0.85, foil: 0.75 } },
            275: { base: 0.75, wrap: { none: 1.0, butcher: 0.85, foil: 0.75 } },
            300: { base: 0.5, wrap: { none: 1.0, butcher: 0.85, foil: 0.75 } },
            325: { base: 0.42, wrap: { none: 1.0, butcher: 0.85, foil: 0.75 } }
        };
        
        this.currentSchedule = null;
        this.timers = new Map(); // Store active timers
        this.notificationPermission = null;
        this.init();
    }

    init() {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('serve-date').value = today;
        
        // Set default time to 6 PM
        document.getElementById('serve-time').value = '18:00';
        
        // Initialize notification permission
        this.requestNotificationPermission();
        
        // Load saved timers from localStorage
        this.loadTimers();
        
        // Start timer update interval
        this.startTimerUpdates();
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            try {
                this.notificationPermission = await Notification.requestPermission();
                console.log('Notification permission:', this.notificationPermission);
            } catch (error) {
                console.log('Notification permission error:', error);
                this.notificationPermission = 'denied';
            }
        }
    }

    showNotification(title, body, options = {}) {
        if (this.notificationPermission === 'granted') {
            const notification = new Notification(title, {
                body: body,
                icon: 'icon-192.png',
                badge: 'icon-192.png',
                tag: 'bbq-timer',
                requireInteraction: true,
                ...options
            });
            
            // Auto-close after 10 seconds
            setTimeout(() => notification.close(), 10000);
            
            // Play audio alert
            this.playAlert();
            
            return notification;
        }
    }

    playAlert() {
        // Create audio alert since some browsers/devices don't play notification sounds
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // BBQ-themed alert sound (short beeps)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    calculateCookingTime(weight, temperature, wrapMethod) {
        const formula = this.cookingFormulas[temperature];
        if (!formula) return 8; // Default fallback
        
        const baseTime = weight * formula.base;
        const wrapMultiplier = formula.wrap[wrapMethod] || 1.0;
        
        return baseTime * wrapMultiplier;
    }

    calculateTotalTime(weight, temperature, wrapMethod, prepTime, restTime) {
        const cookTime = this.calculateCookingTime(weight, temperature, wrapMethod);
        return {
            prep: parseFloat(prepTime),
            cook: cookTime,
            rest: parseFloat(restTime),
            total: parseFloat(prepTime) + cookTime + parseFloat(restTime)
        };
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    formatDuration(hours) {
        const wholeHours = Math.floor(hours);
        const minutes = Math.round((hours - wholeHours) * 60);
        
        if (wholeHours === 0) {
            return `${minutes}m`;
        } else if (minutes === 0) {
            return `${wholeHours}h`;
        } else {
            return `${wholeHours}h ${minutes}m`;
        }
    }

    generateSchedule(serveDateTime, times) {
        const schedule = [];
        
        // Calculate start times
        const serveTime = new Date(serveDateTime);
        const restStartTime = new Date(serveTime.getTime() - (times.rest * 60 * 60 * 1000));
        const cookStartTime = new Date(restStartTime.getTime() - (times.cook * 60 * 60 * 1000));
        const prepStartTime = new Date(cookStartTime.getTime() - (times.prep * 60 * 60 * 1000));

        // Build timeline with timer integration
        schedule.push({
            icon: '🛒',
            title: 'Start Prep & Setup',
            time: this.formatTime(prepStartTime),
            description: 'Trim brisket, apply rub, set up smoker',
            datetime: prepStartTime,
            timerId: 'prep-start'
        });

        schedule.push({
            icon: '🔥',
            title: 'Start Cooking',
            time: this.formatTime(cookStartTime),
            description: 'Put brisket on smoker, maintain temperature',
            datetime: cookStartTime,
            timerId: 'cook-start'
        });

        // Add wrap timing if applicable
        const wrapMethod = document.getElementById('wrap-method').value;
        if (wrapMethod !== 'none') {
            const wrapTime = new Date(cookStartTime.getTime() + (times.cook * 0.6 * 60 * 60 * 1000));
            schedule.push({
                icon: '📦',
                title: `Wrap in ${wrapMethod === 'foil' ? 'Foil' : 'Butcher Paper'}`,
                time: this.formatTime(wrapTime),
                description: 'Wrap brisket when internal temp reaches 165°F',
                datetime: wrapTime,
                timerId: 'wrap-time'
            });
        }

        schedule.push({
            icon: '🌡️',
            title: 'Check for Doneness',
            time: this.formatTime(new Date(restStartTime.getTime() - (30 * 60 * 1000))),
            description: 'Internal temp 195-210°F, probe tender',
            datetime: new Date(restStartTime.getTime() - (30 * 60 * 1000)),
            timerId: 'check-doneness'
        });

        schedule.push({
            icon: '😴',
            title: 'Start Resting',
            time: this.formatTime(restStartTime),
            description: 'Wrap in towels, place in cooler',
            datetime: restStartTime,
            timerId: 'rest-start'
        });

        schedule.push({
            icon: '🍽️',
            title: 'Ready to Serve',
            time: this.formatTime(serveTime),
            description: 'Slice against the grain and enjoy!',
            datetime: serveTime,
            timerId: 'serve-time'
        });

        return schedule;
    }

    // Timer Management Methods
    createTimer(name, targetDateTime, description = '') {
        const id = Date.now().toString();
        const now = new Date();
        const timeRemaining = targetDateTime.getTime() - now.getTime();
        
        if (timeRemaining <= 0) {
            return null; // Don't create timers for past events
        }
        
        const timer = {
            id: id,
            name: name,
            description: description,
            targetDateTime: targetDateTime,
            timeRemaining: timeRemaining,
            isActive: true,
            created: now
        };
        
        this.timers.set(id, timer);
        this.saveTimers();
        return timer;
    }

    deleteTimer(id) {
        this.timers.delete(id);
        this.saveTimers();
        this.updateTimerUI();
    }

    startTimerUpdates() {
        setInterval(() => {
            this.updateTimers();
        }, 1000);
    }

    updateTimers() {
        const now = new Date();
        let hasUpdates = false;
        
        for (let [id, timer] of this.timers) {
            if (!timer.isActive) continue;
            
            const timeRemaining = timer.targetDateTime.getTime() - now.getTime();
            
            if (timeRemaining <= 0) {
                // Timer finished!
                this.showNotification(
                    `🔥 ${timer.name}`,
                    timer.description || 'Time to check your BBQ!',
                    { tag: `timer-${id}` }
                );
                
                timer.isActive = false;
                hasUpdates = true;
            } else {
                timer.timeRemaining = timeRemaining;
                hasUpdates = true;
            }
        }
        
        if (hasUpdates) {
            this.updateTimerUI();
            this.saveTimers();
        }
    }

    saveTimers() {
        const timersData = Array.from(this.timers.entries()).map(([id, timer]) => [
            id, 
            {
                ...timer,
                targetDateTime: timer.targetDateTime.toISOString(),
                created: timer.created.toISOString()
            }
        ]);
        localStorage.setItem('bbq-timers', JSON.stringify(timersData));
    }

    loadTimers() {
        try {
            const saved = localStorage.getItem('bbq-timers');
            if (saved) {
                const timersData = JSON.parse(saved);
                this.timers = new Map(timersData.map(([id, timer]) => [
                    id,
                    {
                        ...timer,
                        targetDateTime: new Date(timer.targetDateTime),
                        created: new Date(timer.created)
                    }
                ]));
                this.updateTimerUI();
            }
        } catch (error) {
            console.error('Failed to load timers:', error);
            this.timers = new Map();
        }
    }

    updateTimerUI() {
        const container = document.getElementById('active-timers');
        if (!container) return;
        
        const activeTimers = Array.from(this.timers.values()).filter(t => t.isActive);
        
        if (activeTimers.length === 0) {
            container.innerHTML = '<p class="no-timers">No active timers</p>';
            return;
        }
        
        const timersHtml = activeTimers.map(timer => {
            const hours = Math.floor(timer.timeRemaining / (1000 * 60 * 60));
            const minutes = Math.floor((timer.timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timer.timeRemaining % (1000 * 60)) / 1000);
            
            return `
                <div class="timer-item ${timer.timeRemaining < 300000 ? 'timer-urgent' : ''}">
                    <div class="timer-content">
                        <h4 class="timer-name">${timer.name}</h4>
                        <div class="timer-display">${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</div>
                        <p class="timer-description">${timer.description}</p>
                    </div>
                    <button class="timer-delete" onclick="deleteTimer('${timer.id}')" title="Delete timer">🗑️</button>
                </div>
            `;
        }).join('');
        
        container.innerHTML = timersHtml;
    }

    getChecklistItems(phase) {
        const checklists = {
            prep: [
                'Buy brisket (choose well-marbled piece)',
                'Trim fat cap to 1/4 inch thickness',
                'Apply dry rub generously',
                'Let brisket rest at room temp (30-60 min)',
                'Set up and preheat smoker',
                'Prepare wood chips/chunks',
                'Check meat thermometer batteries',
                'Prepare wrapping materials',
                'Fill water pan (if using)',
                'Have beer/drinks ready 🍺'
            ],
            cook: [
                'Place brisket fat-side down on smoker',
                'Insert probe thermometer',
                'Maintain steady temperature',
                'Add wood every hour (first 4 hours)',
                'Monitor internal temperature',
                'Check for stall (160-170°F)',
                'Wrap when internal temp reaches 165°F',
                'Continue cooking until probe tender',
                'Target internal temp: 195-210°F',
                'Prepare resting setup (cooler + towels)'
            ],
            serve: [
                'Remove from cooler carefully',
                'Let rest 15 minutes before slicing',
                'Slice against the grain',
                'Save point for burnt ends (optional)',
                'Warm serving plates',
                'Prepare sides and sauces',
                'Take photos for social media 📸',
                'Serve and enjoy!',
                'Store leftovers properly',
                'Clean up smoker while guests eat'
            ]
        };

        return checklists[phase] || [];
    }
}

// Global calculator instance
const calculator = new BBQCalculator();
let currentTab = 'prep';

// Main calculation function
function calculateTiming() {
    // Get form values
    const serveDate = document.getElementById('serve-date').value;
    const serveTime = document.getElementById('serve-time').value;
    const weight = parseFloat(document.getElementById('brisket-weight').value);
    const temperature = parseInt(document.getElementById('cook-temp').value);
    const cookerType = document.getElementById('cooker-type').value;
    const wrapMethod = document.getElementById('wrap-method').value;
    const prepTime = parseFloat(document.getElementById('prep-time').value);
    const restTime = parseFloat(document.getElementById('rest-time').value);

    // Validate inputs
    if (!serveDate || !serveTime || !weight || !temperature || !cookerType || !wrapMethod) {
        alert('Please fill in all required fields.');
        return;
    }

    // Calculate cooking times
    const serveDateTime = new Date(`${serveDate}T${serveTime}`);
    const times = calculator.calculateTotalTime(weight, temperature, wrapMethod, prepTime, restTime);
    
    // Generate schedule
    const schedule = calculator.generateSchedule(serveDateTime, times);
    calculator.currentSchedule = { times, schedule, weight, temperature, cookerType, wrapMethod };

    // Display results
    displayResults(schedule, times, weight, temperature);
    
    // Show results section
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
}

function displayResults(schedule, times, weight, temperature) {
    // Display timeline with timer buttons
    const timelineHtml = schedule.map(item => `
        <div class="timeline-item">
            <div class="timeline-icon">${item.icon}</div>
            <div class="timeline-content">
                <h3>${item.title}</h3>
                <div class="timeline-time">${item.time}</div>
                <p>${item.description}</p>
                <button class="btn-timer" onclick="setTimerFromSchedule('${item.timerId}', '${item.title}', '${item.datetime}', '${item.description}')">
                    ⏰ Set Timer
                </button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('timeline').innerHTML = timelineHtml;

    // Display key stats
    const statsHtml = `
        <div class="stat-card">
            <span class="stat-number">${calculator.formatDuration(times.total)}</span>
            <span class="stat-label">Total Time</span>
        </div>
        <div class="stat-card">
            <span class="stat-number">${calculator.formatDuration(times.cook)}</span>
            <span class="stat-label">Cook Time</span>
        </div>
        <div class="stat-card">
            <span class="stat-number">${weight} lbs</span>
            <span class="stat-label">Brisket Weight</span>
        </div>
        <div class="stat-card">
            <span class="stat-number">${temperature}°F</span>
            <span class="stat-label">Cook Temp</span>
        </div>
    `;
    
    document.getElementById('key-stats').innerHTML = statsHtml;
    
    // Show timer section
    showTimerSection();
}

function showTimerSection() {
    document.getElementById('timer-section').style.display = 'block';
    calculator.updateTimerUI();
}

function setTimerFromSchedule(timerId, title, datetime, description) {
    const targetDate = new Date(datetime);
    const timer = calculator.createTimer(title, targetDate, description);
    
    if (timer) {
        calculator.updateTimerUI();
        calculator.showNotification('Timer Set!', `${title} timer is now active`);
    } else {
        alert('Cannot set timer for past events');
    }
}

function createCustomTimer() {
    const name = document.getElementById('timer-name').value.trim();
    const hours = parseInt(document.getElementById('timer-hours').value) || 0;
    const minutes = parseInt(document.getElementById('timer-minutes').value) || 0;
    
    if (!name) {
        alert('Please enter a timer name');
        return;
    }
    
    if (hours === 0 && minutes === 0) {
        alert('Please set a time greater than 0');
        return;
    }
    
    const totalMinutes = (hours * 60) + minutes;
    const targetTime = new Date(Date.now() + (totalMinutes * 60 * 1000));
    
    const timer = calculator.createTimer(name, targetTime, `${hours}h ${minutes}m timer`);
    if (timer) {
        calculator.updateTimerUI();
        
        // Clear form
        document.getElementById('timer-name').value = '';
        document.getElementById('timer-hours').value = '';
        document.getElementById('timer-minutes').value = '';
        
        calculator.showNotification('Timer Set!', `${name} timer is now active`);
    }
}

function deleteTimer(id) {
    calculator.deleteTimer(id);
}

function showChecklist() {
    document.getElementById('checklist-section').style.display = 'block';
    switchTab('prep');
    document.getElementById('checklist-section').scrollIntoView({ behavior: 'smooth' });
}

function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event?.target?.classList.add('active') || 
        document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    
    // Display checklist for current tab
    const items = calculator.getChecklistItems(tab);
    const checklistHtml = items.map((item, index) => `
        <div class="checklist-item">
            <input type="checkbox" id="${tab}-${index}" onchange="toggleChecklistItem(this)">
            <label for="${tab}-${index}">${item}</label>
        </div>
    `).join('');
    
    document.getElementById('checklist-content').innerHTML = checklistHtml;
}

function toggleChecklistItem(checkbox) {
    const item = checkbox.closest('.checklist-item');
    if (checkbox.checked) {
        item.classList.add('completed');
    } else {
        item.classList.remove('completed');
    }
}

// Set up default values when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set tomorrow as default date if it's after 8 PM
    const now = new Date();
    if (now.getHours() >= 20) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('serve-date').value = tomorrow.toISOString().split('T')[0];
    }
});

// Add some helper functions for future features
function exportSchedule() {
    if (!calculator.currentSchedule) {
        alert('Please calculate a schedule first.');
        return;
    }
    
    // This would export to calendar or PDF in the future
    console.log('Schedule export:', calculator.currentSchedule);
    alert('Export feature coming soon! 📅');
}

function shareSchedule() {
    if (!calculator.currentSchedule) {
        alert('Please calculate a schedule first.');
        return;
    }
    
    // This would share via social media or messaging in the future
    console.log('Schedule share:', calculator.currentSchedule);
    alert('Share feature coming soon! 📱');
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                calculateTiming();
                break;
        }
    }
}); 