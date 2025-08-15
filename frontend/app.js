/**
 * Medical Waiting Room Display System
 * Handles patient calling, media playback, and German text-to-speech
 */

class WaitingRoomDisplay {
    constructor() {
        this.isShowingPatient = false;
        this.lastTriggerTimestamp = 0;
        this.pollingInterval = null;
        this.slideshowInterval = null;
        this.currentSlideIndex = 0;
        this.slides = ['slide1.jpg', 'slide2.jpg', 'slide3.jpg'];
        this.currentMediaType = 'video'; // 'video' or 'slideshow'
        this.displayTimeout = 5000; // 5 seconds display time
        
        this.initializeElements();
        this.setupEventListeners();
        this.startPolling();
        this.initializeMedia();
    }
    
    initializeElements() {
        this.mediaContainer = document.getElementById('media-container');
        this.videoPlayer = document.getElementById('video-player');
        this.slideshowContainer = document.getElementById('slideshow-container');
        this.slideshowImage = document.getElementById('slideshow-image');
        this.patientDisplay = document.getElementById('patient-display');
        this.patientName = document.getElementById('patient-name');
        this.debugPanel = document.getElementById('debug-panel');
        
        // Debug elements
        this.pollingStatus = document.getElementById('polling-status');
        this.lastCheck = document.getElementById('last-check');
        this.triggerStatus = document.getElementById('trigger-status');
    }
    
