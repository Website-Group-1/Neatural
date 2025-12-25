const cartButton = document.querySelector(".utils-btn");
const cartTab = document.querySelector(".cart-tab");
const closeButton = document.querySelector(".close-btn");
const listProductsHTML = document.querySelector(".product-grid");
const totalCart = document.querySelector(".totalCart");
const cardList = document.querySelector(".card-list");
const checkoutButton = document.querySelector(".checkout-btn");
const homeCardContainerHTML = document.querySelector(".card-container");
const searchInput = document.querySelector("#searchProduct");
const paginationContainer = document.querySelector(".pagination");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

let listProducts = [];
let listCartProducts = [];
const listHomeProducts = [4, 3, 11, 8];
let currentPage = 1;
let currentProducts = [];
const ITEMS_PER_PAGE = 12;

cartButton?.addEventListener("click", () => {
    cartTab.classList.add("active");
});

closeButton?.addEventListener("click", () => {
    cartTab.classList.remove("active");
});

searchInput?.addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();

    const filtered = listProducts.filter(product =>
        product.name.toLowerCase().includes(keyword)
    );

    paginateProducts(filtered, 1);
});

const paginateProducts = (products, page = 1) => {
    currentPage = page;
    currentProducts = products;

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    const paginatedData = products.slice(start, end);
    renderFilteredProducts(paginatedData);
    renderPagination(products.length);
};

checkoutButton?.addEventListener("click", () => {
    if (listCartProducts.length === 0) {
        Swal.fire({
            title: "Oops!",
            text: "Your shopping cart is empty.",
            icon: "question"
        });
        return;
    }

    Swal.fire({
        title: "Checkout?",
        text: "Please make sure all items are correct.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#7A4A4A",
        cancelButtonColor: "#E2D6D6",
        confirmButtonText: "Yes, Checkout!"
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Success!",
                text: "Thank you for shopping with us.",
                icon: "success"
            }).then(clearCart);
        }
    });
});

const clearCart = () => {
    listCartProducts = [];
    localStorage.removeItem("cart");
    addToCartHTML();
    updateTotalCart();
};

const filterProductsByName = (keyword) => {
    const filtered = listProducts.filter(product =>
        product.name.toLowerCase().includes(keyword.toLowerCase())
    );

    renderFilteredProducts(filtered);
};


function renderHomeProducts(products) {
    homeCardContainerHTML.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.id = product.id;

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="bottom-card">
                <span>Rp. ${product.price.toLocaleString("id-ID")}</span>
                <button class="product-btn">
                    <i class="fa-solid fa-basket-shopping"></i>
                </button>
            </div>
        `;

        homeCardContainerHTML.appendChild(card);
    });
}

const renderFilteredProducts = (products) => {
    if (!listProductsHTML) return;

    listProductsHTML.innerHTML = "";

    if (products.length === 0) {
        listProductsHTML.innerHTML = `<p>Product not found</p>`;
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.id = product.id;

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="bottom-card">
                <span>Rp. ${product.price.toLocaleString("id-ID")}</span>
                <button class="product-btn">
                    <i class="fa-solid fa-basket-shopping"></i>
                </button>
            </div>
        `;

        listProductsHTML.appendChild(card);
    });
};

const createDots = () => {
    const span = document.createElement("span");
    span.textContent = "...";
    span.style.padding = "6px 10px";
    return span;
};

const renderPagination = (totalItems) => {
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    /* ===== PREV ===== */
    const prevBtn = document.createElement("button");
    prevBtn.innerHTML = "<i class='fa-solid fa-arrow-left'></i>";
    prevBtn.disabled = currentPage === 1;

    prevBtn.addEventListener("click", () => {
        paginateProducts(currentProducts, currentPage - 1);
    });

    paginationContainer.appendChild(prevBtn);

    /* ===== PAGE RANGE ===== */
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    // pastikan selalu max 3 angka
    if (currentPage === 1) endPage = 2;
    if (currentPage === totalPages) startPage = totalPages - 1;

    if (startPage > 1) {
        paginationContainer.appendChild(createDots());
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = i === currentPage ? "active" : "";

        btn.addEventListener("click", () => {
            paginateProducts(currentProducts, i);
        });

        paginationContainer.appendChild(btn);
    }

    if (endPage < totalPages) {
        paginationContainer.appendChild(createDots());
    }

    /* ===== NEXT ===== */
    const nextBtn = document.createElement("button");
    nextBtn.innerHTML = "<i class='fa-solid fa-arrow-right'></i>";
    nextBtn.disabled = currentPage === totalPages;

    nextBtn.addEventListener("click", () => {
        paginateProducts(currentProducts, currentPage + 1);
    });

    paginationContainer.appendChild(nextBtn);
};


