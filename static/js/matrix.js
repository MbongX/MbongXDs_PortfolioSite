/**
 * Matrix Rain Animation
 * A performant, configurable matrix rain effect for modern web applications
 * @class MatrixRain
 */
class MatrixRain {
    /**
     * Default configuration for the matrix rain effect
     * @static
     * @type {Object}
     */
    static defaultConfig = Object.freeze({
        charset: '01',          // Character set for the rain
        fontSize: 18,           // Font size in pixels
        speed: 30,              // Animation speed (higher = faster)
        density: 0.9,           // Density of the rain (0-1)
        minDrops: 30,           // Minimum number of raindrops
        maxDrops: 80,           // Maximum number of raindrops
        colors: [               // Color gradient for the rain
            '#00ff41',
            '#00cc33',
            '#009900',
            '#00cc44'
        ],
        fadeFactor: 0.08,       // Fade effect speed (0-1)
        fpsLimit: 60,           // Maximum frames per second
        resizeDebounce: 250     // Debounce time for resize events (ms)
    });

    /**
     * Create a new MatrixRain instance
     * @param {string} canvasId - ID of the canvas element
     * @param {Object} [config={}] - Configuration options
     */
    constructor(canvasId, config = {}) {
        if (typeof canvasId !== 'string' || !canvasId.trim()) {
            throw new Error('Canvas ID must be a non-empty string');
        }

        // Validate and merge config
        this.config = {
            ...MatrixRain.defaultConfig,
            ...this._validateConfig(config)
        };
        
        // Initialize properties
        this.canvas = document.getElementById(canvasId);
        this.ctx = null;
        this.drops = [];
        this.animationId = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.fps = 0;
        this.resizeTimeout = null;
        this.isRunning = false;
        
        // Bind methods
        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        
        // Initialize
        this._init();
    }
    
