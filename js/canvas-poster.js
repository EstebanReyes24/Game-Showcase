/**
 * Generador procedural de pósters y exportador de imagen Top 5
 */
const CanvasPoster = {
  // Genera un arte SVG procedimental en caso de no tener carátula
  generateSmartPoster(title) {
    const colors = ['#2e1065', '#1e1b4b', '#0f172a', '#172554', '#064e3b', '#450a0a'];
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bg = colors[Math.abs(hash) % colors.length];
    const displayTitle = title.length > 22 ? title.substring(0, 20) + '...' : title;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${bg}" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgGrad)" />
        <circle cx="150" cy="170" r="48" fill="rgba(255,255,255,0.06)" />
        <path d="M130 170 h40 M150 150 v40" stroke="rgba(255,255,255,0.4)" stroke-width="5" stroke-linecap="round" />
        <text x="150" y="270" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="#ffffff" text-anchor="middle">${displayTitle}</text>
        <text x="150" y="295" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#94a3b8" letter-spacing="2" text-anchor="middle">VIDEO GAME</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  },

  // Dibuja la tarjeta gráfica de los 5 mejores juegos
  drawTop5(canvas, games) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    // Fondo degradado
    const bgGrad = ctx.createRadialGradient(w * 0.8, 0, 50, w * 0.5, h * 0.5, w);
    bgGrad.addColorStop(0, "#1e1b4b");
    bgGrad.addColorStop(0.5, "#0b0e17");
    bgGrad.addColorStop(1, "#030712");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Título principal
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("MY ALL-TIME TOP 5 GAMES", 35, 45);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("Game Showcase • Personal Vault", 35, 68);

    const cardWidth = 135;
    const cardHeight = 200;
    const startX = 35;
    const startY = 100;
    const gap = 18;

    games.forEach((g, i) => {
      const x = startX + i * (cardWidth + gap);
      const y = startY;

      // Marco de la tarjeta
      ctx.fillStyle = "#161c2d";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, 12);
      ctx.fill();
      ctx.stroke();

      // Carga de imagen
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = g.coverUrl;
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, cardWidth, cardHeight - 50, [12, 12, 0, 0]);
        ctx.clip();
        ctx.drawImage(img, x, y, cardWidth, cardHeight - 50);
        ctx.restore();
      };

      // Nota
      ctx.fillStyle = "#000000dd";
      ctx.beginPath();
      ctx.roundRect(x + cardWidth - 45, y + 8, 38, 20, 6);
      ctx.fill();

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`★ ${g.rating.toFixed(1)}`, x + cardWidth - 40, y + 22);

      // Título
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      const shortTitle = g.title.length > 15 ? g.title.slice(0, 14) + "..." : g.title;
      ctx.fillText(shortTitle, x + 8, y + cardHeight - 28);

      // Puesto y consola
      ctx.fillStyle = "#818cf8";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(`#${i + 1} • ${(g.platforms || ['PC'])[0]}`, x + 8, y + cardHeight - 12);
    });
  }
};