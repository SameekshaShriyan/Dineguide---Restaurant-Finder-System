/* DineGuide SPA — Auth + Admin + Add Restaurants (localStorage) */
const $ = (q) => document.querySelector(q);
const view = $("#routerView");
const toastEl = $("#toast");
const authButtons = $("#authButtons");
const adminNav = $("#adminNav");
const YEAR = new Date().getFullYear();
$("#year").textContent = YEAR;

/* ---------- Utilities ---------- */
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  del(key) { localStorage.removeItem(key); }
};

function notify(msg, type="success") {
  toastEl.textContent = msg;
  toastEl.className = "fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl text-white shadow-lg " +
    (type === "error" ? "bg-red-600" : type === "warn" ? "bg-amber-500" : "bg-emerald-600");
  toastEl.classList.remove("hidden");
  setTimeout(()=>toastEl.classList.add("hidden"), 1600);
}

function uid() { return Math.random().toString(36).slice(2,9); }

/* ---------- Seed Data ---------- */
if (!store.get("dg_restaurants")) {
  store.set("dg_restaurants", [
    { id: uid(), name: "Spice Symphony", city: "Bengaluru", cuisine: "Indian", price: "₹₹", tags:["trending"], img:"https://images.unsplash.com/photo-1604908554007-79b63a76b0c1?q=80&w=1600&auto=format&fit=crop" },
    { id: uid(), name: "Umami Street", city: "Mumbai", cuisine: "Asian", price: "₹₹₹", tags:["date-night"], img:"https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop" },
    { id: uid(), name: "Green Fork", city: "Pune", cuisine: "Vegan", price: "₹", tags:["vegan","budget"], img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop" },
    { id: uid(), name: "Napoli Corner", city: "Hyderabad", cuisine: "Italian", price: "₹₹", tags:["kid-friendly"], img:"https://images.unsplash.com/photo-1541745537413-b8046dc6d66c?q=80&w=1600&auto=format&fit=crop" },
  ]);
}
if (!store.get("dg_users")) {
  store.set("dg_users", [
    { id: uid(), name: "Admin", email: "admin@dine.guide", role: "admin", password: "admin123" },
  ]);
}
if (!store.get("dg_favs")) store.set("dg_favs", {});

/* ---------- Auth ---------- */
function currentUser() { return store.get("dg_user", null); }
function setUser(u) { store.set("dg_user", u); renderAuth(); }
function logout() { store.del("dg_user"); notify("Logged out"); renderAuth(); routeTo("/"); }

function renderAuth() {
  const u = currentUser();
  adminNav.classList.add("hidden");
  if (!u) {
    authButtons.innerHTML = `
      <a href="#/login" class="px-4 py-2 rounded-xl border border-slate-200 hover:border-emerald-500">Login</a>
      <a href="#/register" class="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">Sign Up</a>
    `;
  } else {
    if (u.role === "admin") adminNav.classList.remove("hidden");
    const initials = (u.name || u.email).slice(0,1).toUpperCase();
    authButtons.innerHTML = `
      <div class="relative group">
        <button class="w-10 h-10 rounded-full bg-emerald-600 text-white grid place-content-center">${initials}</button>
        <div class="absolute right-0 mt-2 w-44 hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-lg p-2">
          <div class="px-3 py-2 text-sm text-slate-500">Signed in as<br><span class="font-medium text-slate-800">${u.email}</span></div>
          ${u.role==="admin" ? `<a class="block px-3 py-2 rounded hover:bg-slate-50" href="#/admin">Admin</a>`:""}
          <a class="block px-3 py-2 rounded hover:bg-slate-50" href="#/favorites">Favorites</a>
          <button class="w-full text-left px-3 py-2 rounded hover:bg-slate-50" id="logoutBtn">Logout</button>
        </div>
      </div>
    `;
    setTimeout(()=> {
      const out = $("#logoutBtn");
      if (out) out.addEventListener("click", logout);
    });
  }
}
renderAuth();

/* ---------- Components ---------- */
function card(r) {
  const favs = store.get("dg_favs", {});
  const u = currentUser();
  const isFav = u && favs[u.email]?.includes(r.id);
  return `
  <article class="lift rounded-2xl overflow-hidden bg-white border border-slate-200">
    <div class="aspect-video overflow-hidden">
      <img class="w-full h-full object-cover" src="${r.img}" alt="${r.name}" />
    </div>
    <div class="p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">${r.name}</h3>
        <span class="text-sm px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">${r.price}</span>
      </div>
      <p class="mt-1 text-slate-500">${r.cuisine} • ${r.city}</p>
      <div class="mt-3 flex flex-wrap gap-2 text-xs">
        ${r.tags.map(t=>`<span class="chip">${t}</span>`).join("")}
      </div>
      <div class="mt-4 flex items-center justify-between">
        <a class="text-emerald-700 hover:underline" href="https://www.google.com/maps/search/${encodeURIComponent(r.name+' '+r.city)}" target="_blank">View on Maps</a>
        <button data-id="${r.id}" class="favBtn text-sm px-3 py-1.5 rounded-xl border ${isFav?'bg-emerald-600 text-white border-emerald-600':'border-slate-200 hover:border-emerald-500'}">${isFav?'★ Saved':'☆ Save'}</button>
      </div>
    </div>
  </article>`;
}

function requireAdmin() {
  const u = currentUser();
  if (!u) { notify("Please log in to continue", "warn"); routeTo("/login"); return false; }
  if (u.role !== "admin") { notify("Admins only", "error"); routeTo("/"); return false; }
  return true;
}

/* ---------- Views ---------- */
const Views = {
  home() {
    const list = store.get("dg_restaurants", []);
    view.innerHTML = `
      <section class="mt-4">
        <h2 class="text-2xl font-bold mb-4">Trending near you</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          ${list.slice(0,8).map(card).join("")}
        </div>
      </section>
    `;
    bindFavs();
  },
  explore(query="") {
    const raw = store.get("dg_restaurants", []);
    const q = query.toLowerCase();
    const list = raw.filter(r =>
      [r.name, r.city, r.cuisine, r.price, ...(r.tags||[])].join(" ").toLowerCase().includes(q)
    );
    view.innerHTML = `
      <section class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold">Explore</h2>
        <div class="text-slate-500">${list.length} results</div>
      </section>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${list.map(card).join("") || `<div class="text-slate-500">No matches. Try a different search.</div>`}
      </div>
    `;
    bindFavs();
  },
  toppicks() {
    const list = store.get("dg_restaurants", []).filter(r=>["trending","date-night"].some(t=>r.tags.includes(t)));
    view.innerHTML = `
      <section>
        <h2 class="text-2xl font-bold mb-4">Top Picks</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          ${list.map(card).join("")}
        </div>
      </section>
    `;
    bindFavs();
  },
  about() {
    view.innerHTML = `
      <section class="prose max-w-none">
        <h2>About DineGuide</h2>
        <p>DineGuide helps you discover great places to eat, fast. Our design is clean, modern, and mobile-first, so you focus on food.</p>
        <ul class="list-disc pl-6">
          <li>Curated lists by mood and budget</li>
          <li>Save favorites and build your own shortlists</li>
          <li>Admin panel for managing listings</li>
        </ul>
      </section>
    `;
  },
  login() {
    view.innerHTML = `
      <section class="max-w-md mx-auto glass rounded-2xl p-6 shadow-xl">
        <div class="flex w-full rounded-xl bg-slate-100 p-1 mb-4">
          <button class="tab flex-1 px-3 py-2 rounded-lg bg-white font-medium" data-tab="user">User</button>
          <button class="tab flex-1 px-3 py-2 rounded-lg hover:bg-white" data-tab="admin">Admin</button>
        </div>
        <form id="loginForm" class="space-y-3">
          <div>
            <label class="text-sm text-slate-600">Email</label>
            <input required type="email" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label class="text-sm text-slate-600">Password</label>
            <input required type="password" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="••••••••" />
          </div>
          <input type="hidden" id="loginRole" value="user" />
          <button class="w-full px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Login</button>
          <p class="text-xs text-slate-500">Demo admin: admin@dine.guide / admin123</p>
          <p class="text-sm text-slate-600">No account? <a class="text-emerald-700 hover:underline" href="#/register">Register</a></p>
        </form>
      </section>
    `;
    const tabs = view.querySelectorAll(".tab");
    tabs.forEach(t=>t.addEventListener("click", ()=> {
      tabs.forEach(x=>x.classList.remove("bg-white","font-medium"));
      t.classList.add("bg-white","font-medium");
      $("#loginRole").value = t.dataset.tab;
    }));
    $("#loginForm").addEventListener("submit", (e)=>{
      e.preventDefault();
      const [emailEl, passEl] = e.target.querySelectorAll("input[type]");
      const email = emailEl.value.trim().toLowerCase();
      const password = passEl.value;
      const role = $("#loginRole").value;

      const users = store.get("dg_users", []);
      const found = users.find(u=>u.email===email && u.password===password && (role==="user" || u.role==="admin"));
      if (!found && role==="admin") return notify("Invalid admin credentials", "error");
      if (!found && role==="user") {
        // Create ephemeral user if not registered
        const u = { id: uid(), name: email.split("@")[0], email, role: "user" };
        setUser(u); notify("Welcome!", "success"); routeTo("/");
      } else {
        setUser({ id: found.id, name: found.name, email: found.email, role: found.role });
        notify(`Hello ${found.role==="admin"?"Admin":found.name}!`);
        routeTo(found.role==="admin"?"/admin":"/");
      }
    });
  },
  register() {
    view.innerHTML = `
      <section class="max-w-md mx-auto glass rounded-2xl p-6 shadow-xl">
        <h2 class="text-2xl font-bold mb-4">Create account</h2>
        <form id="regForm" class="space-y-3">
          <div>
            <label class="text-sm text-slate-600">Name</label>
            <input required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label class="text-sm text-slate-600">Email</label>
            <input required type="email" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label class="text-sm text-slate-600">Password</label>
            <input required type="password" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <button class="w-full px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Sign Up</button>
        </form>
      </section>
    `;
    $("#regForm").addEventListener("submit", (e)=>{
      e.preventDefault();
      const [nameEl, emailEl, passEl] = e.target.querySelectorAll("input");
      const users = store.get("dg_users", []);
      if (users.find(u=>u.email===emailEl.value.toLowerCase())) return notify("Email already registered", "error");
      const u = { id: uid(), name: nameEl.value.trim(), email: emailEl.value.toLowerCase(), role:"user", password: passEl.value };
      users.push(u); store.set("dg_users", users);
      setUser({ id: u.id, name: u.name, email: u.email, role: "user" });
      notify("Account created"); routeTo("/");
    });
  },
  favorites() {
    const u = currentUser();
    if (!u) { notify("Please log in first", "warn"); return routeTo("/login"); }
    const favs = store.get("dg_favs", {})[u.email] || [];
    const list = store.get("dg_restaurants", []).filter(r=>favs.includes(r.id));
    view.innerHTML = `
      <section>
        <h2 class="text-2xl font-bold mb-4">Your Favorites</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl-grid-cols-4 gap-6">
          ${list.map(card).join("") || `<div class="text-slate-500">No favorites yet.</div>`}
        </div>
      </section>
    `;
    bindFavs();
  },
  admin() {
    if (!requireAdmin()) return;
    const list = store.get("dg_restaurants", []);
    view.innerHTML = `
      <section class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1 glass rounded-2xl p-6 shadow-xl h-max">
          <h2 class="text-xl font-bold mb-3">Add Restaurant</h2>
          <form id="addForm" class="space-y-3">
            <input required placeholder="Name" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <div class="grid grid-cols-2 gap-3">
              <input required placeholder="City" class="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              <input required placeholder="Cuisine" class="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <select class="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                <option>₹</option><option selected>₹₹</option><option>₹₹₹</option>
              </select>
              <input placeholder="Tags (comma separated)" class="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <input placeholder="Image URL (optional)" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <button class="w-full px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Add</button>
          </form>
        </div>
        <div class="lg:col-span-2">
          <h2 class="text-xl font-bold mb-3">All Restaurants</h2>
          <div id="adminList" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            ${list.map(r=>`
              <article class="rounded-2xl overflow-hidden bg-white border border-slate-200">
                <div class="aspect-video overflow-hidden">
                  <img class="w-full h-full object-cover" src="${r.img}" alt="${r.name}" />
                </div>
                <div class="p-4">
                  <div class="flex items-center justify-between">
                    <h3 class="font-semibold">${r.name}</h3>
                    <span class="text-sm px-2 py-1 rounded-full bg-slate-100">${r.price}</span>
                  </div>
                  <p class="text-slate-500">${r.cuisine} • ${r.city}</p>
                  <div class="mt-3 flex gap-2">
                    <button data-id="${r.id}" class="delBtn px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              </article>
            `).join("")}
          </div>
        </div>
      </section>
    `;
    $("#addForm").addEventListener("submit", (e)=>{
      e.preventDefault();
      const [nameEl, cityEl, cuisineEl, priceEl, tagsEl, imgEl] = e.target.querySelectorAll("input, select");
      const list = store.get("dg_restaurants", []);
      list.unshift({
        id: uid(),
        name: nameEl.value.trim(),
        city: cityEl.value.trim(),
        cuisine: cuisineEl.value.trim(),
        price: priceEl.value,
        tags: (tagsEl.value || "").split(",").map(t=>t.trim()).filter(Boolean),
        img: imgEl.value || "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop"
      });
      store.set("dg_restaurants", list);
      notify("Restaurant added");
      routeTo("/admin");
    });
    view.querySelectorAll(".delBtn").forEach(b=>b.addEventListener("click", ()=>{
      const id = b.dataset.id;
      const list = store.get("dg_restaurants", []).filter(r=>r.id!==id);
      store.set("dg_restaurants", list);
      notify("Deleted", "warn");
      routeTo("/admin");
    }));
  },
  privacy(){ view.innerHTML = `<div class="prose"><h2>Privacy</h2><p>Demo only. No real data is collected.</p></div>`; },
  terms(){ view.innerHTML = `<div class="prose"><h2>Terms</h2><p>Use at your own risk in demo mode.</p></div>`; },
  contact(){ view.innerHTML = `<div class="prose"><h2>Contact</h2><p>Email: hello@dine.guide</p></div>`; },
};

/* ---------- Favorites binding ---------- */
function bindFavs(){
  view.querySelectorAll(".favBtn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const u = currentUser();
      if (!u) return routeTo("/login");
      const favs = store.get("dg_favs", {});
      const arr = favs[u.email] || [];
      const id = btn.dataset.id;
      const ix = arr.indexOf(id);
      if (ix===-1) arr.push(id); else arr.splice(ix,1);
      favs[u.email] = arr;
      store.set("dg_favs", favs);
      notify(ix===-1?"Saved to favorites":"Removed from favorites", ix===-1?"success":"warn");
      // Rerender to update button state
      const path = location.hash.replace("#",") || "/";
      routeTo(path);
    });
  });
}

