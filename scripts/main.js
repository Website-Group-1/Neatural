const cartButton = document.querySelector(".utils-btn");
const cartTab = document.querySelector(".cart-tab");
const closeButton = document.querySelector(".close-btn");
const listProductsHTML = document.querySelector(".product-grid");
const totalCart = document.querySelector(".totalCart");
const cardList = document.querySelector(".card-list");
const checkoutButton = document.querySelector(".checkout-btn");

let listProducts = [];
let listCartProducts = [];

cartButton?.addEventListener("click", () => {
    cartTab.classList.add("active");
});

closeButton?.addEventListener("click", () => {
    cartTab.classList.remove("active");
});

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

const addDataToHTML = () => {
    if (!listProductsHTML) return;

    listProductsHTML.innerHTML = "";
    listProducts.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.id = product.id;

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="bottom-card">
                <span>Rp. ${product.price}</span>
                <button class="product-btn">
                    <i class="fa-solid fa-basket-shopping"></i>
                </button>
            </div>
        `;

        listProductsHTML.appendChild(card);
    });
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

    totalCart.textContent = total;
};

listProductsHTML?.addEventListener("click", (event) => {
    const button = event.target.closest(".product-btn");
    if (!button) return;

    const card = button.closest(".product-card");
    addToCart(card.dataset.id);
});

const initData = () => {
    fetch("/scripts/dataProduct.json")
        .then(res => res.json())
        .then(data => {
            listProducts = data;
            addDataToHTML();

            const cartData = localStorage.getItem("cart");
            if (cartData) {
                listCartProducts = JSON.parse(cartData);
                addToCartHTML();
                updateTotalCart();
            }
        });
};

document.addEventListener("DOMContentLoaded", initData);
