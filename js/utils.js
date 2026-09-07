// ============================================
// TAMBAHAN FUNGSI UTILITY UNTUK PROJECT
// ============================================

// Tambahkan ke dalam object Utils yang sudah ada

Utils.formatRupiah = function(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

Utils.formatDateInput = function(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

Utils.generateProjectCode = function(nama) {
    const prefix = nama.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${year}-${random}`;
};

Utils.getStatusOptions = function() {
    return ['Draft', 'Aktif', 'On Hold', 'Selesai', 'Batal'];
};
