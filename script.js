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
        this.init();
    }

    init() {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('serve-date').value = today;
        
        // Set default time to 6 PM
        document.getElementById('serve-time').value = '18:00';
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

        // Build timeline
        schedule.push({
            icon: '🛒',
            title: 'Start Prep & Setup',
            time: this.formatTime(prepStartTime),
            description: 'Trim brisket, apply rub, set up smoker',
            datetime: prepStartTime
        });

        schedule.push({
            icon: '🔥',
            title: 'Start Cooking',
            time: this.formatTime(cookStartTime),
            description: 'Put brisket on smoker, maintain temperature',
            datetime: cookStartTime
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
                datetime: wrapTime
            });
        }

        schedule.push({
            icon: '🌡️',
            title: 'Check for Doneness',
            time: this.formatTime(new Date(restStartTime.getTime() - (30 * 60 * 1000))),
            description: 'Internal temp 195-210°F, probe tender',
            datetime: new Date(restStartTime.getTime() - (30 * 60 * 1000))
        });

        schedule.push({
            icon: '😴',
            title: 'Start Resting',
            time: this.formatTime(restStartTime),
            description: 'Wrap in towels, place in cooler',
            datetime: restStartTime
        });

        schedule.push({
            icon: '🍽️',
            title: 'Ready to Serve',
            time: this.formatTime(serveTime),
            description: 'Slice against the grain and enjoy!',
            datetime: serveTime
        });

        return schedule;
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
    // Display timeline
    const timelineHtml = schedule.map(item => `
        <div class="timeline-item">
            <div class="timeline-icon">${item.icon}</div>
            <div class="timeline-content">
                <h3>${item.title}</h3>
                <div class="timeline-time">${item.time}</div>
                <p>${item.description}</p>
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