// ============================================
// QSE PRO - UTILITY FUNCTIONS
// Versi: 1.0
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
            'Penutup': 'fa-home'
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
            'Penutup': '#8b5cf6'
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
    console.log('✅ Utils loaded');
}
