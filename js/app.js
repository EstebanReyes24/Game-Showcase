/**
 * Controlador Principal de la Aplicación
 */
let currentSelectedCover = "";
let activeStatus = "completed";
let activePlatforms = ["PC"];
let isFavorite = false;
let editingGameId = null;
let currentFilter = "all";
let activeModalGameId = null;

// Elementos DOM
const gameSearch = document.getElementById("gameSearch");
const searchBtn = document.getElementById("searchBtn");
const searchBtnText = document.getElementById("searchBtnText");
const searchIcon = document.getElementById("searchIcon");
const searchResults = document.getElementById("searchResults");
const coverPreview = document.getElementById("coverPreview");
const posterIcon = document.getElementById("posterIcon");
const coverStatusText = document.getElementById("coverStatusText");
const manualCoverBtn = document.getElementById("manualCoverBtn");
const scoreRange = document.getElementById("scoreRange");
const scoreDisplay = document.getElementById("scoreDisplay");
const gameHours = document.getElementById("gameHours");
const gameTags = document.getElementById("gameTags");
const gameNotes = document.getElementById("gameNotes");
const favoriteToggleBtn = document.getElementById("favoriteToggleBtn");
const favText = document.getElementById("favText");
const saveGameBtn = document.getElementById("saveGameBtn");
const saveBtnText = document.getElementById("saveBtnText");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const formIconBox = document.getElementById("formIconBox");
const formIcon = document.getElementById("formIcon");
const gamesGrid = document.getElementById("gamesGrid");
const filterInput = document.getElementById("filterInput");
const sortBySelect = document.getElementById("sortBySelect");

// Now Playing
const nowPlayingSection = document.getElementById("nowPlayingSection");
const npCover = document.getElementById("npCover");
const npTitle = document.getElementById("npTitle");
const npMeta = document.getElementById("npMeta");
const npActionBtn = document.getElementById("npActionBtn");

// 1. Selector de Estado
const statusBtns = document.querySelectorAll(".status-btn");
function setStatus(val) {
  activeStatus = val;
  statusBtns.forEach(btn => {
    if (btn.dataset.val === val) {
      btn.className = "status-btn p-2 rounded-xl border border-indigo-500 bg-indigo-500/20 text-white text-center font-bold text-xs shadow-lg shadow-indigo-500/20 transition";
    } else {
      btn.className = "status-btn p-2 rounded-xl border border-slate-700/80 bg-[#121623]/80 text-slate-400 text-center font-bold text-xs hover:border-slate-600 transition";
    }
  });
}
statusBtns.forEach(btn => {
  btn.addEventListener("click", () => setStatus(btn.dataset.val));
});

// 2. Selector de Plataformas
const platBtns = document.querySelectorAll(".plat-btn");
platBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const plat = btn.dataset.platform;
    if (activePlatforms.includes(plat)) {
      if (activePlatforms.length > 1) {
        activePlatforms = activePlatforms.filter(p => p !== plat);
        btn.className = "plat-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 bg-[#121623]/80 text-slate-300 hover:border-slate-500 transition flex items-center gap-1.5";
      }
    } else {
      activePlatforms.push(plat);
      btn.className = "plat-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-indigo-500 bg-indigo-500/20 text-white transition flex items-center gap-1.5 shadow-sm";
    }
  });
});

function setPlatformBadges(plats) {
  activePlatforms = plats && plats.length ? plats : ["PC"];
  platBtns.forEach(btn => {
    if (activePlatforms.includes(btn.dataset.platform)) {
      btn.className = "plat-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-indigo-500 bg-indigo-500/20 text-white transition flex items-center gap-1.5 shadow-sm";
    } else {
      btn.className = "plat-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 bg-[#121623]/80 text-slate-300 hover:border-slate-500 transition flex items-center gap-1.5";
    }
  });
}

// 3. Toggle Favorito
favoriteToggleBtn.addEventListener("click", () => {
  isFavorite = !isFavorite;
  updateFavoriteUI();
});

