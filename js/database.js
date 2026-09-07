// ============================================
// DATABASE JENIS PEKERJAAN & RUMUS
// File terpisah - bisa ditambah kapan saja
// ============================================

const DATABASE = {
    // ========================================
    // STRUKTUR
    // ========================================
    Struktur: {
        id: 'struktur',
        nama: 'Struktur',
        icon: 'fa-building',
        warna: '#2563eb',
        deskripsi: 'Pekerjaan struktur bangunan',
        items: {
            beton: {
                id: 'beton',
                nama: 'Beton',
                icon: 'fa-cube',
                kategori: 'Struktur',
                rumus: 'Volume = P × L × T × Koefisien',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Kolom Lantai 1', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Beton K-250', 'Beton K-300', 'Beton K-350', 'Beton K-400', 'Beton K-450'], default: 'Beton K-300' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'koefisien', label: 'Koefisien', type: 'number', step: 0.001, default: 1.0, hint: 'Faktor pengali' }
                ],
                hitung: function(data) {
                    const vol = data.panjang * data.lebar * data.tinggi * data.koefisien;
                    return { 
                        volume: isNaN(vol) || vol < 0 ? 0 : vol,
                        satuan: 'm³'
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(3)} m</span>
                            <span><i class="fas fa-arrows-alt-v"></i> ${(item.lebar || 0).toFixed(3)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tinggi || 0).toFixed(3)} m</span>
                            <span><i class="fas fa-times"></i> ${(item.koefisien || 1).toFixed(3)}</span>
                        `
                    };
                }
            },
            pembesian: {
                id: 'pembesian',
                nama: 'Pembesian',
                icon: 'fa-vector-square',
                kategori: 'Struktur',
                rumus: 'Besi = (P × Jml × Berat) + Sengkang',
                satuan: 'kg',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Tulangan Kolom K1', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Besi D10', 'Besi D13', 'Besi D16', 'Besi D19', 'Besi D22', 'Besi D25', 'Besi D28', 'Besi D32'], default: 'Besi D16' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'jmlTulangan', label: 'Jumlah Tulangan', type: 'number', step: 1, default: 8, required: true },
                    { id: 'beratJenis', label: 'Berat Jenis (kg/m)', type: 'number', step: 0.001, default: 1.58, hint: 'D16 = 1.58' },
                    { id: 'lebarKolom', label: 'Lebar Kolom (m)', type: 'number', step: 0.001, default: 0.30 },
                    { id: 'tinggiKolom', label: 'Tinggi Kolom (m)', type: 'number', step: 0.001, default: 0.30 },
                    { id: 'jarakSengkang', label: 'Jarak Sengkang (cm)', type: 'number', step: 0.5, default: 15 },
                    { id: 'selimut', label: 'Selimut Beton (cm)', type: 'number', step: 0.5, default: 4 },
                    { id: 'beratSengkang', label: 'Berat Sengkang (kg/m)', type: 'number', step: 0.001, default: 0.617, hint: 'D10 = 0.617' },
                    { id: 'kait', label: 'Panjang Kait (m)', type: 'number', step: 0.001, default: 0.10 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const jml = data.jmlTulangan || 0;
                    const bUtama = data.beratJenis || 1.58;
                    const l = data.lebarKolom || 0;
                    const t = data.tinggiKolom || 0;
                    const jarak = data.jarakSengkang || 15;
                    const selimut = data.selimut || 4;
                    const bSengkang = data.beratSengkang || 0.617;
                    const kait = data.kait || 0.10;

                    const beratTulangan = p * jml * bUtama;
                    const selimutM = selimut / 100;
                    const ls = l - 2 * selimutM;
                    const ts = t - 2 * selimutM;
                    const pSengkang = 2 * (ls + ts) + 2 * kait;
                    const jmlSengkang = Math.floor(p / (jarak / 100)) + 1;
                    const beratSengkangTotal = jmlSengkang * pSengkang * bSengkang;
                    const total = beratTulangan + beratSengkangTotal;

                    return { 
                        volume: total, 
                        satuan: 'kg',
                        beratTulangan, 
                        beratSengkang: beratSengkangTotal,
                        jmlSengkang
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'kg',
                        detail: `
                            <span><i class="fas fa-arrow-up"></i> Utama: ${(item.beratTulangan || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-vector-square"></i> Sengkang: ${(item.beratSengkang || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jmlSengkang || 0} bh</span>
                        `
                    };
                }
            },
            bekisting: {
                id: 'bekisting',
                nama: 'Bekisting',
                icon: 'fa-border-all',
                kategori: 'Struktur',
                rumus: 'Luas = (P×T + L×T) × (Sisi/2)',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Bekisting Kolom K1', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Kayu Meranti', 'Kayu Kamper', 'Kayu Jati', 'Multiplek 12mm', 'Multiplek 15mm', 'Multiplek 18mm'], default: 'Kayu Kamper' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'jumlahSisi', label: 'Jumlah Sisi', type: 'select', options: ['1 (Pelat)', '2 (Dinding)', '3 (Balok)', '4 (Kolom)'], default: '4' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tinggi || 0;
                    const sisiMap = { '1 (Pelat)': 1, '2 (Dinding)': 2, '3 (Balok)': 3, '4 (Kolom)': 4 };
                    const sisi = sisiMap[data.jumlahSisi] || 4;
                    const luas = (p * t + l * t) * (sisi / 2);
                    return { volume: luas, satuan: 'm²' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-border-all"></i> ${item.jumlahSisi || '4 (Kolom)'}</span>
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                        `
                    };
                }
            },
            balok: {
                id: 'balok',
                nama: 'Balok Beton',
                icon: 'fa-grip-lines',
                kategori: 'Struktur',
                rumus: 'Volume = P × L × T × Jumlah',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Balok B1 30x50', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Beton K-250', 'Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-300' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.50, required: true },
                    { id: 'jumlah', label: 'Jumlah', type: 'number', step: 1, default: 4, required: true },
                    { id: 'tulanganAtas', label: 'Tulangan Atas', type: 'number', step: 1, default: 4 },
                    { id: 'tulanganBawah', label: 'Tulangan Bawah', type: 'number', step: 1, default: 3 },
                    { id: 'beratJenis', label: 'Berat Jenis (kg/m)', type: 'number', step: 0.001, default: 1.58 },
                    { id: 'jarakSengkang', label: 'Sengkang (cm)', type: 'number', step: 0.5, default: 15 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tinggi || 0;
                    const jml = data.jumlah || 1;
                    const vol = p * l * t * jml;
                    
                    const tulAtas = data.tulanganAtas || 0;
                    const tulBawah = data.tulanganBawah || 0;
                    const berat = data.beratJenis || 1.58;
                    const jarak = data.jarakSengkang || 15;
                    const totalTulangan = tulAtas + tulBawah;
                    const beratBesi = p * totalTulangan * berat * jml;
                    const jmlSengkang = Math.floor(p / (jarak / 100)) * jml;
                    const pSengkang = 2 * ((l - 0.08) + (t - 0.08)) + 0.1;
                    const beratSengkang = jmlSengkang * pSengkang * 0.617;
                    const totalBesi = beratBesi + beratSengkang;

                    return { volume: vol, satuan: 'm³', totalBesi, beratBesi, beratSengkang };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-grip-lines"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                            <span><i class="fas fa-weight-hanging"></i> Besi: ${(item.totalBesi || 0).toFixed(2)} kg</span>
                        `
                    };
                }
            },
            sloof: {
                id: 'sloof',
                nama: 'Sloof',
                icon: 'fa-grip-lines-vertical',
                kategori: 'Struktur',
                rumus: 'Volume = P × L × T',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Sloof 20x30', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Beton K-250', 'Beton K-300', 'Beton K-350'], default: 'Beton K-300' },
                    { id: 'panjang', label: 'Panjang Total (m)', type: 'number', step: 0.001, default: 45.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.20, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tulanganAtas', label: 'Tulangan Atas', type: 'number', step: 1, default: 3 },
                    { id: 'tulanganBawah', label: 'Tulangan Bawah', type: 'number', step: 1, default: 3 },
                    { id: 'beratJenis', label: 'Berat Jenis (kg/m)', type: 'number', step: 0.001, default: 1.58 },
                    { id: 'jarakSengkang', label: 'Sengkang (cm)', type: 'number', step: 0.5, default: 15 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tinggi || 0;
                    const vol = p * l * t;
                    
                    const tulAtas = data.tulanganAtas || 0;
                    const tulBawah = data.tulanganBawah || 0;
                    const berat = data.beratJenis || 1.58;
                    const jarak = data.jarakSengkang || 15;
                    const totalTulangan = tulAtas + tulBawah;
                    const beratBesi = p * totalTulangan * berat;
                    const jmlSengkang = Math.floor(p / (jarak / 100));
                    const pSengkang = 2 * ((l - 0.08) + (t - 0.08)) + 0.1;
                    const beratSengkang = jmlSengkang * pSengkang * 0.617;
                    const totalBesi = beratBesi + beratSengkang;

                    return { volume: vol, satuan: 'm³', totalBesi };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-grip-lines-vertical"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-weight-hanging"></i> Besi: ${(item.totalBesi || 0).toFixed(2)} kg</span>
                        `
                    };
                }
            },
            pilecap: {
                id: 'pilecap',
                nama: 'Pile Cap',
                icon: 'fa-chess-queen',
                kategori: 'Struktur',
                rumus: 'Volume = P × L × T × Jumlah',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pile Cap PC1', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-350' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 1.20, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 1.20, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.80, required: true },
                    { id: 'jumlah', label: 'Jumlah', type: 'number', step: 1, default: 6, required: true }
                ],
                hitung: function(data) {
                    const vol = (data.panjang || 0) * (data.lebar || 0) * (data.tinggi || 0) * (data.jumlah || 1);
                    return { volume: vol, satuan: 'm³' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-chess-queen"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                        `
                    };
                }
            },
            kolom_bulat: {
                id: 'kolom_bulat',
                nama: 'Kolom Bulat + Spiral',
                icon: 'fa-circle',
                kategori: 'Struktur',
                rumus: 'Volume = π × r² × T | Besi = Utama + Spiral',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Kolom Bulat D400', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-350' },
                    { id: 'diameter', label: 'Diameter (m)', type: 'number', step: 0.001, default: 0.40, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'selimut', label: 'Selimut (cm)', type: 'number', step: 0.5, default: 4 },
                    { id: 'jmlTulangan', label: 'Jumlah Tulangan', type: 'number', step: 1, default: 10 },
                    { id: 'beratJenis', label: 'Berat Jenis (kg/m)', type: 'number', step: 0.001, default: 1.58 },
                    { id: 'jarakSpiral', label: 'Jarak Spiral (cm)', type: 'number', step: 0.5, default: 10 },
                    { id: 'beratSpiral', label: 'Berat Spiral (kg/m)', type: 'number', step: 0.001, default: 0.617 }
                ],
                hitung: function(data) {
                    const d = data.diameter || 0;
                    const t = data.tinggi || 0;
                    const r = d / 2;
                    const volBeton = Math.PI * r * r * t;
                    
                    const jml = data.jmlTulangan || 0;
                    const bUtama = data.beratJenis || 1.58;
                    const beratTulangan = t * jml * bUtama;
                    
                    const selimut = data.selimut || 4;
                    const jarak = data.jarakSpiral || 10;
                    const bSpiral = data.beratSpiral || 0.617;
                    const selimutM = selimut / 100;
                    const dSpiral = d - 2 * selimutM;
                    const keliling = Math.PI * dSpiral;
                    const jmlLilitan = Math.floor(t / (jarak / 100)) + 1;
                    const pSpiral = keliling * jmlLilitan;
                    const beratSpiralTotal = pSpiral * bSpiral;
                    const totalBesi = beratTulangan + beratSpiralTotal;

                    return { 
                        volume: volBeton, 
                        satuan: 'm³',
                        totalBesi,
                        beratTulangan,
                        beratSpiral: beratSpiralTotal,
                        jmlLilitan
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-circle"></i> D${((item.diameter || 0) * 100).toFixed(0)}</span>
                            <span><i class="fas fa-arrow-up"></i> Utama: ${(item.beratTulangan || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-spiral"></i> Spiral: ${(item.beratSpiral || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-weight-hanging"></i> Total: ${(item.totalBesi || 0).toFixed(2)} kg</span>
                        `
                    };
                }
            },
            dinding: {
                id: 'dinding',
                nama: 'Dinding Core/Shear Wall',
                icon: 'fa-layer-group',
                kategori: 'Struktur',
                rumus: 'Volume = P × T × Tebal × Lantai',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Core Lift LT1', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-350' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'tebal', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.25, required: true },
                    { id: 'jmlLantai', label: 'Jumlah Lantai', type: 'number', step: 1, default: 1, required: true }
                ],
                hitung: function(data) {
                    const vol = (data.panjang || 0) * (data.tinggi || 0) * (data.tebal || 0) * (data.jmlLantai || 1);
                    return { volume: vol, satuan: 'm³' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-layer-group"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}×${(item.tebal || 0).toFixed(2)}</span>
                            <span><i class="fas fa-layer-group"></i> ${item.jmlLantai || 1} Lantai</span>
                        `
                    };
                }
            },
            pondasi: {
                id: 'pondasi',
                nama: 'Pondasi Batu Belah',
                icon: 'fa-chess-queen',
                kategori: 'Struktur',
                rumus: 'Volume = ((LA+LB)/2) × T × P',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pondasi Batu Belah', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Batu Belah', 'Batu Kali', 'Batu Gunung'], default: 'Batu Belah' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 10.00, required: true },
                    { id: 'lebarAtas', label: 'Lebar Atas (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'lebarBawah', label: 'Lebar Bawah (m)', type: 'number', step: 0.001, default: 0.60, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.80, required: true },
                    { id: 'persenBatu', label: 'Batu (%)', type: 'number', step: 1, default: 70 },
                    { id: 'persenPasir', label: 'Pasir (%)', type: 'number', step: 1, default: 20 },
                    { id: 'persenSemen', label: 'Semen (%)', type: 'number', step: 1, default: 10 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const la = data.lebarAtas || 0;
                    const lb = data.lebarBawah || 0;
                    const t = data.tinggi || 0;
                    const rata = (la + lb) / 2;
                    const vol = rata * t * p;
                    return { 
                        volume: vol, 
                        satuan: 'm³',
                        batu: vol * (data.persenBatu / 100),
                        pasir: vol * (data.persenPasir / 100),
                        semen: vol * (data.persenSemen / 100)
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-chess-queen"></i> ${(item.panjang || 0).toFixed(2)}m</span>
                            <span><i class="fas fa-percent"></i> Batu ${item.persenBatu || 70}%</span>
                            <span><i class="fas fa-cube"></i> Batu: ${(item.batu || 0).toFixed(3)} m³</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // ARSITEKTUR
    // ========================================
    Arsitektur: {
        id: 'arsitektur',
        nama: 'Arsitektur',
        icon: 'fa-archway',
        warna: '#7c3aed',
        deskripsi: 'Pekerjaan arsitektur bangunan',
        items: {
            pasang_bata: {
                id: 'pasang_bata',
                nama: 'Pasang Bata',
                icon: 'fa-cubes',
                kategori: 'Arsitektur',
                rumus: 'Volume = P × T × Tebal | Jumlah Bata = Volume × 70',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pasang Bata Dinding', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Bata Merah', 'Bata Ringan 7.5cm', 'Bata Ringan 10cm', 'Batako', 'Bata Expose'], default: 'Bata Ringan 10cm' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'tebal', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.10, required: true },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0, hint: 'Pintu, jendela, dll' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const t = data.tinggi || 0;
                    const tebal = data.tebal || 0.10;
                    const luas = p * t;
                    const luasBersih = luas - (data.luasLubang || 0);
                    const vol = luasBersih * tebal;
                    const jmlBata = vol * 70;
                    return { volume: vol, satuan: 'm³', luasBersih, jmlBata };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-cubes"></i> Bata: ${Math.round(item.jmlBata || 0)} bh</span>
                            <span><i class="fas fa-vector-square"></i> Luas: ${(item.luasBersih || 0).toFixed(2)} m²</span>
                        `
                    };
                }
            },
            plesteran: {
                id: 'plesteran',
                nama: 'Plesteran',
                icon: 'fa-trowel',
                kategori: 'Arsitektur',
                rumus: 'Luas = P × T × Sisi',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Plesteran Dinding', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Mortar 1:3', 'Mortar 1:4', 'Mortar 1:5', 'Mortar Instan'], default: 'Mortar 1:4' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'tebalPlester', label: 'Tebal Plester (cm)', type: 'number', step: 0.1, default: 2.0, required: true },
                    { id: 'jumlahSisi', label: 'Jumlah Sisi', type: 'select', options: ['1 Sisi', '2 Sisi'], default: '2 Sisi' },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const t = data.tinggi || 0;
                    const sisi = data.jumlahSisi === '2 Sisi' ? 2 : 1;
                    const luas = (p * t - (data.luasLubang || 0)) * sisi;
                    const volMortar = luas * (data.tebalPlester / 100);
                    return { volume: volMortar, satuan: 'm³', luas };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-border-all"></i> ${item.jumlahSisi || '2 Sisi'}</span>
                            <span><i class="fas fa-vector-square"></i> Luas: ${(item.luas || 0).toFixed(2)} m²</span>
                        `
                    };
                }
            },
            acian: {
                id: 'acian',
                nama: 'Acian',
                icon: 'fa-paint-roller',
                kategori: 'Arsitektur',
                rumus: 'Luas = P × T × Sisi',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Acian Dinding', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Acian Semen', 'Acian Putih', 'Acian Warna', 'Acian Halus'], default: 'Acian Semen' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'jumlahSisi', label: 'Jumlah Sisi', type: 'select', options: ['1 Sisi', '2 Sisi'], default: '2 Sisi' },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const t = data.tinggi || 0;
                    const sisi = data.jumlahSisi === '2 Sisi' ? 2 : 1;
                    const luas = (p * t - (data.luasLubang || 0)) * sisi;
                    return { volume: luas, satuan: 'm²' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-border-all"></i> ${item.jumlahSisi || '2 Sisi'}</span>
                        `
                    };
                }
            },
            lantai: {
                id: 'lantai',
                nama: 'Lantai Keramik',
                icon: 'fa-th-large',
                kategori: 'Arsitektur',
                rumus: 'Luas = P × L',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pasang Keramik Lantai', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Keramik 30x30', 'Keramik 40x40', 'Keramik 60x60', 'Granit 60x60', 'Marmer', 'Parket'], default: 'Keramik 40x40' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 4.00, required: true },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0 }
                ],
                hitung: function(data) {
                    const luas = (data.panjang || 0) * (data.lebar || 0) - (data.luasLubang || 0);
                    const jmlKeramik = luas * 1.05;
                    return { volume: luas, satuan: 'm²', jmlKeramik };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-th-large"></i> Keramik: ${Math.round(item.jmlKeramik || 0)} bh</span>
                        `
                    };
                }
            },
            plafon: {
                id: 'plafon',
                nama: 'Plafon',
                icon: 'fa-chevron-up',
                kategori: 'Arsitektur',
                rumus: 'Luas = P × L',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pasang Plafon', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Gypsum', 'GRC Board', 'Multiplek', 'PVC', 'Aluminium', 'Kayu'], default: 'Gypsum' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 4.00, required: true }
                ],
                hitung: function(data) {
                    const luas = (data.panjang || 0) * (data.lebar || 0);
                    return { volume: luas, satuan: 'm²' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                        `
                    };
                }
            },
            kusen: {
                id: 'kusen',
                nama: 'Kusen Pintu/Jendela',
                icon: 'fa-door-open',
                kategori: 'Arsitektur',
                rumus: 'Volume = (2×T + L) × Jumlah',
                satuan: 'm',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Kusen Pintu', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Kayu Jati', 'Kayu Meranti', 'Kayu Kamper', 'Aluminium', 'PVC'], default: 'Kayu Jati' },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 2.10, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.90, required: true },
                    { id: 'jumlah', label: 'Jumlah', type: 'number', step: 1, default: 4, required: true }
                ],
                hitung: function(data) {
                    const t = data.tinggi || 0;
                    const l = data.lebar || 0;
                    const jml = data.jumlah || 1;
                    const panjang = (2 * t + l) * jml;
                    return { volume: panjang, satuan: 'm' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm',
                        detail: `
                            <span><i class="fas fa-door-open"></i> ${(item.tinggi || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // FINISHING
    // ========================================
    Finishing: {
        id: 'finishing',
        nama: 'Finishing',
        icon: 'fa-paint-roller',
        warna: '#d97706',
        deskripsi: 'Pekerjaan finishing bangunan',
        items: {
            cat_dinding: {
                id: 'cat_dinding',
                nama: 'Cat Dinding',
                icon: 'fa-paint-brush',
                kategori: 'Finishing',
                rumus: 'Luas = P × T × 2',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Cat Dinding', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Cat Tembok Interior', 'Cat Tembok Eksterior', 'Cat Vinyl', 'Cat Anti Bocor', 'Cat Tekstur'], default: 'Cat Tembok Interior' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0 },
                    { id: 'lapis', label: 'Jumlah Lapis', type: 'select', options: ['1 Lapis', '2 Lapis'], default: '2 Lapis' }
                ],
                hitung: function(data) {
                    const luas = ((data.panjang || 0) * (data.tinggi || 0) - (data.luasLubang || 0)) * 2;
                    const lapis = data.lapis === '2 Lapis' ? 2 : 1;
                    const kebutuhan = luas * lapis;
                    return { volume: luas, satuan: 'm²', kebutuhan };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-paint-brush"></i> ${item.lapis || '2 Lapis'}</span>
                            <span><i class="fas fa-paint-roller"></i> ${Math.round(item.kebutuhan || 0)} m²</span>
                        `
                    };
                }
            },
            cat_plafon: {
                id: 'cat_plafon',
                nama: 'Cat Plafon',
                icon: 'fa-chevron-up',
                kategori: 'Finishing',
                rumus: 'Luas = P × L',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Cat Plafon', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Cat Tembok', 'Cat Khusus Plafon', 'Cat Anti Jamur'], default: 'Cat Tembok' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 4.00, required: true },
                    { id: 'lapis', label: 'Jumlah Lapis', type: 'select', options: ['1 Lapis', '2 Lapis'], default: '2 Lapis' }
                ],
                hitung: function(data) {
                    const luas = (data.panjang || 0) * (data.lebar || 0);
                    const lapis = data.lapis === '2 Lapis' ? 2 : 1;
                    const kebutuhan = luas * lapis;
                    return { volume: luas, satuan: 'm²', kebutuhan };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-paint-brush"></i> ${item.lapis || '2 Lapis'}</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // MEKANIKAL
    // ========================================
    Mekanikal: {
        id: 'mekanikal',
        nama: 'Mekanikal',
        icon: 'fa-cogs',
        warna: '#0891b2',
        deskripsi: 'Pekerjaan mekanikal bangunan',
        items: {
            pipa_air: {
                id: 'pipa_air',
                nama: 'Instalasi Pipa Air',
                icon: 'fa-water',
                kategori: 'Mekanikal',
                rumus: 'Panjang = Total panjang pipa',
                satuan: 'm',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pipa Air Bersih', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Pipa PVC', 'Pipa PPR', 'Pipa Galvanis', 'Pipa Tembaga', 'Pipa HDPE'], default: 'Pipa PVC' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 25.00, required: true },
                    { id: 'diameter', label: 'Diameter (inch)', type: 'select', options: ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '3"', '4"'], default: '1"' }
                ],
                hitung: function(data) {
                    return { volume: data.panjang || 0, satuan: 'm' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm',
                        detail: `
                            <span><i class="fas fa-water"></i> ${item.diameter || '1"'}</span>
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)} m</span>
                        `
                    };
                }
            },
            ducting: {
                id: 'ducting',
                nama: 'Instalasi Ducting',
                icon: 'fa-wind',
                kategori: 'Mekanikal',
                rumus: 'Luas = (2×T + 2×L) × P',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Ducting AC', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Seng', 'Aluminium', 'PVC', 'Fiber'], default: 'Seng' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 15.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.30, required: true }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tinggi || 0;
                    const luas = (2 * t + 2 * l) * p;
                    return { volume: luas, satuan: 'm²' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-wind"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // ELEKTRIKAL
    // ========================================
    Elektrikal: {
        id: 'elektrikal',
        nama: 'Elektrikal',
        icon: 'fa-bolt',
        warna: '#f59e0b',
        deskripsi: 'Pekerjaan elektrikal bangunan',
        items: {
            kabel: {
                id: 'kabel',
                nama: 'Instalasi Kabel',
                icon: 'fa-plug',
                kategori: 'Elektrikal',
                rumus: 'Panjang = Total panjang kabel',
                satuan: 'm',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Kabel Listrik', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['NYA 1.5mm²', 'NYA 2.5mm²', 'NYM 3x1.5', 'NYM 3x2.5', 'NYM 4x2.5', 'NYM 4x4', 'NYM 4x6'], default: 'NYA 2.5mm²' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 50.00, required: true },
                    { id: 'jumlahKabel', label: 'Jumlah Kabel', type: 'number', step: 1, default: 3, required: true }
                ],
                hitung: function(data) {
                    const total = (data.panjang || 0) * (data.jumlahKabel || 1);
                    return { volume: total, satuan: 'm' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm',
                        detail: `
                            <span><i class="fas fa-plug"></i> ${item.material || 'NYA 2.5mm²'}</span>
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)} × ${item.jumlahKabel || 1}</span>
                        `
                    };
                }
            },
            fitting: {
                id: 'fitting',
                nama: 'Fitting Listrik',
                icon: 'fa-lightbulb',
                kategori: 'Elektrikal',
                rumus: 'Jumlah = Total titik',
                satuan: 'titik',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Titik Lampu', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Lampu LED', 'Lampu TL', 'Downlight', 'Spotlight', 'Armature'], default: 'Lampu LED' },
                    { id: 'jumlah', label: 'Jumlah Titik', type: 'number', step: 1, default: 12, required: true }
                ],
                hitung: function(data) {
                    return { volume: data.jumlah || 0, satuan: 'titik' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'titik',
                        detail: `
                            <span><i class="fas fa-lightbulb"></i> ${item.material || 'Lampu LED'}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 0} titik</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // PLUMBING
    // ========================================
    Plumbing: {
        id: 'plumbing',
        nama: 'Plumbing',
        icon: 'fa-wrench',
        warna: '#059669',
        deskripsi: 'Pekerjaan plumbing bangunan',
        items: {
            instalasi_plumbing: {
                id: 'instalasi_plumbing',
                nama: 'Instalasi Plumbing',
                icon: 'fa-pipe',
                kategori: 'Plumbing',
                rumus: 'Panjang = Total panjang instalasi',
                satuan: 'm',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Instalasi Plumbing', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Pipa PVC AW', 'Pipa PVC D', 'Pipa PPR', 'Pipa Tembaga', 'Pipa HDPE'], default: 'Pipa PVC AW' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 30.00, required: true },
                    { id: 'diameter', label: 'Diameter (inch)', type: 'select', options: ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '3"', '4"'], default: '1"' }
                ],
                hitung: function(data) {
                    return { volume: data.panjang || 0, satuan: 'm' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm',
                        detail: `
                            <span><i class="fas fa-pipe"></i> ${item.diameter || '1"'}</span>
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)} m</span>
                        `
                    };
                }
            },
            sanitary: {
                id: 'sanitary',
                nama: 'Sanitary',
                icon: 'fa-toilet',
                kategori: 'Plumbing',
                rumus: 'Jumlah = Total unit sanitary',
                satuan: 'unit',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Sanitary', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Wastafel', 'Closet', 'Urinal', 'Floor Drain', 'Shower'], default: 'Wastafel' },
                    { id: 'jumlah', label: 'Jumlah Unit', type: 'number', step: 1, default: 4, required: true }
                ],
                hitung: function(data) {
                    return { volume: data.jumlah || 0, satuan: 'unit' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'unit',
                        detail: `
                            <span><i class="fas fa-toilet"></i> ${item.material || 'Wastafel'}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 0} unit</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // LANDSKAP
    // ========================================
    Landskap: {
        id: 'landskap',
        nama: 'Landskap',
        icon: 'fa-tree',
        warna: '#16a34a',
        deskripsi: 'Pekerjaan lansekap dan taman',
        items: {
            taman: {
                id: 'taman',
                nama: 'Taman',
                icon: 'fa-leaf',
                kategori: 'Landskap',
                rumus: 'Luas = P × L',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Taman', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Rumput', 'Tanaman Hias', 'Batu Alam', 'Paving Block'], default: 'Rumput' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 10.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 8.00, required: true }
                ],
                hitung: function(data) {
                    const luas = (data.panjang || 0) * (data.lebar || 0);
                    return { volume: luas, satuan: 'm²' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-leaf"></i> ${item.material || 'Rumput'}</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // PENUTUP
    // ========================================
    Penutup: {
        id: 'penutup',
        nama: 'Penutup Atap',
        icon: 'fa-home',
        warna: '#8b5cf6',
        deskripsi: 'Pekerjaan penutup atap',
        items: {
            atap: {
                id: 'atap',
                nama: 'Atap',
                icon: 'fa-roof',
                kategori: 'Penutup',
                rumus: 'Luas = (P × L) / Cos α',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Atap Genteng', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Genteng Tanah', 'Genteng Beton', 'Genteng Metal', 'Asbes', 'Seng', 'Polycarbonate'], default: 'Genteng Tanah' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 12.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'sudut', label: 'Sudut Kemiringan (°)', type: 'number', step: 1, default: 30, required: true }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const sudut = data.sudut || 30;
                    const rad = sudut * Math.PI / 180;
                    const luas = (p * l) / Math.cos(rad);
                    return { volume: luas, satuan: 'm²' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-angle-up"></i> ${item.sudut || 30}°</span>
                            <span><i class="fas fa-roof"></i> ${item.material || 'Genteng Tanah'}</span>
                        `
                    };
                }
            }
        }
    }
};

// ============================================
// EKSPOR
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DATABASE;
}

if (typeof window !== 'undefined') {
    window.DATABASE = DATABASE;
    console.log('✅ Database loaded!');
    console.log(`📊 ${Object.keys(DATABASE).length} jenis pekerjaan`);
    const totalItems = Object.values(DATABASE).reduce((acc, j) => acc + Object.keys(j.items).length, 0);
    console.log(`📋 ${totalItems} item pekerjaan`);
                      }
