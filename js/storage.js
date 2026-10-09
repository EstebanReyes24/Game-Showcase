/**
 * Módulo de Almacenamiento Local (LocalStorage)
 */
const STORAGE_KEY = "game_vault_records";

const StorageManager = {
  getGames() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      console.error("Error al leer LocalStorage:", e);
      return [];
    }
  },

  saveGames(games) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch (e) {
      console.error("Error al guardar en LocalStorage:", e);
    }
  },

  addGame(game) {
    const games = this.getGames();
    games.unshift(game);
    this.saveGames(games);
    return games;
  },

  updateGame(id, updatedData) {
    const games = this.getGames();
    const index = games.findIndex(g => g.id === id);
    if (index !== -1) {
      games[index] = { ...games[index], ...updatedData };
      this.saveGames(games);
    }
    return games;
  },

  deleteGame(id) {
    let games = this.getGames();
    games = games.filter(g => g.id !== id);
    this.saveGames(games);
    return games;
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }
};