function updateFavoriteUI() {
  if (isFavorite) {
    favoriteToggleBtn.className = "w-full sm:w-auto px-4 py-2 rounded-xl border border-amber-500 bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 text-xs font-bold";
    favText.innerText = "¡Es Favorito!";
  } else {
    favoriteToggleBtn.className = "w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-700 bg-[#121623] text-slate-400 hover:border-amber-500/50 hover:text-amber-400 transition flex items-center justify-center gap-2 text-xs font-bold";
    favText.innerText = "Marcar como Favorito";
  }
}

// 4. Slider de Puntuación con Feedback de Color Dinámico
scoreRange.addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  scoreDisplay.innerText = val.toFixed(1);

  if (val >= 9.0) {
    scoreDisplay.className = "text-base font-extrabold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]";
  } else if (val >= 7.0) {
    scoreDisplay.className = "text-base font-extrabold text-indigo-400";
  } else if (val >= 5.0) {
    scoreDisplay.className = "text-base font-extrabold text-slate-300";
  } else {
    scoreDisplay.className = "text-base font-extrabold text-rose-400";
  }
});

// 5. Portada Manual
manualCoverBtn.addEventListener("click", () => {
  const url = prompt("Pega aquí el enlace de la imagen:");
  if (url && url.trim().startsWith("http")) {
    currentSelectedCover = url.trim();
    coverPreview.src = currentSelectedCover;
    coverPreview.classList.remove("hidden");
    posterIcon.classList.add("hidden");
    coverStatusText.innerText = "Portada manual lista";
  }
});

// 6. Búsqueda de Carátulas
function onSearchTrigger() {
  const term = gameSearch.value.trim();
  if (term.length < 2) return;

  searchIcon.className = "fa-solid fa-spinner fa-spin";
  searchBtnText.innerText = "...";

  SearchEngine.search(term, (items) => {
    searchIcon.className = "fa-solid fa-magnifying-glass";
    searchBtnText.innerText = "Buscar";
    renderSearchResults(items, term);
  });
}

function renderSearchResults(items, originalQuery) {
  searchResults.innerHTML = "";

  const directLi = document.createElement("li");
  directLi.className = "flex items-center gap-3 p-3 bg-indigo-950/60 hover:bg-indigo-900/80 cursor-pointer transition text-indigo-300 font-semibold text-xs border-b border-slate-800/80";
  directLi.innerHTML = `<i class="fa-solid fa-check-circle"></i> Usar "${originalQuery}" directamente`;
  directLi.addEventListener("click", () => {
    gameSearch.value = originalQuery;
    currentSelectedCover = CanvasPoster.generateSmartPoster(originalQuery);
    coverPreview.src = currentSelectedCover;
    coverPreview.classList.remove("hidden");
    posterIcon.classList.add("hidden");
    coverStatusText.innerText = originalQuery;
    searchResults.classList.add("hidden");
  });
  searchResults.appendChild(directLi);

  items.forEach(item => {
    const li = document.createElement("li");
    li.className = "flex items-center gap-3 p-2.5 hover:bg-slate-800/90 cursor-pointer transition";
    const thumb = item.image || CanvasPoster.generateSmartPoster(item.title);
    li.innerHTML = `
      <img src="${thumb}" class="w-10 h-14 object-cover rounded-lg shadow-md shrink-0 bg-slate-950">
      <div class="overflow-hidden">
        <p class="text-xs font-bold text-white truncate">${item.title}</p>
        <p class="text-[11px] text-slate-400 mt-0.5 truncate">${item.desc}</p>
      </div>
    `;
    li.addEventListener("click", () => {
      gameSearch.value = item.title;
      currentSelectedCover = item.image || CanvasPoster.generateSmartPoster(item.title);
      coverPreview.src = currentSelectedCover;
      coverPreview.classList.remove("hidden");
      posterIcon.classList.add("hidden");
      coverStatusText.innerText = item.title;
      searchResults.classList.add("hidden");
    });
    searchResults.appendChild(li);
  });

  searchResults.classList.remove("hidden");
}

searchBtn.addEventListener("click", onSearchTrigger);
gameSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    onSearchTrigger();
  }
});

let debounceTimer;
gameSearch.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  const val = e.target.value.trim();
  if (val.length >= 2) {
    debounceTimer = setTimeout(onSearchTrigger, 350);
  } else {
    searchResults.classList.add("hidden");
  }
});

