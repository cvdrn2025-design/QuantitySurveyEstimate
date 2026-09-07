// ============================================
// QSE PRO - APLIKASI UTAMA
// Menggunakan database terpisah
// ============================================

(function() {
    "use strict";

    // ============================================
    // CEK DEPENDENSI
    // ============================================
    if (typeof DATABASE === 'undefined') {
        console.error('❌ Database tidak ditemukan!');
        alert('Database tidak ditemukan! Pastikan file database.js terload.');
        return;
    }

    if (typeof Utils === 'undefined') {
        console.error('❌ Utils tidak ditemukan!');
        alert('Utils tidak ditemukan! Pastikan file utils.js terload.');
        return;
    }

    // ============================================
    // STATE
    // ============================================
    const state = {
        items: [],
        gambarFile: null,
        selectedJenis: '',
        selectedItemKey: '',
        currentData: {}
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
        
        // Gambar
        gambarArea: document.getElementById('gambarArea'),
        gambarPreview: document.getElementById('gambarPreview'),
        gambarPlaceholder: document.getElementById('gambarPlaceholder'),
        fileInput: document.getElementById('fileInput'),
        hapusGambarBtn: document.getElementById('hapusGambarBtn')
    };

    // ============================================
    // FUNGSI UTAMA
    // ============================================

    /**
     * Load jenis pekerjaan ke dropdown
     */
    function loadJenisPekerjaan() {
        const select = DOM.jenisSelect;
        const jenisList = Object.keys(DATABASE);
        
        // Hapus option selain default
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Tambah option
        for (const jenis of jenisList) {
            const data = DATABASE[jenis];
            const option = document.createElement('option');
            option.value = jenis;
            option.textContent = `${data.icon ? '🏗️' : '📐'} ${jenis}`;
            select.appendChild(option);
        }
        
        // Update info database
        const totalItems = Object.values(DATABASE).reduce((acc, j) => acc + Object.keys(j.items).length, 0);
        DOM.dbInfo.textContent = `${jenisList.length} jenis, ${totalItems} item`;
    }

    /**
     * Load item berdasarkan jenis yang dipilih
     */
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
        for (const [key, item] of Object.entries(data.items)) {
            html += `
                <button class="item-picker-btn" data-key="${key}" data-nama="${item.nama}">
                    <i class="fas ${item.icon || 'fa-cube'}"></i>
                    ${item.nama}
                    <span class="badge-item">${key}</span>
                </button>
            `;
        }
        DOM.itemPicker.innerHTML = html;

        // Event listener item
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
    }

    /**
     * Load form berdasarkan item yang dipilih
     */
    function loadForm(key) {
        const jenisData = DATABASE[state.selectedJenis];
        if (!jenisData) return;
        const itemData = jenisData.items[key];
        if (!itemData) return;

        // Reset form
        DOM.formContainer.innerHTML = '';
        state.currentData = {};

        // Generate form
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
                let opts = (f.options || []).map(o => `<option value="${o}" ${o===f.default?'selected':''}>${o}</option>`).join('');
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

        // Event listener untuk preview
        document.querySelectorAll('#formContainer input, #formContainer select').forEach(el => {
            el.addEventListener('input', function() { updatePreview(key); });
            el.addEventListener('change', function() { updatePreview(key); });
        });

        // Tampilkan rumus
        DOM.rumusDisplay.textContent = '📐 ' + (itemData.rumus || 'Rumus tidak tersedia');
        DOM.calcDetail.classList.add('show');

        // Preview awal
        updatePreview(key);
    }

    /**
     * Update preview perhitungan
     */
    function updatePreview(key) {
        const jenisData = DATABASE[state.selectedJenis];
        if (!jenisData) return;
        const itemData = jenisData.items[key];
        if (!itemData) return;

        // Ambil data dari form
        const data = getFormData(key);
        
        // Validasi
        const validation = Utils.validateForm(data, itemData.fields || []);
        if (!validation.valid) {
            DOM.stepDisplay.innerHTML = `<span style="color:#dc2626;">⚠️ ${validation.message}</span>`;
            DOM.calcResultValue.textContent = '0.000';
            DOM.calcResultSub.textContent = 'Lengkapi data terlebih dahulu';
            return;
        }

        // Hitung
        const hasil = itemData.hitung(data);
        if (!hasil) return;

        // Tampilkan step
        let stepHtml = '';
        for (const [k, v] of Object.entries(data)) {
            if (typeof v === 'number' && v !== 0) {
                stepHtml += `<span>${k}: <strong>${Utils.formatAngka(v)}</strong></span>`;
            }
        }
        DOM.stepDisplay.innerHTML = stepHtml || '<span>Data lengkap</span>';

        // Tampilkan hasil
        const firstKey = Object.keys(hasil).find(k => k !== 'satuan');
        if (firstKey) {
            DOM.calcResultValue.textContent = Utils.formatAngka(hasil[firstKey] || 0) + ' ' + (hasil.satuan || '');
        }
        
        // Sub result
        let subHtml = [];
        for (const [k, v] of Object.entries(hasil)) {
            if (k !== 'satuan' && k !== firstKey && typeof v === 'number') {
                subHtml.push(`${k}: ${Utils.formatAngka(v)}`);
            }
        }
        DOM.calcResultSub.textContent = subHtml.join(' | ') || '-';

        // Simpan data
        state.currentData = { ...data, ...hasil };
    }

    /**
     * Ambil data dari form
     */
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

    /**
     * Tambah item ke daftar
     */
    function tambahItem() {
        if (!state.selectedJenis || !state.selectedItemKey) {
            alert('⚠️ Pilih Jenis Pekerjaan dan Item terlebih dahulu!');
            return;
        }

        const jenisData = DATABASE[state.selectedJenis];
        if (!jenisData) return;
        const itemData = jenisData.items[state.selectedItemKey];
        if (!itemData) return;

        // Validasi
        const data = getFormData(state.selectedItemKey);
        const validation = Utils.validateForm(data, itemData.fields || []);
        if (!validation.valid) {
            alert(`⚠️ ${validation.message}`);
            return;
        }

        // Hitung
        const hasil = itemData.hitung(data);
        if (!hasil) return;

        // Cari field nama dan material
        const namaField = (itemData.fields || []).find(f => f.id === 'namaItem');
        const materialField = (itemData.fields || []).find(f => f.id === 'material');
        const nama = namaField ? document.getElementById(`field_${namaField.id}`).value.trim() || 'Item' : 'Item';
        const material = materialField ? document.getElementById(`field_${materialField.id}`).value : 'Material';

        // Simpan
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
        renderItems();
    }

    /**
     * Render daftar item
     */
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

        // Event hapus item
        document.querySelectorAll('.del-item').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.index, 10);
                if (!isNaN(idx) && idx >= 0 && idx < state.items.length) {
                    state.items.splice(idx, 1);
                    renderItems();
                }
            });
        });

        updateStats();
        updateMaterialPreview();
        updateBreakdown();

        // Material top
        let topMat = '-', topVol = 0;
        for (const [mat, vol] of Object.entries(materialCount)) {
            if (vol > topVol) { topVol = vol; topMat = mat; }
        }
        DOM.statMaterialTop.textContent = topMat;
        DOM.statJenisPekerjaan.textContent = jenisSet.size;
    }

    /**
     * Update statistik
     */
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

    /**
     * Update preview material terakhir
     */
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

    /**
     * Update breakdown material
     */
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

    /**
     * Reset form
     */
    function resetForm() {
        if (state.selectedItemKey) {
            loadForm(state.selectedItemKey);
        }
    }

    // ============================================
    // GAMBAR
    // ============================================
    function handleGambar(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            DOM.gambarPreview.src = e.target.result;
            DOM.gambarPreview.style.display = 'block';
            DOM.gambarPlaceholder.style.display = 'none';
            state.gambarFile = file;
        };
        reader.readAsDataURL(file);
    }

    // ============================================
    // EXPORT & CETAK
    // ============================================
    function exportCSV() {
        if (state.items.length === 0) {
            alert('Tidak ada data untuk diexport.');
            return;
        }
        let header = 'ID,Nama,Jenis,Item,Material,Volume,Satuan,Tanggal\n';
        let rows = state.items.map(item => {
            const jenisData = DATABASE[item.jenis];
            const itemData = jenisData ? jenisData.items[item.tipe] : null;
            const d = itemData ? itemData.display(item) : { volume: 0, unit: 'm³' };
            const itemNama = itemData ? itemData.nama : item.tipe;
            return `${item.id},${item.nama},${item.jenis},${itemNama},${item.material},${Utils.formatAngka(d.volume||0)},${d.unit||'m³'},${item.tanggal || ''}`;
        }).join('\n');
        Utils.downloadFile(header + rows, 'QSE_Report.csv');
    }

    function cetakRingkasan() {
        if (state.items.length === 0) {
            alert('Tidak ada data untuk dicetak.');
            return;
        }
        let text = '=== QUANTITY SURVEY ENGINEER ===\n';
        text += `Tanggal: ${Utils.formatTanggal(new Date())}\n`;
        text += `Total Item: ${state.items.length}\n\n`;
        
        state.items.forEach((item, i) => {
            const jenisData = DATABASE[item.jenis];
            const itemData = jenisData ? jenisData.items[item.tipe] : null;
            const d = itemData ? itemData.display(item) : { volume: 0, unit: 'm³' };
            const itemNama = itemData ? itemData.nama : item.tipe;
            text += `${i+1}. ${item.nama}\n`;
            text += `   Jenis: ${item.jenis} | Item: ${itemNama}\n`;
            text += `   Material: ${item.material} | Volume: ${Utils.formatAngka(d.volume||0)} ${d.unit||'m³'}\n\n`;
        });
        
        const win = window.open('', '_blank', 'width=500,height=500');
        if (win) {
            win.document.write(`
                <html>
                <head><title>QSE Report</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 30px; background: #fafafa; }
                    pre { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; font-size: 13px; line-height: 1.6; }
                    @media print { body { padding: 0; } pre { border: none; } }
                </style>
                </head>
                <body><pre>${text}</pre></body>
                </html>
            `);
            win.document.close();
            setTimeout(() => win.print(), 300);
        } else {
            alert('Popup diblokir. Izinkan popup untuk mencetak.');
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    // STEP 1: Pilih Jenis
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
        loadItems(state.selectedJenis);
    });

    // Buttons
    DOM.tambahBtn.addEventListener('click', tambahItem);
    DOM.resetFormBtn.addEventListener('click', resetForm);

    DOM.hapusSemuaBtn.addEventListener('click', function() {
        if (state.items.length === 0) return;
        if (confirm('Hapus semua item?')) {
            state.items = [];
            renderItems();
        }
    });

    DOM.exportBtn.addEventListener('click', exportCSV);
    DOM.cetakBtn.addEventListener('click', cetakRingkasan);

    // Gambar
    DOM.fileInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) handleGambar(this.files[0]);
    });

    DOM.gambarArea.addEventListener('dragover', e => {
        e.preventDefault();
        DOM.gambarArea.classList.add('drag-over');
    });

    DOM.gambarArea.addEventListener('dragleave', e => {
        e.preventDefault();
        DOM.gambarArea.classList.remove('drag-over');
    });

    DOM.gambarArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleGambar(files[0]);
            DOM.fileInput.files = files;
        }
    });

    DOM.hapusGambarBtn.addEventListener('click', function() {
        DOM.gambarPreview.src = '';
        DOM.gambarPreview.style.display = 'none';
        DOM.gambarPlaceholder.style.display = 'flex';
        state.gambarFile = null;
        DOM.fileInput.value = '';
    });

    // ============================================
    // INIT
    // ============================================
    loadJenisPekerjaan();

    // Sample data
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

    renderItems();

    console.log('🏗️ QSE Pro v6.0 - Database Terpisah');
    console.log(`📊 ${Object.keys(DATABASE).length} jenis pekerjaan`);
    console.log(`📋 Total item: ${Object.values(DATABASE).reduce((acc, j) => acc + Object.keys(j.items).length, 0)}`);
    console.log('💡 Update database di js/database.js');

})();
