/**
 * Módulo de búsqueda de carátulas (JSONP Wikipedia MediaWiki)
 */
const SearchEngine = {
  search(term, callback) {
    if (!term || term.length < 2) return;

    window.handleWikiResults = function(data) {
      let items = [];
      if (data && data.query && data.query.pages) {
        items = Object.values(data.query.pages).map(p => ({
          title: p.title.replace(/\s*\(.*video game.*\)/i, "").trim(),
          image: p.thumbnail ? p.thumbnail.source : null,
          desc: p.description || "Videojuego"
        }));
      }
      callback(items);
    };

    const oldScript = document.getElementById("jsonp-search");
    if (oldScript) oldScript.remove();

    const script = document.createElement("script");
    script.id = "jsonp-search";
    const query = encodeURIComponent(term + " video game");
    script.src = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${query}&gsrlimit=6&prop=pageimages|description&piprop=thumbnail&pithumbsize=400&callback=handleWikiResults`;
    
    script.onerror = () => {
      callback([]);
    };

    document.body.appendChild(script);
  }
};