document.addEventListener("click", (e) => {
  if (!gameSearch.contains(e.target) && !searchResults.contains(e.target) && !searchBtn.contains(e.target)) {
    searchResults.classList.add("hidden");
  }
});

// 7. Modo Edición y Reset
function resetForm() {
  editingGameId = null;
  formTitle.innerText = "Añadir Título";
  formSubtitle.innerText = "Registra un juego completado, en proceso o en pausa";
  formIconBox.className = "w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 text-lg";
  formIcon.className = "fa-solid fa-plus";
  saveBtnText.innerText = "Guardar en mi estante";
  cancelEditBtn.classList.add("hidden");

  gameSearch.value = "";
  currentSelectedCover = "";
  coverPreview.classList.add("hidden");
  posterIcon.classList.remove("hidden");
  coverStatusText.innerText = "Sin carátula (se genera al guardar)";
  setStatus("completed");
  setPlatformBadges(["PC"]);
  isFavorite = false;
  updateFavoriteUI();
  scoreRange.value = 9;
  scoreDisplay.innerText = "9.0";
  scoreDisplay.className = "text-base font-extrabold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]";
  gameHours.value = "";
  gameTags.value = "";
  gameNotes.value = "";
}

cancelEditBtn.addEventListener("click", resetForm);

function startEditGame(game) {
  editingGameId = game.id;
  formTitle.innerText = `Editando: ${game.title}`;
  formSubtitle.innerText = "Modifica los datos y pulsa Actualizar registro";
  formIconBox.className = "w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 text-lg";
  formIcon.className = "fa-solid fa-pen";
  saveBtnText.innerText = "Actualizar registro";
  cancelEditBtn.classList.remove("hidden");

  gameSearch.value = game.title;
  currentSelectedCover = game.coverUrl;
  coverPreview.src = game.coverUrl;
  coverPreview.classList.remove("hidden");
  posterIcon.classList.add("hidden");
  coverStatusText.innerText = game.title;

  setStatus(game.status || "completed");
  setPlatformBadges(game.platforms || ["PC"]);
  isFavorite = !!game.favorite;
  updateFavoriteUI();

  scoreRange.value = game.rating || 8;
  scoreDisplay.innerText = (game.rating || 8).toFixed(1);
  gameHours.value = game.hours || "";
  gameTags.value = (game.tags || []).join(", ");
  gameNotes.value = game.notes || "";

  document.getElementById("formSection").scrollIntoView({ behavior: 'smooth' });
}

// 8. Guardar / Actualizar
saveGameBtn.addEventListener("click", () => {
  const title = gameSearch.value.trim();
  if (!title) {
    alert("Por favor escribe el nombre del videojuego.");
    gameSearch.focus();
    return;
  }

  const finalCover = currentSelectedCover || CanvasPoster.generateSmartPoster(title);
  const parsedTags = gameTags.value
    .split(",")
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .map(t => t.startsWith("#") ? t : "#" + t);

  const gameData = {
    title: title,
    coverUrl: finalCover,
    status: activeStatus,
    platforms: [...activePlatforms],
    rating: parseFloat(scoreRange.value),
    hours: parseInt(gameHours.value, 10) || 0,
    favorite: isFavorite,
    tags: parsedTags,
    notes: gameNotes.value.trim()
  };

  if (editingGameId) {
    StorageManager.updateGame(editingGameId, gameData);
  } else {
    StorageManager.addGame({ id: Date.now(), ...gameData });
  }

  renderLibrary();
  resetForm();
});

// 9. Filtros y Ordenamiento
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => {
      b.className = "filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#141824] text-slate-400 border border-slate-800 hover:border-slate-700 transition";
    });
    btn.className = "filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition";
    currentFilter = btn.dataset.filter;
    renderLibrary();
  });
});

filterInput.addEventListener("input", () => renderLibrary());
sortBySelect.addEventListener("change", () => renderLibrary());

