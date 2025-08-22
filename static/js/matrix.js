/**
 * Simple and Efficient Matrix Rain Animation
 * - Centered on the page
 * - Optimized for performance
 * - Clean and maintainable code
 */
class MatrixRain {
    // Default configuration
    static defaultConfig = {
        // Character set for the matrix rain
        charset: '01',
        // Font size in pixels
        fontSize: 18,
        // Animation speed (higher = faster)
        speed: 30,
        // Density of the rain (0-1)
        density: 0.9,
        // Minimum number of drops
        minDrops: 30,
        // Maximum number of drops
        maxDrops: 80,
        // Colors for the matrix effect
        colors: ['#00ff41', '#00cc33', '#009900', '#00cc44'],
        // Fade effect speed (0-1)
        fadeFactor: 0.08
    };

    constructor(canvasId, config = {}) {
        // Merge default config with user config
        this.config = { ...MatrixRain.defaultConfig, ...config };
        
        // Get canvas and context
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.drops = [];
        this.animationId = null;
        this.lastTime = 0;
        
        // Initialize
        this.setupCanvas();
        this.createDrops();
        this.bindEvents();
        this.start();
    }
    
    setupCanvas() {
        // Set canvas to full window size
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(dpr, dpr);
        
        // Set font
        this.ctx.font = `${this.config.fontSize}px monospace`;
        this.ctx.textAlign = 'center';
        
        // Calculate number of columns
        this.columnWidth = this.config.fontSize * 0.8;
        this.columns = Math.min(
            Math.max(
                Math.floor((this.width / this.columnWidth) * this.config.density),
                this.config.minDrops
            ),
            this.config.maxDrops
        );
    }
    
    createDrops() {
        this.drops = [];
        const startX = (this.width - (this.columns * this.columnWidth)) / 2;
        
        for (let i = 0; i < this.columns; i++) {
            this.drops.push({
                x: startX + i * this.columnWidth + this.columnWidth / 2,
                y: Math.random() * -1000, // Start above the viewport
                speed: 2 + Math.random() * 5,
                length: 5 + Math.floor(Math.random() * 15),
                chars: []
            });
        }
    }
    
    updateDrops(deltaTime) {
        const speed = this.config.speed * (deltaTime / 16); // Normalize speed
        
        this.drops.forEach(drop => {
            // Move drop down
            drop.y += drop.speed * speed;
            
            // Add new character at the head
            if (Math.random() > 0.95) {
                drop.chars.unshift({
                    char: this.getRandomChar(),
                    opacity: 1
                });
                
                // Remove old characters
                if (drop.chars.length > drop.length) {
                    drop.chars.pop();
                }
            }
            
            // Update opacities
            drop.chars.forEach((char, i) => {
                // Fade out characters
                if (i > 0) {
                    char.opacity = Math.max(0, char.opacity - this.config.fadeFactor);
                }
            });
            
            // Reset drop if it goes off screen
            if (drop.y > this.height + drop.chars.length * this.config.fontSize) {
                drop.y = -drop.chars.length * this.config.fontSize;
                drop.chars = [];
            }
        });
    }
    
    draw() {
        // Clear canvas with semi-transparent black for trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw each drop
        this.drops.forEach(drop => {
            drop.chars.forEach((char, i) => {
                // Calculate color based on position in drop
                const colorIndex = Math.min(
                    Math.floor((i / drop.chars.length) * this.config.colors.length),
                    this.config.colors.length - 1
                );
                
                this.ctx.fillStyle = this.config.colors[colorIndex];
                this.ctx.globalAlpha = char.opacity;
                this.ctx.fillText(char.char, drop.x, drop.y - i * this.config.fontSize);
            });
        });
        
        // Reset global alpha
        this.ctx.globalAlpha = 1;
    }
    
    getRandomChar() {
        return this.config.charset[Math.floor(Math.random() * this.config.charset.length)];
    }
    
