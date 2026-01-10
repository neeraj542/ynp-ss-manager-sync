// Storage key for localStorage (fallback only)
const STORAGE_KEY = 'orderScreenshots';

// GitHub API instance
let githubAPI;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    githubAPI = new GitHubAPI();
    checkGitHubSetup();
    loadOrders();
    updateStats();
    setupEventListeners();
});

// Check if GitHub is configured
function checkGitHubSetup() {
    if (!githubAPI.isConfigured()) {
        showGitHubSetupPrompt();
    } else {
        updateSyncButtonStatus(true);
    }
}

// Show GitHub setup prompt
function showGitHubSetupPrompt() {
    const syncBtn = document.getElementById('syncBtn');
    syncBtn.innerHTML = '<span class="sync-icon">⚠️</span> Setup Required';
    syncBtn.style.background = 'var(--warning)';
}

// Update sync button status
function updateSyncButtonStatus(configured) {
    const syncBtn = document.getElementById('syncBtn');
    const syncBtnText = document.getElementById('syncBtnText');

    if (configured) {
        syncBtn.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
        if (syncBtnText) {
            syncBtnText.textContent = 'Refresh Orders';
        }
    }
}

// Open GitHub settings modal
function openGitHubSettings() {
    const modal = document.getElementById('githubModal');
    const tokenInput = document.getElementById('githubToken');

    if (githubAPI.isConfigured()) {
        tokenInput.value = '••••••••••••••••'; // Show masked token
    }

    modal.style.display = 'block';
}

// Close GitHub settings modal
function closeGitHubModal() {
    document.getElementById('githubModal').style.display = 'none';
}

// Save GitHub token
async function saveGitHubToken() {
    const tokenInput = document.getElementById('githubToken');
    const statusDiv = document.getElementById('tokenStatus');
    const token = tokenInput.value.trim();

    if (!token || token === '••••••••••••••••') {
        statusDiv.style.display = 'block';
        statusDiv.style.background = 'rgba(239, 68, 68, 0.1)';
        statusDiv.style.color = 'var(--danger)';
        statusDiv.textContent = '❌ Please enter a valid token';
        return;
    }

    // Test the token
    statusDiv.style.display = 'block';
    statusDiv.style.background = 'rgba(99, 102, 241, 0.1)';
    statusDiv.style.color = 'var(--primary)';
    statusDiv.textContent = '🔄 Testing token...';

    try {
        githubAPI.setToken(token);

        // Test by fetching repo info
        await githubAPI.request(`/repos/${githubAPI.owner}/${githubAPI.repo}`);

        statusDiv.style.background = 'rgba(16, 185, 129, 0.1)';
        statusDiv.style.color = 'var(--success)';
        statusDiv.textContent = '✅ Token saved successfully!';

        updateSyncButtonStatus(true);

        setTimeout(() => {
            closeGitHubModal();
            loadOrders(); // Reload orders from GitHub
        }, 1500);
    } catch (error) {
        statusDiv.style.background = 'rgba(239, 68, 68, 0.1)';
        statusDiv.style.color = 'var(--danger)';
        statusDiv.textContent = `❌ Invalid token: ${error.message}`;
    }
}

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
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') closeModal();
    });
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    if (!githubAPI.isConfigured()) {
        alert('⚠️ Please configure GitHub token first!\n\nClick the Settings button to set up your Personal Access Token.');
        openGitHubSettings();
        return;
    }

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

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Uploading to GitHub...';
    submitBtn.disabled = true;

    fileInputs.forEach(input => {
        if (input.files.length > 0) {
            const type = input.dataset.type;
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = async (e) => {
                screenshots[type] = {
                    data: e.target.result,
                    filename: `${type}.${file.name.split('.').pop()}`
                };

                filesProcessed++;

                if (filesProcessed === totalFiles) {
                    try {
                        await saveOrderToGitHub({
                            id: orderId,
                            productName,
                            orderDate,
                            platform,
                            screenshots,
                            createdAt: new Date().toISOString()
                        });

                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    } catch (error) {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        alert(`❌ Error uploading to GitHub: ${error.message}`);
                    }
                }
            };

            reader.readAsDataURL(file);
        }
    });
}

// Save order to GitHub
async function saveOrderToGitHub(order) {
    try {
        // Create order on GitHub
        await githubAPI.createOrder(order.id, {
            id: order.id,
            productName: order.productName || "",
            orderDate: order.orderDate || "",
            platform: order.platform || "Other",
            createdAt: order.createdAt,
            updatedAt: new Date().toISOString(),
            screenshots: Object.keys(order.screenshots).map(type => `${type}.png`)
        }, order.screenshots);

        // Reset form
        document.getElementById('orderForm').reset();

        // Clear previews
        document.querySelectorAll('.preview').forEach(preview => {
            preview.innerHTML = '';
        });

        // Reload orders list
        await loadOrders();
        updateStats();

        alert(`✅ Order ${order.id} uploaded to GitHub successfully!\n\nFolder created: orders/${order.id}/\nAll screenshots uploaded.`);
    } catch (error) {
        console.error('Error saving order:', error);
        throw error;
    }
}

