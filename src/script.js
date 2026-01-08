const menu = document.getElementById("menu");
const content = document.getElementById("content");

function toggleMenu() {
  menu.classList.toggle("active");
}

function navigate(page) {
  toggleMenu();
  content.innerHTML = screens[page] || "<p>Em construção</p>";
}

/* TELAS */
const screens = {
  home: "",
  cart: "<h2>Carrinho</h2><p>Seu carrinho está vazio.</p>",
  history: "<h2>Histórico</h2><p>Sem pedidos ainda.</p>",
  search: "<h2>Histórico de Busca</h2><p>Nenhuma busca recente.</p>",
  help: "<h2>Ajuda</h2><p>Fale conosco pelo WhatsApp.</p>",
  settings: `
    <h2>Configurações</h2>
    <p>Tema: Escuro (padrão DYeshop)</p>
  `,
  admin: `
    <h2>Painel Admin</h2>
    <ul>
      <li>📦 Gerenciar Produtos</li>
      <li>🧾 Pedidos</li>
      <li>📊 Relatórios</li>
    </ul>
  `
};

/* HOME (produtos) */
const products = [
  { name: "Fone Bluetooth", price: "R$ 39,90" },
  { name: "Relógio Digital", price: "R$ 49,90" }
];

function loadHome() {
  content.innerHTML = products.map(p => `
    <div class="product">
      <h3>${p.name}</h3>
      <div class="price">${p.price}</div>
      <button class="buy">COMPRAR</button>
    </div>
  `).join("");
}

loadHome();
screens.home = content.innerHTML;
