interface BeninFlagProps {
  className?: string;
}

export default function BeninFlag({ className = "w-16 h-12" }: BeninFlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 220"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <defs>
        {/* Ombre douce */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dx="3" dy="5" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Clip path pour le drapeau ondulé */}
        <clipPath id="flagShape">
          <path
            d="M 20,40
               Q 90,10 160,45
               T 290,50
               L 285,175
               Q 215,205 145,170
               T 15,165
               Z"
          />
        </clipPath>

        {/* Dégradés pour effet 3D subtil */}
        <linearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00a566" />
          <stop offset="50%" stopColor="#008751" />
          <stop offset="100%" stopColor="#006b3f" />
        </linearGradient>

        <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD93D" />
          <stop offset="50%" stopColor="#FCD116" />
          <stop offset="100%" stopColor="#E5BC00" />
        </linearGradient>

        <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF2C42" />
          <stop offset="50%" stopColor="#E8112D" />
          <stop offset="100%" stopColor="#C10E27" />
        </linearGradient>
      </defs>

      {/* Groupe drapeau avec ombre */}
      <g filter="url(#shadow)">
        {/* Fond du drapeau (couleurs) */}
        <g clipPath="url(#flagShape)">
          {/* Bande verte (gauche - 40%) */}
          <rect x="0" y="0" width="120" height="220" fill="url(#greenGrad)" />
          {/* Bande jaune (haut droit - 60% x 50%) */}
          <rect x="120" y="0" width="180" height="110" fill="url(#yellowGrad)" />
          {/* Bande rouge (bas droit - 60% x 50%) */}
          <rect x="120" y="110" width="180" height="110" fill="url(#redGrad)" />
        </g>

        {/* Bordure/contour du drapeau pour la finition */}
        <path
          d="M 20,40
             Q 90,10 160,45
             T 290,50
             L 285,175
             Q 215,205 145,170
             T 15,165
             Z"
          fill="none"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="1"
        />
      </g>

      {/* Effet brillance/lumière subtil */}
      <g clipPath="url(#flagShape)" opacity="0.15">
        <path
          d="M 20,40 Q 90,10 160,45 T 290,50 L 290,90 Q 155,60 20,80 Z"
          fill="white"
        />
      </g>
    </svg>
  );
}