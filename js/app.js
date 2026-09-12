// ============================================
// QSE PRO - APLIKASI UTAMA
// Versi: 6.4 - Complete with Modal Project Fix
// ============================================

(function() {
    "use strict";

    // ============================================
    // CEK DEPENDENSI
    // ============================================
    if (typeof DATABASE === 'undefined') {
        console.error('❌ Database tidak ditemukan!');
        showError('Database tidak ditemukan! Pastikan file database.js terload.');
        return;
    }

    if (typeof Utils === 'undefined') {
        console.error('❌ Utils tidak ditemukan!');
        showError('Utils tidak ditemukan! Pastikan file utils.js terload.');
        return;
    }

    // Fallback untuk ProjectManager
    if (typeof ProjectManager === 'undefined') {
        console.warn('⚠️ ProjectManager tidak ditemukan, membuat fallback...');
        window.ProjectManager = {
            projects: [],
            currentProject: null,
            getCurrent: function() { return this.currentProject; },
            getAll: function() { return this.projects; },
            getById: function(id) { return this.projects.find(p => p.id === id) || null; },
            create: function(data) {
                const project = {
                    id: Utils.generateId ? Utils.generateId() : Date.now().toString(36),
                    nama: data.nama || 'Proyek Baru',
                    lokasi: data.lokasi || '',
                    klien: data.klien || '',
                    kontraktor: data.kontraktor || '',
                    konsultan: data.konsultan || '',
                    tanggalMulai: data.tanggalMulai || '',
                    tanggalSelesai: data.tanggalSelesai || '',
                    deskripsi: data.deskripsi || '',
                    nomorKontrak: data.nomorKontrak || '',
                    nilaiKontrak: data.nilaiKontrak || 0,
                    status: data.status || 'Draft',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                this.projects.push(project);
                this.currentProject = project;
                this.saveToLocal();
                return project;
            },
            update: function(id, data) {
                const index = this.projects.findIndex(p => p.id === id);
                if (index === -1) return null;
                this.projects[index] = { ...this.projects[index], ...data, updatedAt: new Date().toISOString() };
                if (this.currentProject && this.currentProject.id === id) {
                    this.currentProject = this.projects[index];
                }
                this.saveToLocal();
                return this.projects[index];
            },
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
            setCurrent: function(id) {
                const project = this.getById(id);
                if (project) {
                    this.currentProject = project;
                    this.saveToLocal();
                    return project;
                }
                return null;
            },
            saveToLocal: function() {
                try {
                    localStorage.setItem('qse_projects', JSON.stringify(this.projects));
                    localStorage.setItem('qse_current_project', JSON.stringify(this.currentProject));
                } catch (e) {}
            },
            loadFromLocal: function() {
                try {
                    const data = localStorage.getItem('qse_projects');
                    if (data) this.projects = JSON.parse(data);
                    const current = localStorage.getItem('qse_current_project');
                    if (current) this.currentProject = JSON.parse(current);
                } catch (e) {}
            },
            getStatusColor: function(status) {
                const colors = { 'Draft': '#94a3b8', 'Aktif': '#2563eb', 'On Hold': '#f59e0b', 'Selesai': '#059669', 'Batal': '#dc2626' };
                return colors[status] || '#94a3b8';
            }
        };
        console.log('✅ Fallback ProjectManager created');
    }

    console.log('✅ Dependensi terdeteksi:');
    console.log(`   - DATABASE: ${Object.keys(DATABASE).length} jenis`);
    console.log(`   - Utils: ${Object.keys(Utils).length} fungsi`);
    console.log(`   - ProjectManager: ${typeof ProjectManager !== 'undefined' ? '✅' : '❌'}`);

    // ============================================
    // FUNGSI SHOW ERROR
    // ============================================
    function showError(message) {
        const errorEl = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        if (errorEl && errorText) {
            errorEl.classList.add('show');
            errorText.textContent = message;
        } else {
            alert('❌ ' + message);
        }
    }

    // ============================================
    // STATE
    // ============================================
    const state = {
        items: [],
        selectedJenis: '',
        selectedItemKey: '',
        currentData: {},
        // Gambar
        gambarList: [],
        currentGambarIndex: 0,
        // Zoom & Pan
        zoom: 1,
        panX: 0,
        panY: 0,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        startPanX: 0,
        startPanY: 0,
        // Markup
        markupMode: 'draw',
        markupColor: '#dc2626',
        isDrawing: false,
        drawStartX: 0,
        drawStartY: 0,
        markupHistory: [],
        currentMarkup: null
    };

    // ============================================
    // DOM REFS
    // ============================================
    const DOM = {
        // Select
        jenisSelect: document.getElementById('jenisPekerjaanUtama'),
        
        // Containers
        step2: document.getElementById('step2Container'),
        step3: document.getElementById('step3Container'),
        itemPicker: document.getElementById('itemPickerContainer'),
        itemSearchInput: document.getElementById('itemSearchInput'),
        formContainer: document.getElementById('formContainer'),
        calcDetail: document.getElementById('calcDetailContainer'),
        
        // Labels
        selectedJenisLabel: document.getElementById('selectedJenisLabel'),
        selectedItemLabel: document.getElementById('selectedItemLabel'),
        
        // Calc
        rumusDisplay: document.getElementById('rumusDisplay'),
        stepDisplay: document.getElementById('stepDisplay'),
        calcResultValue: document.getElementById('calcResultValue'),
        calcResultSub: document.getElementById('calcResultSub'),
        
        // Buttons
        tambahBtn: document.getElementById('tambahBtn'),
        resetFormBtn: document.getElementById('resetFormBtn'),
        hapusSemuaBtn: document.getElementById('hapusSemuaBtn'),
        exportBtn: document.getElementById('exportBtn'),
        cetakBtn: document.getElementById('cetakBtn'),
        
        // Lists
        itemList: document.getElementById('itemListContainer'),
        jumlahItem: document.getElementById('jumlahItem'),
        
        // Stats
        statTotalItem: document.getElementById('statTotalItem'),
        statTotalVolume: document.getElementById('statTotalVolume'),
        statJenisPekerjaan: document.getElementById('statJenisPekerjaan'),
        statMaterialTop: document.getElementById('statMaterialTop'),
        totalItemsBadge: document.getElementById('totalItemsBadge'),
        totalVolumeBadge: document.getElementById('totalVolumeBadge'),
        
        // Info
        displayMaterial: document.getElementById('displayMaterial'),
        displayVolume: document.getElementById('displayVolume'),
        displayItem: document.getElementById('displayItem'),
        displayJenis: document.getElementById('displayJenis'),
        materialBreakdown: document.getElementById('materialBreakdown'),
        dbInfo: document.getElementById('dbInfo'),
        
        // Project Info
        infoProjectName: document.getElementById('infoProjectName'),
        infoProjectLocation: document.getElementById('infoProjectLocation'),
        infoProjectClient: document.getElementById('infoProjectClient'),
        infoProjectStatusText: document.getElementById('infoProjectStatusText'),
        infoProjectDate: document.getElementById('infoProjectDate'),
        currentProjectName: document.getElementById('currentProjectName'),
        
        // Gambar
        gambarContainer: document.getElementById('gambarContainer'),
        gambarPlaceholder: document.getElementById('gambarPlaceholder'),
        imageWrapper: document.getElementById('imageWrapper'),
        gambarPreview: document.getElementById('gambarPreview'),
        markupCanvas: document.getElementById('markupCanvas'),
        thumbnailList: document.getElementById('thumbnailList'),
        gambarInfo: document.getElementById('gambarInfo'),
        gambarNama: document.getElementById('gambarNama'),
        gambarUkuran: document.getElementById('gambarUkuran'),
        gambarCount: document.getElementById('gambarCount'),
        zoomControls: document.getElementById('zoomControls'),
        zoomLevel: document.getElementById('zoomLevel'),
        fileInput: document.getElementById('fileInput'),
        fileInputMultiple: document.getElementById('fileInputMultiple'),
        hapusGambarBtn: document.getElementById('hapusGambarBtn'),
        simpanGambarBtn: document.getElementById('simpanGambarBtn'),
        
        // Zoom Buttons
        zoomInBtn: document.getElementById('zoomInBtn'),
        zoomOutBtn: document.getElementById('zoomOutBtn'),
        zoomFitBtn: document.getElementById('zoomFitBtn'),
        zoomResetBtn: document.getElementById('zoomResetBtn'),
        
        // Markup Buttons
        markupDraw: document.getElementById('markupDraw'),
        markupLine: document.getElementById('markupLine'),
        markupRect: document.getElementById('markupRect'),
        markupText: document.getElementById('markupText'),
        markupUndo: document.getElementById('markupUndo'),
        markupClear: document.getElementById('markupClear'),
        markupColor: document.getElementById('markupColor')
    };

    // ============================================
    // VALIDASI DOM
    // ============================================
    function validateDOM() {
        const missing = [];
        for (const [key, el] of Object.entries(DOM)) {
            if (!el) {
                missing.push(key);
            }
        }
        if (missing.length > 0) {
            console.warn('⚠️ Element DOM tidak ditemukan:', missing.join(', '));
            return false;
        }
        return true;
    }

    if (!validateDOM()) {
        console.error('❌ DOM validation failed!');
        showError('Beberapa elemen DOM tidak ditemukan. Refresh halaman.');
        return;
    }

    // ============================================
    // FUNGSI DATABASE
    // ============================================
    function loadJenisPekerjaan() {
        const select = DOM.jenisSelect;
        if (!select) return;
        
        const jenisList = Object.keys(DATABASE);
        
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        for (const jenis of jenisList) {
            const data = DATABASE[jenis];
            const option = document.createElement('option');
            option.value = jenis;
            option.textContent = data.nama || jenis;
            select.appendChild(option);
        }
        
        const totalItems = Object.values(DATABASE).reduce((acc, j) => acc + Object.keys(j.items).length, 0);
        if (DOM.dbInfo) {
            DOM.dbInfo.textContent = `${jenisList.length} jenis, ${totalItems} item`;
        }
        console.log(`📋 Loaded ${jenisList.length} jenis pekerjaan ke dropdown`);
    }

    function loadItems(jenis) {
        const data = DATABASE[jenis];
        if (!data) {
            DOM.itemPicker.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;color:#94a3b8;font-size:13px;padding:20px 0;">
                    <i class="fas fa-exclamation-circle" style="display:block;font-size:24px;margin-bottom:8px;opacity:0.3;"></i>
                    Tidak ada item untuk jenis ini
                </div>
            `;
            return;
        }

        let html = '';
        const items = data.items || {};
        const itemKeys = Object.keys(items);
        
        if (itemKeys.length === 0) {
            html = `
                <div style="grid-column:1/-1;text-align:center;color:#94a3b8;font-size:13px;padding:20px 0;">
                    <i class="fas fa-info-circle" style="display:block;font-size:24px;margin-bottom:8px;opacity:0.3;"></i>
                    Belum ada item untuk jenis ini. Tambahkan di database.
                </div>
            `;
        } else {
            for (const [key, item] of Object.entries(items)) {
                const icon = item.icon || 'fa-cube';
                html += `
                    <button class="item-picker-btn" data-key="${key}" data-nama="${item.nama}">
                        <i class="fas ${icon}"></i>
                        ${item.nama}
                        <span class="badge-item">${key}</span>
                    </button>
                `;
            }
        }
        
        DOM.itemPicker.innerHTML = html;

        document.querySelectorAll('.item-picker-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.item-picker-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const key = this.dataset.key;
                const nama = this.dataset.nama;
                state.selectedItemKey = key;
                DOM.selectedItemLabel.textContent = '📐 ' + nama;
                DOM.step3.classList.remove('hidden');
                loadForm(key);
            });
        });
        
        console.log(`📋 Loaded ${itemKeys.length} item untuk ${jenis}`);
    }

    function loadForm(key) {
        const jenisData = DATABASE[state.selectedJenis];
        if (!jenisData) {
            console.warn(`⚠️ Jenis "${state.selectedJenis}" tidak ditemukan`);
            return;
        }
        const itemData = jenisData.items[key];
        if (!itemData) {
            console.warn(`⚠️ Item "${key}" tidak ditemukan di ${state.selectedJenis}`);
            return;
        }

        DOM.formContainer.innerHTML = '';
        state.currentData = {};

        let formHtml = '';
        const fields = itemData.fields || [];
        let currentGroup = [];

        for (let i = 0; i < fields.length; i++) {
            const f = fields[i];
            let inputHtml = '';
            
            if (f.type === 'text') {
                inputHtml = `<input type="text" id="field_${f.id}" placeholder="${f.label}" value="${f.default || ''}" ${f.required ? 'required' : ''} />`;
            } else if (f.type === 'number') {
                inputHtml = `<input type="number" id="field_${f.id}" step="${f.step || 0.001}" value="${f.default || 0}" ${f.required ? 'required' : ''} />`;
            } else if (f.type === 'select') {
                let options = f.options || [];
                let opts = options.map(o => `<option value="${o}" ${o===f.default?'selected':''}>${o}</option>`).join('');
                inputHtml = `<select id="field_${f.id}">${opts}</select>`;
            }
            
            const fieldHtml = `
                <div class="form-group">
                    <label><i class="fas fa-${f.icon || 'circle'}"></i> ${f.label}</label>
                    ${inputHtml}
                    ${f.hint ? `<div class="hint">${f.hint}</div>` : ''}
                </div>
            `;
            currentGroup.push(fieldHtml);
            
            if (currentGroup.length === 4 || i === fields.length - 1) {
                const cols = currentGroup.length;
                const colClass = cols === 1 ? '' : cols === 2 ? 'form-row' : cols === 3 ? 'form-row-3' : 'form-row-4';
                formHtml += `<div class="${colClass}" style="margin-bottom:8px;">${currentGroup.join('')}</div>`;
                currentGroup = [];
            }
        }

        DOM.formContainer.innerHTML = formHtml;

        document.querySelectorAll('#formContainer input, #formContainer select').forEach(el => {
            el.addEventListener('input', function() { updatePreview(key); });
            el.addEventListener('change', function() { updatePreview(key); });
        });

        DOM.rumusDisplay.textContent = '📐 ' + (itemData.rumus || 'Rumus tidak tersedia');
        DOM.calcDetail.classList.add('show');
        updatePreview(key);
        
        console.log(`📋 Form loaded untuk "${itemData.nama}"`);
    }

    function getFormData(key) {
        const data = {};
        const jenisData = DATABASE[state.selectedJenis];
        if (!jenisData) return data;
        const itemData = jenisData.items[key];
        if (!itemData) return data;
        
        (itemData.fields || []).forEach(f => {
            const el = document.getElementById(`field_${f.id}`);
            if (el) {
                if (f.type === 'number') {
                    data[f.id] = parseFloat(el.value) || 0;
                } else if (f.type === 'select') {
                    data[f.id] = el.value;
                } else {
                    data[f.id] = el.value;
                }
            }
        });
        return data;
    }

    function updatePreview(key) {
        const jenisData = DATABASE[state.selectedJenis];
        if (!jenisData) return;
        const itemData = jenisData.items[key];
        if (!itemData) return;

        const data = getFormData(key);
        const validation = Utils.validateForm(data, itemData.fields || []);
        if (!validation.valid) {
            DOM.stepDisplay.innerHTML = `<span style="color:#dc2626;">⚠️ ${validation.message}</span>`;
            DOM.calcResultValue.textContent = '0.000';
            DOM.calcResultSub.textContent = 'Lengkapi data terlebih dahulu';
            return;
        }

        const hasil = itemData.hitung(data);
        if (!hasil) {
            DOM.stepDisplay.innerHTML = `<span style="color:#dc2626;">⚠️ Gagal menghitung</span>`;
            return;
        }

        let stepHtml = '';
        for (const [k, v] of Object.entries(data)) {
            if (typeof v === 'number' && v !== 0) {
                stepHtml += `<span>${k}: <strong>${Utils.formatAngka(v)}</strong></span>`;
            }
        }
        DOM.stepDisplay.innerHTML = stepHtml || '<span>Data lengkap</span>';

        const firstKey = Object.keys(hasil).find(k => k !== 'satuan');
        if (firstKey) {
            DOM.calcResultValue.textContent = Utils.formatAngka(hasil[firstKey] || 0) + ' ' + (hasil.satuan || '');
        }
        
        let subHtml = [];
        for (const [k, v] of Object.entries(hasil)) {
            if (k !== 'satuan' && k !== firstKey && typeof v === 'number') {
                subHtml.push(`${k}: ${Utils.formatAngka(v)}`);
            }
        }
        DOM.calcResultSub.textContent = subHtml.join(' | ') || '-';

        state.currentData = { ...data, ...hasil };
    }

    // ============================================
    // FUNGSI PENYIMPANAN ITEM PER PROYEK
    // ============================================
    function currentProjectId() {
        const p = typeof ProjectManager !== 'undefined' ? ProjectManager.getCurrent() : null;
        return (p && p.id) ? p.id : 'default';
    }

    function saveItemsToLocal() {
        try {
            localStorage.setItem('qse_items_' + currentProjectId(), JSON.stringify(state.items));
        } catch (e) {
            console.warn('⚠️ Gagal menyimpan item ke localStorage:', e);
        }
    }

    function loadItemsForCurrentProject() {
        try {
            const raw = localStorage.getItem('qse_items_' + currentProjectId());
            state.items = raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.warn('⚠️ Gagal load item dari localStorage:', e);
            state.items = [];
        }
    }

    /**
     * Dipanggil setiap kali proyek aktif berganti (pindah/buat/hapus proyek).
     * Memuat ulang item & gambar milik proyek yang baru aktif, lalu render ulang.
     */
    function switchProjectData() {
        loadItemsForCurrentProject();
        state.gambarList = [];
        state.markupHistory = [];
        state.currentGambarIndex = 0;
        loadGambarFromLocal(); // akan render thumbnail/gambar sendiri jika ada data tersimpan
        if (state.gambarList.length === 0) {
            renderThumbnails();
            displayGambar(-1);
            if (DOM.gambarCount) DOM.gambarCount.textContent = '0 gambar';
        }
        renderItems();
    }

    function tambahItem() {
        if (!state.selectedJenis || !state.selectedItemKey) {
            alert('⚠️ Pilih Jenis Pekerjaan dan Item terlebih dahulu!');
            return;
        }

        const jenisData = DATABASE[state.selectedJenis];
        if (!jenisData) {
            alert('⚠️ Jenis pekerjaan tidak ditemukan di database!');
            return;
        }
        const itemData = jenisData.items[state.selectedItemKey];
        if (!itemData) {
            alert('⚠️ Item tidak ditemukan di database!');
            return;
        }

        const data = getFormData(state.selectedItemKey);
        const validation = Utils.validateForm(data, itemData.fields || []);
        if (!validation.valid) {
            alert(`⚠️ ${validation.message}`);
            return;
        }

        const hasil = itemData.hitung(data);
        if (!hasil) {
            alert('⚠️ Gagal menghitung! Periksa data.');
            return;
        }

        const namaField = (itemData.fields || []).find(f => f.id === 'namaItem');
        const materialField = (itemData.fields || []).find(f => f.id === 'material');
        const nama = namaField ? document.getElementById(`field_${namaField.id}`).value.trim() || 'Item' : 'Item';
        const material = materialField ? document.getElementById(`field_${materialField.id}`).value : 'Material';

        const itemEntry = {
            id: Utils.generateId(),
            tipe: state.selectedItemKey,
            jenis: state.selectedJenis,
            nama: nama,
            material: material,
            ...data,
            ...hasil,
            tanggal: new Date().toISOString()
        };

        state.items.push(itemEntry);
        saveItemsToLocal();
        renderItems();
        console.log(`✅ Item "${nama}" berhasil ditambahkan`);
    }

    /**
     * Duplikat item yang sudah ada (memudahkan input item berulang dengan dimensi sama/mirip)
     */
    function duplikatItem(index) {
        if (index < 0 || index >= state.items.length) return;
        const original = state.items[index];
        const copy = {
            ...original,
            id: Utils.generateId(),
            nama: original.nama + ' (Copy)',
            tanggal: new Date().toISOString()
        };
        state.items.splice(index + 1, 0, copy);
        saveItemsToLocal();
        renderItems();
        console.log(`📋 Item "${original.nama}" diduplikat`);
    }

    // ============================================
    // FUNGSI RENDER ITEMS
    // ============================================
    function renderItems() {
        if (state.items.length === 0) {
            DOM.itemList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>Belum ada item</p>
                    <p style="font-size:11px; margin-top:4px;">Ikuti workflow di atas untuk menambahkan</p>
                </div>
            `;
            updateStats();
            updateMaterialPreview();
            updateBreakdown();
            return;
        }

        let html = '';
        let totalVol = 0;
        const materialCount = {};
        const jenisSet = new Set();

        state.items.forEach((item, index) => {
            const jenisData = DATABASE[item.jenis];
            const itemData = jenisData ? jenisData.items[item.tipe] : null;
            const display = itemData ? itemData.display(item) : { volume: 0, unit: 'm³', detail: '' };
            const vol = display.volume || 0;
            totalVol += vol;
            jenisSet.add(item.jenis);
            materialCount[item.material] = (materialCount[item.material] || 0) + vol;

            const icon = Utils.getJenisIcon(item.jenis);
            const tipeLabel = itemData ? itemData.nama : item.tipe;

            html += `
                <div class="item-card">
                    <div class="item-header">
                        <div>
                            <span class="item-name">
                                ${Utils.escHtml(item.nama)}
                                <span class="badge-type"><i class="fas ${icon}"></i> ${Utils.escHtml(item.jenis)}</span>
                                <span class="badge-type" style="background:#e0f2fe;color:#0369a1;">${tipeLabel}</span>
                            </span>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span class="item-volume">${Utils.formatAngka(vol)} ${display.unit || 'm³'}</span>
                            <div class="item-actions">
                                <button class="dup-item" data-index="${index}" title="Duplikat item ini"><i class="fas fa-copy"></i></button>
                                <button class="del-item" data-index="${index}" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                            </div>
                        </div>
                    </div>
                    <div class="item-details">
                        <span><i class="fas fa-cube"></i> ${Utils.escHtml(item.material)}</span>
                        ${display.detail || ''}
                    </div>
                </div>
            `;
        });

        DOM.itemList.innerHTML = html;

        document.querySelectorAll('.del-item').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.index, 10);
                if (!isNaN(idx) && idx >= 0 && idx < state.items.length) {
                    state.items.splice(idx, 1);
                    saveItemsToLocal();
                    renderItems();
                    console.log(`🗑️ Item ke-${idx} dihapus`);
                }
            });
        });

        document.querySelectorAll('.dup-item').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.index, 10);
                duplikatItem(idx);
            });
        });

        updateStats();
        updateMaterialPreview();
        updateBreakdown();

        let topMat = '-', topVol = 0;
        for (const [mat, vol] of Object.entries(materialCount)) {
            if (vol > topVol) { topVol = vol; topMat = mat; }
        }
        DOM.statMaterialTop.textContent = topMat;
        DOM.statJenisPekerjaan.textContent = jenisSet.size;
        
        console.log(`📊 Total item: ${state.items.length}, Total volume: ${Utils.formatAngka(totalVol)}`);
    }

    function updateStats() {
        let total = 0;
        state.items.forEach(item => {
            const jenisData = DATABASE[item.jenis];
            const itemData = jenisData ? jenisData.items[item.tipe] : null;
            const d = itemData ? itemData.display(item) : { volume: 0 };
            total += d.volume || 0;
        });
        const t = Utils.formatAngka(total);
        DOM.statTotalVolume.textContent = t;
        DOM.totalVolumeBadge.textContent = t;
        DOM.statTotalItem.textContent = state.items.length;
        DOM.totalItemsBadge.textContent = state.items.length;
        DOM.jumlahItem.textContent = state.items.length;
    }

    function updateMaterialPreview() {
        if (state.items.length === 0) {
            DOM.displayMaterial.textContent = '-';
            DOM.displayVolume.textContent = '0.000';
            DOM.displayItem.textContent = '-';
            DOM.displayJenis.textContent = '-';
            return;
        }
        const last = state.items[state.items.length - 1];
        const jenisData = DATABASE[last.jenis];
        const itemData = jenisData ? jenisData.items[last.tipe] : null;
        const d = itemData ? itemData.display(last) : { volume: 0, unit: 'm³' };
        DOM.displayMaterial.textContent = last.material;
        DOM.displayVolume.textContent = Utils.formatAngka(d.volume || 0) + ' ' + (d.unit || 'm³');
        DOM.displayItem.textContent = itemData ? itemData.nama : last.tipe;
        DOM.displayJenis.textContent = last.jenis;
    }

    function updateBreakdown() {
        if (state.items.length === 0) {
            DOM.materialBreakdown.innerHTML = `
                <div style="color:#94a3b8;font-size:12px;text-align:center;padding:12px 0;">
                    <i class="fas fa-cube" style="display:block;font-size:20px;margin-bottom:4px;opacity:0.3;"></i>
                    Belum ada data
                </div>
            `;
            return;
        }

        const mv = {};
        state.items.forEach(item => {
            const jenisData = DATABASE[item.jenis];
            const itemData = jenisData ? jenisData.items[item.tipe] : null;
            const d = itemData ? itemData.display(item) : { volume: 0 };
            const vol = d.volume || 0;
            mv[item.material] = (mv[item.material] || 0) + vol;
        });

        let html = '';
        let total = Object.values(mv).reduce((a, b) => a + b, 0);
        Object.entries(mv).sort((a, b) => b[1] - a[1]).forEach(([mat, vol]) => {
            const pct = total > 0 ? (vol / total * 100) : 0;
            html += `
                <div class="mat-item">
                    <span class="mat-name">${Utils.escHtml(mat)}</span>
                    <span class="mat-vol">${Utils.formatAngka(vol)} (${pct.toFixed(1)}%)</span>
                </div>
            `;
        });
        DOM.materialBreakdown.innerHTML = html;
    }

    function resetForm() {
        if (state.selectedItemKey) {
            loadForm(state.selectedItemKey);
            console.log('🔄 Form direset');
        }
    }

    // ============================================
    // FUNGSI GAMBAR - ZOOM & PAN
    // ============================================
    function updateImageTransform() {
        const img = DOM.gambarPreview;
        if (!img || img.style.display === 'none') return;
        
        const z = state.zoom;
        const px = state.panX;
        const py = state.panY;
        
        img.style.transform = `translate(${px}px, ${py}px) scale(${z})`;
        DOM.zoomLevel.textContent = Math.round(z * 100) + '%';
    }

    function zoomIn() {
        state.zoom = Math.min(state.zoom + 0.1, 5);
        updateImageTransform();
    }

    function zoomOut() {
        state.zoom = Math.max(state.zoom - 0.1, 0.1);
        updateImageTransform();
    }

    function zoomFit() {
        const img = DOM.gambarPreview;
        const wrapper = DOM.imageWrapper;
        if (!img || img.style.display === 'none') return;
        
        const containerRect = wrapper.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        const imgWidth = img.naturalWidth || img.width;
        const imgHeight = img.naturalHeight || img.height;
        
        if (imgWidth === 0 || imgHeight === 0) return;
        
        const scaleX = containerWidth / imgWidth;
        const scaleY = containerHeight / imgHeight;
        const fitScale = Math.min(scaleX, scaleY, 1);
        
        state.zoom = fitScale;
        state.panX = 0;
        state.panY = 0;
        updateImageTransform();
    }

    function zoomReset() {
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;
        updateImageTransform();
    }

    // ============================================
    // FUNGSI GAMBAR - MARKUP
    // ============================================
    function initMarkupCanvas() {
        const canvas = DOM.markupCanvas;
        const wrapper = DOM.imageWrapper;
        
        if (!canvas || !wrapper.classList.contains('active')) return;
        
        canvas.width = wrapper.clientWidth || 400;
        canvas.height = wrapper.clientHeight || 300;
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        
        redrawMarkup();
    }

    function redrawMarkup() {
        const canvas = DOM.markupCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        state.markupHistory.forEach(markup => {
            drawMarkupOnCanvas(ctx, markup);
        });
    }

    function drawMarkupOnCanvas(ctx, markup) {
        const { type, x, y, x2, y2, color, text, lineWidth } = markup;
        ctx.save();
        ctx.strokeStyle = color || '#dc2626';
        ctx.fillStyle = color || '#dc2626';
        ctx.lineWidth = lineWidth || 2;
        
        if (type === 'draw' || type === 'line') {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        } else if (type === 'rect') {
            ctx.strokeRect(x, y, x2 - x, y2 - y);
        } else if (type === 'text') {
            ctx.font = '16px Inter, sans-serif';
            ctx.fillText(text || '', x, y);
        }
        
        ctx.restore();
    }

    function startDrawing(e) {
        if (!DOM.markupCanvas.classList.contains('drawing')) return;
        
        const canvas = DOM.markupCanvas;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        state.isDrawing = true;
        state.drawStartX = (clientX - rect.left) * scaleX;
        state.drawStartY = (clientY - rect.top) * scaleY;
        state.currentMarkup = {
            type: state.markupMode === 'text' ? 'text' : state.markupMode,
            x: state.drawStartX,
            y: state.drawStartY,
            x2: state.drawStartX,
            y2: state.drawStartY,
            color: state.markupColor,
            text: state.markupMode === 'text' ? 'Teks' : '',
            lineWidth: 2
        };
    }

    function drawMove(e) {
        if (!state.isDrawing) return;
        
        const canvas = DOM.markupCanvas;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const currentX = (clientX - rect.left) * scaleX;
        const currentY = (clientY - rect.top) * scaleY;
        
        state.currentMarkup.x2 = currentX;
        state.currentMarkup.y2 = currentY;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        state.markupHistory.forEach(m => drawMarkupOnCanvas(ctx, m));
        if (state.currentMarkup) {
            drawMarkupOnCanvas(ctx, state.currentMarkup);
        }
    }

    function endDrawing(e) {
        if (!state.isDrawing) return;
        state.isDrawing = false;
        
        if (state.currentMarkup) {
            if (state.currentMarkup.x !== state.currentMarkup.x2 || 
                state.currentMarkup.y !== state.currentMarkup.y2 ||
                state.currentMarkup.type === 'text') {
                state.markupHistory.push({ ...state.currentMarkup });
                saveGambarToLocal();
            }
            state.currentMarkup = null;
            redrawMarkup();
        }
    }

    // ============================================
    // FUNGSI GAMBAR - MANAJEMEN
    // ============================================
    function addGambar(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = {
                id: Utils.generateId(),
                name: file.name,
                size: file.size,
                data: e.target.result,
                timestamp: Date.now()
            };
            
            state.gambarList.push(imageData);
            renderThumbnails();
            
            if (state.gambarList.length === 1) {
                state.currentGambarIndex = 0;
                displayGambar(state.currentGambarIndex);
            }
            
            DOM.gambarCount.textContent = state.gambarList.length + ' gambar';
            saveGambarToLocal();
            console.log(`🖼️ Gambar "${file.name}" ditambahkan`);
        };
        reader.readAsDataURL(file);
    }

    function displayGambar(index) {
        if (index < 0 || index >= state.gambarList.length) {
            DOM.imageWrapper.classList.remove('active');
            DOM.gambarPlaceholder.style.display = 'flex';
            DOM.zoomControls.style.display = 'none';
            DOM.gambarInfo.style.display = 'none';
            return;
        }
        
        const gambar = state.gambarList[index];
        const img = DOM.gambarPreview;
        img.src = gambar.data;
        img.style.display = 'block';
        img.onload = function() {
            DOM.imageWrapper.classList.add('active');
            DOM.gambarPlaceholder.style.display = 'none';
            DOM.zoomControls.style.display = 'flex';
            DOM.gambarInfo.style.display = 'flex';
            DOM.gambarNama.textContent = gambar.name;
            DOM.gambarUkuran.textContent = (gambar.size / 1024).toFixed(1) + ' KB';
            
            zoomReset();
            setTimeout(initMarkupCanvas, 100);
            updateActiveThumbnail();
        };
    }

    function renderThumbnails() {
        let html = '';
        state.gambarList.forEach((g, i) => {
            const active = i === state.currentGambarIndex ? 'active' : '';
            html += `
                <div class="thumbnail-item ${active}" data-index="${i}">
                    <img src="${g.data}" alt="${g.name}" />
                    <span class="badge-order">${i + 1}</span>
                    <button class="remove-thumb" data-index="${i}" title="Hapus"><i class="fas fa-times"></i></button>
                </div>
            `;
        });
        DOM.thumbnailList.innerHTML = html;
        
        DOM.thumbnailList.querySelectorAll('.thumbnail-item').forEach(el => {
            el.addEventListener('click', function(e) {
                if (e.target.closest('.remove-thumb')) return;
                const idx = parseInt(this.dataset.index);
                if (!isNaN(idx)) {
                    state.currentGambarIndex = idx;
                    displayGambar(idx);
                }
            });
            
            const removeBtn = el.querySelector('.remove-thumb');
            if (removeBtn) {
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const idx = parseInt(this.dataset.index);
                    if (!isNaN(idx)) {
                        state.gambarList.splice(idx, 1);
                        if (state.currentGambarIndex >= state.gambarList.length) {
                            state.currentGambarIndex = state.gambarList.length - 1;
                        }
                        renderThumbnails();
                        if (state.gambarList.length > 0) {
                            displayGambar(state.currentGambarIndex);
                        } else {
                            displayGambar(-1);
                            DOM.gambarCount.textContent = '0 gambar';
                        }
                        saveGambarToLocal();
                    }
                });
            }
        });
    }

    function updateActiveThumbnail() {
        DOM.thumbnailList.querySelectorAll('.thumbnail-item').forEach((el, i) => {
            el.classList.toggle('active', i === state.currentGambarIndex);
        });
    }

    // ============================================
    // FUNGSI GAMBAR - PENYIMPANAN LOKAL
    // ============================================
    function saveGambarToLocal() {
        try {
            const data = state.gambarList.map(g => ({
                id: g.id,
                name: g.name,
                size: g.size,
                data: g.data,
                timestamp: g.timestamp
            }));
            localStorage.setItem('qse_gambar_' + currentProjectId(), JSON.stringify(data));
            localStorage.setItem('qse_markup_' + currentProjectId(), JSON.stringify(state.markupHistory));
        } catch (e) {
            console.warn('⚠️ Gagal menyimpan gambar ke localStorage:', e);
        }
    }

    function loadGambarFromLocal() {
        try {
            const data = localStorage.getItem('qse_gambar_' + currentProjectId());
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    state.gambarList = parsed;
                    state.currentGambarIndex = 0;
                    renderThumbnails();
                    displayGambar(0);
                    DOM.gambarCount.textContent = state.gambarList.length + ' gambar';
                    
                    const markupData = localStorage.getItem('qse_markup_' + currentProjectId());
                    if (markupData) {
                        state.markupHistory = JSON.parse(markupData);
                        setTimeout(redrawMarkup, 200);
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ Gagal load gambar dari localStorage:', e);
        }
    }

    // ============================================
    // FUNGSI EXPORT & CETAK
    // ============================================
    function csvField(v) {
        const s = (v === undefined || v === null) ? '' : String(v);
        if (/[",\n]/.test(s)) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }

    function exportCSV() {
        if (state.items.length === 0) {
            alert('Tidak ada data untuk diexport.');
            return;
        }
        const project = typeof ProjectManager !== 'undefined' ? ProjectManager.getCurrent() : null;
        let header = 'ID,Nama,Jenis,Item,Material,Volume,Satuan,Tanggal\n';
        let rows = state.items.map(item => {
            const jenisData = DATABASE[item.jenis];
            const itemData = jenisData ? jenisData.items[item.tipe] : null;
            const d = itemData ? itemData.display(item) : { volume: 0, unit: 'm³' };
            const itemNama = itemData ? itemData.nama : item.tipe;
            return [
                csvField(item.id),
                csvField(item.nama),
                csvField(item.jenis),
                csvField(itemNama),
                csvField(item.material),
                csvField(Utils.formatAngka(d.volume || 0)),
                csvField(d.unit || 'm³'),
                csvField(item.tanggal || '')
            ].join(',');
        }).join('\n');
        const filename = project && project.nama ?
            `QSE_${project.nama.replace(/[^a-z0-9]+/gi, '_')}.csv` : 'QSE_Report.csv';
        Utils.downloadFile('\uFEFF' + header + rows, filename);
        console.log('📤 Data diexport ke CSV');
    }

    function cetakRingkasan() {
        if (state.items.length === 0) {
            alert('Tidak ada data untuk dicetak.');
            return;
        }

        const project = typeof ProjectManager !== 'undefined' ? ProjectManager.getCurrent() : null;
        const now = new Date();
        const dateStr = Utils.formatTanggal(now);
        const timeStr = Utils.formatWaktu(now);

        // ===== BANGUN BARIS TABEL =====
        const totalsByUnit = {};
        let rowsHtml = '';

        state.items.forEach((item, i) => {
            const jenisData = DATABASE[item.jenis];
            const itemData = jenisData ? jenisData.items[item.tipe] : null;
            const d = itemData ? itemData.display(item) : { volume: 0, unit: 'm³' };
            const itemNamaTipe = itemData ? itemData.nama : item.tipe;
            const unit = d.unit || 'm³';
            totalsByUnit[unit] = (totalsByUnit[unit] || 0) + (d.volume || 0);

            const rumus = itemData && itemData.rumus ? itemData.rumus : '-';
            const fields = itemData && itemData.fields ? itemData.fields : [];
            const rincian = fields
                .filter(f => (f.type === 'number' || f.type === 'select') && f.id !== 'namaItem' && f.id !== 'material')
                .map(f => {
                    const val = item[f.id];
                    if (val === undefined || val === null || val === '') return null;
                    const labelBersih = f.label.replace(/\s*\(.*?\)\s*/g, '').trim();
                    const display = (f.type === 'number') ? Utils.formatAngka(parseFloat(val) || 0, 2) : val;
                    return `${labelBersih}: ${display}`;
                })
                .filter(Boolean)
                .join(', ');

            rowsHtml += `
                <tr>
                    <td class="col-no">${i + 1}</td>
                    <td class="col-item">
                        <div class="item-nama">${Utils.escHtml(item.nama)}</div>
                        <div class="item-sub">${Utils.escHtml(item.jenis)} • ${Utils.escHtml(itemNamaTipe)} • ${Utils.escHtml(item.material || '-')}</div>
                    </td>
                    <td class="col-uraian">
                        <div class="rumus">${Utils.escHtml(rumus)}</div>
                        ${rincian ? `<div class="rincian">${Utils.escHtml(rincian)}</div>` : ''}
                    </td>
                    <td class="col-volume">${Utils.formatAngka(d.volume || 0)}</td>
                    <td class="col-satuan">${Utils.escHtml(unit)}</td>
                </tr>
            `;
        });

        const totalRowsHtml = Object.entries(totalsByUnit).map(([unit, total]) => `
            <tr class="total-row">
                <td colspan="3">TOTAL VOLUME (${Utils.escHtml(unit)})</td>
                <td class="col-volume">${Utils.formatAngka(total)}</td>
                <td class="col-satuan">${Utils.escHtml(unit)}</td>
            </tr>
        `).join('');

        // ===== BANGUN DAFTAR GAMBAR (opsional) =====
        let gambarHtml = '';
        if (state.gambarList.length > 0) {
            gambarHtml = `
                <h3>Acuan Gambar</h3>
                <ol class="gambar-list">
                    ${state.gambarList.map(g => `<li>${Utils.escHtml(g.name)} (${(g.size / 1024).toFixed(1)} KB)</li>`).join('')}
                </ol>
            `;
        }

        const infoProyekHtml = project ? `
            <div class="info-proyek">
                <span><strong>Proyek:</strong> ${Utils.escHtml(project.nama || '-')}</span>
                <span><strong>Lokasi:</strong> ${Utils.escHtml(project.lokasi || '-')}</span>
                <span><strong>Klien:</strong> ${Utils.escHtml(project.klien || '-')}</span>
            </div>
        ` : '';

        const win = window.open('', '_blank', 'width=900,height=700');
        if (win) {
            win.document.write(`
                <html>
                <head>
                <title>QSE Report</title>
                <style>
                    * { box-sizing: border-box; }
                    body { font-family: 'Inter', Arial, sans-serif; padding: 30px; background: #fafafa; color: #0f172a; }
                    h1 { font-size: 18px; margin: 0 0 4px; }
                    .subtitle { font-size: 12px; color: #64748b; margin-bottom: 16px; }
                    .info-proyek { display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; background: #f1f5f9; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; }
                    table { width: 100%; border-collapse: collapse; background: white; font-size: 12px; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; vertical-align: top; }
                    th { background: #0f172a; color: white; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; }
                    .col-no { width: 36px; text-align: center; }
                    .col-volume { width: 90px; text-align: right; font-weight: 600; }
                    .col-satuan { width: 70px; }
                    .item-nama { font-weight: 600; }
                    .item-sub { font-size: 10.5px; color: #64748b; margin-top: 2px; }
                    .rumus { font-style: italic; color: #334155; }
                    .rincian { font-size: 10.5px; color: #64748b; margin-top: 3px; }
                    .total-row td { background: #eff6ff; font-weight: 700; }
                    .total-row td:first-child { text-align: right; }
                    h3 { font-size: 13px; margin: 20px 0 6px; }
                    .gambar-list { font-size: 12px; padding-left: 18px; }
                    .footer { text-align: center; margin-top: 24px; padding-top: 10px; border-top: 2px solid #2563eb; font-size: 11px; color: #64748b; }
                    @media print {
                        body { padding: 0; background: white; }
                        @page { size: landscape; margin: 12mm; }
                    }
                </style>
                </head>
                <body>
                    <h1>📊 Quantity Survey Engineer - Laporan QTO</h1>
                    <div class="subtitle">Dicetak: ${dateStr} ${timeStr} • Total Item: ${state.items.length}</div>
                    ${infoProyekHtml}
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Item Pekerjaan</th>
                                <th>Uraian / Rumus Cara Perhitungan</th>
                                <th>Volume</th>
                                <th>Satuan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                            ${totalRowsHtml}
                        </tbody>
                    </table>
                    ${gambarHtml}
                    <div class="footer">
                        📊 Quantity Survey Engineer - Laporan QTO<br>
                        Dicetak: ${dateStr} ${timeStr}
                    </div>
                </body>
                </html>
            `);
            win.document.close();
            setTimeout(() => win.print(), 500);
            console.log('🖨️ Cetak ringkasan (format tabel)');
        } else {
            alert('Popup diblokir. Izinkan popup untuk mencetak.');
        }
    }

    // ============================================
    // UPDATE PROJECT INFO
    // ============================================
    function updateProjectInfo() {
        try {
            const project = typeof ProjectManager !== 'undefined' ? ProjectManager.getCurrent() : null;
            
            if (DOM.infoProjectName) {
                DOM.infoProjectName.textContent = project ? project.nama || '-' : '-';
            }
            if (DOM.infoProjectLocation) {
                DOM.infoProjectLocation.textContent = project ? project.lokasi || '-' : '-';
            }
            if (DOM.infoProjectClient) {
                DOM.infoProjectClient.textContent = project ? project.klien || '-' : '-';
            }
            if (DOM.infoProjectStatusText) {
                DOM.infoProjectStatusText.textContent = project ? project.status || 'Draft' : '-';
                if (project && typeof ProjectManager.getStatusColor === 'function') {
                    DOM.infoProjectStatusText.style.color = ProjectManager.getStatusColor(project.status);
                }
            }
            if (DOM.infoProjectDate) {
                DOM.infoProjectDate.textContent = project && project.tanggalMulai ? 
                    Utils.formatTanggal(new Date(project.tanggalMulai)) : '-';
            }
            if (DOM.currentProjectName) {
                DOM.currentProjectName.textContent = project ? project.nama || 'Pilih Proyek' : 'Pilih Proyek';
            }
        } catch (e) {
            console.warn('⚠️ Gagal update project info:', e);
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    // STEP 1: Pilih Jenis
    if (DOM.jenisSelect) {
        DOM.jenisSelect.addEventListener('change', function() {
            state.selectedJenis = this.value;
            if (!state.selectedJenis) {
                DOM.step2.classList.add('hidden');
                DOM.step3.classList.add('hidden');
                DOM.itemPicker.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;color:#94a3b8;font-size:13px;padding:20px 0;">
                        <i class="fas fa-arrow-up" style="display:block;font-size:24px;margin-bottom:8px;opacity:0.3;"></i>
                        Pilih Jenis Pekerjaan terlebih dahulu
                    </div>
                `;
                return;
            }
            DOM.step2.classList.remove('hidden');
            DOM.selectedJenisLabel.textContent = '🏗️ ' + state.selectedJenis;
            if (DOM.itemSearchInput) DOM.itemSearchInput.value = '';
            loadItems(state.selectedJenis);
            console.log(`📌 Jenis dipilih: ${state.selectedJenis}`);
        });
    }

    // Pencarian item di Step 2
    if (DOM.itemSearchInput) {
        DOM.itemSearchInput.addEventListener('input', function() {
            const q = this.value.trim().toLowerCase();
            document.querySelectorAll('#itemPickerContainer .item-picker-btn').forEach(btn => {
                const nama = (btn.dataset.nama || '').toLowerCase();
                btn.style.display = (!q || nama.includes(q)) ? '' : 'none';
            });
        });
    }

    // Buttons
    if (DOM.tambahBtn) DOM.tambahBtn.addEventListener('click', tambahItem);
    if (DOM.resetFormBtn) DOM.resetFormBtn.addEventListener('click', resetForm);

    if (DOM.hapusSemuaBtn) {
        DOM.hapusSemuaBtn.addEventListener('click', function() {
            if (state.items.length === 0) return;
            if (confirm('Hapus semua item?')) {
                state.items = [];
                saveItemsToLocal();
                renderItems();
                console.log('🗑️ Semua item dihapus');
            }
        });
    }

    if (DOM.exportBtn) DOM.exportBtn.addEventListener('click', exportCSV);
    if (DOM.cetakBtn) DOM.cetakBtn.addEventListener('click', cetakRingkasan);

    // ============================================
    // EVENT LISTENERS - GAMBAR
    // ============================================
    if (DOM.fileInput) {
        DOM.fileInput.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                addGambar(this.files[0]);
            }
            this.value = '';
        });
    }

    if (DOM.fileInputMultiple) {
        DOM.fileInputMultiple.addEventListener('change', function(e) {
            if (this.files) {
                for (const file of this.files) {
                    addGambar(file);
                }
            }
            this.value = '';
        });
    }

    if (DOM.gambarContainer) {
        DOM.gambarContainer.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });

        DOM.gambarContainer.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
        });

        DOM.gambarContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files) {
                for (const file of files) {
                    if (file.type.startsWith('image/')) {
                        addGambar(file);
                    }
                }
            }
        });
    }

    if (DOM.hapusGambarBtn) {
        DOM.hapusGambarBtn.addEventListener('click', function() {
            if (state.gambarList.length === 0) return;
            if (confirm('Hapus semua gambar?')) {
                state.gambarList = [];
                state.markupHistory = [];
                renderThumbnails();
                displayGambar(-1);
                DOM.gambarCount.textContent = '0 gambar';
                localStorage.removeItem('qse_gambar_' + currentProjectId());
                localStorage.removeItem('qse_markup_' + currentProjectId());
                console.log('🗑️ Semua gambar dihapus');
            }
        });
    }

    if (DOM.simpanGambarBtn) {
        DOM.simpanGambarBtn.addEventListener('click', function() {
            saveGambarToLocal();
            alert('✅ Gambar dan markup berhasil disimpan ke localStorage!');
        });
    }

    // ============================================
    // EVENT LISTENERS - ZOOM
    // ============================================
    if (DOM.zoomInBtn) DOM.zoomInBtn.addEventListener('click', zoomIn);
    if (DOM.zoomOutBtn) DOM.zoomOutBtn.addEventListener('click', zoomOut);
    if (DOM.zoomFitBtn) DOM.zoomFitBtn.addEventListener('click', zoomFit);
    if (DOM.zoomResetBtn) DOM.zoomResetBtn.addEventListener('click', zoomReset);

    if (DOM.imageWrapper) {
        DOM.imageWrapper.addEventListener('wheel', function(e) {
            e.preventDefault();
            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        }, { passive: false });

        DOM.imageWrapper.addEventListener('mousedown', function(e) {
            if (e.target.tagName === 'CANVAS' || e.target.tagName === 'IMG') {
                state.isDragging = true;
                state.dragStartX = e.clientX;
                state.dragStartY = e.clientY;
                state.startPanX = state.panX;
                state.startPanY = state.panY;
                this.style.cursor = 'grabbing';
            }
        });

        let touchStartX = 0, touchStartY = 0, touchPanX = 0, touchPanY = 0;
        DOM.imageWrapper.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                touchPanX = state.panX;
                touchPanY = state.panY;
            }
        }, { passive: true });

        DOM.imageWrapper.addEventListener('touchmove', function(e) {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const dx = touch.clientX - touchStartX;
                const dy = touch.clientY - touchStartY;
                state.panX = touchPanX + dx;
                state.panY = touchPanY + dy;
                updateImageTransform();
            }
        }, { passive: true });
    }

    document.addEventListener('mousemove', function(e) {
        if (state.isDragging && DOM.imageWrapper && DOM.imageWrapper.classList.contains('active')) {
            const dx = e.clientX - state.dragStartX;
            const dy = e.clientY - state.dragStartY;
            state.panX = state.startPanX + dx;
            state.panY = state.startPanY + dy;
            updateImageTransform();
        }
    });

    document.addEventListener('mouseup', function() {
        if (state.isDragging) {
            state.isDragging = false;
            if (DOM.imageWrapper) DOM.imageWrapper.style.cursor = 'grab';
        }
    });

    // ============================================
    // EVENT LISTENERS - MARKUP
    // ============================================
    if (DOM.markupDraw) {
        DOM.markupDraw.addEventListener('click', function() {
            document.querySelectorAll('.markup-tools button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.markupMode = 'draw';
            DOM.markupCanvas.classList.add('drawing');
        });
    }

    if (DOM.markupLine) {
        DOM.markupLine.addEventListener('click', function() {
            document.querySelectorAll('.markup-tools button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.markupMode = 'line';
            DOM.markupCanvas.classList.add('drawing');
        });
    }

    if (DOM.markupRect) {
        DOM.markupRect.addEventListener('click', function() {
            document.querySelectorAll('.markup-tools button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.markupMode = 'rect';
            DOM.markupCanvas.classList.add('drawing');
        });
    }

    if (DOM.markupText) {
        DOM.markupText.addEventListener('click', function() {
            document.querySelectorAll('.markup-tools button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.markupMode = 'text';
            DOM.markupCanvas.classList.add('drawing');
        });
    }

    if (DOM.markupUndo) {
        DOM.markupUndo.addEventListener('click', function() {
            if (state.markupHistory.length > 0) {
                state.markupHistory.pop();
                redrawMarkup();
                saveGambarToLocal();
                console.log('↩️ Undo markup');
            }
        });
    }

    if (DOM.markupClear) {
        DOM.markupClear.addEventListener('click', function() {
            if (state.markupHistory.length === 0) return;
            if (confirm('Hapus semua markup?')) {
                state.markupHistory = [];
                redrawMarkup();
                saveGambarToLocal();
                console.log('🧹 Semua markup dihapus');
            }
        });
    }

    if (DOM.markupColor) {
        DOM.markupColor.addEventListener('change', function() {
            state.markupColor = this.value;
        });
    }

    const canvas = DOM.markupCanvas;
    if (canvas) {
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', drawMove);
        canvas.addEventListener('mouseup', endDrawing);
        canvas.addEventListener('mouseleave', endDrawing);

        canvas.addEventListener('touchstart', function(e) {
            e.preventDefault();
            startDrawing(e);
        }, { passive: false });
        canvas.addEventListener('touchmove', function(e) {
            e.preventDefault();
            drawMove(e);
        }, { passive: false });
        canvas.addEventListener('touchend', function(e) {
            e.preventDefault();
            endDrawing(e);
        }, { passive: false });
    }

    window.addEventListener('resize', function() {
        if (DOM.imageWrapper && DOM.imageWrapper.classList.contains('active')) {
            initMarkupCanvas();
        }
    });

    // ============================================
    // ISI FOOTER SAAT CETAK LANGSUNG (Ctrl+P)
    // ============================================
    window.addEventListener('beforeprint', function() {
        const now = new Date();
        const printDate = document.getElementById('printDate');
        const printTime = document.getElementById('printTime');
        if (printDate) printDate.textContent = Utils.formatTanggal(now);
        if (printTime) printTime.textContent = Utils.formatWaktu(now);
    });

    // ============================================
    // PROJECT MANAGER INTEGRATION
    // ============================================
    if (typeof ProjectManager !== 'undefined') {
        updateProjectInfo();

        const originalSetCurrent = ProjectManager.setCurrent;
        if (originalSetCurrent) {
            ProjectManager.setCurrent = function(id) {
                const prevId = this.currentProject ? this.currentProject.id : null;
                const result = originalSetCurrent.call(this, id);
                updateProjectInfo();
                if (this.currentProject && this.currentProject.id !== prevId) {
                    switchProjectData();
                }
                return result;
            };
        }

        const originalCreate = ProjectManager.create;
        if (originalCreate) {
            ProjectManager.create = function(data) {
                const result = originalCreate.call(this, data);
                updateProjectInfo();
                switchProjectData();
                return result;
            };
        }

        const originalDelete = ProjectManager.delete;
        if (originalDelete) {
            ProjectManager.delete = function(id) {
                const result = originalDelete.call(this, id);
                try {
                    localStorage.removeItem('qse_items_' + id);
                    localStorage.removeItem('qse_gambar_' + id);
                    localStorage.removeItem('qse_markup_' + id);
                } catch (e) {}
                updateProjectInfo();
                switchProjectData();
                return result;
            };
        }
    }

    // ============================================
    // PROJECT MODAL - FIX CONNECTION
    // ============================================
    (function() {
        "use strict";

        // Load project dari localStorage
        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.loadFromLocal();

            if (ProjectManager.projects.length === 0) {
                const defaultProject = ProjectManager.create({
                    nama: 'Proyek Contoh',
                    lokasi: 'Jakarta',
                    klien: 'PT. Developer',
                    kontraktor: 'PT. Kontraktor',
                    status: 'Aktif'
                });
                ProjectManager.setCurrent(defaultProject.id);
            }

            if (!ProjectManager.currentProject && ProjectManager.projects.length > 0) {
                ProjectManager.setCurrent(ProjectManager.projects[0].id);
            }
        }

        // DOM REFS PROJECT
        const projectBtn = document.getElementById('projectBtn');
        const projectModal = document.getElementById('projectModal');
        const projectModalClose = document.getElementById('projectModalClose');
        const projectListContainer = document.getElementById('projectListContainer');
        const projectForm = document.getElementById('projectForm');
        const projectFormId = document.getElementById('projectFormId');
        const projectFormTitle = document.getElementById('projectFormTitle');
        const cancelProjectForm = document.getElementById('cancelProjectForm');
        const projectDeleteBtn = document.getElementById('projectDeleteBtn');
        const projectSubmitBtn = document.getElementById('projectSubmitBtn');

        if (!projectBtn) {
            console.error('❌ Tombol Project tidak ditemukan!');
            return;
        }
        if (!projectModal) {
            console.error('❌ Modal Project tidak ditemukan!');
            return;
        }

        // FUNGSI UI PROJECT
        function updateProjectUI() {
            const current = typeof ProjectManager !== 'undefined' ? ProjectManager.getCurrent() : null;
            
            const nameEl = document.getElementById('currentProjectName');
            if (nameEl) {
                nameEl.textContent = current ? current.nama || 'Pilih Proyek' : 'Pilih Proyek';
            }

            const infoProjectName = document.getElementById('infoProjectName');
            const infoProjectLocation = document.getElementById('infoProjectLocation');
            const infoProjectClient = document.getElementById('infoProjectClient');
            const infoProjectStatusText = document.getElementById('infoProjectStatusText');
            const infoProjectDate = document.getElementById('infoProjectDate');

            if (infoProjectName) infoProjectName.textContent = current ? current.nama || '-' : '-';
            if (infoProjectLocation) infoProjectLocation.textContent = current ? current.lokasi || '-' : '-';
            if (infoProjectClient) infoProjectClient.textContent = current ? current.klien || '-' : '-';
            
            if (infoProjectStatusText) {
                if (current) {
                    infoProjectStatusText.textContent = current.status || 'Draft';
                    if (typeof ProjectManager !== 'undefined' && ProjectManager.getStatusColor) {
                        infoProjectStatusText.style.color = ProjectManager.getStatusColor(current.status);
                    }
                } else {
                    infoProjectStatusText.textContent = '-';
                    infoProjectStatusText.style.color = '#94a3b8';
                }
            }

            if (infoProjectDate) {
                if (current && current.tanggalMulai) {
                    const start = new Date(current.tanggalMulai);
                    infoProjectDate.textContent = Utils.formatTanggal ? Utils.formatTanggal(start) : start.toLocaleDateString('id-ID');
                } else {
                    infoProjectDate.textContent = '-';
                }
            }
        }

        // RENDER PROJECT LIST
        function renderProjectList() {
            const container = projectListContainer;
            if (!container) return;
            
            const projects = typeof ProjectManager !== 'undefined' ? ProjectManager.getAll() : [];

            if (projects.length === 0) {
                container.innerHTML = `
                    <div class="empty-project">
                        <i class="fas fa-folder"></i>
                        <p>Belum ada proyek</p>
                        <p style="font-size:11px; margin-top:4px;">Klik "Proyek Baru" untuk membuat</p>
                    </div>
                `;
                return;
            }

            let html = '';
            const current = typeof ProjectManager !== 'undefined' ? ProjectManager.getCurrent() : null;

            projects.forEach(p => {
                const isActive = current && current.id === p.id;
                const statusColor = typeof ProjectManager !== 'undefined' && ProjectManager.getStatusColor ? 
                    ProjectManager.getStatusColor(p.status) : '#94a3b8';
                
                html += `
                    <div class="project-list-item ${isActive ? 'active' : ''}" data-id="${p.id}">
                        <div class="info">
                            <div class="nama">${Utils.escHtml ? Utils.escHtml(p.nama) : p.nama}</div>
                            <div class="detail">
                                ${p.lokasi || 'Lokasi tidak ditentukan'}
                                ${p.klien ? `• ${p.klien}` : ''}
                                <span class="status-badge" style="background:${statusColor}20; color:${statusColor};">
                                    ${p.status || 'Draft'}
                                </span>
                            </div>
                        </div>
                        <div class="actions">
                            <button class="edit-project" data-id="${p.id}" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-project" data-id="${p.id}" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            container.querySelectorAll('.project-list-item').forEach(el => {
                el.addEventListener('click', function(e) {
                    if (e.target.closest('.actions')) return;
                    const id = this.dataset.id;
                    if (id && typeof ProjectManager !== 'undefined') {
                        ProjectManager.setCurrent(id);
                        renderProjectList();
                        updateProjectUI();
                        if (projectModal) projectModal.classList.remove('active');
                        if (typeof renderItems === 'function') {
                            renderItems();
                        }
                    }
                });
            });

            container.querySelectorAll('.edit-project').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = this.dataset.id;
                    if (id) {
                        loadProjectToForm(id);
                    }
                });
            });

            container.querySelectorAll('.delete-project').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = this.dataset.id;
                    if (id && confirm('Hapus proyek ini?')) {
                        if (typeof ProjectManager !== 'undefined') {
                            ProjectManager.delete(id);
                        }
                        renderProjectList();
                        updateProjectUI();
                    }
                });
            });
        }

        // FORM PROJECT
        function loadProjectToForm(id) {
            const project = typeof ProjectManager !== 'undefined' ? ProjectManager.getById(id) : null;
            if (!project) return;

            projectFormId.value = project.id;
            document.getElementById('projectNama').value = project.nama || '';
            document.getElementById('projectLokasi').value = project.lokasi || '';
            document.getElementById('projectKlien').value = project.klien || '';
            document.getElementById('projectKontraktor').value = project.kontraktor || '';
            document.getElementById('projectKonsultan').value = project.konsultan || '';
            document.getElementById('projectNomorKontrak').value = project.nomorKontrak || '';
            document.getElementById('projectTanggalMulai').value = project.tanggalMulai || '';
            document.getElementById('projectTanggalSelesai').value = project.tanggalSelesai || '';
            document.getElementById('projectNilaiKontrak').value = project.nilaiKontrak || 0;
            document.getElementById('projectStatus').value = project.status || 'Draft';
            document.getElementById('projectDeskripsi').value = project.deskripsi || '';

            projectFormTitle.textContent = 'Edit Proyek';
            projectSubmitBtn.innerHTML = '<i class="fas fa-save"></i> Update Proyek';
            projectDeleteBtn.style.display = 'flex';
            cancelProjectForm.style.display = 'flex';
        }

        function resetProjectForm() {
            projectFormId.value = '';
            document.getElementById('projectNama').value = '';
            document.getElementById('projectLokasi').value = '';
            document.getElementById('projectKlien').value = '';
            document.getElementById('projectKontraktor').value = '';
            document.getElementById('projectKonsultan').value = '';
            document.getElementById('projectNomorKontrak').value = '';
            document.getElementById('projectTanggalMulai').value = '';
            document.getElementById('projectTanggalSelesai').value = '';
            document.getElementById('projectNilaiKontrak').value = 0;
            document.getElementById('projectStatus').value = 'Draft';
            document.getElementById('projectDeskripsi').value = '';

            projectFormTitle.textContent = 'Proyek Baru';
            projectSubmitBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Proyek';
            projectDeleteBtn.style.display = 'none';
            cancelProjectForm.style.display = 'none';
        }

        // EVENT LISTENERS PROJECT - FIX
        if (projectBtn) {
            projectBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔘 Project button clicked');
                renderProjectList();
                resetProjectForm();
                if (projectModal) {
                    projectModal.classList.add('active');
                    console.log('📂 Modal opened');
                }
            });
        }

        if (projectModalClose) {
            projectModalClose.addEventListener('click', function() {
                if (projectModal) projectModal.classList.remove('active');
            });
        }

        if (projectModal) {
            projectModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    projectModal.classList.remove('active');
                }
            });
        }

        if (cancelProjectForm) {
            cancelProjectForm.addEventListener('click', resetProjectForm);
        }

        if (projectForm) {
            projectForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const data = {
                    nama: document.getElementById('projectNama').value.trim(),
                    lokasi: document.getElementById('projectLokasi').value.trim(),
                    klien: document.getElementById('projectKlien').value.trim(),
                    kontraktor: document.getElementById('projectKontraktor').value.trim(),
                    konsultan: document.getElementById('projectKonsultan').value.trim(),
                    nomorKontrak: document.getElementById('projectNomorKontrak').value.trim(),
                    tanggalMulai: document.getElementById('projectTanggalMulai').value,
                    tanggalSelesai: document.getElementById('projectTanggalSelesai').value,
                    nilaiKontrak: parseFloat(document.getElementById('projectNilaiKontrak').value) || 0,
                    status: document.getElementById('projectStatus').value,
                    deskripsi: document.getElementById('projectDeskripsi').value.trim()
                };

                if (!data.nama) {
                    alert('⚠️ Nama proyek wajib diisi!');
                    return;
                }

                const id = projectFormId.value;
                if (id) {
                    if (typeof ProjectManager !== 'undefined') {
                        ProjectManager.update(id, data);
                    }
                } else {
                    if (typeof ProjectManager !== 'undefined') {
                        ProjectManager.create(data);
                    }
                }

                renderProjectList();
                updateProjectUI();
                resetProjectForm();
                if (projectModal) projectModal.classList.remove('active');
            });
        }

        if (projectDeleteBtn) {
            projectDeleteBtn.addEventListener('click', function() {
                const id = projectFormId.value;
                if (id && confirm('Hapus proyek ini?')) {
                    if (typeof ProjectManager !== 'undefined') {
                        ProjectManager.delete(id);
                    }
                    renderProjectList();
                    updateProjectUI();
                    resetProjectForm();
                }
            });
        }

        // UPDATE UI AWAL
        updateProjectUI();
        console.log('✅ Project Manager terintegrasi dengan QSE Pro!');

    })();

    // ============================================
    // KONEKSI CHECK
    // ============================================
    function checkConnections() {
        console.log('🔍 === AUDIT KONEKSI ===');
        console.log(`📊 Database: ${Object.keys(DATABASE).length} jenis`);
        console.log(`🔧 Utils: ${Object.keys(Utils).length} fungsi`);
        if (typeof ProjectManager !== 'undefined') {
            console.log(`📁 ProjectManager: ${ProjectManager.projects.length} project`);
        }
        console.log(`📦 Items: ${state.items.length} item tersimpan`);
        console.log(`🖼️ Gambar: ${state.gambarList.length} gambar`);
        console.log(`✏️ Markup: ${state.markupHistory.length} markup`);
        console.log('=== AUDIT SELESAI ===');
    }

    // ============================================
    // INIT
    // ============================================
    console.log('🚀 QSE Pro v6.4 - Starting...');
    
    loadJenisPekerjaan();

    // Muat item yang sudah tersimpan untuk proyek aktif
    loadItemsForCurrentProject();

    // Data contoh - hanya ditambahkan SEKALI saat pertama kali aplikasi dijalankan
    // (tidak akan muncul lagi setelah pengguna mulai mengisi/menghapus data sendiri)
    if (state.items.length === 0 && !localStorage.getItem('qse_samples_seeded')) {
        const samples = [
            { tipe: 'beton', jenis: 'Struktur', nama: 'Kolom Lantai 1', material: 'Beton K-300', panjang: 0.30, lebar: 0.30, tinggi: 3.50, koefisien: 1.0, volume: 0.315 },
            { tipe: 'pasang_bata', jenis: 'Arsitektur', nama: 'Dinding Bata LT1', material: 'Bata Ringan 10cm', panjang: 8.00, tinggi: 3.50, tebal: 0.10, luasLubang: 0, volume: 2.80, jmlBata: 196, luasBersih: 28.0 },
            { tipe: 'plesteran', jenis: 'Arsitektur', nama: 'Plesteran Dinding', material: 'Mortar 1:4', panjang: 8.00, tinggi: 3.50, tebalPlester: 2.0, jumlahSisi: '2 Sisi', luasLubang: 0, volume: 1.12, luas: 56.0 }
        ];

        samples.forEach(s => {
            const jenisData = DATABASE[s.jenis];
            const itemData = jenisData ? jenisData.items[s.tipe] : null;
            if (itemData) {
                const d = itemData.display(s);
                state.items.push({
                    id: Utils.generateId(),
                    ...s,
                    ...d,
                    tanggal: new Date().toISOString()
                });
            }
        });

        saveItemsToLocal();
    }
    try { localStorage.setItem('qse_samples_seeded', '1'); } catch (e) {}

    renderItems();
    loadGambarFromLocal();
    updateProjectInfo();

    setTimeout(checkConnections, 500);

    console.log('✅ QSE Pro v6.4 siap digunakan!');
    console.log('📐 Fitur: Database terpisah | Acuan Gambar | Zoom | Pan | Markup | Project Manager');

})();
