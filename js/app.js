// ============================================
// QSE PRO - APLIKASI UTAMA
// Versi: 6.0 - Complete with Gambar Features
// ============================================

(function() {
    "use strict";

    // ============================================
    // CEK DEPENDENSI
    // ============================================
    if (typeof DATABASE === 'undefined') {
        console.error('❌ Database tidak ditemukan!');
        alert('❌ Database tidak ditemukan! Pastikan file database.js terload.');
        return;
    }

    if (typeof Utils === 'undefined') {
        console.error('❌ Utils tidak ditemukan!');
        alert('❌ Utils tidak ditemukan! Pastikan file utils.js terload.');
        return;
    }

    console.log('✅ Dependensi terdeteksi:');
    console.log(`   - DATABASE: ${Object.keys(DATABASE).length} jenis`);
    console.log(`   - Utils: ${Object.keys(Utils).length} fungsi`);

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
        return;
    }

    // ============================================
    // FUNGSI DATABASE
    // ============================================
    function loadJenisPekerjaan() {
        const select = DOM.jenisSelect;
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
        DOM.dbInfo.textContent = `${jenisList.length} jenis, ${totalItems} item`;
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
                html += `
                    <button class="item-picker-btn" data-key="${key}" data-nama="${item.nama}">
                        <i class="fas ${item.icon || 'fa-cube'}"></i>
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
                // Cek apakah ada dynamicOptions
                let options = f.options || [];
                if (f.dynamicOptions && f.id === 'ukuranBesi') {
                    const jenisTulangan = document.getElementById('field_jenisTulangan');
                    if (jenisTulangan) {
                        options = f.dynamicOptions[jenisTulangan.value] || options;
                    }
                }
                let opts = options.map(o => `<option value="${o}" ${o===f.default?'selected':''}>${o}</option>`).join('');
                inputHtml = `<select id="field_${f.id}">${opts}</select>`;
                
                // Event listener untuk dynamic dropdown
                if (f.id === 'jenisTulangan') {
                    setTimeout(() => {
                        const el = document.getElementById('field_jenisTulangan');
                        if (el) {
                            el.addEventListener('change', function() {
                                const ukuranEl = document.getElementById('field_ukuranBesi');
                                if (ukuranEl && f.dynamicOptions) {
                                    const opts = f.dynamicOptions[this.value] || [];
                                    ukuranEl.innerHTML = opts.map(o => `<option value="${o}">${o}</option>`).join('');
                                    updatePreview(key);
                                }
                            });
                        }
                    }, 100);
                }
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
        renderItems();
        console.log(`✅ Item "${nama}" berhasil ditambahkan`);
    }

    function resetForm() {
        if (state.selectedItemKey) {
            loadForm(state.selectedItemKey);
            console.log('🔄 Form direset');
        }
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
                    renderItems();
                    console.log(`🗑️ Item ke-${idx} dihapus`);
                }
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
            localStorage.setItem('qse_gambar', JSON.stringify(data));
            localStorage.setItem('qse_markup', JSON.stringify(state.markupHistory));
        } catch (e) {
            console.warn('⚠️ Gagal menyimpan gambar ke localStorage:', e);
        }
    }

    function loadGambarFromLocal() {
        try {
            const data = localStorage.getItem('qse_gambar');
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    state.gambarList = parsed;
                    state.currentGambarIndex = 0;
                    renderThumbnails();
                    displayGambar(0);
                    DOM.gambarCount.textContent = state.gambarList.length + ' gambar';
                    
                    const markupData = localStorage.getItem('qse_markup');
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
        console.log('📤 Data diexport ke CSV');
    }

    function cetakRingkasan() {
        if (state.items.length === 0) {
            alert('Tidak ada data untuk dicetak.');
            return;
        }
        let text = '=== QUANTITY SURVEY ENGINEER ===\n';
        text += `Tanggal: ${Utils.formatTanggal(new Date())}\n`;
        text += `Total Item: ${state.items.length}\n`;
        text += `Total Gambar: ${state.gambarList.length}\n\n`;
        
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
            console.log('🖨️ Cetak ringkasan');
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
        console.log(`📌 Jenis dipilih: ${state.selectedJenis}`);
    });

    // Buttons
    DOM.tambahBtn.addEventListener('click', tambahItem);
    DOM.resetFormBtn.addEventListener('click', resetForm);

    DOM.hapusSemuaBtn.addEventListener('click', function() {
        if (state.items.length === 0) return;
        if (confirm('Hapus semua item?')) {
            state.items = [];
            renderItems();
            console.log('🗑️ Semua item dihapus');
        }
    });

    DOM.exportBtn.addEventListener('click', exportCSV);
    DOM.cetakBtn.addEventListener('click', cetakRingkasan);

    // ============================================
    // EVENT LISTENERS - GAMBAR
    // ============================================
    // Upload
    DOM.fileInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            addGambar(this.files[0]);
        }
        this.value = '';
    });

    DOM.fileInputMultiple.addEventListener('change', function(e) {
        if (this.files) {
            for (const file of this.files) {
                addGambar(file);
            }
        }
        this.value = '';
    });

    // Drag & Drop
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

    // Hapus semua gambar
    DOM.hapusGambarBtn.addEventListener('click', function() {
        if (state.gambarList.length === 0) return;
        if (confirm('Hapus semua gambar?')) {
            state.gambarList = [];
            state.markupHistory = [];
            renderThumbnails();
            displayGambar(-1);
            DOM.gambarCount.textContent = '0 gambar';
            localStorage.removeItem('qse_gambar');
            localStorage.removeItem('qse_markup');
            console.log('🗑️ Semua gambar dihapus');
        }
    });

    // Simpan gambar
    DOM.simpanGambarBtn.addEventListener('click', function() {
        saveGambarToLocal();
        alert('✅ Gambar dan markup berhasil disimpan ke localStorage!');
    });

    // ============================================
    // EVENT LISTENERS - ZOOM
    // ============================================
    DOM.zoomInBtn.addEventListener('click', zoomIn);
    DOM.zoomOutBtn.addEventListener('click', zoomOut);
    DOM.zoomFitBtn.addEventListener('click', zoomFit);
    DOM.zoomResetBtn.addEventListener('click', zoomReset);

    // Mouse Wheel Zoom
    DOM.imageWrapper.addEventListener('wheel', function(e) {
        e.preventDefault();
        if (e.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    }, { passive: false });

    // Pan dengan mouse drag
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

    document.addEventListener('mousemove', function(e) {
        if (state.isDragging && DOM.imageWrapper.classList.contains('active')) {
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
            DOM.imageWrapper.style.cursor = 'grab';
        }
    });

    // Touch support untuk pan
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

    // ============================================
    // EVENT LISTENERS - MARKUP
    // ============================================
    DOM.markupDraw.addEventListener('click', function() {
        document.querySelectorAll('.markup-tools button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        state.markupMode = 'draw';
        DOM.markupCanvas.classList.add('drawing');
    });

    DOM.markupLine.addEventListener('click', function() {
        document.querySelectorAll('.markup-tools button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        state.markupMode = 'line';
        DOM.markupCanvas.classList.add('drawing');
    });

    DOM.markupRect.addEventListener('click', function() {
        document.querySelectorAll('.markup-tools button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        state.markupMode = 'rect';
        DOM.markupCanvas.classList.add('drawing');
    });

    DOM.markupText.addEventListener('click', function() {
        document.querySelectorAll('.markup-tools button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        state.markupMode = 'text';
        DOM.markupCanvas.classList.add('drawing');
    });

    DOM.markupUndo.addEventListener('click', function() {
        if (state.markupHistory.length > 0) {
            state.markupHistory.pop();
            redrawMarkup();
            saveGambarToLocal();
            console.log('↩️ Undo markup');
        }
    });

    DOM.markupClear.addEventListener('click', function() {
        if (state.markupHistory.length === 0) return;
        if (confirm('Hapus semua markup?')) {
            state.markupHistory = [];
            redrawMarkup();
            saveGambarToLocal();
            console.log('🧹 Semua markup dihapus');
        }
    });

    DOM.markupColor.addEventListener('change', function() {
        state.markupColor = this.value;
    });

    // Canvas events untuk drawing
    const canvas = DOM.markupCanvas;
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

    // Resize canvas saat window resize
    window.addEventListener('resize', function() {
        if (DOM.imageWrapper.classList.contains('active')) {
            initMarkupCanvas();
        }
    });

    // ============================================
    // KONEKSI CHECK
    // ============================================
    function checkConnections() {
        console.log('🔍 === AUDIT KONEKSI ===');
        console.log(`📊 Database: ${Object.keys(DATABASE).length} jenis`);
        console.log(`🔧 Utils: ${Object.keys(Utils).length} fungsi`);
        console.log(`📦 Items: ${state.items.length} item tersimpan`);
        console.log(`🖼️ Gambar: ${state.gambarList.length} gambar`);
        console.log(`✏️ Markup: ${state.markupHistory.length} markup`);
        console.log('=== AUDIT SELESAI ===');
    }

    // ============================================
    // INIT
    // ============================================
    console.log('🚀 QSE Pro v6.0 - Starting...');
    
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

    // Load gambar dari localStorage
    loadGambarFromLocal();

    // Jalankan audit koneksi setelah semua terload
    setTimeout(checkConnections, 500);

    console.log('✅ QSE Pro v6.0 siap digunakan!');
    console.log('📐 Fitur: Database terpisah | Acuan Gambar | Zoom | Pan | Markup | Multiple Upload | Local Storage');

})();