// 10. Renderizado de Biblioteca (Cards visualmente pulidas)
function renderLibrary() {
  const lib = StorageManager.getGames();
  const term = filterInput.value.toLowerCase().trim();
  const sortBy = sortBySelect.value;

  const playingCount = lib.filter(g => g.status === 'playing').length;
  const completedCount = lib.filter(g => g.status === 'completed' || g.status === 'extras' || g.status === 'platinum').length;
  const platinumCount = lib.filter(g => g.status === 'platinum').length;
  const totalHours = lib.reduce((acc, g) => acc + (g.hours || 0), 0);

  document.getElementById("statPlaying").innerText = playingCount;
  document.getElementById("statCompleted").innerText = completedCount;
  document.getElementById("statPlatinum").innerText = platinumCount;
  document.getElementById("statHours").innerText = totalHours > 0 ? `${totalHours}h` : "0h";

  if (lib.length > 0) {
    const avg = lib.reduce((acc, g) => acc + g.rating, 0) / lib.length;
    document.getElementById("statAvg").innerText = avg.toFixed(1);
  } else {
    document.getElementById("statAvg").innerText = "0.0";
  }

  const currentPlayingGame = lib.find(g => g.status === 'playing');
  if (currentPlayingGame) {
    npCover.src = currentPlayingGame.coverUrl;
    npTitle.innerText = currentPlayingGame.title;
    npMeta.innerText = `${(currentPlayingGame.platforms || []).join(", ")} • ${currentPlayingGame.hours || 0} hrs dedicadas`;
    nowPlayingSection.classList.remove("hidden");
    npActionBtn.onclick = () => startEditGame(currentPlayingGame);
  } else {
    nowPlayingSection.classList.add("hidden");
  }

  let filtered = [...lib];
  if (currentFilter !== "all") {
    if (currentFilter === "favorite") {
      filtered = filtered.filter(g => g.favorite);
    } else if (currentFilter === "completed") {
      filtered = filtered.filter(g => g.status === 'completed' || g.status === 'extras' || g.status === 'platinum');
    } else {
      filtered = filtered.filter(g => g.status === currentFilter);
    }
  }

  if (term) {
    filtered = filtered.filter(g => 
      g.title.toLowerCase().includes(term) || 
      (g.platforms && g.platforms.some(p => p.toLowerCase().includes(term))) ||
      (g.tags && g.tags.some(t => t.toLowerCase().includes(term)))
    );
  }

  if (sortBy === 'rating-desc') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'rating-asc') {
    filtered.sort((a, b) => a.rating - b.rating);
  } else if (sortBy === 'hours-desc') {
    filtered.sort((a, b) => (b.hours || 0) - (a.hours || 0));
  } else if (sortBy === 'title-asc') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    filtered.sort((a, b) => b.id - a.id);
  }

  gamesGrid.innerHTML = "";

  if (filtered.length === 0) {
    gamesGrid.innerHTML = `
      <div class="col-span-full py-20 text-center glass rounded-3xl border border-slate-800/80">
        <i class="fa-solid fa-gamepad text-5xl text-slate-600 mb-3 block"></i>
        <p class="text-sm font-semibold text-slate-400">No hay juegos en esta vista.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(game => {
    const card = document.createElement("div");
    card.className = "glass-card game-card-hover rounded-2xl overflow-hidden flex flex-col group cursor-pointer relative shadow-xl";

    let badgeHtml = '';
    if (game.status === 'playing') {
      badgeHtml = `<span class="badge-playing text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1"><i class="fa-solid fa-fire text-orange-400"></i> Jugando</span>`;
    } else if (game.status === 'platinum') {
      badgeHtml = `<span class="badge-platinum text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1"><i class="fa-solid fa-trophy text-amber-400"></i> 100%</span>`;
    } else if (game.status === 'extras') {
      badgeHtml = `<span class="badge-extras text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><i class="fa-solid fa-star-half-stroke text-indigo-300"></i> Extras</span>`;
    } else if (game.status === 'onhold') {
      badgeHtml = `<span class="badge-onhold text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><i class="fa-solid fa-pause"></i> En Pausa</span>`;
    } else {
      badgeHtml = `<span class="badge-completed text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><i class="fa-solid fa-check"></i> Pasado</span>`;
    }

    const favBadge = game.favorite ? `<div class="absolute top-2.5 right-12 z-10 w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xs shadow-md backdrop-blur-sm"><i class="fa-solid fa-crown text-[11px]"></i></div>` : '';

    const platformIcons = (game.platforms || []).map(p => {
      if (p === 'PC') return '<i class="fa-brands fa-windows text-blue-400" title="PC"></i>';
      if (p === 'PlayStation') return '<i class="fa-brands fa-playstation text-blue-500" title="PlayStation"></i>';
      if (p === 'Xbox') return '<i class="fa-brands fa-xbox text-emerald-400" title="Xbox"></i>';
      if (p === 'Nintendo') return '<i class="fa-solid fa-gamepad text-red-400" title="Nintendo"></i>';
      return '<i class="fa-solid fa-ghost text-purple-400" title="Retro"></i>';
    }).join(" ");

    const hoursDisplay = game.hours ? `<span class="text-[10px] text-slate-300 font-semibold bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10"><i class="fa-regular fa-clock mr-1 text-slate-400"></i>${game.hours}h</span>` : '';

    card.innerHTML = `
      <div class="relative aspect-[3/4] overflow-hidden bg-slate-950 poster-sheen">
        <img src="${game.coverUrl}" alt="${game.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='${CanvasPoster.generateSmartPoster(game.title)}'">
        
        <div class="absolute top-2.5 left-2.5 z-10">
          ${badgeHtml}
        </div>

        ${favBadge}

        <div class="absolute top-2.5 right-2.5 z-10 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/15 text-amber-400 font-black text-xs flex items-center gap-1 shadow-lg">
          <i class="fa-solid fa-star text-[10px]"></i> ${game.rating.toFixed(1)}
        </div>

        <div class="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex justify-between items-center text-xs drop-shadow-md">
          <div class="flex gap-2">${platformIcons}</div>
          ${hoursDisplay}
        </div>
      </div>

      <div class="p-3.5 flex flex-col justify-between flex-1 gap-2 bg-gradient-to-b from-[#121623]/90 to-[#0e111c]">
        <div>
          <h3 class="font-bold text-xs sm:text-sm text-slate-100 line-clamp-1 group-hover:text-indigo-300 transition" title="${game.title}">${game.title}</h3>
          ${game.tags && game.tags.length ? `
            <div class="flex flex-wrap gap-1 mt-1.5">
              ${game.tags.slice(0, 2).map(t => `<span class="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/20 text-indigo-300 font-medium">${t}</span>`).join(" ")}
            </div>
          ` : ''}
        </div>
        ${game.notes ? `<p class="text-[11px] text-slate-400 line-clamp-2 italic bg-[#0a0d16] p-2 rounded-lg border border-slate-800/60">"${game.notes}"</p>` : ''}
      </div>
    `;

    card.addEventListener("click", () => openDetailModal(game));
    gamesGrid.appendChild(card);
  });
}

