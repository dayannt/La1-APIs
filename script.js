function setLoading(container) { container.innerHTML = '<p class="loading">Cargando...</p>'; }
function setError(container, msg = "Error") { container.innerHTML = `<p class="error">${msg}</p>`; }
function setEmpty(container, msg = "No hay resultados.") { container.innerHTML = `<p class="empty">${msg}</p>`; }
function clear(container) { container.innerHTML = ""; }
function escapeHtml(str){ if (!str && str !== 0) return ""; return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'", "&#039;"); }

//Animeeee
document.getElementById("searchAnime").addEventListener("click", async () => {
  const name = document.getElementById("animeName").value.trim();
  let limit = parseInt(document.getElementById("animeLimit").value, 10);
  const type = document.getElementById("animeType").value;
  const status = document.getElementById("animeStatus");
  const container = document.getElementById("animeResults");

  if (!limit || limit <= 0) limit = 6;
  clear(container);
  status.innerHTML = '<span class="loading">Cargando...</span>';

  const params = new URLSearchParams();
  if (name) params.set("q", name);
  params.set("limit", String(limit));
  if (type) params.set("type", type);

  const url = `https://api.jikan.moe/v4/anime?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API anime error: ' + res.status);
    const json = await res.json();
    if (!json.data || json.data.length === 0) {
      setEmpty(status, "No se encontraron resultados.");
      return;
    }

    status.innerHTML = "";
    json.data.forEach((anime, i) => {
      const card = document.createElement("article");
      card.className = "anime-card";
      card.style.animationDelay = `${i * 60}ms`;

      const img = anime.images?.jpg?.image_url || "";
      card.innerHTML = `
        ${img ? `<img src="${img}" alt="${escapeHtml(anime.title)}">` : ''}
        <h3>${escapeHtml(anime.title)}</h3>
        <div class="meta">Tipo: ${escapeHtml(anime.type||'—')} • Episodios: ${anime.episodes ?? '—'} • Score: ${anime.score ?? '—'}</div>
        <p class="synopsis">${escapeHtml(anime.synopsis ?? 'Sin sinopsis')}</p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    setError(status, "Ocurrió un error al buscar anime.");
  }
});

//Otras APIs
document.getElementById("getUser").addEventListener("click", async () => {
  const container = document.getElementById("userResult");
  setLoading(container);
  try {
    const res = await fetch("https://randomuser.me/api/");
    if (!res.ok) throw new Error("RandomUser falla");
    const j = await res.json();
    const u = j.results[0];
    container.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <img src="${u.picture?.large || u.picture?.medium || ''}" alt="${escapeHtml(u.name?.first)}" style="width:86px;height:86px;object-fit:cover;border-radius:10px;">
        <div>
          <strong>${escapeHtml(u.name?.first)} ${escapeHtml(u.name?.last)}</strong>
          <div style="font-size:13px;color:#444">${escapeHtml(u.email)}</div>
          <div style="font-size:13px;color:#666;margin-top:6px">${escapeHtml(u.location?.country || '')}</div>
        </div>
      </div>
    `;
  } catch (err) {
    setError(container, "Error al cargar usuario.");
  }
});


document.getElementById("getBitcoin").addEventListener("click", async () => {
  const container = document.getElementById("bitcoinResult");
  setLoading(container);

  try {
    const cd = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json");
    if (cd.ok) {
      const data = await cd.json();
      const rateFloat = data?.bpi?.USD?.rate_float ?? null;
      const rateStr = rateFloat ? rateFloat.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : data?.bpi?.USD?.rate ?? "N/A";
      container.innerHTML = `<div style="text-align:center"><strong style="font-size:1.25rem">$ ${rateStr}</strong><div style="font-size:12px;color:#666;margin-top:6px">Source: Coindesk</div></div>`;
      return;
    }
  } catch (e) {

  }

  // fallback
  try {
    const cg = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
    if (!cg.ok) throw new Error("CoinGecko falla");
    const json = await cg.json();
    const val = json?.bitcoin?.usd;
    if (typeof val !== "number") throw new Error("Respuesta inesperada");
    const str = val.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
    container.innerHTML = `<div style="text-align:center"><strong style="font-size:1.25rem">$ ${str}</strong><div style="font-size:12px;color:#666;margin-top:6px">Source: CoinGecko</div></div>`;
  } catch (err) {
    setError(container, "Error al cargar precio BTC.");
  }
});

document.getElementById("getCatFact").addEventListener("click", async () => {
  const container = document.getElementById("catResult");
  setLoading(container);
  try {
    const res = await fetch("https://catfact.ninja/fact");
    if (!res.ok) throw new Error("CatFact falla");
    const j = await res.json();
    if (!j.fact) { setEmpty(container, "No hay dato."); return; }
    container.innerHTML = `<div style="font-size:14px;color:#333">${escapeHtml(j.fact)}</div>`;
  } catch (err) {
    setError(container, "Error al cargar dato de gatos.");
  }
});
