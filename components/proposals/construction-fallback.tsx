/** Code-native architectural plate: also works without JavaScript or WebGL. */
export function ConstructionFallback({
  complete = false,
}: {
  complete?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1000 700"
      fill="none"
      role="img"
      aria-label={
        complete
          ? "Edificio contemporáneo terminado, con galería acristalada y jardín"
          : "Terreno arquitectónico con líneas de replanteo"
      }
    >
      <defs>
        <linearGradient
          id={`site-${complete}`}
          x1="200"
          y1="250"
          x2="800"
          y2="650"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#405457" />
          <stop offset="1" stopColor="#1e3034" />
        </linearGradient>
        <linearGradient
          id={`glass-${complete}`}
          x1="300"
          y1="150"
          x2="500"
          y2="480"
        >
          <stop stopColor="#acc4c8" />
          <stop offset="1" stopColor="#435e64" />
        </linearGradient>
        <linearGradient
          id={`stone-${complete}`}
          x1="250"
          y1="100"
          x2="650"
          y2="450"
        >
          <stop stopColor="#ded4b9" />
          <stop offset="1" stopColor="#8d968b" />
        </linearGradient>
      </defs>
      <ellipse
        cx="525"
        cy="530"
        rx="370"
        ry="110"
        fill="#050c10"
        opacity=".45"
      />
      <path
        d="M100 431 479 244 910 448 535 652Z"
        fill={`url(#site-${complete})`}
        stroke="#637572"
        strokeWidth="1"
      />
      <path d="M100 431v24l435 220 375-202v-25L535 652Z" fill="#203238" />
      <g stroke="#8ab1ad" strokeWidth="1" opacity=".6">
        <path d="m220 423 260-129 300 146-260 139Z" />
        <path d="m350 358 300 149m-260 6 258-137M220 423l300 156m-33-283v278" />
      </g>
      {complete && (
        <>
          <path d="m246 402 226-114 268 127-224 118Z" fill="#b0b6a3" />
          <path d="M246 402V237l226-112v163Z" fill="#63756d" />
          <path
            d="m246 237 226-112 268 128-224 116Z"
            fill={`url(#stone-${complete})`}
          />
          <path
            d="M246 237v165l270 131V369Z"
            fill={`url(#glass-${complete})`}
          />
          <path d="M516 369v164l224-118V253Z" fill="#697d7b" />
          <path
            d="m241 322 275 134 231-120v18L516 475 241 340Z"
            fill="#b9bda8"
          />
          <path
            d="m241 237 275 134 231-120v18L516 390 241 255Z"
            fill="#d6cfb6"
          />
          <g stroke="#d1c5a4" strokeWidth="5">
            <path d="M298 263v164m53-137v164m54-136v165m55-137v165" />
          </g>
          <path d="m577 502 110-57 137 66-112 59Z" fill="#c0bea7" />
          <path d="M577 502v-98l135 65v101Z" fill="#b2b39e" />
          <path d="M712 469v101l112-59v-98Z" fill="#74877f" />
          <path d="m570 402 113-57 148 70-118 64Z" fill="#d4cdb5" />
          <g stroke="#82735b" strokeWidth="3">
            <path d="M283 260v69m13-63v69m13-63v69m13-63v69m13-63v69" />
          </g>
          {[
            [210, 440],
            [793, 485],
            [465, 571],
          ].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x} ${y}v-57`} stroke="#8b846c" strokeWidth="5" />
              <ellipse cx={x} cy={y - 61} rx="24" ry="21" fill="#687b62" />
              <ellipse cx={x - 14} cy={y - 52} rx="18" ry="17" fill="#485f50" />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}
