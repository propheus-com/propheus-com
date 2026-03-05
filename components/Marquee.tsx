'use client';

export default function Marquee() {
    const items = [
        'PHYSICAL AI',
        'RETAIL',
        'INFRASTRUCTURE',
        'LOGISTICS',
        'EDGE INFERENCE',
        'ROBOTICS',
        'AUTOMATION',
    ];

    // Build the repeating track with bullet separators
    const track = [...items, ...items, ...items];

    return (
        <div className="marquee-container">
            <div className="marquee-track">
                {track.map((item, index) => (
                    <span key={index} className="marquee-item">
                        {item}
                        <span style={{ margin: '0 1.5rem', opacity: 0.4 }}>•</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
