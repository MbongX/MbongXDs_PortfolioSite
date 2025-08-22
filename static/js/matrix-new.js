/**
 * Matrix Rain Effect
 * A clean, efficient implementation of the Matrix digital rain effect
 */
class MatrixRain {
    constructor(containerId, options = {}) {
        // Default configuration
        this.config = {
            // Character set for the rain
            charset: '01',
            // Font size in pixels
            fontSize: 18,
            // Animation speed (higher = faster)
            speed: 30,
            // Density of the rain (0-1)
            density: 0.8,
            // Minimum number of drops
            minDrops: 20,
            // Maximum number of drops
            maxDrops: 80,
            // Colors for the matrix effect
            colors: ['#00ff41', '#00cc33', '#009900', '#00cc44'],
            // Fade effect speed (0-1)
            fadeFactor: 0.08,
            // Merge with user options
            ...options
        };

        // Get container and create canvas
        this.container = document.getElementById(containerId) || document.body;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        // Animation state
        this.drops = [];
        this.animationId = null;
        this.lastTime = 0;
        this.columns = 0;
        this.columnWidth = 0;

        // Initialize
        this.setupCanvas();
        this.createDrops();
        this.bindEvents();
        this.start();
    }

    /**
     * Set up the canvas dimensions and styles
     */
    setupCanvas() {
        // Set canvas to container size
        const dpr = window.devicePixelRatio || 1;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        // Set canvas size with high DPI support
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(dpr, dpr);
        
        // Set font and text alignment
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

    /**
     * Create the initial raindrops
     */
    createDrops() {
        this.drops = [];
        const now = performance.now();
        
        // Create drops with fixed positions for better performance
        for (let i = 0; i < this.columns; i++) {
            // Use pre-calculated x positions
            const x = this.columnPositions[i] || (Math.random() * this.width);
            
            // Stagger start positions
            const startY = -Math.random() * 1000;
            
            // Create a simplified drop object
            this.drops.push({
                x: x,
                y: startY,
                speed: 1 + Math.random() * 3, // Slower speed for better visibility
                length: 3 + Math.floor(Math.random() * 15), // Shorter trails for better performance
                chars: [],
                nextCharTime: 0,
                lastUpdate: now - Math.random() * 1000, // Stagger updates
                speedVariation: 0.9 + Math.random() * 0.2, // Less variation for smoother animation
                color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)]
            });
        }
    }

    /**
     * Update the position and state of each raindrop
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    updateDrops(deltaTime) {
        const now = performance.now();
        const timeDelta = now - (this.lastTime || now);
        this.lastTime = now;

        for (let i = 0; i < this.drops.length; i++) {
            const drop = this.drops[i];
            
            // Update position with smooth movement
            drop.y += drop.speed * (timeDelta / 16);
            
            // Add new character to the drop with timing
            if (now - (drop.lastUpdate || 0) > (drop.nextCharTime || 50)) {
                const char = this.config.charset[Math.floor(Math.random() * this.config.charset.length)];
                drop.chars.unshift({
                    char: char,
                    opacity: 1,
                    color: this.getRandomColor(),
                    y: drop.y
                });
                
                // Randomize time until next character
                drop.nextCharTime = 30 + Math.random() * 40;
                drop.lastUpdate = now;
                
                // Remove characters that are too old or off-screen
                while (drop.chars.length > 0 && 
                      (drop.chars.length > drop.length || 
                       drop.chars[drop.chars.length - 1].y > this.height + this.config.fontSize)) {
                    drop.chars.pop();
                }
            }
            
            // Update character positions and opacities
            for (let j = 0; j < drop.chars.length; j++) {
                const char = drop.chars[j];
                // Slight vertical spread for a more organic look
                char.y += (drop.speed * 0.2) * (timeDelta / 16);
                // Fade out based on position in the trail
                char.opacity = 1 - (j / drop.length) * 0.9;
            }
            
            // Reset drop if it goes below the viewport
            if (drop.y > this.height + drop.length * this.config.fontSize) {
                drop.y = -this.config.fontSize * (5 + Math.random() * 20);
                drop.x = Math.random() * (this.width - this.columnWidth) + this.columnWidth / 2;
                drop.chars = [];
                drop.speed = 2 + Math.random() * 5; // Randomize speed on reset
            }
        }
    }

    /**
     * Draw the current state of the animation
     */
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

    /**
     * Get a random character from the character set
     * @returns {string} A random character
     */
    getRandomChar() {
        return this.config.charset[Math.floor(Math.random() * this.config.charset.length)];
    }

    /**
     * Set up event listeners
     */
    bindEvents() {
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.setupCanvas();
        this.createDrops();
    }

    /**
     * Animation loop
     * @param {number} timestamp - Current timestamp
     */
    animate(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.updateDrops(deltaTime);
        this.draw();
        
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }

    /**
     * Start the animation
     */
    start() {
        if (!this.animationId) {
            this.lastTime = 0;
            this.animate(0);
        }
    }

    /**
     * Stop the animation
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stop();
        window.removeEventListener('resize', this.handleResize);
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize the matrix effect when the DOM is loaded
function initMatrix() {
    // Create container if it doesn't exist
    let container = document.getElementById('matrix-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'matrix-container';
        document.body.insertBefore(container, document.body.firstChild);
    }

    // Set container styles
    Object.assign(container.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '-1',
        overflow: 'hidden',
        pointerEvents: 'none', // Allow clicks to pass through
        margin: '0',
        padding: '0'
    });

    // Initialize the matrix effect with full width settings
    const matrix = new MatrixRain('matrix-container', {
        charset: '01',
        fontSize: 20,
        speed: 25,
        density: 0.7,
        minDrops: 30,
        maxDrops: 100,
        colors: ['#00ff41', '#00ff88', '#00cc66', '#00aa55'],
        fadeFactor: 0.1
    });

    // Return cleanup function
    return () => matrix.destroy();
}

// Start the animation when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMatrix);
} else {
    // If the document is already loaded, initialize immediately
    initMatrix();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MatrixRain };
}
