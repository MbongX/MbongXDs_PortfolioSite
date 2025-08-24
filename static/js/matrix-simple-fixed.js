// Simple Matrix Rain Effect - Fixed Version
class SimpleMatrix {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        // Configuration
        this.chars = '01';
        this.fontSize = 16;
        this.columns = 0;
        this.drops = [];
        
        // Initialize
        this.setup();
        this.animate();
        window.addEventListener('resize', () => this.setup());
    }
    
    setup() {
        // Set canvas size
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        
        // Calculate columns
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        
        // Initialize drops
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * 100;
        }
    }
    
    draw() {
        // Semi-transparent black background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set text style
        this.ctx.fillStyle = '#0f0';
        this.ctx.font = `${this.fontSize}px monospace`;
        
        // Draw the characters
        for (let i = 0; i < this.drops.length; i++) {
            const text = this.chars.charAt(Math.floor(Math.random() * this.chars.length));
            this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
            
            // Reset drops that have reached the bottom
            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            
            // Move drops down
            this.drops[i]++;
        }
    }
    
    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.matrixEffect = new SimpleMatrix('matrix-container');
});