// Load and display orders from GitHub
async function loadOrders(filter = '') {
    const ordersList = document.getElementById('ordersList');

    if (!githubAPI.isConfigured()) {
        ordersList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">⚙️ Configure GitHub token to view orders</p>';
        return;
    }

    ordersList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">🔄 Loading orders from GitHub...</p>';

    try {
        const orders = await githubAPI.getAllOrders();

        const filteredOrders = orders.filter(order => {
            const searchTerm = filter.toLowerCase();
            return order.id.toLowerCase().includes(searchTerm) ||
                (order.productName && order.productName.toLowerCase().includes(searchTerm)) ||
                order.platform.toLowerCase().includes(searchTerm);
        });

        if (filteredOrders.length === 0) {
            ordersList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">📭 No orders found. Add your first order!</p>';
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
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="delete-btn" style="background: var(--primary);" onclick="viewOrderDetails('${order.id}')">View Details</button>
                    <button class="delete-btn" style="background: var(--success);" onclick="downloadOrderFromGitHub('${order.id}')">Download All</button>
                </div>
            </div>
        `).join('');

        updateStats();
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersList.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 2rem;">❌ Error loading orders: ${error.message}</p>`;
    }
}

// View order details
async function viewOrderDetails(orderId) {
    try {
        const order = await githubAPI.getOrder(orderId);

        if (!order) {
            alert('Order not found');
            return;
        }

        const screenshotsHtml = order.screenshots.map(ss => `
            <img src="${ss.url}" 
                 alt="${ss.type}" 
                 class="screenshot-thumb" 
                 title="${ss.type}"
                 onclick="openModal('${ss.url}')"
                 style="width: 100px; height: 100px; object-fit: cover; cursor: pointer; border-radius: 8px; margin: 0.5rem;">
        `).join('');

        const detailsHtml = `
            <div style="padding: 1rem;">
                <h3>Order: ${order.id}</h3>
                <p><strong>Product:</strong> ${order.productName || 'N/A'}</p>
                <p><strong>Platform:</strong> ${order.platform}</p>
                <p><strong>Date:</strong> ${order.orderDate || 'N/A'}</p>
                <p><strong>Screenshots (${order.screenshots.length}):</strong></p>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${screenshotsHtml}
                </div>
            </div>
        `;

        const modal = document.getElementById('modal');
        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <span class="close" onclick="closeModal()">&times;</span>
            ${detailsHtml}
        `;
        modal.style.display = 'block';
    } catch (error) {
        alert(`Error loading order details: ${error.message}`);
    }
}

// Download order screenshots from GitHub
async function downloadOrderFromGitHub(orderId) {
    try {
        const order = await githubAPI.getOrder(orderId);

        if (!order || !order.screenshots) {
            alert('No screenshots found for this order');
            return;
        }

        // Download each screenshot
        for (const screenshot of order.screenshots) {
            const link = document.createElement('a');
            link.href = screenshot.url;
            link.download = screenshot.name;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        alert(`✅ Downloading ${order.screenshots.length} screenshots for order ${orderId}!`);
    } catch (error) {
        alert(`Error downloading screenshots: ${error.message}`);
    }
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

// Update statistics
async function updateStats() {
    if (!githubAPI.isConfigured()) {
        document.getElementById('totalOrders').textContent = '-';
        document.getElementById('totalScreenshots').textContent = '-';
        return;
    }

    try {
        const orders = await githubAPI.getAllOrders();
        const totalScreenshots = orders.reduce((sum, order) => {
            return sum + (order.screenshots ? order.screenshots.length : 0);
        }, 0);

        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalScreenshots').textContent = totalScreenshots;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Handle sync (refresh orders from GitHub)
async function handleSync() {
    if (!githubAPI.isConfigured()) {
        openGitHubSettings();
        return;
    }

    const syncBtn = document.getElementById('syncBtn');
    const syncBtnText = document.getElementById('syncBtnText');
    const originalText = syncBtnText.textContent;

    syncBtnText.textContent = 'Refreshing...';
    syncBtn.disabled = true;

    try {
        await loadOrders();
        syncBtnText.textContent = '✅ Refreshed!';

        setTimeout(() => {
            syncBtnText.textContent = originalText;
            syncBtn.disabled = false;
        }, 2000);
    } catch (error) {
        syncBtnText.textContent = '❌ Error';
        alert(`Error refreshing orders: ${error.message}`);

        setTimeout(() => {
            syncBtnText.textContent = originalText;
            syncBtn.disabled = false;
        }, 2000);
    }
}

// Modal functions
function openModal(imageSrc) {
    const modal = document.getElementById('modal');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = `
        <span class="close" onclick="closeModal()">&times;</span>
        <img src="${imageSrc}" alt="Screenshot" style="width: 100%; height: auto;">
    `;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}
