import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Mismo patron de nodos que components/Logo.tsx y app/icon.tsx, escalado a este
// badge de 56x56 - consistencia de marca en las 3 superficies.
const NODES: { x: number; y: number; d: number; o: number }[] = [
  { x: 28, y: 28, d: 7.3, o: 0.95 },
  { x: 28, y: 12.6, d: 4.8, o: 0.85 },
  { x: 37.8, y: 17.5, d: 4.2, o: 0.75 },
  { x: 42, y: 28, d: 4.8, o: 0.85 },
  { x: 35.7, y: 38.5, d: 4.2, o: 0.75 },
  { x: 28, y: 42, d: 4.8, o: 0.85 },
  { x: 20.3, y: 38.5, d: 4.2, o: 0.75 },
  { x: 14, y: 28, d: 4.8, o: 0.85 },
  { x: 18.2, y: 17.5, d: 4.2, o: 0.75 },
];

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'radial-gradient(120% 140% at 15% -10%, #3a2a6b 0%, #241a47 45%, #150f2c 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              position: 'relative',
              width: 56,
              height: 56,
              borderRadius: 16,
              display: 'flex',
              background: 'linear-gradient(135deg, #FF5A7A 0%, #FF8A5B 55%, #6A4CFF 100%)',
            }}
          >
            {NODES.map((n, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: n.x - n.d / 2,
                  top: n.y - n.d / 2,
                  width: n.d,
                  height: n.d,
                  borderRadius: '50%',
                  background: `rgba(255,255,255,${n.o})`,
                  display: 'flex',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>AIdmin</span>
        </div>
        <div style={{ display: 'flex', fontSize: 56, fontWeight: 700, color: 'white', marginTop: 40, maxWidth: 920, lineHeight: 1.15 }}>
          Un equipo directivo que nunca duerme
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.7)', marginTop: 24, maxWidth: 820 }}>
          6 gerentes de inteligencia artificial trabajando todos los días en tu pyme
        </div>
      </div>
    ),
    { ...size },
  );
}
