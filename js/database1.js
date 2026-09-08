// ============================================
// QSE PRO - DATABASE JENIS PEKERJAAN & RUMUS
// Versi: 3.5 - Complete Database
// ============================================

const DATABASE = {
    // ========================================
    // 1. PEKERJAAN TANAH
    // ========================================
    Pekerjaan_Tanah: {
        id: 'pekerjaan_tanah',
        nama: 'Pekerjaan Tanah',
        icon: 'fa-tractor',
        warna: '#8B6B4C',
        deskripsi: 'Pekerjaan persiapan dan pengolahan tanah',
        items: {
            galian_tanah: {
                id: 'galian_tanah',
                nama: 'Galian Tanah',
                icon: 'fa-tractor',
                kategori: 'Pekerjaan Tanah',
                rumus: 'Volume = P × L × T (Persegi) atau ((LA+LB)/2) × T × P (Trapesium)',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Galian Pondasi', required: true },
                    { id: 'material', label: 'Jenis Tanah', type: 'select', options: ['Tanah Biasa', 'Tanah Lempung', 'Tanah Pasir', 'Tanah Berbatu', 'Tanah Gambut'], default: 'Tanah Biasa' },
                    { id: 'bentukGalian', label: 'Bentuk Galian', type: 'select', options: ['Persegi', 'Trapesium'], default: 'Persegi' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 10.00, required: true },
                    { id: 'lebarAtas', label: 'Lebar Atas (m)', type: 'number', step: 0.001, default: 1.00, required: true },
                    { id: 'lebarBawah', label: 'Lebar Bawah (m)', type: 'number', step: 0.001, default: 0.60, hint: 'Untuk bentuk trapesium' },
                    { id: 'tinggi', label: 'Kedalaman (m)', type: 'number', step: 0.001, default: 1.50, required: true },
                    { id: 'faktorGali', label: 'Faktor Kemudahan', type: 'number', step: 0.001, default: 1.0, hint: '1.0 = mudah, 1.2 = sedang, 1.5 = keras' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const la = data.lebarAtas || 0;
                    const lb = data.lebarBawah || 0;
                    const t = data.tinggi || 0;
                    const faktor = data.faktorGali || 1.0;
                    let volume = 0;
                    if (data.bentukGalian === 'Trapesium') {
                        const rataLebar = (la + lb) / 2;
                        volume = rataLebar * t * p;
                    } else {
                        volume = p * la * t;
                    }
                    volume = volume * faktor;
                    return {
                        volume: isNaN(volume) || volume < 0 ? 0 : volume,
                        satuan: 'm³',
                        luasArea: p * la,
                        volumeBersih: p * la * t
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${item.bentukGalian || 'Persegi'}</span>
                            <span><i class="fas fa-ruler"></i> ${(item.tinggi || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-times"></i> ${(item.faktorGali || 1).toFixed(2)}</span>
                        `
                    };
                }
            },
            urugan_tanah: {
                id: 'urugan_tanah',
                nama: 'Urugan Tanah',
                icon: 'fa-mountain',
                kategori: 'Pekerjaan Tanah',
                rumus: 'Volume = P × L × T × Faktor Pemadatan × (1 + Susut)',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Urugan Kembali', required: true },
                    { id: 'material', label: 'Material Urug', type: 'select', options: ['Tanah Urug', 'Tanah Pilihan', 'Tanah Campur', 'Tanah Lempung'], default: 'Tanah Urug' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 10.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tinggi', label: 'Tebal Urugan (m)', type: 'number', step: 0.001, default: 0.50, required: true },
                    { id: 'faktorPadat', label: 'Faktor Pemadatan', type: 'number', step: 0.001, default: 1.2, hint: '1.2 = padat, 1.0 = lepas' },
                    { id: 'persenSusut', label: 'Susut Material (%)', type: 'number', step: 0.1, default: 10 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tinggi || 0;
                    const faktor = data.faktorPadat || 1.2;
                    const susut = (data.persenSusut || 10) / 100;
                    let volume = p * l * t;
                    volume = volume * faktor * (1 + susut);
                    return {
                        volume: isNaN(volume) || volume < 0 ? 0 : volume,
                        satuan: 'm³',
                        volumeBersih: p * l * t,
                        volumePadat: p * l * t * faktor
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tinggi || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-compress"></i> ${(item.faktorPadat || 1.2).toFixed(2)}</span>
                            <span><i class="fas fa-percent"></i> ${item.persenSusut || 10}%</span>
                        `
                    };
                }
            },
            pasir_urug: {
                id: 'pasir_urug',
                nama: 'Pasir Urug Bawah Lantai',
                icon: 'fa-sand',
                kategori: 'Pekerjaan Tanah',
                rumus: 'Volume = (P × L - Lubang) × T × Faktor Pemadatan',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pasir Urug Bawah Lantai', required: true },
                    { id: 'material', label: 'Jenis Pasir', type: 'select', options: ['Pasir Urug', 'Pasir Kasar', 'Pasir Halus', 'Pasir Beton'], default: 'Pasir Urug' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 10.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tebal', label: 'Tebal Pasir (m)', type: 'number', step: 0.001, default: 0.10, required: true, hint: 'Minimal 10cm' },
                    { id: 'faktorPadat', label: 'Faktor Pemadatan', type: 'number', step: 0.001, default: 1.15, hint: '1.15 = manual, 1.1 = mekanis' },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0, hint: 'Kolom, pipa, dll' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tebal || 0;
                    const luasLubang = data.luasLubang || 0;
                    const faktor = data.faktorPadat || 1.15;
                    const luas = p * l - luasLubang;
                    let volume = luas * t * faktor;
                    return {
                        volume: isNaN(volume) || volume < 0 ? 0 : volume,
                        satuan: 'm³',
                        luas: luas,
                        volumeBersih: luas * t
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tebal || 0).toFixed(3)} m</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luas || 0).toFixed(2)} m²</span>
                        `
                    };
                }
            },
            cut_fill: {
                id: 'cut_fill',
                nama: 'Cut and Fill',
                icon: 'fa-arrows-alt-h',
                kategori: 'Pekerjaan Tanah',
                rumus: 'Volume = Luas Area × Rata-rata Selisih Elevasi',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Cut and Fill Lahan', required: true },
                    { id: 'material', label: 'Jenis Tanah', type: 'select', options: ['Tanah Biasa', 'Tanah Lempung', 'Tanah Pasir', 'Tanah Berbatu'], default: 'Tanah Biasa' },
                    { id: 'panjang', label: 'Panjang Area (m)', type: 'number', step: 0.001, default: 20.00, required: true },
                    { id: 'lebar', label: 'Lebar Area (m)', type: 'number', step: 0.001, default: 15.00, required: true },
                    { id: 'elevasiAwal', label: 'Elevasi Awal (m)', type: 'number', step: 0.001, default: 5.50, required: true },
                    { id: 'elevasiAkhir', label: 'Elevasi Akhir (m)', type: 'number', step: 0.001, default: 4.20, required: true },
                    { id: 'faktorGembur', label: 'Faktor Gembur', type: 'number', step: 0.001, default: 1.2, hint: '1.0-1.5 tergantung jenis tanah' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const ea = data.elevasiAwal || 0;
                    const eb = data.elevasiAkhir || 0;
                    const faktor = data.faktorGembur || 1.2;
                    const luas = p * l;
                    const selisih = Math.abs(ea - eb);
                    let volume = luas * selisih;
                    if (ea > eb) {
                        volume = volume * faktor;
                        return { volume: isNaN(volume) || volume < 0 ? 0 : volume, satuan: 'm³', tipe: 'Cut', luas, selisih };
                    } else {
                        return { volume: isNaN(volume) || volume < 0 ? 0 : volume, satuan: 'm³', tipe: 'Fill', luas, selisih };
                    }
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrow-up"></i> ${item.tipe || 'Cut'}</span>
                            <span><i class="fas fa-ruler"></i> ${(item.selisih || 0).toFixed(2)} m</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 2. PEKERJAAN PONDASI
    // ========================================
    Pekerjaan_Pondasi: {
        id: 'pekerjaan_pondasi',
        nama: 'Pekerjaan Pondasi',
        icon: 'fa-chess-queen',
        warna: '#8B4513',
        deskripsi: 'Pekerjaan pondasi bangunan',
        items: {
            pondasi_batu_kali: {
                id: 'pondasi_batu_kali',
                nama: 'Pondasi Batu Kali',
                icon: 'fa-chess-queen',
                kategori: 'Pekerjaan Pondasi',
                rumus: 'Volume = ((LA+LB)/2) × T × P',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pondasi Batu Kali', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Batu Kali', 'Batu Belah', 'Batu Gunung'], default: 'Batu Kali' },
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
                        volume: isNaN(vol) || vol < 0 ? 0 : vol,
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
                            <span><i class="fas fa-chess-queen"></i> ${(item.panjang || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-percent"></i> Batu ${item.persenBatu || 70}%</span>
                            <span><i class="fas fa-cube"></i> Batu: ${(item.batu || 0).toFixed(3)} m³</span>
                        `
                    };
                }
            },
            pondasi_batu_belah: {
                id: 'pondasi_batu_belah',
                nama: 'Pondasi Batu Belah',
                icon: 'fa-chess-queen',
                kategori: 'Pekerjaan Pondasi',
                rumus: 'Volume = ((LA+LB)/2) × T × P',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pondasi Batu Belah', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Batu Belah', 'Batu Kali', 'Batu Gunung'], default: 'Batu Belah' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 10.00, required: true },
                    { id: 'lebarAtas', label: 'Lebar Atas (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'lebarBawah', label: 'Lebar Bawah (m)', type: 'number', step: 0.001, default: 0.60, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.80, required: true }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const la = data.lebarAtas || 0;
                    const lb = data.lebarBawah || 0;
                    const t = data.tinggi || 0;
                    const rata = (la + lb) / 2;
                    const vol = rata * t * p;
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
                            <span><i class="fas fa-chess-queen"></i> ${(item.panjang || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.lebarAtas || 0).toFixed(2)}×${(item.lebarBawah || 0).toFixed(2)} m</span>
                        `
                    };
                }
            },
            pondasi_tiang_pancang: {
                id: 'pondasi_tiang_pancang',
                nama: 'Pondasi Tiang Pancang',
                icon: 'fa-arrows-alt-v',
                kategori: 'Pekerjaan Pondasi',
                rumus: 'Volume = π × r² × T × Jumlah',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Tiang Pancang', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Beton Prategang', 'Beton Bertulang', 'Baja', 'Kayu'], default: 'Beton Prategang' },
                    { id: 'diameter', label: 'Diameter (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tinggi', label: 'Panjang Tiang (m)', type: 'number', step: 0.001, default: 12.00, required: true },
                    { id: 'jumlah', label: 'Jumlah Tiang', type: 'number', step: 1, default: 20, required: true }
                ],
                hitung: function(data) {
                    const d = data.diameter || 0;
                    const t = data.tinggi || 0;
                    const jml = data.jumlah || 1;
                    const r = d / 2;
                    const vol = Math.PI * r * r * t * jml;
                    return {
                        volume: isNaN(vol) || vol < 0 ? 0 : vol,
                        satuan: 'm³',
                        volumePerTiang: Math.PI * r * r * t
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-circle"></i> D${((item.diameter || 0) * 100).toFixed(0)}</span>
                            <span><i class="fas fa-arrows-alt-v"></i> ${(item.tinggi || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                        `
                    };
                }
            },
            pilecap: {
                id: 'pilecap',
                nama: 'Pile Cap',
                icon: 'fa-chess-queen',
                kategori: 'Pekerjaan Pondasi',
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
                    return { volume: isNaN(vol) || vol < 0 ? 0 : vol, satuan: 'm³' };
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
            }
        }
    },

    // ========================================
    // 3. PEKERJAAN STRUKTUR BETON
    // ========================================
    Struktur_Beton: {
        id: 'struktur_beton',
        nama: 'Struktur Beton',
        icon: 'fa-cube',
        warna: '#2563eb',
        deskripsi: 'Pekerjaan struktur beton bertulang',
        items: {
            beton: {
                id: 'beton',
                nama: 'Beton',
                icon: 'fa-cube',
                kategori: 'Struktur Beton',
                rumus: 'Volume = P × L × T × Koefisien × Jumlah',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Kolom Lantai 1', required: true },
                    { id: 'material', label: 'Mutu Beton', type: 'select', options: ['Beton K-175', 'Beton K-200', 'Beton K-225', 'Beton K-250', 'Beton K-300', 'Beton K-350', 'Beton K-400', 'Beton K-450', 'Beton K-500'], default: 'Beton K-300' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'koefisien', label: 'Koefisien', type: 'number', step: 0.001, default: 1.0, hint: 'Faktor pengali' },
                    { id: 'jumlah', label: 'Jumlah', type: 'number', step: 1, default: 1, hint: 'Untuk pekerjaan berulang' }
                ],
                hitung: function(data) {
                    const vol = data.panjang * data.lebar * data.tinggi * data.koefisien * (data.jumlah || 1);
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
                            ${item.jumlah > 1 ? `<span><i class="fas fa-hashtag"></i> ${item.jumlah} bh</span>` : ''}
                        `
                    };
                }
            },
            balok: {
                id: 'balok',
                nama: 'Balok Beton',
                icon: 'fa-grip-lines',
                kategori: 'Struktur Beton',
                rumus: 'Volume = P × L × T × Jumlah | Besi = Tulangan × P × Berat',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Balok B1 30x50', required: true },
                    { id: 'material', label: 'Mutu Beton', type: 'select', options: ['Beton K-250', 'Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-300' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.50, required: true },
                    { id: 'jumlah', label: 'Jumlah Balok', type: 'number', step: 1, default: 4, required: true },
                    { id: 'tulanganAtas', label: 'Tulangan Atas (Jumlah)', type: 'number', step: 1, default: 4 },
                    { id: 'tulanganBawah', label: 'Tulangan Bawah (Jumlah)', type: 'number', step: 1, default: 3 },
                    { id: 'ukuranUtama', label: 'Ukuran Tulangan Utama', type: 'select', options: ['D6', 'D8', 'D10', 'D12', 'D13', 'D16', 'D19', 'D22', 'D25', 'D28', 'D32', 'D36', 'D40'], default: 'D16' },
                    { id: 'ukuranSengkang', label: 'Ukuran Sengkang', type: 'select', options: ['D4', 'D6', 'D8', 'D10', 'D12', 'D13', 'D16'], default: 'D10' },
                    { id: 'jarakSengkang', label: 'Jarak Sengkang (cm)', type: 'number', step: 0.5, default: 15 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tinggi || 0;
                    const jml = data.jumlah || 1;
                    const vol = p * l * t * jml;
                    const beratJenisMap = {
                        'D4': 0.099, 'D6': 0.222, 'D8': 0.395, 'D10': 0.617,
                        'D12': 0.888, 'D13': 1.040, 'D16': 1.580, 'D19': 2.230,
                        'D22': 2.980, 'D25': 3.850, 'D28': 4.830, 'D32': 6.310,
                        'D36': 7.990, 'D40': 9.860
                    };
                    const beratUtama = beratJenisMap[data.ukuranUtama] || 1.58;
                    const beratSengkang = beratJenisMap[data.ukuranSengkang] || 0.617;
                    const tulAtas = data.tulanganAtas || 0;
                    const tulBawah = data.tulanganBawah || 0;
                    const totalTulangan = tulAtas + tulBawah;
                    const beratBesi = p * totalTulangan * beratUtama * jml;
                    const jmlSengkang = Math.floor(p / (data.jarakSengkang / 100)) * jml;
                    const pSengkang = 2 * ((l - 0.08) + (t - 0.08)) + 0.1;
                    const beratSengkangTotal = jmlSengkang * pSengkang * beratSengkang;
                    const totalBesi = beratBesi + beratSengkangTotal;
                    return {
                        volume: isNaN(vol) || vol < 0 ? 0 : vol,
                        satuan: 'm³',
                        totalBesi,
                        beratBesi,
                        beratSengkang: beratSengkangTotal,
                        ukuranUtama: data.ukuranUtama,
                        ukuranSengkang: data.ukuranSengkang
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-grip-lines"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                            <span><i class="fas fa-weight-hanging"></i> Utama ${item.ukuranUtama || 'D16'}: ${(item.beratBesi || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-vector-square"></i> Sengkang ${item.ukuranSengkang || 'D10'}: ${(item.beratSengkang || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-weight-hanging"></i> Total: ${(item.totalBesi || 0).toFixed(2)} kg</span>
                        `
                    };
                }
            },
            sloof: {
                id: 'sloof',
                nama: 'Sloof',
                icon: 'fa-grip-lines-vertical',
                kategori: 'Struktur Beton',
                rumus: 'Volume = P × L × T | Besi = Tulangan × P × Berat',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Sloof 20x30', required: true },
                    { id: 'material', label: 'Mutu Beton', type: 'select', options: ['Beton K-250', 'Beton K-300', 'Beton K-350'], default: 'Beton K-300' },
                    { id: 'panjang', label: 'Panjang Total (m)', type: 'number', step: 0.001, default: 45.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.20, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tulanganAtas', label: 'Tulangan Atas (Jumlah)', type: 'number', step: 1, default: 3 },
                    { id: 'tulanganBawah', label: 'Tulangan Bawah (Jumlah)', type: 'number', step: 1, default: 3 },
                    { id: 'ukuranUtama', label: 'Ukuran Tulangan Utama', type: 'select', options: ['D6', 'D8', 'D10', 'D12', 'D13', 'D16', 'D19', 'D22', 'D25'], default: 'D16' },
                    { id: 'ukuranSengkang', label: 'Ukuran Sengkang', type: 'select', options: ['D4', 'D6', 'D8', 'D10', 'D12', 'D13'], default: 'D10' },
                    { id: 'jarakSengkang', label: 'Jarak Sengkang (cm)', type: 'number', step: 0.5, default: 15 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tinggi || 0;
                    const vol = p * l * t;
                    const beratJenisMap = {
                        'D4': 0.099, 'D6': 0.222, 'D8': 0.395, 'D10': 0.617,
                        'D12': 0.888, 'D13': 1.040, 'D16': 1.580, 'D19': 2.230,
                        'D22': 2.980, 'D25': 3.850
                    };
                    const beratUtama = beratJenisMap[data.ukuranUtama] || 1.58;
                    const beratSengkang = beratJenisMap[data.ukuranSengkang] || 0.617;
                    const tulAtas = data.tulanganAtas || 0;
                    const tulBawah = data.tulanganBawah || 0;
                    const totalTulangan = tulAtas + tulBawah;
                    const beratBesi = p * totalTulangan * beratUtama;
                    const jmlSengkang = Math.floor(p / (data.jarakSengkang / 100));
                    const pSengkang = 2 * ((l - 0.08) + (t - 0.08)) + 0.1;
                    const beratSengkangTotal = jmlSengkang * pSengkang * beratSengkang;
                    const totalBesi = beratBesi + beratSengkangTotal;
                    return {
                        volume: isNaN(vol) || vol < 0 ? 0 : vol,
                        satuan: 'm³',
                        totalBesi,
                        beratBesi,
                        beratSengkang: beratSengkangTotal,
                        ukuranUtama: data.ukuranUtama,
                        ukuranSengkang: data.ukuranSengkang
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-grip-lines-vertical"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-weight-hanging"></i> Utama ${item.ukuranUtama || 'D16'}: ${(item.beratBesi || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-vector-square"></i> Sengkang ${item.ukuranSengkang || 'D10'}: ${(item.beratSengkang || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-weight-hanging"></i> Total: ${(item.totalBesi || 0).toFixed(2)} kg</span>
                        `
                    };
                }
            },
            kolom: {
                id: 'kolom',
                nama: 'Kolom',
                icon: 'fa-arrow-up',
                kategori: 'Struktur Beton',
                rumus: 'Volume = P × L × T × Jumlah | Besi = Tulangan × P × Berat',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Kolom K1 30x30', required: true },
                    { id: 'material', label: 'Mutu Beton', type: 'select', options: ['Beton K-250', 'Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-300' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'jumlah', label: 'Jumlah Kolom', type: 'number', step: 1, default: 8, required: true },
                    { id: 'tulanganUtama', label: 'Jumlah Tulangan Utama', type: 'number', step: 1, default: 8 },
                    { id: 'ukuranUtama', label: 'Ukuran Tulangan Utama', type: 'select', options: ['D6', 'D8', 'D10', 'D12', 'D13', 'D16', 'D19', 'D22', 'D25', 'D28', 'D32', 'D36', 'D40'], default: 'D16' },
                    { id: 'ukuranSengkang', label: 'Ukuran Sengkang', type: 'select', options: ['D4', 'D6', 'D8', 'D10', 'D12', 'D13', 'D16'], default: 'D10' },
                    { id: 'jarakSengkang', label: 'Jarak Sengkang (cm)', type: 'number', step: 0.5, default: 15 },
                    { id: 'selimut', label: 'Selimut Beton (cm)', type: 'number', step: 0.5, default: 4 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tinggi || 0;
                    const jml = data.jumlah || 1;
                    const vol = p * l * t * jml;
                    const beratJenisMap = {
                        'D4': 0.099, 'D6': 0.222, 'D8': 0.395, 'D10': 0.617,
                        'D12': 0.888, 'D13': 1.040, 'D16': 1.580, 'D19': 2.230,
                        'D22': 2.980, 'D25': 3.850, 'D28': 4.830, 'D32': 6.310,
                        'D36': 7.990, 'D40': 9.860
                    };
                    const beratUtama = beratJenisMap[data.ukuranUtama] || 1.58;
                    const beratSengkang = beratJenisMap[data.ukuranSengkang] || 0.617;
                    const jmlTulangan = data.tulanganUtama || 0;
                    const beratBesi = t * jmlTulangan * beratUtama * jml;
                    const selimutM = (data.selimut || 4) / 100;
                    const lebarS = l - 2 * selimutM;
                    const tinggiS = p - 2 * selimutM;
                    const pSengkang = 2 * (lebarS + tinggiS) + 0.1;
                    const jmlSengkang = Math.floor(t / (data.jarakSengkang / 100)) * jml;
                    const beratSengkangTotal = jmlSengkang * pSengkang * beratSengkang;
                    const totalBesi = beratBesi + beratSengkangTotal;
                    return {
                        volume: isNaN(vol) || vol < 0 ? 0 : vol,
                        satuan: 'm³',
                        totalBesi,
                        beratBesi,
                        beratSengkang: beratSengkangTotal,
                        ukuranUtama: data.ukuranUtama,
                        ukuranSengkang: data.ukuranSengkang
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrow-up"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                            <span><i class="fas fa-weight-hanging"></i> Utama ${item.ukuranUtama || 'D16'}: ${(item.beratBesi || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-vector-square"></i> Sengkang ${item.ukuranSengkang || 'D10'}: ${(item.beratSengkang || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-weight-hanging"></i> Total: ${(item.totalBesi || 0).toFixed(2)} kg</span>
                        `
                    };
                }
            },
            kolom_bulat: {
                id: 'kolom_bulat',
                nama: 'Kolom Bulat + Spiral',
                icon: 'fa-circle',
                kategori: 'Struktur Beton',
                rumus: 'Volume = π × r² × T | Besi = Utama + Spiral',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Kolom Bulat D400', required: true },
                    { id: 'material', label: 'Mutu Beton', type: 'select', options: ['Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-350' },
                    { id: 'diameter', label: 'Diameter (m)', type: 'number', step: 0.001, default: 0.40, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'selimut', label: 'Selimut Beton (cm)', type: 'number', step: 0.5, default: 4 },
                    { id: 'jumlah', label: 'Jumlah Kolom', type: 'number', step: 1, default: 4 },
                    { id: 'jmlTulangan', label: 'Jumlah Tulangan Utama', type: 'number', step: 1, default: 10 },
                    { id: 'ukuranUtama', label: 'Ukuran Tulangan Utama', type: 'select', options: ['D6', 'D8', 'D10', 'D12', 'D13', 'D16', 'D19', 'D22', 'D25', 'D28', 'D32'], default: 'D16' },
                    { id: 'ukuranSpiral', label: 'Ukuran Spiral', type: 'select', options: ['D4', 'D6', 'D8', 'D10', 'D12', 'D13'], default: 'D10' },
                    { id: 'jarakSpiral', label: 'Jarak Spiral (cm)', type: 'number', step: 0.5, default: 10 }
                ],
                hitung: function(data) {
                    const d = data.diameter || 0;
                    const t = data.tinggi || 0;
                    const jml = data.jumlah || 1;
                    const r = d / 2;
                    const volBeton = Math.PI * r * r * t * jml;
                    const beratJenisMap = {
                        'D4': 0.099, 'D6': 0.222, 'D8': 0.395, 'D10': 0.617,
                        'D12': 0.888, 'D13': 1.040, 'D16': 1.580, 'D19': 2.230,
                        'D22': 2.980, 'D25': 3.850, 'D28': 4.830, 'D32': 6.310
                    };
                    const beratUtama = beratJenisMap[data.ukuranUtama] || 1.58;
                    const beratSpiral = beratJenisMap[data.ukuranSpiral] || 0.617;
                    const jmlTul = data.jmlTulangan || 0;
                    const beratTulangan = t * jmlTul * beratUtama * jml;
                    const selimutM = (data.selimut || 4) / 100;
                    const dSpiral = d - 2 * selimutM;
                    const keliling = Math.PI * dSpiral;
                    const jmlLilitan = Math.floor(t / (data.jarakSpiral / 100)) + 1;
                    const pSpiral = keliling * jmlLilitan * jml;
                    const beratSpiralTotal = pSpiral * beratSpiral;
                    const totalBesi = beratTulangan + beratSpiralTotal;
                    return {
                        volume: isNaN(volBeton) || volBeton < 0 ? 0 : volBeton,
                        satuan: 'm³',
                        totalBesi,
                        beratTulangan,
                        beratSpiral: beratSpiralTotal,
                        jmlLilitan,
                        ukuranUtama: data.ukuranUtama,
                        ukuranSpiral: data.ukuranSpiral
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-circle"></i> D${((item.diameter || 0) * 100).toFixed(0)}</span>
                            <span><i class="fas fa-weight-hanging"></i> Utama ${item.ukuranUtama || 'D16'}: ${(item.beratTulangan || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-spiral"></i> Spiral ${item.ukuranSpiral || 'D10'}: ${(item.beratSpiral || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-weight-hanging"></i> Total: ${(item.totalBesi || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                        `
                    };
                }
            },
            dinding_core_lift: {
                id: 'dinding_core_lift',
                nama: 'Dinding Core Lift',
                icon: 'fa-elevator',
                kategori: 'Struktur Beton',
                rumus: 'Volume = P × T × Tebal × Lantai',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Core Lift LT1', required: true },
                    { id: 'material', label: 'Mutu Beton', type: 'select', options: ['Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-350' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'tebal', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.25, required: true },
                    { id: 'jmlLantai', label: 'Jumlah Lantai', type: 'number', step: 1, default: 1, required: true }
                ],
                hitung: function(data) {
                    const vol = (data.panjang || 0) * (data.tinggi || 0) * (data.tebal || 0) * (data.jmlLantai || 1);
                    return { volume: isNaN(vol) || vol < 0 ? 0 : vol, satuan: 'm³' };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-elevator"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}×${(item.tebal || 0).toFixed(2)}</span>
                            <span><i class="fas fa-layer-group"></i> ${item.jmlLantai || 1} Lantai</span>
                        `
                    };
                }
            },
            shear_wall: {
                id: 'shear_wall',
                nama: 'Shear Wall',
                icon: 'fa-layer-group',
                kategori: 'Struktur Beton',
                rumus: 'Volume = P × T × Tebal × Lantai',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Shear Wall SW1', required: true },
                    { id: 'material', label: 'Mutu Beton', type: 'select', options: ['Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-350' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 12.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'tebal', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'jmlLantai', label: 'Jumlah Lantai', type: 'number', step: 1, default: 1, required: true }
                ],
                hitung: function(data) {
                    const vol = (data.panjang || 0) * (data.tinggi || 0) * (data.tebal || 0) * (data.jmlLantai || 1);
                    return { volume: isNaN(vol) || vol < 0 ? 0 : vol, satuan: 'm³' };
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
            lantai_kerja: {
                id: 'lantai_kerja',
                nama: 'Lantai Kerja',
                icon: 'fa-layer-group',
                kategori: 'Struktur Beton',
                rumus: 'Volume = (P × L - Lubang) × T',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Lantai Kerja Beton', required: true },
                    { id: 'material', label: 'Mutu Beton', type: 'select', options: ['Beton K-175', 'Beton K-200', 'Beton K-225', 'Beton K-250'], default: 'Beton K-200' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 10.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tebal', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.05, required: true, hint: 'Minimal 5cm' },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0, hint: 'Untuk lubang elevator, pipa, dll' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tebal || 0;
                    const luasLubang = data.luasLubang || 0;
                    const luas = p * l - luasLubang;
                    const volume = luas * t;
                    return {
                        volume: isNaN(volume) || volume < 0 ? 0 : volume,
                        satuan: 'm³',
                        luas: luas
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tebal || 0).toFixed(3)} m</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luas || 0).toFixed(2)} m²</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 4. PEKERJAAN DINDING
    // ========================================
    Pekerjaan_Dinding: {
        id: 'pekerjaan_dinding',
        nama: 'Pekerjaan Dinding',
        icon: 'fa-layer-group',
        warna: '#d97706',
        deskripsi: 'Pekerjaan dinding bangunan',
        items: {
            pasang_bata: {
                id: 'pasang_bata',
                nama: 'Pasang Bata',
                icon: 'fa-cubes',
                kategori: 'Pekerjaan Dinding',
                rumus: 'Volume = (P × T - Lubang) × Tebal | Jumlah Bata = Volume × 70',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pasang Bata Dinding', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Bata Merah', 'Bata Ringan 7.5cm', 'Bata Ringan 10cm', 'Batako', 'Bata Expose', 'Bata Klinker'], default: 'Bata Ringan 10cm' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'tebal', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.10, required: true },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0, hint: 'Pintu, jendela, dll' },
                    { id: 'jenisIkatan', label: 'Jenis Ikatan', type: 'select', options: ['Ikatan Biasa', 'Ikatan Inggris', 'Ikatan Belanda'], default: 'Ikatan Biasa' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const t = data.tinggi || 0;
                    const tebal = data.tebal || 0.10;
                    const luas = p * t;
                    const luasBersih = luas - (data.luasLubang || 0);
                    const vol = luasBersih * tebal;
                    const jmlBata = vol * 70;
                    return {
                        volume: isNaN(vol) || vol < 0 ? 0 : vol,
                        satuan: 'm³',
                        luasBersih,
                        jmlBata,
                        luasTotal: luas
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-cubes"></i> Bata: ${Math.round(item.jmlBata || 0)} bh</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luasBersih || 0).toFixed(2)} m²</span>
                            <span><i class="fas fa-border-all"></i> ${item.jenisIkatan || 'Ikatan Biasa'}</span>
                        `
                    };
                }
            },
            plesteran: {
                id: 'plesteran',
                nama: 'Plesteran',
                icon: 'fa-trowel',
                kategori: 'Pekerjaan Dinding',
                rumus: 'Luas = (P × T - Lubang) × Sisi',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Plesteran Dinding', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Mortar 1:3', 'Mortar 1:4', 'Mortar 1:5', 'Mortar Instan', 'Mortar Plester Kering'], default: 'Mortar 1:4' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'tebalPlester', label: 'Tebal Plester (cm)', type: 'number', step: 0.1, default: 2.0, required: true },
                    { id: 'jumlahSisi', label: 'Jumlah Sisi', type: 'select', options: ['1 Sisi', '2 Sisi'], default: '2 Sisi' },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0 },
                    { id: 'kualitas', label: 'Kualitas Plester', type: 'select', options: ['Kasar', 'Sedang', 'Halus'], default: 'Sedang' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const t = data.tinggi || 0;
                    const sisi = data.jumlahSisi === '2 Sisi' ? 2 : 1;
                    const luas = (p * t - (data.luasLubang || 0)) * sisi;
                    const volMortar = luas * (data.tebalPlester / 100);
                    return {
                        volume: isNaN(volMortar) || volMortar < 0 ? 0 : volMortar,
                        satuan: 'm³',
                        luas,
                        kebutuhanMortar: luas * 0.02
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-border-all"></i> ${item.jumlahSisi || '2 Sisi'}</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luas || 0).toFixed(2)} m²</span>
                            <span><i class="fas fa-trowel"></i> ${item.kualitas || 'Sedang'}</span>
                        `
                    };
                }
            },
            acian: {
                id: 'acian',
                nama: 'Acian',
                icon: 'fa-paint-roller',
                kategori: 'Pekerjaan Dinding',
                rumus: 'Luas = (P × T - Lubang) × Sisi',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Acian Dinding', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Acian Semen', 'Acian Putih', 'Acian Warna', 'Acian Halus', 'Acian Cat'], default: 'Acian Semen' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'jumlahSisi', label: 'Jumlah Sisi', type: 'select', options: ['1 Sisi', '2 Sisi'], default: '2 Sisi' },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0 },
                    { id: 'kualitas', label: 'Kualitas Acian', type: 'select', options: ['Standar', 'Halus', 'Premium'], default: 'Standar' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const t = data.tinggi || 0;
                    const sisi = data.jumlahSisi === '2 Sisi' ? 2 : 1;
                    const luas = (p * t - (data.luasLubang || 0)) * sisi;
                    return {
                        volume: isNaN(luas) || luas < 0 ? 0 : luas,
                        satuan: 'm²'
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-border-all"></i> ${item.jumlahSisi || '2 Sisi'}</span>
                            <span><i class="fas fa-paint-roller"></i> ${item.kualitas || 'Standar'}</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 5. PEKERJAAN LANTAI
    // ========================================
    Pekerjaan_Lantai: {
        id: 'pekerjaan_lantai',
        nama: 'Pekerjaan Lantai',
        icon: 'fa-th-large',
        warna: '#0891b2',
        deskripsi: 'Pekerjaan lantai bangunan',
        items: {
            lantai_keramik: {
                id: 'lantai_keramik',
                nama: 'Lantai Keramik',
                icon: 'fa-th-large',
                kategori: 'Pekerjaan Lantai',
                rumus: 'Luas = P × L - Lubang',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pasang Keramik Lantai', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Keramik 30x30', 'Keramik 40x40', 'Keramik 60x60', 'Granit 60x60', 'Marmer', 'Parket', 'Vinyl'], default: 'Keramik 40x40' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 4.00, required: true },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0 },
                    { id: 'pola', label: 'Pola Pemasangan', type: 'select', options: ['Lurus', 'Diagonal', 'Herringbone', 'Basket Weave'], default: 'Lurus' }
                ],
                hitung: function(data) {
                    const luas = (data.panjang || 0) * (data.lebar || 0) - (data.luasLubang || 0);
                    const jmlKeramik = luas * 1.05;
                    return {
                        volume: isNaN(luas) || luas < 0 ? 0 : luas,
                        satuan: 'm²',
                        jmlKeramik
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-th-large"></i> ${Math.round(item.jmlKeramik || 0)} bh</span>
                            <span><i class="fas fa-border-all"></i> ${item.pola || 'Lurus'}</span>
                        `
                    };
                }
            },
            lantai_beton: {
                id: 'lantai_beton',
                nama: 'Lantai Beton',
                icon: 'fa-cube',
                kategori: 'Pekerjaan Lantai',
                rumus: 'Volume = (P × L - Lubang) × T | Besi = (P/jarak × L + L/jarak × P) × Berat × Lapis',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Lantai Beton LT1', required: true },
                    { id: 'material', label: 'Mutu Beton', type: 'select', options: ['Beton K-200', 'Beton K-225', 'Beton K-250', 'Beton K-300', 'Beton K-350'], default: 'Beton K-225' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 10.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tebal', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.12, required: true, hint: 'Minimal 10cm untuk lantai kendaraan' },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0, hint: 'Untuk kolom, pipa, dll' },
                    { id: 'jenisTulangan', label: 'Jenis Tulangan', type: 'select', options: ['Wiremesh', 'Besi Polos', 'Besi Ulir'], default: 'Wiremesh' },
                    { id: 'ukuranBesi', label: 'Ukuran Besi/Wiremesh', type: 'select', options: ['M6/D6', 'M8/D8', 'M10/D10', 'M12/D12', 'M13/D13', 'M14/D14', 'M16/D16', 'M18/D18', 'M19/D19', 'M20/D20', 'M22/D22', 'M25/D25'], default: 'M8/D8' },
                    { id: 'jarakX', label: 'Jarak Tulangan Arah X (cm)', type: 'number', step: 0.5, default: 15, required: true },
                    { id: 'lapisX', label: 'Jumlah Lapis Arah X', type: 'select', options: ['1 Lapis', '2 Lapis', '3 Lapis'], default: '1 Lapis' },
                    { id: 'jarakY', label: 'Jarak Tulangan Arah Y (cm)', type: 'number', step: 0.5, default: 15, required: true },
                    { id: 'lapisY', label: 'Jumlah Lapis Arah Y', type: 'select', options: ['1 Lapis', '2 Lapis', '3 Lapis'], default: '1 Lapis' },
                    { id: 'selimut', label: 'Selimut Beton (cm)', type: 'number', step: 0.5, default: 3, hint: 'Minimal 3cm untuk lantai' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tebal || 0;
                    const luasLubang = data.luasLubang || 0;
                    const luas = p * l - luasLubang;
                    const volumeBeton = luas * t;
                    const beratJenisMap = {
                        'M6/D6': 0.222, 'M8/D8': 0.395, 'M10/D10': 0.617,
                        'M12/D12': 0.888, 'M13/D13': 1.040, 'M14/D14': 1.210,
                        'M16/D16': 1.580, 'M18/D18': 1.999, 'M19/D19': 2.230,
                        'M20/D20': 2.470, 'M22/D22': 2.980, 'M25/D25': 3.850
                    };
                    const beratJenis = beratJenisMap[data.ukuranBesi] || 0.617;
                    const jarakXM = (data.jarakX || 15) / 100;
                    const jarakYM = (data.jarakY || 15) / 100;
                    const lapisX = parseInt(data.lapisX) || 1;
                    const lapisY = parseInt(data.lapisY) || 1;
                    const jmlX = Math.floor(l / jarakXM) + 1;
                    const jmlY = Math.floor(p / jarakYM) + 1;
                    const panjangX = jmlX * p * lapisX;
                    const panjangY = jmlY * l * lapisY;
                    const totalPanjang = panjangX + panjangY;
                    const beratBesi = totalPanjang * beratJenis;
                    const kebutuhanBeton = volumeBeton * 1.05;
                    return {
                        volume: volumeBeton,
                        satuan: 'm³',
                        luas: luas,
                        kebutuhanBeton: kebutuhanBeton,
                        beratBesi: beratBesi,
                        jmlX: jmlX,
                        jmlY: jmlY,
                        panjangX: panjangX,
                        panjangY: panjangY,
                        totalPanjang: totalPanjang,
                        ukuranBesi: data.ukuranBesi,
                        jarakX: data.jarakX,
                        jarakY: data.jarakY,
                        lapisX: lapisX,
                        lapisY: lapisY,
                        beratJenis: beratJenis,
                        jenisTulangan: data.jenisTulangan
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tebal || 0).toFixed(3)} m</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luas || 0).toFixed(2)} m²</span>
                            <span><i class="fas fa-tag"></i> ${item.jenisTulangan || 'Wiremesh'}</span>
                            <span><i class="fas fa-weight-hanging"></i> ${item.ukuranBesi || 'M8/D8'}: ${(item.beratBesi || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-arrow-right"></i> X: ${item.jarakX || 15}cm (${item.lapisX || 1} lapis)</span>
                            <span><i class="fas fa-arrow-left"></i> Y: ${item.jarakY || 15}cm (${item.lapisY || 1} lapis)</span>
                            <span><i class="fas fa-cube"></i> Beton: ${(item.volume || 0).toFixed(3)} m³</span>
                        `
                    };
                }
            },
            plafon: {
                id: 'plafon',
                nama: 'Plafon',
                icon: 'fa-chevron-up',
                kategori: 'Pekerjaan Lantai',
                rumus: 'Luas = P × L',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pasang Plafon', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Gypsum', 'GRC Board', 'Multiplek', 'PVC', 'Aluminium', 'Kayu', 'Fiberglass'], default: 'Gypsum' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 4.00, required: true },
                    { id: 'jenisRangka', label: 'Jenis Rangka', type: 'select', options: ['Kayu', 'Metal Stud', 'Hollow', 'Galvanis'], default: 'Metal Stud' },
                    { id: 'desain', label: 'Desain Plafon', type: 'select', options: ['Datar', 'Drop Ceiling', 'Coffered', 'Akustik'], default: 'Datar' }
                ],
                hitung: function(data) {
                    const luas = (data.panjang || 0) * (data.lebar || 0);
                    return {
                        volume: isNaN(luas) || luas < 0 ? 0 : luas,
                        satuan: 'm²',
                        kebutuhanMaterial: luas * 1.05
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-chevron-up"></i> ${item.material || 'Gypsum'}</span>
                            <span><i class="fas fa-border-all"></i> ${item.desain || 'Datar'}</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 6. PEKERJAAN ATAP
    // ========================================
    Pekerjaan_Atap: {
        id: 'pekerjaan_atap',
        nama: 'Pekerjaan Atap',
        icon: 'fa-home',
        warna: '#8b5cf6',
        deskripsi: 'Pekerjaan atap dan penutup',
        items: {
            atap_genteng: {
                id: 'atap_genteng',
                nama: 'Atap Genteng',
                icon: 'fa-roof',
                kategori: 'Pekerjaan Atap',
                rumus: 'Luas = (P × L) / Cos α',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Atap Genteng', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Genteng Tanah', 'Genteng Beton', 'Genteng Metal', 'Genteng Keramik', 'Genteng Kaca', 'Genteng Sokka'], default: 'Genteng Tanah' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 12.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'sudut', label: 'Sudut Kemiringan (°)', type: 'number', step: 1, default: 30, required: true },
                    { id: 'jenisRangka', label: 'Jenis Rangka', type: 'select', options: ['Kayu', 'Baja Ringan', 'Besi', 'Beton'], default: 'Baja Ringan' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const sudut = data.sudut || 30;
                    const rad = sudut * Math.PI / 180;
                    const luas = (p * l) / Math.cos(rad);
                    return {
                        volume: isNaN(luas) || luas < 0 ? 0 : luas,
                        satuan: 'm²',
                        kebutuhanGenteng: luas * 1.1
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-angle-up"></i> ${item.sudut || 30}°</span>
                            <span><i class="fas fa-roof"></i> ${item.material || 'Genteng Tanah'}</span>
                            <span><i class="fas fa-tools"></i> ${item.jenisRangka || 'Baja Ringan'}</span>
                        `
                    };
                }
            },
            atap_baja_ringan: {
                id: 'atap_baja_ringan',
                nama: 'Atap Baja Ringan',
                icon: 'fa-tools',
                kategori: 'Pekerjaan Atap',
                rumus: 'Luas = (P × L) / Cos α',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Atap Baja Ringan', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Metal Sheet', 'Spandek', 'Bondek', 'Zincalume', 'Colorbond'], default: 'Spandek' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 15.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 10.00, required: true },
                    { id: 'sudut', label: 'Sudut Kemiringan (°)', type: 'number', step: 1, default: 15, required: true },
                    { id: 'tebal', label: 'Tebal Material (mm)', type: 'number', step: 0.1, default: 0.75 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const sudut = data.sudut || 15;
                    const rad = sudut * Math.PI / 180;
                    const luas = (p * l) / Math.cos(rad);
                    return {
                        volume: isNaN(luas) || luas < 0 ? 0 : luas,
                        satuan: 'm²',
                        kebutuhanMaterial: luas * 1.05
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-angle-up"></i> ${item.sudut || 15}°</span>
                            <span><i class="fas fa-tools"></i> ${item.material || 'Spandek'}</span>
                            <span><i class="fas fa-arrows-alt-v"></i> ${(item.tebal || 0.75).toFixed(2)} mm</span>
                        `
                    };
                }
            },
            rangka_atap_kayu: {
                id: 'rangka_atap_kayu',
                nama: 'Rangka Atap Kayu',
                icon: 'fa-tree',
                kategori: 'Pekerjaan Atap',
                rumus: 'Volume = Jumlah × Panjang × Luas Penampang',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Rangka Atap Kayu', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Kayu Jati', 'Kayu Meranti', 'Kayu Kamper', 'Kayu Borneo', 'Kayu Glulam'], default: 'Kayu Kamper' },
                    { id: 'panjang', label: 'Panjang Total (m)', type: 'number', step: 0.001, default: 50.00, required: true },
                    { id: 'lebar', label: 'Lebar Kayu (cm)', type: 'number', step: 0.1, default: 8, required: true },
                    { id: 'tinggi', label: 'Tinggi Kayu (cm)', type: 'number', step: 0.1, default: 12, required: true },
                    { id: 'jumlah', label: 'Jumlah Balok', type: 'number', step: 1, default: 20, required: true }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = (data.lebar || 0) / 100;
                    const t = (data.tinggi || 0) / 100;
                    const jml = data.jumlah || 1;
                    const vol = p * l * t * jml;
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
                            <span><i class="fas fa-tree"></i> ${item.material || 'Kayu Kamper'}</span>
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.lebar || 0).toFixed(1)}×${(item.tinggi || 0).toFixed(1)} cm</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 7. PEKERJAAN BESI & PENULANGAN
    // ========================================
    Pekerjaan_Besi: {
        id: 'pekerjaan_besi',
        nama: 'Pekerjaan Besi',
        icon: 'fa-vector-square',
        warna: '#dc2626',
        deskripsi: 'Pekerjaan besi dan penulangan',
        items: {
            pembesian: {
                id: 'pembesian',
                nama: 'Pembesian',
                icon: 'fa-vector-square',
                kategori: 'Pekerjaan Besi',
                rumus: 'Besi Utama = P × Jml × Berat | Sengkang = Jml × Panjang × Berat',
                satuan: 'kg',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Tulangan Kolom K1', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Besi Beton', 'Besi Baja', 'Besi Ulir', 'Besi Polos'], default: 'Besi Beton' },
                    { id: 'ukuranUtama', label: 'Ukuran Tulangan Utama', type: 'select', options: ['D6', 'D8', 'D10', 'D12', 'D13', 'D16', 'D19', 'D22', 'D25', 'D28', 'D32', 'D36', 'D40'], default: 'D16' },
                    { id: 'jmlUtama', label: 'Jumlah Tulangan Utama', type: 'number', step: 1, default: 8, required: true },
                    { id: 'panjangUtama', label: 'Panjang Tulangan (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'ukuranSengkang', label: 'Ukuran Sengkang', type: 'select', options: ['D4', 'D6', 'D8', 'D10', 'D12', 'D13', 'D16'], default: 'D10' },
                    { id: 'lebarKolom', label: 'Lebar Kolom (m)', type: 'number', step: 0.001, default: 0.30 },
                    { id: 'tinggiKolom', label: 'Tinggi Kolom (m)', type: 'number', step: 0.001, default: 0.30 },
                    { id: 'jarakSengkang', label: 'Jarak Sengkang (cm)', type: 'number', step: 0.5, default: 15 },
                    { id: 'selimut', label: 'Selimut Beton (cm)', type: 'number', step: 0.5, default: 4 },
                    { id: 'kait', label: 'Panjang Kait (m)', type: 'number', step: 0.001, default: 0.10 }
                ],
                hitung: function(data) {
                    const beratJenisMap = {
                        'D4': 0.099, 'D6': 0.222, 'D8': 0.395, 'D10': 0.617,
                        'D12': 0.888, 'D13': 1.040, 'D16': 1.580, 'D19': 2.230,
                        'D22': 2.980, 'D25': 3.850, 'D28': 4.830, 'D32': 6.310,
                        'D36': 7.990, 'D40': 9.860
                    };
                    const beratUtama = beratJenisMap[data.ukuranUtama] || 1.58;
                    const beratSengkang = beratJenisMap[data.ukuranSengkang] || 0.617;
                    const panjang = data.panjangUtama || 0;
                    const jml = data.jmlUtama || 0;
                    const l = data.lebarKolom || 0;
                    const t = data.tinggiKolom || 0;
                    const jarak = data.jarakSengkang || 15;
                    const selimut = data.selimut || 4;
                    const kait = data.kait || 0.10;
                    const beratTulangan = panjang * jml * beratUtama;
                    const selimutM = selimut / 100;
                    const ls = l - 2 * selimutM;
                    const ts = t - 2 * selimutM;
                    const pSengkang = 2 * (ls + ts) + 2 * kait;
                    const jmlSengkang = Math.floor(panjang / (jarak / 100)) + 1;
                    const beratSengkangTotal = jmlSengkang * pSengkang * beratSengkang;
                    const total = beratTulangan + beratSengkangTotal;
                    return {
                        volume: isNaN(total) || total < 0 ? 0 : total,
                        satuan: 'kg',
                        beratTulangan,
                        beratSengkang: beratSengkangTotal,
                        jmlSengkang,
                        ukuranUtama: data.ukuranUtama,
                        ukuranSengkang: data.ukuranSengkang,
                        beratUtama: beratUtama,
                        beratSengkang: beratSengkang
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'kg',
                        detail: `
                            <span><i class="fas fa-arrow-up"></i> Utama ${item.ukuranUtama || 'D16'} (${(item.beratUtama || 1.58).toFixed(3)} kg/m): ${(item.beratTulangan || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-vector-square"></i> Sengkang ${item.ukuranSengkang || 'D10'} (${(item.beratSengkang || 0.617).toFixed(3)} kg/m): ${(item.beratSengkang || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jmlSengkang || 0} bh</span>
                            <span><i class="fas fa-weight-hanging"></i> Total: ${(item.volume || 0).toFixed(2)} kg</span>
                        `
                    };
                }
            },
            wiremesh: {
                id: 'wiremesh',
                nama: 'Wiremesh',
                icon: 'fa-border-all',
                kategori: 'Pekerjaan Besi',
                rumus: 'Luas = P × L | Jumlah = Luas / Luas Per Lembar',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Wiremesh Lantai', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Wiremesh M6', 'Wiremesh M8', 'Wiremesh M10', 'Wiremesh M12', 'Wiremesh M14'], default: 'Wiremesh M8' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 10.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'luasLembar', label: 'Luas Per Lembar (m²)', type: 'number', step: 0.001, default: 2.88, hint: '2.88 = 1.2m × 2.4m' }
                ],
                hitung: function(data) {
                    const luas = (data.panjang || 0) * (data.lebar || 0);
                    const luasLembar = data.luasLembar || 2.88;
                    const jmlLembar = Math.ceil(luas / luasLembar);
                    return {
                        volume: isNaN(luas) || luas < 0 ? 0 : luas,
                        satuan: 'm²',
                        jmlLembar,
                        kebutuhanTambah: luas * 1.05
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-border-all"></i> ${item.material || 'Wiremesh M8'}</span>
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jmlLembar || 0} lembar</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 8. PEKERJAAN BEKISTING
    // ========================================
    Pekerjaan_Bekisting: {
        id: 'pekerjaan_bekisting',
        nama: 'Pekerjaan Bekisting',
        icon: 'fa-border-all',
        warna: '#0891b2',
        deskripsi: 'Pekerjaan bekisting beton',
        items: {
            bekisting_kolom: {
                id: 'bekisting_kolom',
                nama: 'Bekisting Kolom',
                icon: 'fa-border-all',
                kategori: 'Pekerjaan Bekisting',
                rumus: 'Luas = (P×T + L×T) × 2 × Jumlah',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Bekisting Kolom K1', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Kayu Meranti', 'Kayu Kamper', 'Kayu Jati', 'Multiplek 12mm', 'Multiplek 15mm', 'Multiplek 18mm', 'Sistem Bekisting'], default: 'Multiplek 15mm' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'jumlah', label: 'Jumlah Kolom', type: 'number', step: 1, default: 8, required: true }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tinggi || 0;
                    const jml = data.jumlah || 1;
                    const luas = (p * t + l * t) * 2 * jml;
                    return {
                        volume: isNaN(luas) || luas < 0 ? 0 : luas,
                        satuan: 'm²'
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-border-all"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                            <span><i class="fas fa-cube"></i> ${item.material || 'Multiplek 15mm'}</span>
                        `
                    };
                }
            },
            bekisting_balok: {
                id: 'bekisting_balok',
                nama: 'Bekisting Balok',
                icon: 'fa-grip-lines',
                kategori: 'Pekerjaan Bekisting',
                rumus: 'Luas = (2×T + L) × P × Jumlah',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Bekisting Balok B1', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Kayu Meranti', 'Kayu Kamper', 'Multiplek 12mm', 'Multiplek 15mm', 'Multiplek 18mm'], default: 'Multiplek 15mm' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.50, required: true },
                    { id: 'jumlah', label: 'Jumlah Balok', type: 'number', step: 1, default: 4, required: true }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tinggi || 0;
                    const jml = data.jumlah || 1;
                    const luas = (2 * t + l) * p * jml;
                    return {
                        volume: isNaN(luas) || luas < 0 ? 0 : luas,
                        satuan: 'm²'
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-grip-lines"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                        `
                    };
                }
            },
            bekisting_pelat: {
                id: 'bekisting_pelat',
                nama: 'Bekisting Pelat',
                icon: 'fa-table',
                kategori: 'Pekerjaan Bekisting',
                rumus: 'Luas = P × L × Jumlah Lantai',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Bekisting Pelat Lantai', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Multiplek 12mm', 'Multiplek 15mm', 'Multiplek 18mm', 'Sistem Bekisting'], default: 'Multiplek 15mm' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'jumlah', label: 'Jumlah Lantai', type: 'number', step: 1, default: 1, required: true }
                ],
                hitung: function(data) {
                    const luas = (data.panjang || 0) * (data.lebar || 0) * (data.jumlah || 1);
                    return {
                        volume: isNaN(luas) || luas < 0 ? 0 : luas,
                        satuan: 'm²'
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-table"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-layer-group"></i> ${item.jumlah || 1} Lantai</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 9. PEKERJAAN FINISHING
    // ========================================
    Pekerjaan_Finishing: {
        id: 'pekerjaan_finishing',
        nama: 'Pekerjaan Finishing',
        icon: 'fa-paint-roller',
        warna: '#d97706',
        deskripsi: 'Pekerjaan finishing bangunan',
        items: {
            cat_dinding: {
                id: 'cat_dinding',
                nama: 'Cat Dinding',
                icon: 'fa-paint-brush',
                kategori: 'Pekerjaan Finishing',
                rumus: 'Luas = (P × T - Lubang) × 2',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Cat Dinding', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Cat Tembok Interior', 'Cat Tembok Eksterior', 'Cat Vinyl', 'Cat Anti Bocor', 'Cat Tekstur', 'Cat Elastomerik'], default: 'Cat Tembok Interior' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0 },
                    { id: 'lapis', label: 'Jumlah Lapis', type: 'select', options: ['1 Lapis', '2 Lapis', '3 Lapis'], default: '2 Lapis' },
                    { id: 'warna', label: 'Warna', type: 'text', default: 'Putih' }
                ],
                hitung: function(data) {
                    const luas = ((data.panjang || 0) * (data.tinggi || 0) - (data.luasLubang || 0)) * 2;
                    const lapis = parseInt(data.lapis) || 2;
                    const kebutuhan = luas * lapis;
                    return {
                        volume: isNaN(luas) || luas < 0 ? 0 : luas,
                        satuan: 'm²',
                        kebutuhan,
                        kebutuhanCat: kebutuhan / 10
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-paint-brush"></i> ${item.lapis || '2 Lapis'}</span>
                            <span><i class="fas fa-paint-roller"></i> ${Math.round(item.kebutuhan || 0)} m²</span>
                            <span><i class="fas fa-palette"></i> ${item.warna || 'Putih'}</span>
                        `
                    };
                }
            },
            cat_plafon: {
                id: 'cat_plafon',
                nama: 'Cat Plafon',
                icon: 'fa-chevron-up',
                kategori: 'Pekerjaan Finishing',
                rumus: 'Luas = P × L',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Cat Plafon', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Cat Tembok', 'Cat Khusus Plafon', 'Cat Anti Jamur', 'Cat Akrilik'], default: 'Cat Tembok' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 4.00, required: true },
                    { id: 'lapis', label: 'Jumlah Lapis', type: 'select', options: ['1 Lapis', '2 Lapis'], default: '2 Lapis' }
                ],
                hitung: function(data) {
                    const luas = (data.panjang || 0) * (data.lebar || 0);
                    const lapis = parseInt(data.lapis) || 2;
                    const kebutuhan = luas * lapis;
                    return {
                        volume: isNaN(luas) || luas < 0 ? 0 : luas,
                        satuan: 'm²',
                        kebutuhan,
                        kebutuhanCat: kebutuhan / 10
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-paint-brush"></i> ${item.lapis || '2 Lapis'}</span>
                            <span><i class="fas fa-chevron-up"></i> ${item.material || 'Cat Tembok'}</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 10. PEKERJAAN MEKANIKAL
    // ========================================
    Pekerjaan_Mekanikal: {
        id: 'pekerjaan_mekanikal',
        nama: 'Pekerjaan Mekanikal',
        icon: 'fa-cogs',
        warna: '#0891b2',
        deskripsi: 'Pekerjaan mekanikal bangunan',
        items: {
            pipa_air: {
                id: 'pipa_air',
                nama: 'Instalasi Pipa Air',
                icon: 'fa-water',
                kategori: 'Pekerjaan Mekanikal',
                rumus: 'Panjang = Total panjang pipa',
                satuan: 'm',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pipa Air Bersih', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Pipa PVC', 'Pipa PPR', 'Pipa Galvanis', 'Pipa Tembaga', 'Pipa HDPE', 'Pipa PE'], default: 'Pipa PVC' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 25.00, required: true },
                    { id: 'diameter', label: 'Diameter (inch)', type: 'select', options: ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '3"', '4"'], default: '1"' },
                    { id: 'sistem', label: 'Sistem', type: 'select', options: ['Air Bersih', 'Air Kotor', 'Air Hujan', 'Fire Protection'], default: 'Air Bersih' }
                ],
                hitung: function(data) {
                    return {
                        volume: data.panjang || 0,
                        satuan: 'm'
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm',
                        detail: `
                            <span><i class="fas fa-water"></i> ${item.diameter || '1"'}</span>
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-tools"></i> ${item.sistem || 'Air Bersih'}</span>
                        `
                    };
                }
            },
            ducting: {
                id: 'ducting',
                nama: 'Instalasi Ducting',
                icon: 'fa-wind',
                kategori: 'Pekerjaan Mekanikal',
                rumus: 'Luas = (2×T + 2×L) × P',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Ducting AC', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Seng', 'Aluminium', 'PVC', 'Fiber', 'Insulasi'], default: 'Seng' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 15.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.30, required: true },
                    { id: 'tebal', label: 'Tebal Material (mm)', type: 'number', step: 0.1, default: 0.8 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tinggi || 0;
                    const luas = (2 * t + 2 * l) * p;
                    return {
                        volume: isNaN(luas) || luas < 0 ? 0 : luas,
                        satuan: 'm²'
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-wind"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)}</span>
                            <span><i class="fas fa-tools"></i> ${item.material || 'Seng'}</span>
                            <span><i class="fas fa-arrows-alt-v"></i> ${(item.tebal || 0.8).toFixed(1)} mm</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 11. PEKERJAAN ELEKTRIKAL
    // ========================================
    Pekerjaan_Elektrikal: {
        id: 'pekerjaan_elektrikal',
        nama: 'Pekerjaan Elektrikal',
        icon: 'fa-bolt',
        warna: '#f59e0b',
        deskripsi: 'Pekerjaan elektrikal bangunan',
        items: {
            kabel: {
                id: 'kabel',
                nama: 'Instalasi Kabel',
                icon: 'fa-plug',
                kategori: 'Pekerjaan Elektrikal',
                rumus: 'Panjang = Total panjang kabel',
                satuan: 'm',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Kabel Listrik', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['NYA 1.5mm²', 'NYA 2.5mm²', 'NYM 3×1.5', 'NYM 3×2.5', 'NYM 4×2.5', 'NYM 4×4', 'NYM 4×6', 'NYM 4×10', 'NYM 4×16', 'NYY', 'BC'], default: 'NYA 2.5mm²' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 50.00, required: true },
                    { id: 'jumlahKabel', label: 'Jumlah Kabel', type: 'number', step: 1, default: 3, required: true },
                    { id: 'jenis', label: 'Jenis Instalasi', type: 'select', options: ['Di Dalam Tembok', 'Di Luar Tembok', 'Dalam Pipa', 'Udara'], default: 'Di Dalam Tembok' }
                ],
                hitung: function(data) {
                    const total = (data.panjang || 0) * (data.jumlahKabel || 1);
                    return {
                        volume: isNaN(total) || total < 0 ? 0 : total,
                        satuan: 'm'
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm',
                        detail: `
                            <span><i class="fas fa-plug"></i> ${item.material || 'NYA 2.5mm²'}</span>
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)} × ${item.jumlahKabel || 1}</span>
                            <span><i class="fas fa-home"></i> ${item.jenis || 'Di Dalam Tembok'}</span>
                        `
                    };
                }
            },
            fitting: {
                id: 'fitting',
                nama: 'Fitting Listrik',
                icon: 'fa-lightbulb',
                kategori: 'Pekerjaan Elektrikal',
                rumus: 'Jumlah = Total titik',
                satuan: 'titik',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Titik Lampu', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Lampu LED', 'Lampu TL', 'Downlight', 'Spotlight', 'Armature', 'Lampu Taman', 'Lampu Emergency'], default: 'Lampu LED' },
                    { id: 'jumlah', label: 'Jumlah Titik', type: 'number', step: 1, default: 12, required: true },
                    { id: 'daya', label: 'Daya (Watt)', type: 'number', step: 1, default: 10 },
                    { id: 'lokasi', label: 'Lokasi', type: 'text', default: 'Ruangan' }
                ],
                hitung: function(data) {
                    return {
                        volume: data.jumlah || 0,
                        satuan: 'titik',
                        totalDaya: (data.jumlah || 0) * (data.daya || 0)
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'titik',
                        detail: `
                            <span><i class="fas fa-lightbulb"></i> ${item.material || 'Lampu LED'}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 0} titik</span>
                            <span><i class="fas fa-bolt"></i> ${(item.totalDaya || 0)} W</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${item.lokasi || 'Ruangan'}</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 12. PEKERJAAN PLUMBING
    // ========================================
    Pekerjaan_Plumbing: {
        id: 'pekerjaan_plumbing',
        nama: 'Pekerjaan Plumbing',
        icon: 'fa-wrench',
        warna: '#059669',
        deskripsi: 'Pekerjaan plumbing bangunan',
        items: {
            instalasi_plumbing: {
                id: 'instalasi_plumbing',
                nama: 'Instalasi Plumbing',
                icon: 'fa-pipe',
                kategori: 'Pekerjaan Plumbing',
                rumus: 'Panjang = Total panjang instalasi',
                satuan: 'm',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Instalasi Plumbing', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Pipa PVC AW', 'Pipa PVC D', 'Pipa PPR', 'Pipa Tembaga', 'Pipa HDPE', 'Pipa Besi'], default: 'Pipa PVC AW' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 30.00, required: true },
                    { id: 'diameter', label: 'Diameter (inch)', type: 'select', options: ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '3"', '4"', '6"'], default: '1"' }
                ],
                hitung: function(data) {
                    return {
                        volume: data.panjang || 0,
                        satuan: 'm'
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm',
                        detail: `
                            <span><i class="fas fa-pipe"></i> ${item.diameter || '1"'}</span>
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-tools"></i> ${item.material || 'Pipa PVC AW'}</span>
                        `
                    };
                }
            },
            sanitary: {
                id: 'sanitary',
                nama: 'Sanitary',
                icon: 'fa-toilet',
                kategori: 'Pekerjaan Plumbing',
                rumus: 'Jumlah = Total unit sanitary',
                satuan: 'unit',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Sanitary', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Wastafel', 'Closet', 'Urinal', 'Floor Drain', 'Shower', 'Bidet', 'Bathtub', 'Shower Screen'], default: 'Wastafel' },
                    { id: 'jumlah', label: 'Jumlah Unit', type: 'number', step: 1, default: 4, required: true },
                    { id: 'merk', label: 'Merk', type: 'text', default: 'TOTO' }
                ],
                hitung: function(data) {
                    return {
                        volume: data.jumlah || 0,
                        satuan: 'unit'
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'unit',
                        detail: `
                            <span><i class="fas fa-toilet"></i> ${item.material || 'Wastafel'}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 0} unit</span>
                            <span><i class="fas fa-tag"></i> ${item.merk || 'TOTO'}</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 13. PEKERJAAN LANDSKAP
    // ========================================
    Pekerjaan_Landskap: {
        id: 'pekerjaan_landskap',
        nama: 'Pekerjaan Landskap',
        icon: 'fa-tree',
        warna: '#16a34a',
        deskripsi: 'Pekerjaan lansekap dan taman',
        items: {
            taman: {
                id: 'taman',
                nama: 'Taman',
                icon: 'fa-leaf',
                kategori: 'Pekerjaan Landskap',
                rumus: 'Luas = P × L',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Taman', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Rumput', 'Tanaman Hias', 'Batu Alam', 'Paving Block', 'Kayu', 'Bambu'], default: 'Rumput' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 10.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'jenisTaman', label: 'Jenis Taman', type: 'select', options: ['Taman Kering', 'Taman Basah', 'Taman Minimalis', 'Taman Tropis', 'Taman Jepang'], default: 'Taman Minimalis' }
                ],
                hitung: function(data) {
                    const luas = (data.panjang || 0) * (data.lebar || 0);
                    return {
                        volume: isNaN(luas) || luas < 0 ? 0 : luas,
                        satuan: 'm²'
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)}</span>
                            <span><i class="fas fa-leaf"></i> ${item.material || 'Rumput'}</span>
                            <span><i class="fas fa-tree"></i> ${item.jenisTaman || 'Taman Minimalis'}</span>
                        `
                    };
                }
            },
            pagar: {
                id: 'pagar',
                nama: 'Pagar',
                icon: 'fa-fence',
                kategori: 'Pekerjaan Landskap',
                rumus: 'Panjang = Total panjang pagar',
                satuan: 'm',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pagar', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Besi', 'Kayu', 'Beton', 'Aluminium', 'Bambu', 'Kawat'], default: 'Besi' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 20.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 1.50, required: true },
                    { id: 'jenisPagar', label: 'Jenis Pagar', type: 'select', options: ['Pagar Tempa', 'Pagar Minimalis', 'Pagar Kayu', 'Pagar Beton'], default: 'Pagar Minimalis' }
                ],
                hitung: function(data) {
                    const luas = (data.panjang || 0) * (data.tinggi || 0);
                    return {
                        volume: data.panjang || 0,
                        satuan: 'm',
                        luas: luas
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm',
                        detail: `
                            <span><i class="fas fa-fence"></i> ${(item.panjang || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt-v"></i> ${(item.tinggi || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-tools"></i> ${item.material || 'Besi'}</span>
                            <span><i class="fas fa-border-all"></i> ${item.jenisPagar || 'Pagar Minimalis'}</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 14. PEKERJAAN INTERIOR
    // ========================================
    Pekerjaan_Interior: {
        id: 'pekerjaan_interior',
        nama: 'Pekerjaan Interior',
        icon: 'fa-couch',
        warna: '#8b5cf6',
        deskripsi: 'Pekerjaan interior bangunan',
        items: {
            backdrop: {
                id: 'backdrop',
                nama: 'Pemasangan Backdrop',
                icon: 'fa-clipboard',
                kategori: 'Pekerjaan Interior',
                rumus: 'Luas = P × T | Jumlah = Luas × 1.05 (waste)',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Backdrop Ruang Tamu', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Kayu', 'HPL', 'Acrylic', 'GRC', 'Aluminium Composite', 'Wallpaper', 'Batu Alam', 'Kaca'], default: 'Kayu' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 4.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 2.50, required: true },
                    { id: 'jenisBackdrop', label: 'Jenis Backdrop', type: 'select', options: ['Dinding', 'Partisi', 'TV', 'Pajangan', 'Ruang Keluarga'], default: 'Dinding' },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0, hint: 'Untuk lubang speaker, AC, dll' },
                    { id: 'waste', label: 'Waste Material (%)', type: 'number', step: 0.1, default: 5, hint: 'Standar 5-10%' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const t = data.tinggi || 0;
                    const luasLubang = data.luasLubang || 0;
                    const waste = (data.waste || 5) / 100;
                    const luas = p * t - luasLubang;
                    const luasTotal = luas * (1 + waste);
                    return {
                        volume: isNaN(luasTotal) || luasTotal < 0 ? 0 : luasTotal,
                        satuan: 'm²',
                        luasBersih: luas,
                        wasteMaterial: luas * waste
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-tag"></i> ${item.jenisBackdrop || 'Dinding'}</span>
                            <span><i class="fas fa-cube"></i> ${item.material || 'Kayu'}</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luasBersih || 0).toFixed(2)} m²</span>
                            <span><i class="fas fa-percent"></i> Waste ${item.waste || 5}%</span>
                        `
                    };
                }
            },
            wpc: {
                id: 'wpc',
                nama: 'Pemasangan WPC',
                icon: 'fa-layer-group',
                kategori: 'Pekerjaan Interior',
                rumus: 'Luas = P × L | Jumlah = Luas × 1.05 (waste)',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'WPC Lantai', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['WPC Deck', 'WPC Plank', 'WPC Panel', 'WPC Profile'], default: 'WPC Deck' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 4.00, required: true },
                    { id: 'jenisPemasangan', label: 'Jenis Pemasangan', type: 'select', options: ['Lantai', 'Dinding', 'Plafon', 'Outdoor'], default: 'Lantai' },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0, hint: 'Untuk kolom, pipa, dll' },
                    { id: 'waste', label: 'Waste Material (%)', type: 'number', step: 0.1, default: 5, hint: 'Standar 5-10%' },
                    { id: 'sistemRangka', label: 'Sistem Rangka', type: 'select', options: ['Tanpa Rangka', 'Kayu', 'Aluminium', 'Baja Ringan'], default: 'Aluminium' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const luasLubang = data.luasLubang || 0;
                    const waste = (data.waste || 5) / 100;
                    const luas = p * l - luasLubang;
                    const luasTotal = luas * (1 + waste);
                    const kebutuhanPanel = luasTotal / 0.18;
                    return {
                        volume: isNaN(luasTotal) || luasTotal < 0 ? 0 : luasTotal,
                        satuan: 'm²',
                        luasBersih: luas,
                        wasteMaterial: luas * waste,
                        kebutuhanPanel: Math.ceil(kebutuhanPanel)
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-tag"></i> ${item.jenisPemasangan || 'Lantai'}</span>
                            <span><i class="fas fa-cube"></i> ${item.material || 'WPC Deck'}</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luasBersih || 0).toFixed(2)} m²</span>
                            <span><i class="fas fa-tools"></i> ${item.sistemRangka || 'Aluminium'}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.kebutuhanPanel || 0} panel</span>
                        `
                    };
                }
            },
            wallboard: {
                id: 'wallboard',
                nama: 'Pemasangan Wallboard',
                icon: 'fa-border-all',
                kategori: 'Pekerjaan Interior',
                rumus: 'Luas = P × T | Jumlah Lembar = Luas / Luas Per Lembar',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Wallboard Dinding', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Gypsum Board', 'GRC Board', 'Fibreboard', 'Cement Board', 'MDF', 'PVC Board', 'Akustik Board'], default: 'Gypsum Board' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.00, required: true },
                    { id: 'tebal', label: 'Tebal (mm)', type: 'number', step: 0.5, default: 9, hint: 'Standar 9mm, 12mm' },
                    { id: 'luasLembar', label: 'Luas Per Lembar (m²)', type: 'number', step: 0.001, default: 2.88, hint: '1.2m × 2.4m = 2.88' },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0, hint: 'Untuk pintu, jendela, dll' },
                    { id: 'waste', label: 'Waste Material (%)', type: 'number', step: 0.1, default: 10, hint: 'Standar 10-15%' },
                    { id: 'jenisAplikasi', label: 'Jenis Aplikasi', type: 'select', options: ['Dinding', 'Plafon', 'Partisi', 'Lantai'], default: 'Dinding' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const t = data.tinggi || 0;
                    const luasLubang = data.luasLubang || 0;
                    const luasLembar = data.luasLembar || 2.88;
                    const waste = (data.waste || 10) / 100;
                    const luas = p * t - luasLubang;
                    const luasTotal = luas * (1 + waste);
                    const jmlLembar = Math.ceil(luasTotal / luasLembar);
                    const kebutuhanRangka = luas * 1.2;
                    return {
                        volume: isNaN(luasTotal) || luasTotal < 0 ? 0 : luasTotal,
                        satuan: 'm²',
                        luasBersih: luas,
                        jmlLembar: jmlLembar,
                        luasPerLembar: luasLembar,
                        wasteMaterial: luas * waste,
                        kebutuhanRangka: kebutuhanRangka
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-tag"></i> ${item.jenisAplikasi || 'Dinding'}</span>
                            <span><i class="fas fa-cube"></i> ${item.material || 'Gypsum Board'}</span>
                            <span><i class="fas fa-arrows-alt-v"></i> ${(item.tebal || 9).toFixed(1)} mm</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jmlLembar || 0} lembar</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luasBersih || 0).toFixed(2)} m²</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 15. PEKERJAAN KUSEN
    // ========================================
    Pekerjaan_Kusen: {
        id: 'pekerjaan_kusen',
        nama: 'Pekerjaan Kusen',
        icon: 'fa-door-open',
        warna: '#b45309',
        deskripsi: 'Pekerjaan kusen pintu dan jendela',
        items: {
            acp: {
                id: 'acp',
                nama: 'ACP (Aluminium Composite Panel)',
                icon: 'fa-vector-square',
                kategori: 'Pekerjaan Kusen',
                rumus: 'Luas = P × T | Jumlah Lembar = Luas / Luas Per Lembar',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'ACP Fasad', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['ACP Alucobond', 'ACP Alupanel', 'ACP Alstrong', 'ACP B&K', 'ACP Local'], default: 'ACP Alucobond' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 4.00, required: true },
                    { id: 'tebal', label: 'Tebal (mm)', type: 'number', step: 0.1, default: 4, hint: 'Standar 3mm, 4mm, 6mm' },
                    { id: 'luasLembar', label: 'Luas Per Lembar (m²)', type: 'number', step: 0.001, default: 4.80, hint: '1.2m × 4.0m = 4.8' },
                    { id: 'jenisACP', label: 'Jenis ACP', type: 'select', options: ['Fasad', 'Dinding', 'Plafon', 'Partisi', 'Canopy'], default: 'Fasad' },
                    { id: 'luasLubang', label: 'Luas Lubang (m²)', type: 'number', step: 0.001, default: 0, hint: 'Untuk jendela, pintu, dll' },
                    { id: 'waste', label: 'Waste Material (%)', type: 'number', step: 0.1, default: 10, hint: 'Standar 8-15%' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const t = data.tinggi || 0;
                    const luasLubang = data.luasLubang || 0;
                    const luasLembar = data.luasLembar || 4.80;
                    const waste = (data.waste || 10) / 100;
                    const luas = p * t - luasLubang;
                    const luasTotal = luas * (1 + waste);
                    const jmlLembar = Math.ceil(luasTotal / luasLembar);
                    const kebutuhanRangka = luas * 0.8;
                    return {
                        volume: isNaN(luasTotal) || luasTotal < 0 ? 0 : luasTotal,
                        satuan: 'm²',
                        luasBersih: luas,
                        jmlLembar: jmlLembar,
                        luasPerLembar: luasLembar,
                        wasteMaterial: luas * waste,
                        kebutuhanRangka: kebutuhanRangka,
                        tebal: data.tebal
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.tinggi || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-tag"></i> ${item.jenisACP || 'Fasad'}</span>
                            <span><i class="fas fa-cube"></i> ${item.material || 'ACP Alucobond'}</span>
                            <span><i class="fas fa-arrows-alt-v"></i> ${(item.tebal || 4).toFixed(1)} mm</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jmlLembar || 0} lembar</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luasBersih || 0).toFixed(2)} m²</span>
                        `
                    };
                }
            },
            kusen_aluminium: {
                id: 'kusen_aluminium',
                nama: 'Kusen Aluminium',
                icon: 'fa-door-open',
                kategori: 'Pekerjaan Kusen',
                rumus: 'Panjang = (2×T + L) × Jumlah | Luas Kaca = P × T × Jumlah',
                satuan: 'm',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Kusen Aluminium Pintu', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Aluminium YKK', 'Aluminium Alco', 'Aluminium Local', 'Aluminium Anodized', 'Aluminium Powder Coated'], default: 'Aluminium YKK' },
                    { id: 'tinggi', label: 'Tinggi Kusen (m)', type: 'number', step: 0.001, default: 2.10, required: true },
                    { id: 'lebar', label: 'Lebar Kusen (m)', type: 'number', step: 0.001, default: 0.90, required: true },
                    { id: 'jumlah', label: 'Jumlah', type: 'number', step: 1, default: 4, required: true },
                    { id: 'jenisKusen', label: 'Jenis', type: 'select', options: ['Pintu', 'Jendela', 'Pintu & Jendela', 'Sliding Door', 'Folding Door'], default: 'Pintu' },
                    { id: 'profil', label: 'Profil Aluminium', type: 'select', options: ['Standar', 'Heavy Duty', 'Minimalis', 'Premium'], default: 'Standar' },
                    { id: 'warna', label: 'Warna', type: 'select', options: ['Natural', 'Hitam', 'Putih', 'Coklat', 'Silver', 'Custom'], default: 'Natural' }
                ],
                hitung: function(data) {
                    const t = data.tinggi || 0;
                    const l = data.lebar || 0;
                    const jml = data.jumlah || 1;
                    const jenis = data.jenisKusen || 'Pintu';
                    let panjangKusen = 0;
                    if (jenis === 'Pintu' || jenis === 'Sliding Door' || jenis === 'Folding Door') {
                        panjangKusen = (2 * t + l) * jml;
                    } else {
                        panjangKusen = (2 * t + 2 * l) * jml;
                    }
                    const luasKaca = (t * l) * jml;
                    const kebutuhanAksesoris = jml * 4;
                    return {
                        volume: isNaN(panjangKusen) || panjangKusen < 0 ? 0 : panjangKusen,
                        satuan: 'm',
                        luasKaca: luasKaca,
                        jumlah: jml,
                        kebutuhanAksesoris: kebutuhanAksesoris,
                        jenisKusen: jenis
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm',
                        detail: `
                            <span><i class="fas fa-door-open"></i> ${item.jenisKusen || 'Pintu'}</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tinggi || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                            <span><i class="fas fa-cube"></i> ${item.material || 'Aluminium YKK'}</span>
                            <span><i class="fas fa-palette"></i> ${item.warna || 'Natural'}</span>
                            <span><i class="fas fa-vector-square"></i> Kaca: ${(item.luasKaca || 0).toFixed(2)} m²</span>
                        `
                    };
                }
            },
            kusen_kayu: {
                id: 'kusen_kayu',
                nama: 'Kusen Kayu',
                icon: 'fa-tree',
                kategori: 'Pekerjaan Kusen',
                rumus: 'Volume = (2×T + L) × Luas Penampang × Jumlah',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Kusen Kayu Pintu', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Kayu Jati', 'Kayu Meranti', 'Kayu Kamper', 'Kayu Borneo', 'Kayu Mahoni', 'Kayu Glulam'], default: 'Kayu Jati' },
                    { id: 'tinggi', label: 'Tinggi Kusen (m)', type: 'number', step: 0.001, default: 2.10, required: true },
                    { id: 'lebar', label: 'Lebar Kusen (m)', type: 'number', step: 0.001, default: 0.90, required: true },
                    { id: 'lebarKayu', label: 'Lebar Kayu (cm)', type: 'number', step: 0.1, default: 12, required: true, hint: 'Standar 10-15cm' },
                    { id: 'tebalKayu', label: 'Tebal Kayu (cm)', type: 'number', step: 0.1, default: 4, required: true, hint: 'Standar 3-5cm' },
                    { id: 'jumlah', label: 'Jumlah', type: 'number', step: 1, default: 4, required: true },
                    { id: 'jenisKusen', label: 'Jenis', type: 'select', options: ['Pintu', 'Jendela', 'Pintu & Jendela', 'Sliding Door', 'Folding Door'], default: 'Pintu' },
                    { id: 'kelasKayu', label: 'Kelas Kayu', type: 'select', options: ['Kelas I', 'Kelas II', 'Kelas III', 'Kelas IV'], default: 'Kelas I' }
                ],
                hitung: function(data) {
                    const t = data.tinggi || 0;
                    const l = data.lebar || 0;
                    const lb = (data.lebarKayu || 12) / 100;
                    const tb = (data.tebalKayu || 4) / 100;
                    const jml = data.jumlah || 1;
                    const jenis = data.jenisKusen || 'Pintu';
                    let panjangKusen = 0;
                    if (jenis === 'Pintu' || jenis === 'Sliding Door' || jenis === 'Folding Door') {
                        panjangKusen = (2 * t + l) * jml;
                    } else {
                        panjangKusen = (2 * t + 2 * l) * jml;
                    }
                    const volumeKayu = panjangKusen * lb * tb;
                    const luasPermukaan = panjangKusen * (2 * lb + 2 * tb);
                    const kebutuhanFinishing = luasPermukaan * 0.1;
                    return {
                        volume: isNaN(volumeKayu) || volumeKayu < 0 ? 0 : volumeKayu,
                        satuan: 'm³',
                        panjangKusen: panjangKusen,
                        luasPermukaan: luasPermukaan,
                        kebutuhanFinishing: kebutuhanFinishing,
                        jumlah: jml,
                        jenisKusen: jenis
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-tree"></i> ${item.material || 'Kayu Jati'}</span>
                            <span><i class="fas fa-door-open"></i> ${item.jenisKusen || 'Pintu'}</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tinggi || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.lebarKayu || 12).toFixed(1)}×${(item.tebalKayu || 4).toFixed(1)} cm</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                            <span><i class="fas fa-weight-hanging"></i> ${(item.panjangKusen || 0).toFixed(2)} m</span>
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
    const totalJenis = Object.keys(DATABASE).length;
    const totalItems = Object.values(DATABASE).reduce((acc, j) => acc + Object.keys(j.items).length, 0);
    console.log(`📊 ${totalJenis} jenis pekerjaan, ${totalItems} item pekerjaan`);
    console.log('✅ Fitur: ACP, Kusen Aluminium, Kusen Kayu, Interior (Backdrop, WPC, Wallboard)');
                     }
