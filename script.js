// Storage key for localStorage
const STORAGE_KEY = 'orderScreenshots';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    updateStats();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('orderForm').addEventListener('submit', handleFormSubmit);

    // File input previews
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', handleFilePreview);
    });

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Sync button
    document.getElementById('syncBtn').addEventListener('click', handleSync);

    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') closeModal();
    });
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    const orderId = document.getElementById('orderId').value.trim();
    const productName = document.getElementById('productName').value.trim();
    const orderDate = document.getElementById('orderDate').value;
    const platform = document.getElementById('platform').value;

    if (!orderId) {
        alert('Please enter an Order ID');
        return;
    }

    // Collect screenshots
    const screenshots = {};
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    let filesProcessed = 0;
    const totalFiles = Array.from(fileInputs).filter(input => input.files.length > 0).length;

    if (totalFiles === 0) {
        alert('Please upload at least one screenshot');
        return;
    }

    fileInputs.forEach(input => {
        if (input.files.length > 0) {
            const type = input.dataset.type;
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                screenshots[type] = {
                    data: e.target.result,
                    filename: `${type}_ss_${orderId}.${file.name.split('.').pop()}`
                };

                filesProcessed++;

                if (filesProcessed === totalFiles) {
                    saveOrder({
                        id: orderId,
                        productName,
                        orderDate,
                        platform,
                        screenshots,
                        createdAt: new Date().toISOString()
                    });
                }
            };

            reader.readAsDataURL(file);
        }
    });
}

// Save order to localStorage
function saveOrder(order) {
    const orders = getOrders();
    
    // Check if order already exists
    const existingIndex = orders.findIndex(o => o.id === order.id);
    
    if (existingIndex !== -1) {
        if (confirm('Order ID already exists. Do you want to update it?')) {
            orders[existingIndex] = order;
        } else {
            return;
        }
    } else {
        orders.push(order);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    
    // Reset form
    document.getElementById('orderForm').reset();
    
    // Clear previews
    document.querySelectorAll('.preview').forEach(preview => {
        preview.innerHTML = '';
    });

    // Reload orders list
    loadOrders();
    updateStats();

    // Generate download instructions
    generateDownloadInstructions(order);

    alert('Order saved successfully! Check the console for download instructions.');
}

// Generate download instructions
function generateDownloadInstructions(order) {
    console.log('\n=== DOWNLOAD INSTRUCTIONS ===');
    console.log(`Order ID: ${order.id}`);
    console.log('\nTo save screenshots to your local folder:');
    console.log('1. Right-click on each image below');
    console.log('2. Select "Save Image As..."');
    console.log('3. Use the suggested filename\n');

    Object.entries(order.screenshots).forEach(([type, screenshot]) => {
        console.log(`%c${screenshot.filename}`, 'font-weight: bold; color: #6366f1;');
        console.log(`%c${screenshot.data.substring(0, 100)}...`, 'color: #94a3b8; font-size: 10px;');
        console.log('\n');
    });

    console.log('=== END INSTRUCTIONS ===\n');
}

// Get all orders from localStorage
function getOrders() {
    const orders = localStorage.getItem(STORAGE_KEY);
    return orders ? JSON.parse(orders) : [];
}

// Load and display orders
function loadOrders(filter = '') {
    const orders = getOrders();
    const ordersList = document.getElementById('ordersList');

    const filteredOrders = orders.filter(order => {
        const searchTerm = filter.toLowerCase();
        return order.id.toLowerCase().includes(searchTerm) ||
               (order.productName && order.productName.toLowerCase().includes(searchTerm)) ||
               order.platform.toLowerCase().includes(searchTerm);
    });

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No orders found. Add your first order!</p>';
        return;
    }

    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <div class="order-id">${order.id}</div>
                    ${order.productName ? `<div style="color: var(--text-secondary); margin-top: 0.25rem;">${order.productName}</div>` : ''}
                </div>
                <span class="order-platform">${order.platform}</span>
            </div>
            <div class="order-details">
                ${order.orderDate ? `📅 ${new Date(order.orderDate).toLocaleDateString()}` : ''}
                ${order.createdAt ? `<span style="margin-left: 1rem;">🕒 Added ${new Date(order.createdAt).toLocaleDateString()}</span>` : ''}
            </div>
            <div class="order-screenshots">
                ${Object.entries(order.screenshots).map(([type, screenshot]) => `
                    <img src="${screenshot.data}" 
                         alt="${type}" 
                         class="screenshot-thumb" 
                         title="${type}"
                         onclick="openModal('${screenshot.data}')">
                `).join('')}
            </div>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="delete-btn" onclick="deleteOrder('${order.id}')">Delete</button>
                <button class="delete-btn" style="background: var(--primary);" onclick="downloadOrderScreenshots('${order.id}')">Download All</button>
            </div>
        </div>
    `).join('');
}

// Handle file preview
function handleFilePreview(e) {
    const file = e.target.files[0];
    const type = e.target.dataset.type;
    const preview = document.getElementById(`preview-${type}`);

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="${type}">`;
        };
        reader.readAsDataURL(file);
    }
}

// Handle search
function handleSearch(e) {
    loadOrders(e.target.value);
}

// Delete order
function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        const orders = getOrders();
        const filteredOrders = orders.filter(order => order.id !== orderId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredOrders));
        loadOrders();
        updateStats();
    }
}

// Download all screenshots for an order
function downloadOrderScreenshots(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) return;

    Object.entries(order.screenshots).forEach(([type, screenshot]) => {
        const link = document.createElement('a');
        link.href = screenshot.data;
        link.download = screenshot.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    alert('Screenshots are being downloaded. Check your Downloads folder!');
}

// Update statistics
function updateStats() {
    const orders = getOrders();
    const totalScreenshots = orders.reduce((sum, order) => {
        return sum + Object.keys(order.screenshots).length;
    }, 0);

    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalScreenshots').textContent = totalScreenshots;

    const lastSync = localStorage.getItem('lastSync');
    if (lastSync) {
        const date = new Date(lastSync);
        document.getElementById('lastSync').textContent = date.toLocaleDateString();
    }
}

// Handle sync to GitHub
function handleSync() {
    const orders = getOrders();
    
    if (orders.length === 0) {
        alert('No orders to sync!');
        return;
    }

    // Create export data
    const exportData = {
        exportDate: new Date().toISOString(),
        totalOrders: orders.length,
        orders: orders.map(order => ({
            id: order.id,
            productName: order.productName,
            orderDate: order.orderDate,
            platform: order.platform,
            createdAt: order.createdAt,
            screenshotCount: Object.keys(order.screenshots).length
        }))
    };

    // Download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update last sync time
    localStorage.setItem('lastSync', new Date().toISOString());
    updateStats();

    alert('Export file downloaded! Follow the README instructions to sync with GitHub.');
}

// Modal functions
function openModal(imageSrc) {
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = imageSrc;
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}
