/**
 * Snowfall Engine
 * Security: Pointer-events none (no click hijacking)
 * Performance: HTML5 Canvas + requestAnimationFrame
 * Standards: Modern JS, Retina Support
 */
class Snowfall {
	static #instance = null;

	constructor( options = {} ) {
		if ( Snowfall.#instance ) {
			return Snowfall.#instance;
		}

		this.defaults = {
			count: options.count || 100,
			type: options.type || 'lines',
			color: options.color || '#ffffff',
			minSize: options.minSize || 1,
			maxSize: options.maxSize || 3,
			minSpeed: options.minSpeed || 0.5,
			maxSpeed: options.maxSpeed || 2,
			zIndex: options.zIndex || 9999
		};

		this.flakes = [];
		this.canvas = null;
		this.ctx = null;
		this.animationId = null;
		this.dpr = window.devicePixelRatio || 1;
		this.isRendering = true;

		this.init();

		Snowfall.#instance = this;
	}

	static boot() {
		if ( Snowfall.#instance ) {
			return Snowfall.#instance;
		}

		const settings = window.snowSettings || {};
		return new Snowfall( settings );
	}

	static getInstance() {
		return Snowfall.#instance;
	}

	init() {
		this.createCanvas();
		this.setupStyles();
		this.resize();
		this.createFlakes();
		this.bindEvents();
		this.render();
	}

	createCanvas() {
		this.canvas = document.createElement( 'canvas' );
		this.ctx = this.canvas.getContext( '2d', { alpha: true } );
		document.body.appendChild( this.canvas );
	}

	setupStyles() {
		Object.assign(
			this.canvas.style,
			{
				position: 'fixed',
				top: '0',
				left: '0',
				width: '100vw',
				height: '100vh',
				pointerEvents: 'none',
				zIndex: this.defaults.zIndex,
				display: 'block'
			}
		);
	}

	resize() {

		const width = window.innerWidth;
		const height = window.innerHeight;

		this.canvas.width = width * this.dpr;
		this.canvas.height = height * this.dpr;

		this.ctx.setTransform( this.dpr, 0, 0, this.dpr, 0, 0 );

		this.width = width;
		this.height = height;
	}

	bindEvents() {
		this.resizeHandler = () => {
			if ( this.resizeTimeout ) {
				cancelAnimationFrame( this.resizeTimeout );
			}
			this.resizeTimeout = requestAnimationFrame( () => this.resize() );
		};
		window.addEventListener( 'resize', this.resizeHandler, { passive: true } );

		this.visibilityHandler = () => {
			if ( document.hidden ) {
				this.isRendering = false;
				cancelAnimationFrame( this.animationId );
			} else {
				if ( ! this.isRendering ) {
					this.isRendering = true;
					this.render();
				}
			}
		};
		document.addEventListener( 'visibilitychange', this.visibilityHandler );

	}

	createFlakes() {

		const area = ( window.innerWidth * window.innerHeight ) / 1000000;

		const density = this.defaults.count;
		const calculatedCount = Math.floor( area * density );

		const finalCount = Math.max( 20, Math.min( calculatedCount, 800 ) );

		this.flakes = Array.from( { length: finalCount }, () => this.createFlake() );
	}

	createFlake() {
		return {
			x: Math.random() * this.width,
			y: Math.random() * this.height,
			r: Math.random() * ( this.defaults.maxSize - this.defaults.minSize ) + this.defaults.minSize,
			speed: Math.random() * ( this.defaults.maxSpeed - this.defaults.minSpeed ) + this.defaults.minSpeed,
			drift: Math.random() * 2 - 1,
			step: 0
		};
	}

	update() {
		for ( let i = 0; i < this.flakes.length; i++ ) {
			const f = this.flakes[ i ];
			f.y += f.speed;
			f.step += 0.01;
			f.x += Math.sin( f.step ) * f.drift;

			if ( f.y > this.height ) {
				f.y = -f.r;
				f.x = Math.random() * this.width;
			}
		}
	}

	draw() {
		const ctx = this.ctx;
		const { type, color } = this.defaults;

		ctx.clearRect( 0, 0, this.width, this.height );
		ctx.beginPath();

		let drawMethod;

		if ( type === 'dot' ) {
			drawMethod = ( f ) => {
				ctx.moveTo( f.x + f.r, f.y );
				ctx.arc( f.x, f.y, f.r, 0, 6.28 );
			};
		} else if ( type === 'star' ) {
			drawMethod = ( f ) => this.drawStar( ctx, f.x, f.y, f.r );
		} else {
			drawMethod = ( f ) => this.drawLines( ctx, f.x, f.y, f.r );
		}

		for ( let i = 0; i < this.flakes.length; i++ ) {
			drawMethod( this.flakes[ i ] );
		}

		// 3. ФИНАЛЬНЫЙ СТРОК ИЛИ ФИЛЛ
		if ( type === 'lines' ) {
			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.stroke();
		} else {
			ctx.fillStyle = color;
			ctx.fill();
		}
	}

	drawLines( ctx, x, y, r ) {
		ctx.moveTo( x, y - r );
		ctx.lineTo( x, y + r );
		const c = r * 0.866,
			s = r * 0.5;
		ctx.moveTo( x - c, y - s );
		ctx.lineTo( x + c, y + s );
		ctx.moveTo( x + c, y - s );
		ctx.lineTo( x - c, y + s );
	}

	drawStar( ctx, x, y, r ) {
		const innerRadius = r * 0.4;
		const spikes = 8;
		const step = Math.PI / spikes;
		let rotation = -Math.PI / 2;
		ctx.moveTo( x, y - r );

		for ( let i = 0; i < spikes; i++ ) {
			// Внешняя точка
			let px = x + Math.cos( rotation ) * r;
			let py = y + Math.sin( rotation ) * r;
			ctx.lineTo( px, py );
			rotation += step;

			// Внутренняя точка
			px = x + Math.cos( rotation ) * innerRadius;
			py = y + Math.sin( rotation ) * innerRadius;
			ctx.lineTo( px, py );
			rotation += step;
		}
		ctx.lineTo( x, y - r );
		ctx.closePath();
	}

	render() {
		if ( ! this.isRendering ) {
			return;
		}
		this.update();
		this.draw();
		this.animationId = requestAnimationFrame( () => this.render() );
	}

	destroy() {
		cancelAnimationFrame( this.animationId );

		window.removeEventListener( 'resize', this.resizeHandler );
		document.removeEventListener( 'visibilitychange', this.visibilityHandler );

		if ( this.canvas && this.canvas.parentNode ) {
			this.canvas.parentNode.removeChild( this.canvas );
		}

		this.flakes = [];
		this.ctx = null;

		Snowfall.#instance = null;
	}
}

if ( document.readyState === 'complete' || document.readyState === 'interactive' ) {
	window.snowInstance = Snowfall.boot();
} else {
	document.addEventListener( 'DOMContentLoaded', () => {
		window.snowInstance = Snowfall.boot();
	} );
}

