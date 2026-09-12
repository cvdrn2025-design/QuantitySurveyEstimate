// ============================================
// QSE PRO - UTILITY FUNCTIONS
// Versi: 6.3 - Complete Utilities
// ============================================

const Utils = {
    /**
     * Format angka dengan desimal tertentu
     */
    formatAngka: function(v, digits = 3) {
        if (v === undefined || v === null || isNaN(v)) return '0.000';
        return v.toFixed(digits);
    },

    /**
     * Escape HTML untuk keamanan (mencegah XSS)
     */
    escHtml: function(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },

    /**
     * Mendapatkan icon berdasarkan jenis pekerjaan
     */
    getJenisIcon: function(jenis) {
        const icons = {
            'Struktur': 'fa-building',
            'Arsitektur': 'fa-archway',
            'Mekanikal': 'fa-cogs',
            'Elektrikal': 'fa-bolt',
            'Finishing': 'fa-paint-roller',
            'Plumbing': 'fa-wrench',
            'Landskap': 'fa-tree',
            'Penutup': 'fa-home',
            'Pekerjaan_Tanah': 'fa-tractor',
            'Pekerjaan_Pondasi': 'fa-chess-queen',
            'Struktur_Beton': 'fa-cube',
            'Pekerjaan_Dinding': 'fa-layer-group',
            'Pekerjaan_Lantai': 'fa-th-large',
            'Pekerjaan_Atap': 'fa-home',
            'Pekerjaan_Besi': 'fa-vector-square',
            'Pekerjaan_Bekisting': 'fa-border-all',
            'Pekerjaan_Finishing': 'fa-paint-roller',
            'Pekerjaan_Mekanikal': 'fa-cogs',
            'Pekerjaan_Elektrikal': 'fa-bolt',
            'Pekerjaan_Plumbing': 'fa-wrench',
            'Pekerjaan_Landskap': 'fa-tree'
        };
        return icons[jenis] || 'fa-cube';
    },

    /**
     * Mendapatkan warna berdasarkan jenis pekerjaan
     */
    getJenisWarna: function(jenis) {
        const warna = {
            'Struktur': '#2563eb',
            'Arsitektur': '#7c3aed',
            'Mekanikal': '#0891b2',
            'Elektrikal': '#f59e0b',
            'Finishing': '#d97706',
            'Plumbing': '#059669',
            'Landskap': '#16a34a',
            'Penutup': '#8b5cf6',
            'Pekerjaan_Tanah': '#8B6B4C',
            'Pekerjaan_Pondasi': '#8B4513',
            'Struktur_Beton': '#2563eb',
            'Pekerjaan_Dinding': '#d97706',
            'Pekerjaan_Lantai': '#0891b2',
            'Pekerjaan_Atap': '#8b5cf6',
            'Pekerjaan_Besi': '#dc2626',
            'Pekerjaan_Bekisting': '#0891b2',
            'Pekerjaan_Finishing': '#d97706',
            'Pekerjaan_Mekanikal': '#0891b2',
            'Pekerjaan_Elektrikal': '#f59e0b',
            'Pekerjaan_Plumbing': '#059669',
            'Pekerjaan_Landskap': '#16a34a'
        };
        return warna[jenis] || '#64748b';
    },

    /**
     * Generate ID unik
     */
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    /**
     * Download file
     */
    downloadFile: function(content, filename, type = 'text/csv') {
        const blob = new Blob([content], { type: type });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    },

    /**
     * Format tanggal Indonesia
     */
    formatTanggal: function(date) {
        if (!date) date = new Date();
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    /**
     * Format waktu Indonesia
     */
    formatWaktu: function(date) {
        if (!date) date = new Date();
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    /**
     * Format tanggal dan waktu
     */
    formatDateTime: function(date) {
        if (!date) date = new Date();
        return this.formatTanggal(date) + ' ' + this.formatWaktu(date);
    },

    /**
     * Deep clone object
     */
    clone: function(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (e) {
            return { ...obj };
        }
    },

    /**
     * Validasi form
     */
    validateForm: function(data, fields) {
        if (!fields || !Array.isArray(fields)) {
            return { valid: true };
        }
        
        for (const field of fields) {
            if (field.required) {
                const val = data[field.id];
                if (val === undefined || val === null || val === '') {
                    return { 
                        valid: false, 
                        field: field.id, 
                        message: `${field.label} wajib diisi` 
                    };
                }
                if (field.type === 'number' && (isNaN(val) || val <= 0)) {
                    return { 
                        valid: false, 
                        field: field.id, 
                        message: `${field.label} harus > 0` 
                    };
                }
            }
        }
        return { valid: true };
    },

    /**
     * Format Rupiah
     */
    formatRupiah: function(value) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },

    /**
     * Format date input
     */
    formatDateInput: function(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    },

    /**
     * Generate project code
     */
    generateProjectCode: function(nama) {
        const prefix = nama.substring(0, 3).toUpperCase();
        const year = new Date().getFullYear();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${year}-${random}`;
    },

    /**
     * Get status options
     */
    getStatusOptions: function() {
        return ['Draft', 'Aktif', 'On Hold', 'Selesai', 'Batal'];
    },

    /**
     * Check internet connection
     */
    checkInternet: function() {
        return new Promise((resolve) => {
            fetch('https://www.google.com/favicon.ico', { 
                mode: 'no-cors',
                cache: 'no-store'
            })
            .then(() => resolve(true))
            .catch(() => resolve(false));
        });
    },

    /**
     * Check Service Worker status
     */
    checkSWStatus: function() {
        if (!('serviceWorker' in navigator)) {
            return 'Not Supported';
        }
        if (navigator.serviceWorker.controller) {
            return 'Active';
        }
        return 'Registered';
    },

    /**
     * Copy to clipboard
     */
    copyToClipboard: function(text) {
        return new Promise((resolve) => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text)
                    .then(() => resolve(true))
                    .catch(() => resolve(false));
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    resolve(true);
                } catch (e) {
                    resolve(false);
                }
                document.body.removeChild(textarea);
            }
        });
    },

    /**
     * Debounce function
     */
    debounce: function(func, wait = 300, immediate = false) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },

    /**
     * Throttle function
     */
    throttle: function(func, limit = 300) {
        let inThrottle;
        return function() {
            const context = this;
            const args = arguments;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Check if object is empty
     */
    isEmpty: function(obj) {
        if (!obj) return true;
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        return false;
    },

    /**
     * Group array by key
     */
    groupBy: function(arr, key) {
        if (!arr || !Array.isArray(arr)) return {};
        return arr.reduce((result, item) => {
            const groupKey = item[key] || 'undefined';
            if (!result[groupKey]) result[groupKey] = [];
            result[groupKey].push(item);
            return result;
        }, {});
    },

    /**
     * Sort array by key
     */
    sortBy: function(arr, key, ascending = true) {
        if (!arr || !Array.isArray(arr)) return [];
        return [...arr].sort((a, b) => {
            const valA = a[key] || 0;
            const valB = b[key] || 0;
            if (typeof valA === 'string') {
                return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return ascending ? valA - valB : valB - valA;
        });
    },

    /**
     * Get file extension
     */
    getFileExtension: function(filename) {
        if (!filename) return '';
        return filename.split('.').pop().toLowerCase();
    },

    /**
     * Check if file is image
     */
    isImageFile: function(filename) {
        if (!filename) return false;
        const ext = this.getFileExtension(filename);
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'];
        return imageExts.includes(ext);
    },

    /**
     * Random color
     */
    randomColor: function() {
        const colors = [
            '#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706',
            '#dc2626', '#8b5cf6', '#16a34a', '#f59e0b', '#ec4899',
            '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * Sleep
     */
    sleep: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Parse query string
     */
    parseQuery: function(query) {
        if (!query) return {};
        const params = new URLSearchParams(query);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    /**
     * Build query string
     */
    buildQuery: function(params) {
        if (!params || Object.keys(params).length === 0) return '';
        return '?' + new URLSearchParams(params).toString();
    }
};

// ============================================
// EKSPOR
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

if (typeof window !== 'undefined') {
    window.Utils = Utils;
    console.log('✅ Utils loaded!');
    console.log(`📋 ${Object.keys(Utils).length} fungsi tersedia`);
            }