    setupEventListeners() {
        // Debug buttons
        document.getElementById('test-trigger-btn').addEventListener('click', () => {
            this.testTrigger();
        });
        
        document.getElementById('toggle-media-btn').addEventListener('click', () => {
            this.toggleMediaType();
        });
        
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.enterFullscreen();
        });
        
        // Handle fullscreen change
        document.addEventListener('fullscreenchange', () => {
            this.handleFullscreenChange();
        });
        
        // Handle visibility change (for pausing when tab is not active)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && !this.isShowingPatient) {
                this.pauseMedia();
            } else if (!document.hidden && !this.isShowingPatient) {
                this.resumeMedia();
            }
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'F11':
                case 'f':
                    this.enterFullscreen();
                    break;
                case 'Escape':
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    }
                    break;
                case 't':
                    this.testTrigger();
                    break;
                case 'm':
                    this.toggleMediaType();
                    break;
                case 'd':
                    this.toggleDebug();
                    break;
            }
        });
    }
    
    initializeMedia() {
        // Setup video player
        this.videoPlayer.addEventListener('loadeddata', () => {
            console.log('Video loaded successfully');
        });
        
        this.videoPlayer.addEventListener('error', (e) => {
            console.warn('Video loading failed, switching to slideshow mode');
            this.switchToSlideshow();
        });
        
        // Initialize slideshow - start immediately since video is not available
        this.switchToSlideshow();
        this.startSlideshow();
    }
    
    startPolling() {
        this.pollingInterval = setInterval(() => {
            this.checkTrigger();
        }, 1000); // Check every second
        
        console.log('Started polling for trigger.json changes');
        this.updateDebugStatus('Polling: Active');
    }
    
    async checkTrigger() {
        try {
            const response = await fetch('/api/trigger');
            const data = await response.json();
            
            this.updateDebugStatus(`Last Check: ${new Date().toLocaleTimeString()}`);
            
            if (data.has_data && data.trigger.name && data.timestamp > this.lastTriggerTimestamp) {
                this.lastTriggerTimestamp = data.timestamp;
                this.showPatient(data.trigger.name);
                this.updateDebugStatus(`Trigger: ${data.trigger.name}`);
                
                // Clear trigger after processing
                await fetch('/api/clear-trigger', { method: 'POST' });
            } else if (!data.has_data) {
                this.updateDebugStatus('Trigger: None');
            }
        } catch (error) {
            console.error('Error checking trigger:', error);
            this.updateDebugStatus('Polling: Error');
        }
    }
    
    showPatient(patientName) {
        if (this.isShowingPatient) return;
        
        console.log(`Calling patient: ${patientName}`);
        this.isShowingPatient = true;
        
        // Pause media
        this.pauseMedia();
        
        // Update patient name display
        this.patientName.textContent = patientName;
        
        // Show patient display with animation
        this.patientDisplay.classList.remove('hidden', 'fade-out');
        this.patientDisplay.classList.add('show');
        
        // Speak the name in German
        this.speakGerman(patientName);
        
        // Hide after display timeout
        setTimeout(() => {
            this.hidePatient();
        }, this.displayTimeout);
    }
    
    hidePatient() {
        if (!this.isShowingPatient) return;
        
        console.log('Hiding patient display');
        
        // Add fade out animation
        this.patientDisplay.classList.add('fade-out');
        
        // After fade animation completes, hide completely and resume media
        setTimeout(() => {
            this.patientDisplay.classList.remove('show', 'fade-out');
            this.patientDisplay.classList.add('hidden');
            this.isShowingPatient = false;
            
            // Resume media
            this.resumeMedia();
        }, 600); // Match CSS transition duration
    }
    
    speakGerman(text) {
        if ('speechSynthesis' in window) {
            // Cancel any existing speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set German language and voice settings
            utterance.lang = 'de-DE';
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Try to find a German voice
            const voices = speechSynthesis.getVoices();
            const germanVoice = voices.find(voice => 
                voice.lang.startsWith('de') || 
                voice.name.toLowerCase().includes('german') ||
                voice.name.toLowerCase().includes('deutsch')
            );
            
            if (germanVoice) {
                utterance.voice = germanVoice;
                console.log(`Using German voice: ${germanVoice.name}`);
            } else {
                console.log('No German voice found, using default');
            }
            
            utterance.onstart = () => {
                console.log(`Speaking: ${text}`);
            };
            
            utterance.onerror = (event) => {
                console.error('Speech error:', event.error);
            };
            
            speechSynthesis.speak(utterance);
        } else {
            console.warn('Speech synthesis not supported');
        }
    }
    
    pauseMedia() {
        if (this.currentMediaType === 'video') {
            this.videoPlayer.pause();
        }
        // Slideshow continues running but will be hidden
    }
    
    resumeMedia() {
        if (this.currentMediaType === 'video') {
            this.videoPlayer.play().catch(e => {
                console.warn('Could not resume video:', e);
            });
        }
    }
    
    toggleMediaType() {
        if (this.currentMediaType === 'video') {
            this.switchToSlideshow();
        } else {
            this.switchToVideo();
        }
    }
    
    switchToVideo() {
        this.currentMediaType = 'video';
        this.videoPlayer.style.display = 'block';
        this.slideshowContainer.style.display = 'none';
        
        if (!this.isShowingPatient) {
            this.videoPlayer.play().catch(e => {
                console.warn('Could not play video:', e);
            });
        }
        
        console.log('Switched to video mode');
    }
    
    switchToSlideshow() {
        this.currentMediaType = 'slideshow';
        this.videoPlayer.style.display = 'none';
        this.slideshowContainer.style.display = 'flex';
        this.videoPlayer.pause();
        
        console.log('Switched to slideshow mode');
    }
    
    startSlideshow() {
        this.slideshowInterval = setInterval(() => {
            if (this.currentMediaType === 'slideshow' && !this.isShowingPatient) {
                this.nextSlide();
            }
        }, 5000); // Change slide every 5 seconds
    }
    
    nextSlide() {
        this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
        const nextSlide = this.slides[this.currentSlideIndex];
        
        // Fade out current image
        this.slideshowImage.style.opacity = '0';
        
        setTimeout(() => {
            this.slideshowImage.src = `media/${nextSlide}`;
            this.slideshowImage.style.opacity = '1';
        }, 400);
    }
    
    enterFullscreen() {
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    
    handleFullscreenChange() {
        if (document.fullscreenElement) {
            console.log('Entered fullscreen mode');
            document.body.style.cursor = 'none';
        } else {
            console.log('Exited fullscreen mode');
            document.body.style.cursor = 'default';
        }
    }
    
    async testTrigger() {
        try {
            const response = await fetch('/api/test-trigger', { method: 'POST' });
            const data = await response.json();
            console.log('Test trigger sent:', data);
        } catch (error) {
            console.error('Error sending test trigger:', error);
        }
    }
    
    updateDebugStatus(message) {
        const [key, value] = message.split(': ');
        
        switch(key) {
            case 'Polling':
                this.pollingStatus.textContent = message;
                break;
            case 'Last Check':
                this.lastCheck.textContent = message;
                break;
            case 'Trigger':
                this.triggerStatus.textContent = message;
                break;
        }
    }
}

// Global functions
function toggleDebug() {
    const debugPanel = document.getElementById('debug-panel');
    debugPanel.classList.toggle('debug-hidden');
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load voices for speech synthesis
    if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = () => {
            const voices = speechSynthesis.getVoices();
            console.log('Available voices:', voices.filter(v => v.lang.startsWith('de')));
        };
    }
    
    // Initialize the waiting room display
    window.waitingRoomDisplay = new WaitingRoomDisplay();
    
    console.log('Medical Waiting Room Display System initialized');
    console.log('Keyboard shortcuts:');
    console.log('  F11 or F - Enter fullscreen');
    console.log('  ESC - Exit fullscreen');
    console.log('  T - Test patient trigger');
    console.log('  M - Toggle video/slideshow');
    console.log('  D - Toggle debug panel');
});