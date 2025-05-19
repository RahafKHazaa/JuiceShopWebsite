// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the shop page
    if (document.querySelector('#juice-container')) {
        loadJuices();
    }
    
    // Check if we're on the cart page
    if (document.querySelector('#cart-items')) {
        loadCart();
        setupCheckout();
    }
});

// Load juices from API and display them
function loadJuices() {
    fetch('/api/juices')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('juice-container');
            container.innerHTML = '';
            
            for (const [id, juice] of Object.entries(data.juices)) {
                const juiceCard = document.createElement('div');
                juiceCard.className = 'juice-card';
                juiceCard.innerHTML = `
                    <img src="/static/images/${juice.image}" alt="${juice.name}" class="juice-img">
                    <div class="juice-info">
                        <h3>${juice.name}</h3>
                        <p>${juice.description}</p>
                        <p class="juice-price">$${juice.price}</p>
                        <div class="quantity-controls">
                            <button class="decrease" data-id="${id}">-</button>
                            <span class="quantity" data-id="${id}">0</span>
                            <button class="increase" data-id="${id}">+</button>
                        </div>
                        <button class="add-to-cart" data-id="${id}">Add to Cart</button>
                    </div>
                `;
                container.appendChild(juiceCard);
            }
            
            // Add event listeners for quantity controls
            document.querySelectorAll('.increase').forEach(button => {
                button.addEventListener('click', increaseQuantity);
            });
            
            document.querySelectorAll('.decrease').forEach(button => {
                button.addEventListener('click', decreaseQuantity);
            });
            
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', addToCart);
            });
        })
        .catch(error => {
            console.error('Error loading juices:', error);
        });
}

// Increase quantity
function increaseQuantity(event) {
    const id = event.target.getAttribute('data-id');
    const quantityElement = document.querySelector(`.quantity[data-id="${id}"]`);
    let quantity = parseInt(quantityElement.textContent);
    quantityElement.textContent = quantity + 1;
}

// Decrease quantity
function decreaseQuantity(event) {
    const id = event.target.getAttribute('data-id');
    const quantityElement = document.querySelector(`.quantity[data-id="${id}"]`);
    let quantity = parseInt(quantityElement.textContent);
    if (quantity > 0) {
        quantityElement.textContent = quantity - 1;
    }
}

// Add item to cart
function addToCart(event) {
    const id = event.target.getAttribute('data-id');
    const quantityElement = document.querySelector(`.quantity[data-id="${id}"]`);
    const quantity = parseInt(quantityElement.textContent);
    
    if (quantity > 0) {
        // Get current cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || {};
        
        // Add or update item in cart
        if (cart[id]) {
            cart[id] += quantity;
        } else {
            cart[id] = quantity;
        }
        
        // Save back to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Reset quantity
        quantityElement.textContent = '0';
        
        // Show success message
        alert(`${quantity} item(s) added to cart!`);
    }
}

// Load cart from localStorage and display
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    
    let total = 0;
    
    // Fetch juice details for items in cart
    fetch('/api/juices')
        .then(response => response.json())
        .then(data => {
            for (const [id, quantity] of Object.entries(cart)) {
                const juice = data.juices[id];
                if (juice) {
                    const itemTotal = parseFloat(juice.price) * quantity;
                    total += itemTotal;
                    
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <img src="/static/images/${juice.image}" alt="${juice.name}" class="cart-item-img">
                        <div class="cart-item-info">
                            <div>
                                <h3>${juice.name}</h3>
                                <p>$${juice.price} each</p>
                            </div>
                            <div>
                                <p>Quantity: ${quantity}</p>
                                <p>Total: $${itemTotal.toFixed(2)}</p>
                                <button class="remove-item" data-id="${id}">Remove</button>
                            </div>
                        </div>
                    `;
                    container.appendChild(cartItem);
                }
            }
            
            // Display total
            document.getElementById('cart-total').textContent = `Total: $${total.toFixed(2)}`;
            
            // Add event listeners for remove buttons
            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', removeFromCart);
            });
        });
}

// Remove item from cart
function removeFromCart(event) {
    const id = event.target.getAttribute('data-id');
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    
    if (cart[id]) {
        delete cart[id];
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart(); // Refresh cart display
    }
}

// Setup checkout button
function setupCheckout() {
    document.getElementById('checkout-btn').addEventListener('click', function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        
        if (Object.keys(cart).length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Convert cart to array of items
        const items = Object.entries(cart).map(([id, quantity]) => ({
            id,
            quantity
        }));
        
        // Send order to server
        fetch('/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Order placed successfully!');
                localStorage.removeItem('cart');
                window.location.href = '/shop';
            } else {
                alert('There was an error processing your order. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error processing your order. Please try again.');
        });
    });
}