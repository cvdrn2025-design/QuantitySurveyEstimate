// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
    /**
     * Format angka dengan desimal tertentu
     */
    formatAngka: function(v, digits = 3) {
        return v.toFixed(digits);
    },

    /**
     * Escape HTML untuk keamanan
     */
    escHtml: function(str) {
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
            'Penutup': 'fa-home'
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
            'Penutup': '#8b5cf6'
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
     * Format tanggal
     */
    formatTanggal: function(date) {
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    /**
     * Deep clone object
     */
    clone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Validasi form
     */
    validateForm: function(data, fields) {
        for (const field of fields) {
            if (field.required) {
                const val = data[field.id];
                if (val === undefined || val === null || val === '') {
                    return { valid: false, field: field.id, message: `${field.label} wajib diisi` };
                }
                if (field.type === 'number' && (isNaN(val) || val <= 0)) {
                    return { valid: false, field: field.id, message: `${field.label} harus > 0` };
                }
            }
        }
        return { valid: true };
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
            }