    bindEvents() {
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    handleResize() {
        this.setupCanvas();
        this.createDrops();
    }
    
    animate(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.updateDrops(deltaTime);
        this.draw();
        
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    
    start() {
        if (!this.animationId) {
            this.lastTime = 0;
            this.animationId = requestAnimationFrame(this.animate.bind(this));
        }
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    destroy() {
        this.stop();
        window.removeEventListener('resize', this.handleResize);
    }
            // Extended character set including Japanese katakana and other symbols
            charset: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                    'abcdefghijklmnopqrstuvwxyz' +
                    '0123456789' +
                    '!@#$%^&*()_+-=[]{}|;:,.<>?/' + 
                    'αβγδεζηθικλμνξοπρστυφχψω' + // Greek letters
                    'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' + // Russian letters
                    '∀∃∅∆∇∈∉∋∌∏∑−√∛∜∞∠∧∨∩∪∫∴∵∼∝≅≈≠≡≤≥⊂⊃⊄⊆⊇⊕⊗⊥⋅⋅', // Math symbols
            fontSize: 18,
            speed: 1.2, // Slower for better readability
            density: 0.75, // Slightly less dense for better performance
            fadeSpeed: 0.025, // Slower fade for longer trails
            minDrops: 30,
            maxDrops: 120, // More drops for wider screens
            columnWidth: 20, // Pixels between columns
            colorRange: [
                '#00ff41', // Bright matrix green
                '#00e63d',
                '#00cc38',
                '#00b332',
                '#00992c',
                '#008026',
                '#00ff88', // Cyan-green for highlights
                '#00cc6a',
                '#00aa55',
                '#33ff33'  // Bright green for emphasis
            ],
            ...options
        };
        
        // Pre-process character set into an array for better performance
        this.charSet = Array.from(this.config.charset);
        this.charSetLength = this.charSet.length;
        
        // Animation state
        this.drops = [];
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / 25; // Target 25 FPS for better performance
        this.animationId = null;
        this.dpr = window.devicePixelRatio || 1;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.createDrops();
        this.start();
    }
    
    setupCanvas() {
        // Set canvas dimensions
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Set display style
        Object.assign(this.canvas.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '-1',
            opacity: '0.6'
        });
        
        // High DPI display support
        this.dpr = window.devicePixelRatio || 1;
        this.canvas.width = width * this.dpr;
        this.canvas.height = height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
        
        // Set font and text alignment
        this.ctx.font = `bold ${this.config.fontSize}px 'Roboto Mono', monospace`;
        this.ctx.textAlign = 'center';
        
        // Calculate number of columns based on screen size
        this.columnWidth = this.config.fontSize * 0.8;
        this.columns = Math.min(
            Math.max(
                Math.floor((width / this.columnWidth) * this.config.density),
                this.config.minDrops
            ),
            this.config.maxDrops
        );
        
        // Adjust font size if needed to fit columns
        while (this.columns < this.config.minDrops && this.config.fontSize > 10) {
            this.config.fontSize -= 1;
            this.columnWidth = this.config.fontSize * 0.8;
            this.columns = Math.floor((width / this.columnWidth) * this.config.density);
        }
    }
    