// 11. Modal Detalle
const detailModal = document.getElementById("detailModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalCover = document.getElementById("modalCover");
const modalCoverThumb = document.getElementById("modalCoverThumb");
const modalTitle = document.getElementById("modalTitle");
const modalBadges = document.getElementById("modalBadges");
const modalReview = document.getElementById("modalReview");
const modalRating = document.getElementById("modalRating");
const modalTagsContainer = document.getElementById("modalTagsContainer");
const modalEditBtn = document.getElementById("modalEditBtn");
const modalDeleteBtn = document.getElementById("modalDeleteBtn");

function openDetailModal(game) {
  activeModalGameId = game.id;
  modalCover.src = game.coverUrl;
  modalCoverThumb.src = game.coverUrl;
  modalTitle.innerText = game.title;
  modalRating.innerText = game.rating.toFixed(1);
  modalReview.innerText = game.notes || "Sin reseña escrita.";

  let statusBadge = game.status === 'playing' ? '🔥 Jugando actualmente' : 
                    (game.status === 'platinum' ? '🏆 Platinado / 100%' : 
                    (game.status === 'extras' ? '⭐ Campaña + Extras' : 
                    (game.status === 'onhold' ? '⏸️ En Pausa' : '✅ Historia Principal')));

  modalBadges.innerHTML = `
    <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[11px] border border-indigo-500/30">${statusBadge}</span>
    <span class="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px]">${(game.platforms || []).join(", ")}</span>
    ${game.hours ? `<span class="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px]"><i class="fa-regular fa-clock mr-1"></i>${game.hours}h</span>` : ''}
  `;

  if (game.tags && game.tags.length) {
    modalTagsContainer.innerHTML = game.tags.map(t => `<span class="text-[10px] px-2 py-0.5 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 rounded-md font-medium">${t}</span>`).join(" ");
  } else {
    modalTagsContainer.innerHTML = '';
  }

  detailModal.classList.remove("hidden");
}

closeModalBtn.addEventListener("click", () => detailModal.classList.add("hidden"));
detailModal.addEventListener("click", (e) => {
  if (e.target === detailModal) detailModal.classList.add("hidden");
});

modalEditBtn.addEventListener("click", () => {
  const lib = StorageManager.getGames();
  const target = lib.find(g => g.id === activeModalGameId);
  if (target) {
    detailModal.classList.add("hidden");
    startEditGame(target);
  }
});

modalDeleteBtn.addEventListener("click", () => {
  if (confirm("¿Seguro que deseas eliminar este juego de tu colección?")) {
    StorageManager.deleteGame(activeModalGameId);
    renderLibrary();
    detailModal.classList.add("hidden");
  }
});

// 12. Modal Stats
const statsModal = document.getElementById("statsModal");
const openStatsBtn = document.getElementById("openStatsBtn");
const closeStatsModalBtn = document.getElementById("closeStatsModalBtn");

openStatsBtn.addEventListener("click", () => {
  const lib = StorageManager.getGames();
  if (lib.length === 0) {
    alert("Agrega algunos juegos primero para ver las estadísticas.");
    return;
  }

  const completed = lib.filter(g => ['completed', 'extras', 'platinum'].includes(g.status)).length;
  const rate = Math.round((completed / lib.length) * 100);
  document.getElementById("statCompletionRate").innerText = `${rate}%`;

  const gamesWithHours = lib.filter(g => g.hours && g.hours > 0);
  const avgHours = gamesWithHours.length ? Math.round(gamesWithHours.reduce((acc, g) => acc + g.hours, 0) / gamesWithHours.length) : 0;
  document.getElementById("statAvgHours").innerText = `${avgHours}h`;

  const masters = lib.filter(g => g.rating >= 9).length;
  document.getElementById("statMasterpieces").innerText = masters;

  const platCounts = {};
  lib.forEach(g => {
    (g.platforms || []).forEach(p => {
      platCounts[p] = (platCounts[p] || 0) + 1;
    });
  });
  let topPlat = "-";
  let topCount = 0;
  for (const [p, count] of Object.entries(platCounts)) {
    if (count > topCount) {
      topCount = count;
      topPlat = p;
    }
  }
  document.getElementById("statTopPlatform").innerText = topPlat;

  const playing = lib.filter(g => g.status === 'playing').length;
  const onhold = lib.filter(g => g.status === 'onhold').length;

  const pPlaying = (playing / lib.length) * 100;
  const pCompleted = (completed / lib.length) * 100;
  const pOnhold = (onhold / lib.length) * 100;

  const statusBar = document.getElementById("statusBarBreakdown");
  statusBar.innerHTML = `
    <div style="width: ${pCompleted}%" class="bg-emerald-500 h-full" title="Completados"></div>
    <div style="width: ${pPlaying}%" class="bg-orange-500 h-full" title="Jugando"></div>
    <div style="width: ${pOnhold}%" class="bg-yellow-500 h-full" title="En Pausa"></div>
  `;

  document.getElementById("statusBarLegend").innerHTML = `
    <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> ${completed} Pasados</span>
    <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span> ${playing} Jugando</span>
    <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> ${onhold} En Pausa</span>
  `;

  const platList = document.getElementById("platformBreakdownList");
  platList.innerHTML = Object.entries(platCounts).map(([plat, count]) => {
    const perc = Math.round((count / lib.length) * 100);
    return `
      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-300 font-semibold">${plat}</span>
        <div class="flex items-center gap-2">
          <div class="w-28 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div class="bg-indigo-500 h-full" style="width: ${perc}%"></div>
          </div>
          <span class="text-slate-400 font-bold w-6 text-right">${count}</span>
        </div>
      </div>
    `;
  }).join("");

  statsModal.classList.remove("hidden");
});

closeStatsModalBtn.addEventListener("click", () => statsModal.classList.add("hidden"));
statsModal.addEventListener("click", (e) => {
  if (e.target === statsModal) statsModal.classList.add("hidden");
});

// 13. Top 5 Canvas
const top5Modal = document.getElementById("top5Modal");
const openTop5Btn = document.getElementById("openTop5Btn");
const closeTop5ModalBtn = document.getElementById("closeTop5ModalBtn");
const downloadTop5Btn = document.getElementById("downloadTop5Btn");
const top5Canvas = document.getElementById("top5Canvas");

openTop5Btn.addEventListener("click", () => {
  const lib = StorageManager.getGames();
  if (lib.length === 0) {
    alert("Agrega juegos a tu estante primero.");
    return;
  }
  const top5 = [...lib].sort((a, b) => b.rating - a.rating).slice(0, 5);
  CanvasPoster.drawTop5(top5Canvas, top5);
  top5Modal.classList.remove("hidden");
});

closeTop5ModalBtn.addEventListener("click", () => top5Modal.classList.add("hidden"));
top5Modal.addEventListener("click", (e) => {
  if (e.target === top5Modal) top5Modal.classList.add("hidden");
});

downloadTop5Btn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `my_top_5_games.png`;
  link.href = top5Canvas.toDataURL("image/png");
  link.click();
});

