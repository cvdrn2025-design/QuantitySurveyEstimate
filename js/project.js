// ============================================
// QSE PRO - MANAJEMEN PROJECT
// Versi: 1.0
// ============================================

const ProjectManager = {
    // ============================================
    // STATE
    // ============================================
    currentProject: null,
    projects: [],
    projectHistory: [],

    // ============================================
    // DEFAULT PROJECT
    // ============================================
    getDefaultProject: function() {
        return {
            id: Utils.generateId(),
            nama: 'Proyek Baru',
            lokasi: '',
            klien: '',
            kontraktor: '',
            konsultan: '',
            tanggalMulai: '',
            tanggalSelesai: '',
            deskripsi: '',
            nomorKontrak: '',
            nilaiKontrak: 0,
            status: 'Draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    },

    // ============================================
    // CRUD OPERATIONS
    // ============================================
    
    /**
     * Buat project baru
     */
    create: function(data) {
        const project = {
            ...this.getDefaultProject(),
            ...data,
            id: Utils.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.projects.push(project);
        this.currentProject = project;
        this.saveToLocal();
        return project;
    },

    /**
     * Baca semua project
     */
    getAll: function() {
        return this.projects;
    },

    /**
     * Baca project berdasarkan ID
     */
    getById: function(id) {
        return this.projects.find(p => p.id === id) || null;
    },

    /**
     * Update project
     */
    update: function(id, data) {
        const index = this.projects.findIndex(p => p.id === id);
        if (index === -1) return null;
        
        this.projects[index] = {
            ...this.projects[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        
        if (this.currentProject && this.currentProject.id === id) {
            this.currentProject = this.projects[index];
        }
        
        this.saveToLocal();
        return this.projects[index];
    },

    /**
     * Hapus project
     */
    delete: function(id) {
        const index = this.projects.findIndex(p => p.id === id);
        if (index === -1) return false;
        
        this.projects.splice(index, 1);
        if (this.currentProject && this.currentProject.id === id) {
            this.currentProject = this.projects.length > 0 ? this.projects[0] : null;
        }
        this.saveToLocal();
        return true;
    },

    /**
     * Set current project
     */
    setCurrent: function(id) {
        const project = this.getById(id);
        if (project) {
            this.currentProject = project;
            this.saveToLocal();
            return project;
        }
        return null;
    },

    /**
     * Get current project
     */
    getCurrent: function() {
        return this.currentProject;
    },

    // ============================================
    // PENYIMPANAN LOKAL
    // ============================================
    
    /**
     * Simpan ke localStorage
     */
    saveToLocal: function() {
        try {
            localStorage.setItem('qse_projects', JSON.stringify(this.projects));
            localStorage.setItem('qse_current_project', JSON.stringify(this.currentProject));
        } catch (e) {
            console.warn('⚠️ Gagal menyimpan project ke localStorage:', e);
        }
    },

    /**
     * Load dari localStorage
     */
    loadFromLocal: function() {
        try {
            const projectsData = localStorage.getItem('qse_projects');
            if (projectsData) {
                this.projects = JSON.parse(projectsData);
            }
            
            const currentData = localStorage.getItem('qse_current_project');
            if (currentData) {
                this.currentProject = JSON.parse(currentData);
            }
        } catch (e) {
            console.warn('⚠️ Gagal load project dari localStorage:', e);
        }
    },

    // ============================================
    // VALIDASI
    // ============================================
    
    /**
     * Validasi data project
     */
    validate: function(data) {
        const errors = [];
        if (!data.nama || data.nama.trim() === '') {
            errors.push('Nama proyek wajib diisi');
        }
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    // ============================================
    // UTILITY
    // ============================================
    
    /**
     * Get status badge
     */
    getStatusBadge: function(status) {
        const badges = {
            'Draft': 'badge-draft',
            'Aktif': 'badge-active',
            'On Hold': 'badge-hold',
            'Selesai': 'badge-done',
            'Batal': 'badge-cancel'
        };
        return badges[status] || 'badge-draft';
    },

    /**
     * Get status color
     */
    getStatusColor: function(status) {
        const colors = {
            'Draft': '#94a3b8',
            'Aktif': '#2563eb',
            'On Hold': '#f59e0b',
            'Selesai': '#059669',
            'Batal': '#dc2626'
        };
        return colors[status] || '#94a3b8';
    },

    /**
     * Format nilai kontrak
     */
    formatNilai: function(value) {
        return Utils.formatRupiah(value);
    },

    /**
     * Get summary project
     */
    getSummary: function(project) {
        if (!project) return null;
        return {
            nama: project.nama,
            lokasi: project.lokasi || '-',
            klien: project.klien || '-',
            kontraktor: project.kontraktor || '-',
            status: project.status || 'Draft',
            nilaiKontrak: this.formatNilai(project.nilaiKontrak || 0),
            durasi: this.getDurasi(project.tanggalMulai, project.tanggalSelesai)
        };
    },

    /**
     * Get durasi proyek
     */
    getDurasi: function(tanggalMulai, tanggalSelesai) {
        if (!tanggalMulai || !tanggalSelesai) return '-';
        const start = new Date(tanggalMulai);
        const end = new Date(tanggalSelesai);
        const diff = end - start;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 0) return '0 hari';
        if (days === 0) return '1 hari';
        if (days < 30) return days + ' hari';
        if (days < 365) return Math.floor(days / 30) + ' bulan';
        return Math.floor(days / 365) + ' tahun';
    }
};

// ============================================
// EKSPOR
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectManager;
}

if (typeof window !== 'undefined') {
    window.ProjectManager = ProjectManager;
    console.log('✅ ProjectManager loaded!');
          }