    /**
     * Validate configuration object
     * @private
     * @param {Object} config - Configuration to validate
     * @returns {Object} Validated configuration
     */
    _validateConfig(config) {
        const validated = {};
        const { defaultConfig } = MatrixRain;
        
        Object.keys(config).forEach(key => {
            const value = config[key];
            
            switch (key) {
                case 'fontSize':
                case 'speed':
                case 'minDrops':
                case 'maxDrops':
                    if (typeof value === 'number' && value > 0) {
                        validated[key] = Math.floor(value);
                    }
                    break;
                    
                case 'density':
                case 'fadeFactor':
                    if (typeof value === 'number' && value >= 0 && value <= 1) {
                        validated[key] = value;
                    }
                    break;
                    
                case 'charset':
                    if (typeof value === 'string' && value.length > 0) {
                        validated[key] = value;
                    }
                    break;
                    
                case 'colors':
                    if (Array.isArray(value) && value.every(c => /^#[0-9A-F]{6}$/i.test(c))) {
                        validated[key] = [...value];
                    }
                    break;
                    
                case 'fpsLimit':
                case 'resizeDebounce':
                    if (typeof value === 'number' && value > 0) {
                        validated[key] = Math.max(1, Math.min(value, 144));
                    }
                    break;
            }
        });
        
        // Ensure minDrops <= maxDrops
        if ('minDrops' in validated || 'maxDrops' in validated) {
            const min = 'minDrops' in validated ? validated.minDrops : defaultConfig.minDrops;
            const max = 'maxDrops' in validated ? validated.maxDrops : defaultConfig.maxDrops;
            validated.minDrops = Math.min(min, max);
            validated.maxDrops = Math.max(min, max);
        }
        
        return validated;
    }
    
    /**
     * Initialize the matrix effect
     * @private
     */
    _init() {
        if (!this.canvas) {
            console.error(`[MatrixRain] Canvas element with ID '${this.config.canvasId}' not found`);
            return;
        }
        
        // Set up canvas context
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        if (!this.ctx) {
            console.error('[MatrixRain] Could not get 2D rendering context');
            return;
        }
        
        // Pre-process character set for better performance
        this.charSet = Array.from(new Set(this.config.charset));
        this.charSetLength = this.charSet.length;
        
        if (this.charSetLength === 0) {
            console.warn('[MatrixRain] Empty character set, using default');
            this.charSet = ['0', '1'];
            this.charSetLength = 2;
        }
        
        // Set up initial state
        this.setupCanvas();
        this.createDrops();
        this.bindEvents();
        this.start();
    }
    
    setupCanvas() {
        // Set canvas to full window size
        
        // Store current dimensions for comparison
        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;
        
        // Set canvas dimensions to match container (handles HiDPI displays)
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        
        // Scale the context to handle HiDPI displays
        this.ctx.scale(dpr, dpr);
        
        // Set font and calculate metrics
        this.ctx.font = `${this.config.fontSize}px 'Fira Code', 'Courier New', monospace`;
        this.ctx.textBaseline = 'top';
        this.ctx.textAlign = 'left';
        
        // Calculate column width based on the widest character
        this.columnWidth = this.ctx.measureText('W').width * 1.2; // Add some padding
        this.columns = Math.max(1, Math.floor(rect.width / this.columnWidth));
        this.rows = Math.ceil(rect.height / this.config.fontSize) + 1;
        
        // Only recreate drops if dimensions changed significantly
        if (Math.abs(oldWidth - this.canvas.width) > 10 || 
            Math.abs(oldHeight - this.canvas.height) > 10) {
            this.createDrops();
        }
    }
    
    /**
     * Create and initialize raindrops
     * @public
     */
    createDrops() {
        if (!this.ctx || !this.columns) return;
        
        const { minDrops, maxDrops, density } = this.config;
        const targetDrops = Math.min(
            maxDrops,
            Math.max(minDrops, Math.floor(this.columns * density))
        );
        
        // Reuse existing drops when possible to avoid visual jumps
        const oldDrops = this.drops || [];
        this.drops = [];
        
        for (let i = 0; i < targetDrops; i++) {
            // Try to reuse existing drop if available
            const oldDrop = oldDrops[i];
            
            if (oldDrop && oldDrop.x < this.canvas.width) {
                // Adjust position if needed
                oldDrop.x = Math.min(oldDrop.x, (this.columns - 1) * this.columnWidth);
                oldDrop.y = Math.min(oldDrop.y, -oldDrop.length * this.config.fontSize);
                this.drops.push(oldDrop);
            } else {
                // Create new drop
                this.drops.push({
                    x: Math.floor(Math.random() * this.columns) * this.columnWidth,
                    y: Math.random() * -100, // Start above the viewport
                    speed: 1 + Math.random() * 3,
                    chars: [],
                    length: 5 + Math.floor(Math.random() * 15),
                    lastUpdate: 0
                });
            }
        }
        
        // Initialize character arrays for each drop
        this.drops.forEach(drop => {
            if (!drop.chars || drop.chars.length !== drop.length) {
                drop.chars = Array(drop.length).fill(0).map(() => ({
                    char: this._getRandomChar(),
                    alpha: 0,
                    color: this._getRandomColor()
                }));
            }
        });
    }
    
    /**
     * Get a random character from the character set
     * @private
     * @returns {string} Random character
     */
    _getRandomChar() {
        return this.charSet[Math.floor(Math.random() * this.charSetLength)];
    }
    
    /**
     * Get a random color from the color palette
     * @private
     * @returns {string} Color in hex format
     */
    _getRandomColor() {
        return this.config.colors[
            Math.floor(Math.random() * this.config.colors.length)
        ];
    }
    
    /**
     * Update raindrops
     * @public
     * @param {number} deltaTime - Time since last update (in seconds)
     */
    updateDrops(deltaTime) {
        const speed = this.config.speed * (deltaTime / 16); // Normalize speed
        
        this.drops.forEach(drop => {
            // Move drop down
            drop.y += drop.speed * speed;
            
            // Update character animations
            drop.chars.forEach((char, i) => {
                // Fade out characters
                if (i > 0) {
                    char.alpha = Math.max(0, char.alpha - this.config.fadeFactor);
                }
            });
            
            // Reset drop if it goes off screen
            if (drop.y > this.canvas.height + (drop.chars.length * this.config.fontSize)) {
                drop.y = -drop.chars.length * this.config.fontSize;
                drop.chars = Array(drop.length).fill(0).map(() => ({
                    char: this._getRandomChar(),
                    alpha: 0,
                    color: this._getRandomColor()
                }));
            }
        });
    }
    
    /**
     * Draw raindrops
     * @public
     */
    drawDrops() {
        // Clear the canvas with a slight fade effect
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context state
        this.ctx.save();
        
        try {
            // Draw each drop
            this.drops.forEach(drop => {
                drop.chars.forEach((char, i) => {
                    // Calculate color based on position in drop
                    const colorIndex = Math.min(
                        Math.floor((i / drop.chars.length) * this.config.colors.length),
                        this.config.colors.length - 1
                    );
                    
                    this.ctx.fillStyle = char.color;
                    this.ctx.globalAlpha = char.alpha;
                    this.ctx.fillText(char.char, drop.x, drop.y - i * this.config.fontSize);
                });
            });
        } catch (error) {
            console.error('[MatrixRain] Error in drawing:', error);
        }
        
        // Restore context state
        this.ctx.restore();
    }
    
    /**
     * Animation loop
     * @private
     */
    animate(timestamp) {
        if (!this.isRunning) return;
        
        // Calculate delta time and limit FPS
        const now = timestamp || performance.now();
        const deltaTime = now - this.lastFrameTime;
        const frameInterval = 1000 / this.config.fpsLimit;
        
        // Skip frame if not enough time has passed
        if (deltaTime < frameInterval) {
            this.animationId = requestAnimationFrame(this.animate);
            return;
        }
        
        // Update FPS counter
        this.frameCount++;
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
        
        // Update last frame time
        this.lastFrameTime = now - (deltaTime % frameInterval);
        
        // Update and draw drops
        this.updateDrops(deltaTime / 1000); // Convert to seconds
        this.drawDrops();
        
        // Request next frame
        this.animationId = requestAnimationFrame(this.animate);
    }
    
    /**
     * Start the animation
     * @public
     */
    start() {
        if (this.animationId || !this.ctx) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.lastFpsUpdate = this.lastFrameTime;
        
        // Start the animation loop
        this.animate();
    }
    
    /**
     * Stop the animation
     * @public
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * Destroy the matrix effect
     * @public
     */
    destroy() {
        this.stop();
        this.unbindEvents();
    }
    
    /**
     * Bind event listeners
     * @private
     */
    bindEvents() {
        // Remove any existing listeners to prevent duplicates
        this.unbindEvents();
        
        // Debounced resize handler
        const handleResize = () => {
            if (this.resizeTimeout) {
                cancelAnimationFrame(this.resizeTimeout);
            }
            
            this.resizeTimeout = requestAnimationFrame(() => {
                this.setupCanvas();
                // Don't recreate drops here to avoid visual glitches
                // Drops will be repositioned in the next animation frame
            });
        };
        
        // Use passive event listeners for better scrolling performance
        window.addEventListener('resize', this.handleResize, { passive: true });
        window.addEventListener('orientationchange', this.handleResize, { passive: true });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Clean up on page unload
        window.addEventListener('unload', () => this.destroy());
    }
    
    /**
     * Unbind event listeners
     * @private
     */
    unbindEvents() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        if (this.resizeTimeout) {
            cancelAnimationFrame(this.resizeTimeout);
            this.resizeTimeout = null;
        }
    }
    
    /**
     * Handle window resize event
     * @private
     */
    handleResize = () => {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = setTimeout(() => {
            this.setupCanvas();
            this.resizeTimeout = null;
        }, this.config.resizeDebounce);
    }
    
    /**
     * Handle visibility change event
     * @private
     */
    handleVisibilityChange = () => {
        if (document.hidden) {
            this.stop();
        } else {
            this.start();
        }
    }
}

/**
 * MatrixInitializer - Handles initialization and cleanup of the Matrix effect
 * @class
 */
class MatrixInitializer {
    /**
     * Create a new MatrixInitializer
     * @constructor
     */
    constructor() {
        this.matrix = null;
        this.isInitialized = false;
        this.config = {
            charset: '01',
            fontSize: 18,
            speed: 25,
            density: 0.7,
            minDrops: 20,
            maxDrops: 60,
            colors: ['#00ff41', '#00cc33', '#009900', '#00cc44'],
            fadeFactor: 0.06,
            fpsLimit: 60,
            resizeDebounce: 250
        };
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