// 14. Backup JSON
document.getElementById("exportBtn").addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("game_vault_records") || "[]");
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `mis_juegos_backup_${new Date().toISOString().slice(0,10)}.json`);
  dlAnchor.click();
});

document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (Array.isArray(parsed)) {
        StorageManager.saveGames(parsed);
        renderLibrary();
        alert("¡Colección importada con éxito!");
      }
    } catch(err) {
      alert("El archivo subido no es un JSON válido.");
    }
  };
  reader.readAsText(file);
});

// 15. Demo y Reset
document.getElementById("loadDemoBtn").addEventListener("click", () => {
  const demoGames = [
    {
      id: Date.now() - 10000,
      title: "Elden Ring",
      coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
      status: "platinum",
      platforms: ["PC"],
      rating: 10,
      hours: 145,
      favorite: true,
      tags: ["#Soulslike", "#GOTY", "#MundoAbierto"],
      notes: "De las experiencias más completas de exploración. Platinado tras recorrer cada rincón de las Tierras Intermedias."
    },
    {
      id: Date.now() - 20000,
      title: "Cyberpunk 2077",
      coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80",
      status: "playing",
      platforms: ["PC"],
      rating: 9.5,
      hours: 68,
      favorite: true,
      tags: ["#RPG", "#SciFi"],
      notes: "Night City tiene una de las ambientaciones más densas de la industria. Actualmente pasando el DLC Phantom Liberty."
    },
    {
      id: Date.now() - 30000,
      title: "Hollow Knight",
      coverUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80",
      status: "completed",
      platforms: ["Nintendo", "PC"],
      rating: 9.5,
      hours: 42,
      favorite: false,
      tags: ["#Metroidvania", "#Indie"],
      notes: "Dirección de arte impecable y diseño de mapa superlativo."
    },
    {
      id: Date.now() - 40000,
      title: "Red Dead Redemption 2",
      coverUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
      status: "extras",
      platforms: ["PlayStation"],
      rating: 10,
      hours: 110,
      favorite: true,
      tags: ["#Narrativa", "#MundoAbierto"],
      notes: "Arthur Morgan es uno de los mejores personajes escritos en el medio."
    }
  ];

  StorageManager.saveGames(demoGames);
  renderLibrary();
  alert("¡Datos de demostración cargados exitosamente!");
});

document.getElementById("clearAllBtn").addEventListener("click", () => {
  if (confirm("¿Estás seguro de que deseas borrar toda tu biblioteca?")) {
    StorageManager.clearAll();
    renderLibrary();
    resetForm();
  }
});

// Inicialización
renderLibrary();
