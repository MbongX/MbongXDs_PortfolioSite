/**
 * Enhanced Mouse Trail Effect
 * Features:
 * - Smooth particle-based trail with matrix-style characters
 * - Performance optimized with requestAnimationFrame
 * - Configurable appearance and behavior
 * - Clean memory management
 */
class MouseTrail {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            maxParticles: 100,      // Maximum number of particles
            particleSize: 2.5,      // Base size of particles
            colors: [
                '#00ff41', '#00e63d', '#00cc38', '#00b332', 
                '#00992c', '#00ff88', '#00cc6a', '#00aa55',
                '#00ffcc', '#00ffaa', '#00ff99', '#00dd88'
            ],
            baseSpeed: 0.8,         // Base movement speed
            maxSpeed: 3.5,          // Maximum movement speed
            trailLength: 40,        // Length of the trail
            particleLifetime: 150,  // How long particles live (frames)
            spawnRate: 3,           // Particles per frame
            opacity: 1.0,           // Base opacity
            characters: '01',       // Characters to use for the trail
            fontSize: 16,           // Base font size
            glowIntensity: 8,       // Glow effect intensity
            ...options
        };
        
        // Initialize state
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.animationId = null;
        this.lastFrameTime = 0;
        this.lastMove = 0;
        this.dpr = window.devicePixelRatio || 1;
        
        // Bind methods
        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.start();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { 
            alpha: true,
            desynchronized: true // Improve performance
        });
        
        // Style canvas
        Object.assign(this.canvas.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: '9998', // Below content, above background
            opacity: '1',
            mixBlendMode: 'screen' // Better blending with the background
        });
        
        // Set canvas size
        this.handleResize();
        document.body.appendChild(this.canvas);
    }
    
    handleResize() {
        this.dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Set canvas size with high DPI support
        this.canvas.width = Math.floor(width * this.dpr);
        this.canvas.height = Math.floor(height * this.dpr);
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ctx.scale(this.dpr, this.dpr);
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    setupEventListeners() {
        // Throttled mousemove handler
        this.handleMouseMove = (e) => {
            const now = performance.now();
            if (now - this.lastMove < 8) return; // ~120fps for smoother tracking
            this.lastMove = now;
            
            // Update position with easing for smoother movement
            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;
            
            // Smooth movement
            this.mouseX += (e.clientX - this.mouseX) * 0.5;
            this.mouseY += (e.clientY - this.mouseY) * 0.5;
            
            // Calculate velocity with smoothing
            this.velocityX = (this.mouseX - this.lastMouseX) * 0.3;
            this.velocityY = (this.mouseY - this.lastMouseY) * 0.3;
            
            // Create new particles with velocity-based spawning
            const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
            const particlesToSpawn = Math.min(
                Math.ceil(speed * 0.1 * this.config.spawnRate),
                this.config.spawnRate * 3
            );
            
            for (let i = 0; i < particlesToSpawn; i++) {
                this.createParticle();
            }
        };
        
        // Add event listeners with passive where appropriate
        window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
        window.addEventListener('resize', this.handleResize, { passive: true });
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
    
    createParticle() {
        // Create a single particle per frame for better performance
        const now = performance.now();
        
        // Reuse particles from pool if available
        let particle;
        if (this.particlePool.length > 0) {
            particle = this.particlePool.pop();
        } else if (this.particles.length < this.config.maxParticles) {
            // Create new particle if pool is empty and we haven't reached max
            particle = {};
        } else {
            // Reuse the oldest particle if we've reached max
            particle = this.particles.shift();
        }
        
        if (!particle) return;
        
        // Calculate position based on mouse movement
        const angle = Math.atan2(this.velocityY, this.velocityX);
        const speed = Math.min(Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY), 30);
        const spread = 5 + speed * 0.5;
        
        // Update particle properties
        Object.assign(particle, {
            x: this.mouseX + (Math.random() - 0.5) * spread,
            y: this.mouseY + (Math.random() - 0.5) * spread,
            char: Math.random() > 0.1 ? (Math.random() > 0.5 ? '0' : '1') : String.fromCharCode(0x30A0 + Math.random() * 96),
            vx: (Math.random() - 0.5) * 0.3 + Math.cos(angle) * speed * 0.01,
            vy: (Math.random() - 0.5) * 0.3 + Math.sin(angle) * speed * 0.01,
            size: this.config.fontSize * (0.7 + Math.random() * 0.6),
            baseSize: 0, // Will be set after creation
            life: this.config.particleLifetime * (0.8 + Math.random() * 0.4),
            color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
            opacity: 1.0,
            originalLife: 0,
            rotation: (Math.random() - 0.5) * 0.1, // Less rotation for better performance
            rotationSpeed: (Math.random() - 0.5) * 0.02, // Slower rotation
            createdAt: now
        });
        
        particle.baseSize = particle.size;
        particle.originalLife = particle.life;
        
        // Add to active particles
        this.particles.push(particle);
        this.activeParticles = this.particles.length;
    }
    
    updateParticles(deltaTime) {
        const now = performance.now();
        const deltaFactor = Math.min(deltaTime / (1000 / 60), 2);
        
        // Update particles in reverse order for safe removal
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const age = now - p.createdAt;
            const lifeRatio = 1 - (age / (p.originalLife * 16.67));
            
            // Skip if particle is dead
            if (lifeRatio <= 0) {
                // Move to pool for reuse
                this.particlePool.push(this.particles.splice(i, 1)[0]);
                this.activeParticles--;
                continue;
            }
            
            // Simplified physics
            p.vy += 0.005 * deltaFactor; // Very gentle gravity
            
            // Update position with easing based on life
            const ease = 0.5 + lifeRatio * 0.5;
            p.x += p.vx * deltaFactor * ease;
            p.y += p.vy * deltaFactor * ease;
            
            // Simple air resistance
            p.vx *= Math.pow(0.96, deltaFactor);
            p.vy *= Math.pow(0.96, deltaFactor);
            
            // Update visual properties
            p.opacity = lifeRatio * this.config.opacity;
            p.size = p.baseSize * (0.6 + 0.4 * lifeRatio);
            
            // Remove particles that are off-screen or completely faded
            if (p.y > this.canvas.height + 50 || 
                p.x < -50 || 
                p.x > this.canvas.width + 50 ||
                p.opacity < 0.01) {
                this.particlePool.push(this.particles.splice(i, 1)[0]);
                this.activeParticles--;
            }
        }
    }
    
    drawParticles() {
        // Clear the canvas with a semi-transparent background for trail effect
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set composite operation for glow effect
        this.ctx.globalCompositeOperation = 'lighter';
        
        // Sort particles by opacity for proper blending
        const sortedParticles = [...this.particles].sort((a, b) => {
            return (a.opacity - b.opacity);
        });
        
        // Draw each particle
        for (const p of sortedParticles) {
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            
            // Draw character with glow effect
            const fontSize = Math.max(1, p.size);
            const fontFamily = p.char.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/) ? 
                '"Hiragino Kaku Gothic Pro", Meiryo, sans-serif' : 
                '"Roboto Mono", monospace';
                
            this.ctx.font = `bold ${fontSize}px ${fontFamily}`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Glow effect - more intense for brighter particles
            const glowIntensity = p.opacity * this.config.glowIntensity * (0.7 + 0.3 * Math.sin(performance.now() * 0.01));
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = glowIntensity * 1.5;
            
            // Draw the character with gradient
            const gradient = this.ctx.createLinearGradient(0, -fontSize/2, 0, fontSize/2);
            gradient.addColorStop(0, this.lightenColor(p.color, 30));
            gradient.addColorStop(0.5, p.color);
            gradient.addColorStop(1, this.darkenColor(p.color, 20));
            
            // Draw main character
            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = p.opacity * 0.9;
            this.ctx.fillText(p.char, 0, 0);
            
            // Draw a subtle highlight
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.globalAlpha = p.opacity * 0.15;
            this.ctx.fillText(p.char, -1, -1);
            
            // Draw a glow behind the character
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = glowIntensity * 2;
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.opacity * 0.3;
            this.ctx.fillText(p.char, 0, 0);
            
            this.ctx.restore();
        }
        
        // Reset composite operation
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // Helper function to lighten a color
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        
        return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
    }
    
    // Helper function to darken a color
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        
        return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
    }
    
    animate(timestamp) {
        // Calculate delta time for smooth animation
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Cap delta time to prevent large jumps
        const cappedDelta = Math.min(deltaTime, 100);
        
        // Update and render with the actual time delta
        this.updateParticles(cappedDelta);
        this.drawParticles();
        
        // Continue animation loop
        this.animationId = requestAnimationFrame(this.animate);
    }
    
    start() {
        if (!this.animationId) {
            this.lastFrameTime = performance.now();
            this.animationId = requestAnimationFrame(this.animate);
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
        if (this.handleMouseMove) {
            window.removeEventListener('mousemove', this.handleMouseMove);
        }
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Remove canvas from DOM
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize MouseTrail when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and start the mouse trail effect
    const mouseTrail = new MouseTrail({
        maxParticles: 120,
        particleSize: 2.5,
        baseSpeed: 0.8,
        maxSpeed: 3.5,
        trailLength: 40,
        particleLifetime: 150,
        spawnRate: 3,
        opacity: 1.0,
        fontSize: 16,
        glowIntensity: 10
    });
    
    // Handle page visibility changes
    const handleVisibilityChange = () => {
        if (document.hidden) {
            mouseTrail.stop();
        } else {
            mouseTrail.start();
        }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function
    const cleanup = () => {
        mouseTrail.destroy();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', cleanup);
    };
    
    window.addEventListener('beforeunload', cleanup);
    
    // Expose to window for debugging if needed
    window.mouseTrail = mouseTrail;
});
