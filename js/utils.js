// ============================================
// QSE PRO - UTILITY FUNCTIONS
// Versi: 6.0 - Complete Utilities
// ============================================

const Utils = {
    /**
     * Format angka dengan desimal tertentu
     * @param {number} v - Nilai yang akan diformat
     * @param {number} digits - Jumlah desimal (default: 3)
     * @returns {string} Angka terformat
     */
    formatAngka: function(v, digits = 3) {
        if (v === undefined || v === null || isNaN(v)) return '0.000';
        return v.toFixed(digits);
    },

    /**
     * Escape HTML untuk keamanan (mencegah XSS)
     * @param {string} str - String yang akan di-escape
     * @returns {string} String aman untuk HTML
     */
    escHtml: function(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },

    /**
     * Mendapatkan icon berdasarkan jenis pekerjaan
     * @param {string} jenis - Nama jenis pekerjaan
     * @returns {string} Nama class Font Awesome
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
     * @param {string} jenis - Nama jenis pekerjaan
     * @returns {string} Kode warna hex
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
     * Generate ID unik untuk item
     * @returns {string} ID unik
     */
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    /**
     * Download file sebagai CSV
     * @param {string} content - Konten file
     * @param {string} filename - Nama file
     * @param {string} type - MIME type (default: text/csv)
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
     * Format tanggal ke format Indonesia
     * @param {Date} date - Objek Date
     * @returns {string} Tanggal terformat
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
     * Format waktu ke format Indonesia
     * @param {Date} date - Objek Date
     * @returns {string} Waktu terformat
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
     * Format tanggal dan waktu lengkap
     * @param {Date} date - Objek Date
     * @returns {string} Tanggal dan waktu terformat
     */
    formatDateTime: function(date) {
        if (!date) date = new Date();
        return this.formatTanggal(date) + ' ' + this.formatWaktu(date);
    },

    /**
     * Deep clone object
     * @param {object} obj - Objek yang akan di-clone
     * @returns {object} Clone objek
     */
    clone: function(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (e) {
            return { ...obj };
        }
    },

    /**
     * Validasi form berdasarkan field definition
     * @param {object} data - Data yang divalidasi
     * @param {array} fields - Array field definition
     * @returns {object} { valid: boolean, field: string, message: string }
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
     * Validasi email
     * @param {string} email - Email yang divalidasi
     * @returns {boolean} Valid atau tidak
     */
    isValidEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validasi URL
     * @param {string} url - URL yang divalidasi
     * @returns {boolean} Valid atau tidak
     */
    isValidUrl: function(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Cek apakah koneksi internet tersedia
     * @returns {Promise<boolean>}
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
     * Cek status Service Worker
     * @returns {string} Status SW
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
     * Cek apakah browser mendukung fitur tertentu
     * @param {string} feature - Nama fitur
     * @returns {boolean} Mendukung atau tidak
     */
    isFeatureSupported: function(feature) {
        const features = {
            'localStorage': typeof localStorage !== 'undefined',
            'sessionStorage': typeof sessionStorage !== 'undefined',
            'serviceWorker': 'serviceWorker' in navigator,
            'webp': this.isWebPSupported(),
            'touch': 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            'canvas': !!document.createElement('canvas').getContext
        };
        return features[feature] || false;
    },

    /**
     * Cek dukungan format WebP
     * @returns {boolean} Mendukung atau tidak
     */
    isWebPSupported: function() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        const data = ctx.getImageData(0, 0, 1, 1);
        const test = canvas.toDataURL('image/webp');
        return test.indexOf('image/webp') === 0;
    },

    /**
     * Format ukuran file
     * @param {number} bytes - Ukuran dalam bytes
     * @param {number} decimals - Jumlah desimal
     * @returns {string} Ukuran terformat
     */
    formatFileSize: function(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    /**
     * Truncate string
     * @param {string} str - String yang akan dipotong
     * @param {number} maxLength - Panjang maksimal
     * @param {string} suffix - Akhiran (default: ...)
     * @returns {string} String terpotong
     */
    truncate: function(str, maxLength = 50, suffix = '...') {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + suffix;
    },

    /**
     * Capitalize string
     * @param {string} str - String yang akan di-capitalize
     * @returns {string} String ter-capitalize
     */
    capitalize: function(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Generate slug dari string
     * @param {string} str - String yang akan di-slug
     * @returns {string} Slug
     */
    slugify: function(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Debounce function untuk mencegah terlalu banyak eksekusi
     * @param {function} func - Fungsi yang akan di-debounce
     * @param {number} wait - Waktu tunggu (ms)
     * @param {boolean} immediate - Eksekusi segera
     * @returns {function} Fungsi ter-debounce
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
     * Throttle function untuk membatasi eksekusi
     * @param {function} func - Fungsi yang akan di-throttle
     * @param {number} limit - Batas waktu (ms)
     * @returns {function} Fungsi ter-throttle
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
     * Parse query string menjadi object
     * @param {string} query - Query string
     * @returns {object} Object dari query string
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
     * Build query string dari object
     * @param {object} params - Object parameter
     * @returns {string} Query string
     */
    buildQuery: function(params) {
        if (!params || Object.keys(params).length === 0) return '';
        return '?' + new URLSearchParams(params).toString();
    },

    /**
     * Copy text ke clipboard
     * @param {string} text - Teks yang akan disalin
     * @returns {Promise<boolean>}
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
     * Get file extension
     * @param {string} filename - Nama file
     * @returns {string} Ekstensi file
     */
    getFileExtension: function(filename) {
        if (!filename) return '';
        return filename.split('.').pop().toLowerCase();
    },

    /**
     * Get file name without extension
     * @param {string} filename - Nama file
     * @returns {string} Nama file tanpa ekstensi
     */
    getFileName: function(filename) {
        if (!filename) return '';
        const parts = filename.split('.');
        parts.pop();
        return parts.join('.');
    },

    /**
     * Check if file is image
     * @param {string} filename - Nama file
     * @returns {boolean} Apakah file gambar
     */
    isImageFile: function(filename) {
        if (!filename) return false;
        const ext = this.getFileExtension(filename);
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'];
        return imageExts.includes(ext);
    },

    /**
     * Get random color
     * @returns {string} Kode warna hex random
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
     * Sleep for given milliseconds
     * @param {number} ms - Milidetik
     * @returns {Promise<void>}
     */
    sleep: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Check if object is empty
     * @param {object} obj - Objek yang diperiksa
     * @returns {boolean} Apakah objek kosong
     */
    isEmpty: function(obj) {
        if (!obj) return true;
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        return false;
    },

    /**
     * Group array by key
     * @param {array} arr - Array yang akan digroup
     * @param {string} key - Kunci untuk grouping
     * @returns {object} Objek hasil grouping
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
     * @param {array} arr - Array yang akan di-sort
     * @param {string} key - Kunci untuk sorting
     * @param {boolean} ascending - Arah sorting
     * @returns {array} Array ter-sort
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
     * Convert to Rupiah format
     * @param {number} value - Nilai yang akan diformat
     * @param {string} prefix - Awalan (default: Rp)
     * @returns {string} Format Rupiah
     */
    toRupiah: function(value, prefix = 'Rp ') {
        if (isNaN(value) || value === null || value === undefined) return prefix + '0';
        const formatted = new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
        return prefix + formatted;
    },

    /**
     * Convert from Rupiah string to number
     * @param {string} str - String Rupiah
     * @returns {number} Nilai angka
     */
    fromRupiah: function(str) {
        if (!str) return 0;
        const cleaned = str.replace(/[^0-9,]/g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    },

    /**
     * Get month name in Indonesian
     * @param {number} month - Bulan (1-12)
     * @returns {string} Nama bulan
     */
    getMonthName: function(month) {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return months[month - 1] || '';
    },

    /**
     * Get day name in Indonesian
     * @param {number} day - Hari (0-6)
     * @returns {string} Nama hari
     */
    getDayName: function(day) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[day] || '';
    },

    /**
     * Get remaining days between two dates
     * @param {Date} start - Tanggal awal
     * @param {Date} end - Tanggal akhir
     * @returns {number} Selisih hari
     */
    getDaysDiff: function(start, end) {
        if (!start || !end) return 0;
        const diff = new Date(end) - new Date(start);
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },

    /**
     * Check if date is today
     * @param {Date} date - Tanggal yang diperiksa
     * @returns {boolean} Apakah hari ini
     */
    isToday: function(date) {
        if (!date) return false;
        const today = new Date();
        const d = new Date(date);
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    },

    /**
     * Merge objects deeply
     * @param {object} target - Target object
     * @param {object} source - Source object
     * @returns {object} Object hasil merge
     */
    deepMerge: function(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
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