/* ---------- Router ---------- */
function routeTo(path){ location.hash = path.startsWith("#")? path : `#${path}`; }
function handleRoute(){
  const hash = (location.hash || "#/").slice(2); // remove "#/"
  const [route, query] = hash.split("?q=");
  // search bar wiring
  const searchInput = $("#searchInput"), searchBtn = $("#searchBtn");
  if (searchBtn) searchBtn.onclick = ()=> routeTo(`/explore?q=${encodeURIComponent(searchInput.value)}`);
  if (searchInput) {
    document.querySelectorAll("[data-chip]").forEach(c=>c.onclick=()=>{
      routeTo(`/explore?q=${encodeURIComponent(c.dataset.chip)}`);
    });
  }
  switch(route){
    case "": Views.home(); break;
    case "explore": Views.explore(decodeURIComponent(query||"")); break;
    case "top-picks": Views.toppicks(); break;
    case "about": Views.about(); break;
    case "login": Views.login(); break;
    case "register": Views.register(); break;
    case "favorites": Views.favorites(); break;
    case "admin": Views.admin(); break;
    case "privacy": Views.privacy(); break;
    case "terms": Views.terms(); break;
    case "contact": Views.contact(); break;
    default: Views.home();
  }
}
window.addEventListener("hashchange", handleRoute);
window.addEventListener("load", handleRoute);
