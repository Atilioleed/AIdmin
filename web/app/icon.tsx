import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

// Mismos 9 nodos que components/Logo.tsx (cerebro hecho de nodos conectados),
// escalados a este lienzo de 64x64. Solo los puntos (sin lineas) - a tamano de
// favicon las lineas finas desaparecen, los nodos solos ya leen como "red/cluster".
const NODES: { x: number; y: number; d: number; o: number }[] = [
  { x: 32, y: 32, d: 8.3, o: 0.95 }, // centro
  { x: 32, y: 14.4, d: 5.4, o: 0.85 },
  { x: 43.2, y: 20, d: 4.8, o: 0.75 },
  { x: 48, y: 32, d: 5.4, o: 0.85 },
  { x: 40.8, y: 44, d: 4.8, o: 0.75 },
  { x: 32, y: 48, d: 5.4, o: 0.85 },
  { x: 23.2, y: 44, d: 4.8, o: 0.75 },
  { x: 16, y: 32, d: 5.4, o: 0.85 },
  { x: 20.8, y: 20, d: 4.8, o: 0.75 },
];

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          borderRadius: 18,
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
    ),
    { ...size },
  );
}
