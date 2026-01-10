/**
 * GitHub API Integration
 * Handles all GitHub repository operations
 */

class GitHubAPI {
    constructor() {
        this.token = localStorage.getItem('github_token');
        this.owner = 'neeraj542';
        this.repo = 'ynp-ss-manager-sync';
        this.branch = 'main';
        this.baseUrl = 'https://api.github.com';
    }

    // Check if token is configured
    isConfigured() {
        return !!this.token;
    }

    // Set GitHub token
    setToken(token) {
        this.token = token;
        localStorage.setItem('github_token', token);
    }

    // Make authenticated request to GitHub API
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'GitHub API request failed');
        }

        return response.json();
    }

    // Get file content from repository
    async getFile(path) {
        try {
            return await this.request(`/repos/${this.owner}/${this.repo}/contents/${path}`);
        } catch (error) {
            if (error.message.includes('Not Found')) {
                return null;
            }
            throw error;
        }
    }

    // Create or update file in repository
    async createOrUpdateFile(path, content, message, sha = null) {
        const body = {
            message,
            content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
            branch: this.branch
        };

        if (sha) {
            body.sha = sha;
        }

        return await this.request(`/repos/${this.owner}/${this.repo}/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    // Upload binary file (image)
    async uploadImage(path, base64Data, message) {
        // Remove data URL prefix if present
        const base64Content = base64Data.split(',')[1] || base64Data;

        // Check if file already exists to get its SHA
        let existingSha = null;
        try {
            const existingFile = await this.getFile(path);
            if (existingFile && existingFile.sha) {
                existingSha = existingFile.sha;
            }
        } catch (error) {
            // File doesn't exist, that's fine
        }

        const body = {
            message,
            content: base64Content,
            branch: this.branch
        };

        // Include SHA if file exists (for updates)
        if (existingSha) {
            body.sha = existingSha;
        }

        return await this.request(`/repos/${this.owner}/${this.repo}/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    // List contents of a directory
    async listDirectory(path = '') {
        try {
            return await this.request(`/repos/${this.owner}/${this.repo}/contents/${path}`);
        } catch (error) {
            if (error.message.includes('Not Found')) {
                return [];
            }
            throw error;
        }
    }

    // Create order on GitHub
    async createOrder(orderId, orderData, screenshots) {
        const orderPath = `orders/${orderId}`;

        try {
            // 1. Create or update order.json
            const orderJson = JSON.stringify(orderData, null, 2);

            // Check if order.json already exists
            let existingOrderSha = null;
            try {
                const existingOrder = await this.getFile(`${orderPath}/order.json`);
                if (existingOrder && existingOrder.sha) {
                    existingOrderSha = existingOrder.sha;
                }
            } catch (error) {
                // File doesn't exist, that's fine
            }

            await this.createOrUpdateFile(
                `${orderPath}/order.json`,
                orderJson,
                `${existingOrderSha ? 'Update' : 'Add'} order ${orderId}`,
                existingOrderSha
            );

            // 2. Upload screenshots SEQUENTIALLY to avoid race conditions
            // Parallel uploads can cause SHA conflicts when files exist
            for (const [type, screenshot] of Object.entries(screenshots)) {
                const ext = screenshot.filename.split('.').pop();
                try {
                    await this.uploadImage(
                        `${orderPath}/${type}.${ext}`,
                        screenshot.data,
                        `${existingOrderSha ? 'Update' : 'Add'} ${type} screenshot for order ${orderId}`
                    );
                } catch (error) {
                    console.error(`Error uploading ${type} screenshot:`, error);
                    // Continue with other screenshots even if one fails
                }
            }

            return true;
        } catch (error) {
            console.error('Error creating order on GitHub:', error);
            throw error;
        }
    }

    // Get all orders from GitHub
    async getAllOrders() {
        try {
            const ordersDir = await this.listDirectory('orders');

            if (!ordersDir || ordersDir.length === 0) {
                return [];
            }

            // Filter only directories
            const orderFolders = ordersDir.filter(item => item.type === 'dir');

            // Fetch order.json for each order
            const orderPromises = orderFolders.map(async (folder) => {
                try {
                    const orderFile = await this.getFile(`orders/${folder.name}/order.json`);
                    if (orderFile && orderFile.content) {
                        const content = atob(orderFile.content);
                        return JSON.parse(content);
                    }
                } catch (error) {
                    console.error(`Error fetching order ${folder.name}:`, error);
                    return null;
                }
            });

            const orders = await Promise.all(orderPromises);
            return orders.filter(order => order !== null);
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }

    // Get specific order by ID
    async getOrder(orderId) {
        try {
            const orderFile = await this.getFile(`orders/${orderId}/order.json`);

            if (!orderFile || !orderFile.content) {
                return null;
            }

            const content = atob(orderFile.content);
            const orderData = JSON.parse(content);

            // Get screenshots
            const orderDir = await this.listDirectory(`orders/${orderId}`);
            const screenshots = orderDir
                .filter(file => file.type === 'file' && file.name !== 'order.json')
                .map(file => ({
                    name: file.name,
                    url: file.download_url,
                    type: file.name.split('.')[0]
                }));

            return {
                ...orderData,
                screenshots
            };
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error);
            return null;
        }
    }

    // Get raw URL for file
    getRawUrl(path) {
        return `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${path}`;
    }
}

// Export for use in other scripts
window.GitHubAPI = GitHubAPI;