const addToCart = (productId) => {
    const index = listCartProducts.findIndex(item => item.productId == productId);

    if (index < 0) {
        listCartProducts.push({ productId, quantity: 1 });
    } else {
        listCartProducts[index].quantity++;
    }

    saveCart();
    addToCartHTML();
    updateTotalCart();
};

const saveCart = () => {
    localStorage.setItem("cart", JSON.stringify(listCartProducts));
};

const addToCartHTML = () => {
    if (!cardList) return;

    cardList.innerHTML = "";

    listCartProducts.forEach(cart => {
        const product = listProducts.find(p => p.id == cart.productId);
        if (!product) return;

        const item = document.createElement("div");
        item.className = "item";
        item.dataset.id = cart.productId;

        item.innerHTML = `
            <div class="card-image">
                <img src="${product.image}">
            </div>
            <div class="name">${product.name}</div>
            <div class="totalPrice">Rp. ${product.price * cart.quantity}</div>
            <div class="quantity">
                <span class="minus"><i class="fa-solid fa-minus"></i></span>
                <span>${cart.quantity}</span>
                <span class="plus"><i class="fa-solid fa-plus"></i></span>
            </div>
        `;

        cardList.appendChild(item);
    });
};

cardList?.addEventListener("click", (event) => {
    const item = event.target.closest(".item");
    if (!item) return;

    const productId = item.dataset.id;
    if (event.target.closest(".plus")) {
        changeQuantity(productId, "plus");
    }
    if (event.target.closest(".minus")) {
        changeQuantity(productId, "minus");
    }
});

const changeQuantity = (productId, type) => {
    const index = listCartProducts.findIndex(item => item.productId == productId);
    if (index < 0) return;

    if (type === "plus") {
        listCartProducts[index].quantity++;
    } else {
        listCartProducts[index].quantity--;
        if (listCartProducts[index].quantity <= 0) {
            listCartProducts.splice(index, 1);
        }
    }

    saveCart();
    addToCartHTML();
    updateTotalCart();
};

const updateTotalCart = () => {
    if (!totalCart) return;

    const total = listCartProducts.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    if (total === 0) {
        totalCart.style.display = "none";
        totalCart.textContent = "";
        return;
    } else if (total > 9) {
        totalCart.textContent = `9+`;
        return;
    }

    totalCart.style.display = "flex";
    totalCart.textContent = total;
};

listProductsHTML?.addEventListener("click", (event) => {
    const button = event.target.closest(".product-btn");
    if (!button) return;

    const card = button.closest(".product-card");
    addToCart(card.dataset.id);
});

homeCardContainerHTML?.addEventListener("click", (event) => {
    const button = event.target.closest(".product-btn");
    if (!button) return;

    const card = button.closest(".product-card");
    if (!card) return;

    addToCart(card.dataset.id);
});


const initData = () => {
    fetch("/scripts/dataProduct.json")
        .then(res => res.json())
        .then(data => {
            listProducts = data;
            paginateProducts(listProducts, 1);

            if (homeCardContainerHTML) {
                const homeProducts = listProducts.filter(product =>
                    listHomeProducts.includes(product.id)
                );

                renderHomeProducts(homeProducts);
            }

            const cartData = localStorage.getItem("cart");
            listCartProducts = cartData ? JSON.parse(cartData) : [];
            addToCartHTML();
            updateTotalCart();
        });
};

document.addEventListener("DOMContentLoaded", initData);
