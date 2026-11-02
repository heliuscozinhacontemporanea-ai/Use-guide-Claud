import { useId, useRef } from 'react';
import { cn } from '../../shared/utils/cn';
import { usePreaChoreography } from '../hooks/usePreaChoreography';
import './PreaWheel.css';

// Textura do pelo aguti: tracinhos escuros no dorso e pontas claras.
const FUR_DARK =
  'M48.0 86.1q1.3 -1.6 2.6 -1.0 M50.7 86.0q1.3 -1.6 2.6 -1.0 M53.3 83.7q1.3 -1.6 2.6 -1.0 M56.0 83.9q1.3 -1.6 2.6 -1.0 M58.7 81.8q1.3 -1.6 2.6 -1.0 M61.3 82.3q1.3 -1.6 2.6 -1.0 M64.0 80.7q1.3 -1.6 2.6 -1.0 M66.7 81.7q1.3 -1.6 2.6 -1.0 M69.3 80.9q1.3 -1.6 2.6 -1.0 M72.0 82.7q1.3 0.0 2.6 0.6 M74.7 82.2q1.3 0.0 2.6 0.6 M77.3 84.4q1.3 0.0 2.6 0.6 M80.0 84.2q1.3 0.0 2.6 0.6 M82.7 86.6q1.3 0.0 2.6 0.6 M85.3 86.7q1.3 0.0 2.6 0.6 M88.0 89.4q1.3 0.0 2.6 0.6';
const FUR_LIGHT =
  'M50.0 88.5q1.1 -0.9 2.2 -0.2 M53.3 88.5q1.1 -0.9 2.2 -0.2 M56.5 85.9q1.1 -0.9 2.2 -0.2 M59.8 86.4q1.1 -0.9 2.2 -0.2 M63.1 84.3q1.1 -0.9 2.2 -0.2 M66.4 85.4q1.1 -0.9 2.2 -0.2 M69.6 84.4q1.1 -0.9 2.2 -0.2 M72.9 86.5q1.1 -0.9 2.2 -0.2 M76.2 86.1q1.1 -0.9 2.2 -0.2 M79.5 88.6q1.1 -0.9 2.2 -0.2 M82.7 88.6q1.1 -0.9 2.2 -0.2 M86.0 91.5q1.1 -0.9 2.2 -0.2';

const SPOKES = [0, 60, 120, 180, 240, 300];

/**
 * Preá (Cavia aperea, o roedor que dá nome à Praia do Preá) correndo na roda, desenhado para a página
 * não encontrada. Decorativo: o texto da página diz o que aconteceu.
 */
