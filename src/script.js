const products = [
  {
    name: "Fone Bluetooth",
    price: "R$ 39,90",
    image: "https://via.placeholder.com/300x300?text=Fone"
  },
  {
    name: "Relógio Digital",
    price: "R$ 49,90",
    image: "https://via.placeholder.com/300x300?text=Relógio"
  },
  {
    name: "Suporte Celular",
    price: "R$ 19,90",
    image: "https://via.placeholder.com/300x300?text=Suporte"
  },
  {
    name: "Cabo USB Reforçado",
    price: "R$ 14,90",
    image: "https://via.placeholder.com/300x300?text=Cabo"
  }
];

const container = document.getElementById("products");

products.forEach(p => {
  const card = document.createElement("div");
  card.className = "product";

  card.innerHTML = `
    <img src="${p.image}" />
    <h3>${p.name}</h3>
    <div class="price">${p.price}</div>
    <button class="buy">COMPRAR</button>
  `;

  container.appendChild(card);
});
