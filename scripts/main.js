const cartButton = document.querySelector(".utils-btn");
const cartTab = document.querySelector(".cart-tab");
const closeButton = document.querySelector(".close-btn");
const listProductsHTML = document.querySelector(".product-grid");
const totalCart = document.querySelector(".totalCart");
const cardList = document.querySelector(".card-list");
const checkoutButton = document.querySelector(".checkout-btn");
const homeCardContainerHTML = document.querySelector(".card-container");
const searchInput = document.getElementById("searchProduct");
const paginationContainer = document.querySelector(".pagination");
const langToggle = document.getElementById("langToggle");
const menuCheckbox = document.getElementById('check');
const navLinks = document.querySelectorAll('.nav-links li a');
const menuContainer = document.querySelector('.menu');
const bottomNavLinks = document.querySelectorAll('.nav-item');
const currentPath = window.location.pathname;

let listProducts = [];
let listCartProducts = [];
let langData = {};
const listHomeProducts = [4, 3, 11, 8];
let currentPage = 1;
let currentProducts = [];
const ITEMS_PER_PAGE = 12;
let currentLang = localStorage.getItem("lang") || "en";

const loadLanguage = async (lang) => {
    try {
        const res = await fetch(`/scripts/languanges/${lang}.json`);
        langData = await res.json();

        if (langToggle) langToggle.checked = (lang === "id");

        applyLanguage();
        localStorage.setItem("lang", lang);

        if (currentProducts.length > 0) {
            paginateProducts(currentProducts, currentPage);
        } else {
            paginateProducts(listProducts, 1);
        }

        if (homeCardContainerHTML) {
            const homeProducts = listProducts.filter(p => listHomeProducts.includes(p.id));
            renderHomeProducts(homeProducts);
        }

        addToCartHTML();
        updateTotalCart();
    } catch (error) {
        console.error("Gagal memuat bahasa:", error);
    }
};

const applyLanguage = () => {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        const value = getValue(langData, key);
        if (value) el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        const value = getValue(langData, key);
        if (value) el.placeholder = value;
    });

    // update title
    const titleKey = document.querySelector("title")?.dataset.i18n;
    if (titleKey) {
        document.title = getValue(langData, titleKey);
    }
};

function getValue(obj, path) {
    return path.split(".").reduce((o, k) => o?.[k], obj);
}

langToggle?.addEventListener("change", () => {
    currentLang = langToggle.checked ? "id" : "en";
    loadLanguage(currentLang)
});

bottomNavLinks.forEach(link => {
    if (link.getAttribute('href').includes(currentPath)) {
        link.classList.add('active');
    }
});

cartButton?.addEventListener("click", () => {
    cartTab.classList.add("active");
});

closeButton?.addEventListener("click", () => {
    cartTab.classList.remove("active");
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuCheckbox.checked = false;
        document.body.style.overflow = 'auto';
    });
});

menuCheckbox?.addEventListener('change', () => {
    if (menuCheckbox.checked) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
});

searchInput?.addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();

    const filtered = listProducts.filter(product =>
        product.name[currentLang].toLowerCase().includes(keyword)
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

document.addEventListener('click', (event) => {
    const isClickInsideMenu = menuContainer.contains(event.target);
    const isClickOnHamburger = document.querySelector('.menu-btn').contains(event.target);

    if (menuCheckbox.checked && !isClickInsideMenu && !isClickOnHamburger) {
        menuCheckbox.checked = false;
        document.body.style.overflow = 'auto';
    }
});

checkoutButton?.addEventListener("click", () => {
    cartTab.classList.remove("active");
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

function renderHomeProducts(products) {
    homeCardContainerHTML.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.id = product.id;

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name[currentLang]}">
            <h3>${product.name[currentLang]}</h3>
            <p>${product.description[currentLang]}</p>
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
            <img src="${product.image}" alt="${product.name[currentLang]}">
            <h3>${product.name[currentLang]}</h3>
            <p>${product.description[currentLang]}</p>
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
    if (currentPage === 1) {
        prevBtn.style.display = "none";
    }

    prevBtn.addEventListener("click", () => {
        paginateProducts(currentProducts, currentPage - 1);
    });

    paginationContainer.appendChild(prevBtn);

    /* ===== PAGE RANGE ===== */
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

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
    if (currentPage === totalPages) {
        nextBtn.style.display = "none";
    }

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
            <div class="name">${product.name[currentLang]}</div>
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

            loadLanguage(currentLang);
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