export function PreaWheel({ className }: { className?: string }) {
  const rootRef = useRef<SVGSVGElement | null>(null);
  const phase = usePreaChoreography(rootRef);
  const id = useId().replace(/:/g, '');

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      data-phase={phase}
      className={cn('ug-prea-wheel shrink-0', className)}
    >
      <defs>
        <linearGradient id={`${id}-fur`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3a2c" />
          <stop offset="0.35" stopColor="#76604a" />
          <stop offset="0.72" stopColor="#a8896a" />
          <stop offset="1" stopColor="#d9c3a0" />
        </linearGradient>
        <linearGradient id={`${id}-head`} x1="0.2" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#55432f" />
          <stop offset="0.55" stopColor="#8a6f54" />
          <stop offset="1" stopColor="#c7ab86" />
        </linearGradient>
        <linearGradient id={`${id}-thigh`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6c5440" />
          <stop offset="1" stopColor="#a3866a" />
        </linearGradient>
        <clipPath id={`${id}-body`}>
          <path d="M42 99C40 88 49 79 63 78C77 77 89 83 90 94C91 102 85 107 76 107L50 107C45 107 42 104 42 99Z" />
        </clipPath>
      </defs>

      <circle className="ug-prea-wheel__rim" cx="60" cy="60" r="56" />
      <g className="ug-prea-wheel__spin">
        <circle className="ug-prea-wheel__track" cx="60" cy="60" r="51.5" />
        {SPOKES.map((angle) => (
          <line
            key={angle}
            className="ug-prea-wheel__spoke"
            x1="60"
            y1="60"
            x2="60"
            y2="9"
            transform={`rotate(${angle} 60 60)`}
          />
        ))}
        <circle className="ug-prea-wheel__hub" cx="60" cy="60" r="3.2" />
      </g>

      <ellipse className="ug-prea__shadow" cx="62" cy="109.5" rx="24" ry="1.8" />

      <g className="ug-prea__dust">
        <circle cx="86" cy="107" r="1.1" />
        <circle cx="84" cy="108" r="0.8" />
        <circle cx="88" cy="106.5" r="0.7" />
      </g>

      <g className="ug-prea">
        <g className="ug-prea__bob">
          {/* Patas do outro lado, mais escuras, atrás do corpo. */}
          <g className="ug-prea__leg ug-prea__leg--front ug-prea__leg--far">
            <path d="M47.5 97C47 101 47.5 104.5 48 106.2L45.6 107.6C44.8 108 45 108.9 46 108.9L51 108.9C52 108.9 52 107.7 51.4 106.8C51.6 103.5 52 100.5 51.8 97Z" />
          </g>
          <g className="ug-prea__leg ug-prea__leg--back ug-prea__leg--far">
            <path d="M70 103C69.5 105 70 106.8 71 107.6L67.6 108.4C66.6 108.8 66.9 109.6 67.9 109.6L75.4 109.6C76.6 109.6 76.6 108.4 75.8 107.6C76.3 106 76.4 104.6 76 103.4Z" />
          </g>

          <path
            className="ug-prea__body"
            fill={`url(#${id}-fur)`}
            d="M42 99C40 88 49 79 63 78C77 77 89 83 90 94C91 102 85 107 76 107L50 107C45 107 42 104 42 99Z"
          />
          <g clipPath={`url(#${id}-body)`}>
            <ellipse className="ug-prea__belly" cx="64" cy="105" rx="21" ry="4.6" />
            <path className="ug-prea__fur ug-prea__fur--dark" d={FUR_DARK} />
            <path className="ug-prea__fur ug-prea__fur--light" d={FUR_LIGHT} />
          </g>

          <g className="ug-prea__leg ug-prea__leg--back ug-prea__leg--near">
            <ellipse cx="77" cy="99" rx="9.5" ry="7.5" fill={`url(#${id}-thigh)`} />
            <path
              className="ug-prea__foot"
              d="M73.5 104C73 106 73.5 107.5 74.5 108.2L71 108.8C70 109.1 70.3 109.8 71.3 109.8L79 109.8C80.2 109.8 80.2 108.6 79.4 107.8C79.9 106.2 80 104.8 79.6 103.6Z"
            />
          </g>
          <g className="ug-prea__leg ug-prea__leg--front ug-prea__leg--near">
            <path
              className="ug-prea__foot"
              d="M44 97C43.5 101 44 104.5 44.6 106.2L42 107.6C41.2 108 41.4 108.9 42.4 108.9L47.6 108.9C48.6 108.9 48.6 107.7 48 106.8C48.2 103.5 48.6 100.5 48.4 97Z"
            />
            <path
              className="ug-prea__claws"
              d="M42.6 108.9l-0.6 0.6M44.2 108.9l-0.5 0.6M45.8 108.9l-0.4 0.6"
            />
          </g>

          <g className="ug-prea__head">
            <path
              fill={`url(#${id}-head)`}
              d="M54 84C50 78 40 77 34 81C30 84 28 88 28 92C28 96 31 98 35 99C41 101 49 100 53 97C56 94 57 88 54 84Z"
            />
            <ellipse className="ug-prea__cheek" cx="43" cy="94.5" rx="6.5" ry="3.6" />
            <ellipse className="ug-prea__muzzle" cx="31.6" cy="92.6" rx="3.7" ry="3.3" />
            <g className="ug-prea__ear">
              <path
                className="ug-prea__ear-outer"
                d="M47 80.5C45.5 75.5 50.5 73.5 53 77C54 79 51.5 81.5 47 80.5Z"
              />
              <path
                className="ug-prea__ear-inner"
                d="M48 79.6C47.4 76.6 50.6 75.6 51.9 77.6C52.3 78.8 50.6 80.2 48 79.6Z"
              />
            </g>
            <g className="ug-prea__eye">
              <circle className="ug-prea__eye-ring" cx="39.5" cy="86.8" r="3.1" />
              <circle className="ug-prea__eye-ball" cx="39.5" cy="86.8" r="2.4" />
              <circle className="ug-prea__eye-shine" cx="40.4" cy="85.9" r="0.75" />
            </g>
            <g className="ug-prea__snout">
              <path
                className="ug-prea__nose"
                d="M28.6 90.6c0.9-0.7 2.1-0.6 2.6 0.3c0.3 0.7-0.6 1.5-1.4 1.6c-0.8 0-1.6-1.1-1.2-1.9Z"
              />
              <path className="ug-prea__mouth" d="M30.2 94.2q1.2 1.4 2.8 0.6" />
              <path
                className="ug-prea__whiskers"
                d="M31 92.4L20.5 89M31 93L19.8 93M31 93.6L20.8 97.4M32 92.2L23.5 87.2"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