    setupEventListeners() {
        // Debounced resize handler
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.setupCanvas();
                this.createDrops();
            }, 100);
        };
        
        window.addEventListener('resize', handleResize, { passive: true });
        
        // Cleanup on page hide
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(this.animationId);
            } else {
                this.lastFrameTime = performance.now();
                this.animationId = requestAnimationFrame(this.animate.bind(this));
            }
        });
    }
    
    createDrops() {
        this.drops = [];
        const columnCount = Math.max(
            this.config.minDrops,
            Math.min(
                Math.floor(this.canvas.width / this.config.columnWidth),
                this.config.maxDrops
            )
        );
        
        const columnWidth = this.canvas.width / columnCount;
        
        // Create drops with staggered starting positions
        for (let i = 0; i < columnCount; i++) {
            this.addDrop(i * columnWidth + (columnWidth / 2), true);
        }
    }
    
    addDrop(x, initial = false) {
        if (this.drops.length >= this.config.maxDrops) return null;
        
        const drop = {
            x: x || Math.random() * this.canvas.width,
            y: initial ? Math.random() * -this.canvas.height : -20,
            speed: 0.7 + Math.random() * this.config.speed,
            length: 5 + Math.floor(Math.random() * 25), // Longer trails
            chars: [],
            nextCharChange: 0,
            charChangeSpeed: 0.5 + Math.random(), // How often to change characters (seconds)
            lastUpdate: performance.now(),
            color: this.getRandomColor()
        };
        
        this.resetDropChars(drop);
        this.drops.push(drop);
        return drop;
    }
    
    resetDropChars(drop) {
        drop.chars = [];
        const charCount = Math.min(40, drop.length); // Increased max characters
        
        for (let i = 0; i < charCount; i++) {
            const progress = i / charCount;
            drop.chars.push({
                char: this.getRandomChar(),
                originalChar: this.getRandomChar(),
                opacity: this.easeOutQuad(progress, 0.1, 0.9, 1),
                speed: drop.speed * (0.8 + Math.random() * 0.4),
                nextChange: 0,
                changeSpeed: 0.2 + Math.random() * 1.5, // How often to change (seconds)
                lastUpdate: performance.now()
            });
        }
    }
    
    // Easing function for smooth transitions
    easeOutQuad(t, b, c, d) {
        t /= d;
        return -c * t * (t - 2) + b;
    }
    
    getRandomChar() {
        // 70% chance to return a character from the first half (more common characters)
        // 30% chance to return from the full set (including rarer characters)
        const useCommon = Math.random() < 0.7;
        const subsetLength = useCommon 
            ? Math.floor(this.charSetLength * 0.3) 
            : this.charSetLength;
            
        return this.charSet[Math.floor(Math.random() * subsetLength)];
    }
    
    getRandomColor() {
        return this.config.colorRange[
            Math.floor(Math.random() * this.config.colorRange.length)
        ];
    }
    
    updateDrops() {
        const now = performance.now();
        const deltaTime = (now - (this.lastFrameTime || now)) / 1000; // Convert to seconds
        this.lastFrameTime = now;
        
        // Update each drop
        for (let i = this.drops.length - 1; i >= 0; i--) {
            const drop = this.drops[i];
            const timeSinceLastUpdate = (now - drop.lastUpdate) / 1000;
            
            // Move drop down with easing for a more natural feel
            drop.y += drop.speed * 60 * deltaTime;
            
            // Update character animations
            for (let j = 0; j < drop.chars.length; j++) {
                const char = drop.chars[j];
                const charProgress = j / drop.chars.length;
                
                // Update character change timing
                char.nextChange -= deltaTime;
                if (char.nextChange <= 0) {
                    char.originalChar = char.char;
                    char.char = this.getRandomChar();
                    char.nextChange = char.changeSpeed * (0.5 + Math.random());
                }
                
                // Calculate character opacity based on position in drop
                if (charProgress > 0.7) {
                    // Fade out at the end
                    char.opacity = Math.max(0, char.opacity - (deltaTime * 0.5));
                } else if (charProgress < 0.3) {
                    // Fade in at the start
                    char.opacity = Math.min(
                        this.easeOutQuad(charProgress * 3.33, 0.1, 0.9, 1),
                        char.opacity + (deltaTime * 0.5)
                    );
                }
                
                // Randomly change characters occasionally (in addition to scheduled changes)
                if (Math.random() > 0.98) {
                    char.originalChar = char.char;
                    char.char = this.getRandomChar();
                    char.nextChange = char.changeSpeed * (0.5 + Math.random());
                }
            }
            
            // Reset or remove drop if it goes off screen
            if (drop.y > this.canvas.height + (drop.chars.length * this.config.fontSize * 1.5)) {
                if (Math.random() > 0.2) { // 80% chance to reset, 20% to remove
                    this.resetDrop(drop);
                } else {
                    this.drops.splice(i, 1);
                    // Add a new drop to replace the removed one if needed
                    if (this.drops.length < this.config.minDrops) {
                        this.addRandomDrop();
                    }
                }
            }
            
            drop.lastUpdate = now;
        }
        
        // Occasionally add new drops if we're below max
        if (this.drops.length < this.config.maxDrops && Math.random() > 0.97) {
            this.addDrop();
        }
    }
    
    resetDrop(drop) {
        drop.y = -Math.random() * this.canvas.height * 0.5;
        drop.speed = 0.7 + Math.random() * this.config.speed;
        drop.length = 5 + Math.floor(Math.random() * 25);
        drop.color = this.getRandomColor();
        this.resetDropChars(drop);
    }
    
    addRandomDrop() {
        this.addDrop(Math.random() * this.canvas.width);
    }
    
    animate(timestamp) {
        // Throttle frame rate
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const deltaTime = timestamp - this.lastFrameTime;
        
        if (deltaTime >= this.frameInterval) {
            this.updateDrops();
            this.draw();
            this.lastFrameTime = timestamp - (deltaTime % this.frameInterval);
        }
        
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    
    start() {
        if (!this.animationId) {
            this.lastFrameTime = performance.now();
            this.animationId = requestAnimationFrame(this.animate.bind(this));
        }
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    destroy() {
        this.stop();
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
}

// Initialize Matrix effect when DOM is loaded
class MatrixInitializer {
    constructor() {
        this.matrix = null;
        this.handleResize = this.handleResize.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.init();
    }

    init() {
        const container = document.getElementById('matrix');
        if (!container) {
            console.warn('Matrix container not found');
            return;
        }

        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-canvas';
        
        // Set container styles
        Object.assign(container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '-1',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000'
        });
        
        container.appendChild(canvas);

        // Initialize Matrix animation with custom options
        this.matrix = new MatrixRain('matrix-canvas', {
            charset: '01',
            fontSize: 18,
            speed: 1.2,
            density: 0.85,
            minDrops: 30,
            maxDrops: 100,
            colorRange: [
                '#00ff41', // Matrix green
                '#00e63d',
                '#00cc38',
                '#00b332',
                '#33ff33'  // Bright green
            ]
        });

        // Set up event listeners
        this.setupEventListeners();
        
        // Initial resize to set canvas dimensions
        this.handleResize();
        
        // Start the animation after a short delay
        setTimeout(() => {
            this.matrix.start();
        }, 100);
        
        // Expose to window for debugging if needed
        window.matrixAnimation = this.matrix;
    }

    handleResize() {
        if (this.matrix) {
            this.matrix.setupCanvas();
            this.matrix.createDrops();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.matrix?.stop();
        } else {
            this.matrix?.start();
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener('beforeunload', this.cleanup.bind(this));
    }

    cleanup() {
        if (this.matrix) {
            this.matrix.destroy();
            this.matrix = null;
        }
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('beforeunload', this.cleanup);
    }
}

