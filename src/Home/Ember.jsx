import "../styles/ember.scss"

export default function Embers() {
    const embers = Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,       // % across screen
        size: 2 + Math.random() * 3,      // px radius
        duration: 3 + Math.random() * 3,  // seconds
        delay: Math.random() * 4,         // seconds
        driftX: (Math.random() - 0.5) * 40,
        color: ['#f97316','#fb923c','#fbbf24','#fde047'][Math.floor(Math.random()*4)],
    }));

    return (
        <>
            <div id={"ember"}></div>
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
                {embers.map(e => (
                    <div key={e.id} style={{
                        position: 'absolute',
                        bottom: '-10px',
                        left: `${e.x}%`,
                        width: e.size, height: e.size,
                        borderRadius: '50%',
                        background: e.color,
                        filter: 'blur(0.5px)',
                        animation: `ember-rise ${e.duration}s ${e.delay}s infinite ease-in`,
                        '--drift': `${e.driftX}px`,
                    }} />
                ))}
                <style>{`
                @keyframes ember-rise {
                    0%   { transform: translateY(0)     translateX(0)                opacity: 0; }
                    10%  { opacity: 1; }
                    60%  { transform: translateY(-55vh) translateX(var(--drift));     opacity: 0.7; }
                    100% { transform: translateY(-100vh) translateX(calc(var(--drift) * 1.5)); opacity: 0; }
                }
            `}</style>
            </div>
        </>
    );
}