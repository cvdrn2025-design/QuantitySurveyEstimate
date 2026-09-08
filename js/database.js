// ============================================
// QSE PRO - DATABASE JENIS PEKERJAAN & RUMUS
// Versi: 3.6 - Complete Database
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
    // 2. STRUKTUR
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
                kategori: 'Struktur',
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
                kategori: 'Struktur',
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
                kategori: 'Struktur',
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
                kategori: 'Struktur',
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
                kategori: 'Struktur',
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
                kategori: 'Struktur',
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
                kategori: 'Struktur',
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
    // 3. ARSITEKTUR
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
                kategori: 'Arsitektur',
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
                kategori: 'Arsitektur',
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
    // 4. FINISHING
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
                kategori: 'Finishing',
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
    // 5. MEKANIKAL
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
                kategori: 'Mekanikal',
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
    // 6. ELEKTRIKAL
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
                kategori: 'Elektrikal',
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
    // 7. PLUMBING
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
                kategori: 'Plumbing',
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
    // 8. PEKERJAAN JALAN
    // ========================================
    Pekerjaan_Jalan: {
        id: 'pekerjaan_jalan',
        nama: 'Pekerjaan Jalan',
        icon: 'fa-road',
        warna: '#4B5563',
        deskripsi: 'Pekerjaan konstruksi jalan raya dan lingkungan',
        items: {
            badan_jalan: {
                id: 'badan_jalan',
                nama: 'Pembuatan Badan Jalan',
                icon: 'fa-road',
                kategori: 'Pekerjaan Jalan',
                rumus: 'Volume = P × L × T × Faktor | Luas = P × L',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Badan Jalan', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Tanah Biasa', 'Tanah Pilihan', 'Tanah Lempung', 'Tanah Berbatu'], default: 'Tanah Pilihan' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 100.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'tebal', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.50, required: true },
                    { id: 'faktorPadat', label: 'Faktor Pemadatan', type: 'number', step: 0.001, default: 1.2, hint: '1.2 = padat, 1.0 = lepas' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tebal || 0;
                    const faktor = data.faktorPadat || 1.2;
                    const luas = p * l;
                    const volume = luas * t * faktor;
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
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tebal || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luas || 0).toFixed(2)} m²</span>
                            <span><i class="fas fa-compress"></i> ${(item.faktorPadat || 1.2).toFixed(2)}</span>
                        `
                    };
                }
            },
            sub_grade: {
                id: 'sub_grade',
                nama: 'Lapisan Sub Grade',
                icon: 'fa-layer-group',
                kategori: 'Pekerjaan Jalan',
                rumus: 'Volume = P × L × T | Luas = P × L',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Sub Grade', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Tanah Pilihan', 'Sirtu', 'Pasir Batu', 'Tanah Stabilisasi'], default: 'Sirtu' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 100.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'tebal', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.30, required: true }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tebal || 0;
                    const luas = p * l;
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
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tebal || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luas || 0).toFixed(2)} m²</span>
                            <span><i class="fas fa-cube"></i> ${item.material || 'Sirtu'}</span>
                        `
                    };
                }
            },
            sub_base: {
                id: 'sub_base',
                nama: 'Lapisan Sub Base',
                icon: 'fa-layer-group',
                kategori: 'Pekerjaan Jalan',
                rumus: 'Volume = P × L × T | Luas = P × L',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Sub Base', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Batu Pecah', 'Sirtu', 'Agregat Kasar', 'Agregat Halus'], default: 'Batu Pecah' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 100.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'tebal', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.20, required: true }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tebal || 0;
                    const luas = p * l;
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
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tebal || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luas || 0).toFixed(2)} m²</span>
                            <span><i class="fas fa-cube"></i> ${item.material || 'Batu Pecah'}</span>
                        `
                    };
                }
            },
            base_course: {
                id: 'base_course',
                nama: 'Lapisan Base Course',
                icon: 'fa-layer-group',
                kategori: 'Pekerjaan Jalan',
                rumus: 'Volume = P × L × T | Luas = P × L',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Base Course', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Batu Pecah 3/5', 'Batu Pecah 5/7', 'Agregat A', 'Agregat B'], default: 'Batu Pecah 3/5' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 100.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'tebal', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.15, required: true }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tebal || 0;
                    const luas = p * l;
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
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tebal || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luas || 0).toFixed(2)} m²</span>
                            <span><i class="fas fa-cube"></i> ${item.material || 'Batu Pecah 3/5'}</span>
                        `
                    };
                }
            },
            perkerasan_beton: {
                id: 'perkerasan_beton',
                nama: 'Perkerasan Beton',
                icon: 'fa-cube',
                kategori: 'Pekerjaan Jalan',
                rumus: 'Volume = P × L × T | Besi = (P/jarak × L + L/jarak × P) × Berat',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Perkerasan Beton', required: true },
                    { id: 'material', label: 'Mutu Beton', type: 'select', options: ['Beton K-250', 'Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-300' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 100.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'tebal', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.20, required: true },
                    { id: 'jenisTulangan', label: 'Jenis Tulangan', type: 'select', options: ['Tanpa Tulangan', 'Wiremesh', 'Besi Polos', 'Besi Ulir'], default: 'Wiremesh' },
                    { id: 'ukuranBesi', label: 'Ukuran Besi/Wiremesh', type: 'select', options: ['M6/D6', 'M8/D8', 'M10/D10', 'M12/D12', 'M13/D13', 'M14/D14', 'M16/D16', 'M18/D18', 'M19/D19', 'M20/D20'], default: 'M8/D8' },
                    { id: 'jarakX', label: 'Jarak Tulangan Arah X (cm)', type: 'number', step: 0.5, default: 15, required: true },
                    { id: 'jarakY', label: 'Jarak Tulangan Arah Y (cm)', type: 'number', step: 0.5, default: 15, required: true },
                    { id: 'lapis', label: 'Jumlah Lapis', type: 'select', options: ['1 Lapis', '2 Lapis'], default: '1 Lapis' },
                    { id: 'selimut', label: 'Selimut Beton (cm)', type: 'number', step: 0.5, default: 4, hint: 'Minimal 4cm' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tebal || 0;
                    const luas = p * l;
                    const volume = luas * t;
                    const beratJenisMap = {
                        'M6/D6': 0.222, 'M8/D8': 0.395, 'M10/D10': 0.617,
                        'M12/D12': 0.888, 'M13/D13': 1.040, 'M14/D14': 1.210,
                        'M16/D16': 1.580, 'M18/D18': 1.999, 'M19/D19': 2.230,
                        'M20/D20': 2.470
                    };
                    const beratJenis = beratJenisMap[data.ukuranBesi] || 0.617;
                    const jarakXM = (data.jarakX || 15) / 100;
                    const jarakYM = (data.jarakY || 15) / 100;
                    const lapis = parseInt(data.lapis) || 1;
                    const jmlX = Math.floor(l / jarakXM) + 1;
                    const jmlY = Math.floor(p / jarakYM) + 1;
                    const panjangX = jmlX * p * lapis;
                    const panjangY = jmlY * l * lapis;
                    const totalPanjang = panjangX + panjangY;
                    const beratBesi = totalPanjang * beratJenis;
                    return {
                        volume: isNaN(volume) || volume < 0 ? 0 : volume,
                        satuan: 'm³',
                        luas: luas,
                        beratBesi: beratBesi,
                        jmlX: jmlX,
                        jmlY: jmlY,
                        totalPanjang: totalPanjang,
                        ukuranBesi: data.ukuranBesi,
                        jenisTulangan: data.jenisTulangan
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tebal || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luas || 0).toFixed(2)} m²</span>
                            <span><i class="fas fa-weight-hanging"></i> ${item.ukuranBesi || 'M8/D8'}: ${(item.beratBesi || 0).toFixed(2)} kg</span>
                            <span><i class="fas fa-tag"></i> ${item.jenisTulangan || 'Wiremesh'}</span>
                        `
                    };
                }
            },
            lapisan_aspal: {
                id: 'lapisan_aspal',
                nama: 'Lapisan Aspal',
                icon: 'fa-fill-drip',
                kategori: 'Pekerjaan Jalan',
                rumus: 'Volume = P × L × T | Luas = P × L',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Lapisan Aspal', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['AC-WC (Laston)', 'AC-BC', 'AC-Base', 'HRS', 'Aspal Emulsi'], default: 'AC-WC (Laston)' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 100.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 6.00, required: true },
                    { id: 'tebal', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.05, required: true },
                    { id: 'jenisAspal', label: 'Jenis Aspal', type: 'select', options: ['Aspal Pen 60/70', 'Aspal Pen 80/100', 'Aspal Modified', 'Aspal Emulsi'], default: 'Aspal Pen 60/70' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tebal || 0;
                    const luas = p * l;
                    const volume = luas * t;
                    return {
                        volume: isNaN(volume) || volume < 0 ? 0 : volume,
                        satuan: 'm³',
                        luas: luas,
                        kebutuhanAspal: volume * 1.05
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
                            <span><i class="fas fa-tag"></i> ${item.material || 'AC-WC (Laston)'}</span>
                            <span><i class="fas fa-fill-drip"></i> ${item.jenisAspal || 'Aspal Pen 60/70'}</span>
                        `
                    };
                }
            },
            paving_block: {
                id: 'paving_block',
                nama: 'Paving Block',
                icon: 'fa-th-large',
                kategori: 'Pekerjaan Jalan',
                rumus: 'Luas = P × L | Jumlah = Luas × 44 (untuk ukuran 20×10cm)',
                satuan: 'm²',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Paving Block', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Paving Block 20x10x6', 'Paving Block 20x10x8', 'Paving Block 20x10x10', 'Conblock', 'Grass Block'], default: 'Paving Block 20x10x6' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 20.00, required: true },
                    { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 10.00, required: true },
                    { id: 'pola', label: 'Pola Pemasangan', type: 'select', options: ['Bata', 'Herringbone', 'Basket Weave', 'Diagonal'], default: 'Herringbone' },
                    { id: 'waste', label: 'Waste Material (%)', type: 'number', step: 0.1, default: 5, hint: 'Standar 5-10%' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const waste = (data.waste || 5) / 100;
                    const luas = p * l;
                    const luasTotal = luas * (1 + waste);
                    const jmlPaving = Math.ceil(luasTotal * 44);
                    return {
                        volume: isNaN(luasTotal) || luasTotal < 0 ? 0 : luasTotal,
                        satuan: 'm²',
                        luasBersih: luas,
                        jmlPaving: jmlPaving,
                        wasteMaterial: luas * waste
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm²',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)}×${(item.lebar || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-th-large"></i> ${item.material || 'Paving Block 20x10x6'}</span>
                            <span><i class="fas fa-border-all"></i> ${item.pola || 'Herringbone'}</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jmlPaving || 0} bh</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luasBersih || 0).toFixed(2)} m²</span>
                        `
                    };
                }
            }
        }
    },

    // ========================================
    // 9. PEKERJAAN DRAINASE
    // ========================================
    Pekerjaan_Drainase: {
        id: 'pekerjaan_drainase',
        nama: 'Pekerjaan Drainase',
        icon: 'fa-water',
        warna: '#0ea5e9',
        deskripsi: 'Pekerjaan sistem drainase dan saluran air',
        items: {
            galian_drainase: {
                id: 'galian_drainase',
                nama: 'Galian Saluran Drainase',
                icon: 'fa-tractor',
                kategori: 'Pekerjaan Drainase',
                rumus: 'Volume = ((LA+LB)/2) × T × P',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Galian Drainase', required: true },
                    { id: 'material', label: 'Jenis Tanah', type: 'select', options: ['Tanah Biasa', 'Tanah Lempung', 'Tanah Pasir', 'Tanah Berbatu'], default: 'Tanah Biasa' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 50.00, required: true },
                    { id: 'lebarAtas', label: 'Lebar Atas (m)', type: 'number', step: 0.001, default: 1.20, required: true },
                    { id: 'lebarBawah', label: 'Lebar Bawah (m)', type: 'number', step: 0.001, default: 0.60, required: true },
                    { id: 'tinggi', label: 'Kedalaman (m)', type: 'number', step: 0.001, default: 0.80, required: true }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const la = data.lebarAtas || 0;
                    const lb = data.lebarBawah || 0;
                    const t = data.tinggi || 0;
                    const rata = (la + lb) / 2;
                    const volume = rata * t * p;
                    return {
                        volume: isNaN(volume) || volume < 0 ? 0 : volume,
                        satuan: 'm³'
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.lebarAtas || 0).toFixed(2)}×${(item.lebarBawah || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-ruler"></i> ${(item.tinggi || 0).toFixed(2)} m</span>
                        `
                    };
                }
            },
            pasangan_batu_drainase: {
                id: 'pasangan_batu_drainase',
                nama: 'Pasangan Batu Drainase',
                icon: 'fa-cubes',
                kategori: 'Pekerjaan Drainase',
                rumus: 'Volume = (P × T × Tebal) × 2 sisi',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pasangan Batu Drainase', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Batu Kali', 'Batu Belah', 'Batu Gunung', 'Bata Merah'], default: 'Batu Kali' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 50.00, required: true },
                    { id: 'tinggi', label: 'Tinggi Dinding (m)', type: 'number', step: 0.001, default: 0.80, required: true },
                    { id: 'tebal', label: 'Tebal Pasangan (m)', type: 'number', step: 0.001, default: 0.20, required: true },
                    { id: 'jumlahSisi', label: 'Jumlah Sisi', type: 'select', options: ['1 Sisi', '2 Sisi'], default: '2 Sisi' },
                    { id: 'persenBatu', label: 'Batu (%)', type: 'number', step: 1, default: 70 },
                    { id: 'persenPasir', label: 'Pasir (%)', type: 'number', step: 1, default: 20 },
                    { id: 'persenSemen', label: 'Semen (%)', type: 'number', step: 1, default: 10 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const t = data.tinggi || 0;
                    const tebal = data.tebal || 0;
                    const sisi = data.jumlahSisi === '2 Sisi' ? 2 : 1;
                    const volume = p * t * tebal * sisi;
                    return {
                        volume: isNaN(volume) || volume < 0 ? 0 : volume,
                        satuan: 'm³',
                        batu: volume * (data.persenBatu / 100),
                        pasir: volume * (data.persenPasir / 100),
                        semen: volume * (data.persenSemen / 100)
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tinggi || 0).toFixed(2)}×${(item.tebal || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-border-all"></i> ${item.jumlahSisi || '2 Sisi'}</span>
                            <span><i class="fas fa-cube"></i> Batu: ${(item.batu || 0).toFixed(3)} m³</span>
                        `
                    };
                }
            },
            saluran_beton: {
                id: 'saluran_beton',
                nama: 'Saluran Beton Drainase',
                icon: 'fa-cube',
                kategori: 'Pekerjaan Drainase',
                rumus: 'Volume = ((LA+LB)/2) × T × P',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Saluran Beton', required: true },
                    { id: 'material', label: 'Mutu Beton', type: 'select', options: ['Beton K-200', 'Beton K-225', 'Beton K-250', 'Beton K-300'], default: 'Beton K-225' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 50.00, required: true },
                    { id: 'lebarAtas', label: 'Lebar Atas (m)', type: 'number', step: 0.001, default: 0.80, required: true },
                    { id: 'lebarBawah', label: 'Lebar Bawah (m)', type: 'number', step: 0.001, default: 0.50, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.50, required: true },
                    { id: 'tebalDinding', label: 'Tebal Dinding (m)', type: 'number', step: 0.001, default: 0.10, required: true }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const la = data.lebarAtas || 0;
                    const lb = data.lebarBawah || 0;
                    const t = data.tinggi || 0;
                    const rata = (la + lb) / 2;
                    const volume = rata * t * p;
                    return {
                        volume: isNaN(volume) || volume < 0 ? 0 : volume,
                        satuan: 'm³',
                        luas: p * la
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.lebarAtas || 0).toFixed(2)}×${(item.lebarBawah || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tinggi || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt-v"></i> ${(item.tebalDinding || 0).toFixed(2)} m</span>
                        `
                    };
                }
            },
            pipa_drainase: {
                id: 'pipa_drainase',
                nama: 'Pipa Drainase',
                icon: 'fa-pipe',
                kategori: 'Pekerjaan Drainase',
                rumus: 'Panjang = Total panjang pipa',
                satuan: 'm',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Pipa Drainase', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Pipa PVC', 'Pipa HDPE', 'Pipa Beton', 'Pipa Besi'], default: 'Pipa PVC' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 50.00, required: true },
                    { id: 'diameter', label: 'Diameter (inch)', type: 'select', options: ['4"', '6"', '8"', '10"', '12"', '16"', '20"', '24"'], default: '8"' },
                    { id: 'kedalaman', label: 'Kedalaman Tanam (m)', type: 'number', step: 0.001, default: 0.60 },
                    { id: 'jenis', label: 'Jenis Pipa', type: 'select', options: ['PVC AW', 'PVC D', 'HDPE PN 10', 'HDPE PN 16', 'Beton Bertulang'], default: 'PVC AW' }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    return {
                        volume: isNaN(p) || p < 0 ? 0 : p,
                        satuan: 'm',
                        diameter: data.diameter,
                        kedalaman: data.kedalaman
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm',
                        detail: `
                            <span><i class="fas fa-pipe"></i> ${item.diameter || '8"'}</span>
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.volume || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt-v"></i> ${(item.kedalaman || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-tools"></i> ${item.jenis || 'PVC AW'}</span>
                            <span><i class="fas fa-cube"></i> ${item.material || 'Pipa PVC'}</span>
                        `
                    };
                }
            },
            gorong_gorong: {
                id: 'gorong_gorong',
                nama: 'Gorong-Gorong',
                icon: 'fa-archway',
                kategori: 'Pekerjaan Drainase',
                rumus: 'Panjang = Total panjang | Volume = π × r² × P',
                satuan: 'm',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Gorong-Gorong', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Beton Bertulang', 'Baja', 'PVC', 'HDPE'], default: 'Beton Bertulang' },
                    { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 10.00, required: true },
                    { id: 'diameter', label: 'Diameter (m)', type: 'number', step: 0.001, default: 0.60, required: true },
                    { id: 'jumlah', label: 'Jumlah', type: 'number', step: 1, default: 2, required: true }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const d = data.diameter || 0;
                    const jml = data.jumlah || 1;
                    const r = d / 2;
                    const volume = Math.PI * r * r * p * jml;
                    return {
                        volume: isNaN(volume) || volume < 0 ? 0 : volume,
                        satuan: 'm³',
                        panjangTotal: p * jml,
                        jumlah: jml,
                        diameter: d
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-archway"></i> ${item.material || 'Beton Bertulang'}</span>
                            <span><i class="fas fa-circle"></i> D${(item.diameter || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt-h"></i> ${(item.panjang || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                            <span><i class="fas fa-cube"></i> ${(item.volume || 0).toFixed(3)} m³</span>
                        `
                    };
                }
            },
            sumur_resapan: {
                id: 'sumur_resapan',
                nama: 'Sumur Resapan',
                icon: 'fa-water',
                kategori: 'Pekerjaan Drainase',
                rumus: 'Volume = π × r² × T | Luas = 2 × π × r × T',
                satuan: 'm³',
                fields: [
                    { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Sumur Resapan', required: true },
                    { id: 'material', label: 'Material', type: 'select', options: ['Beton Bertulang', 'Bata', 'Batu Kali', 'Precast'], default: 'Beton Bertulang' },
                    { id: 'diameter', label: 'Diameter (m)', type: 'number', step: 0.001, default: 1.00, required: true },
                    { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 1.50, required: true },
                    { id: 'jumlah', label: 'Jumlah', type: 'number', step: 1, default: 2, required: true }
                ],
                hitung: function(data) {
                    const d = data.diameter || 0;
                    const t = data.tinggi || 0;
                    const jml = data.jumlah || 1;
                    const r = d / 2;
                    const volume = Math.PI * r * r * t * jml;
                    const luasDinding = 2 * Math.PI * r * t * jml;
                    return {
                        volume: isNaN(volume) || volume < 0 ? 0 : volume,
                        satuan: 'm³',
                        luasDinding: luasDinding,
                        jumlah: jml,
                        diameter: d
                    };
                },
                display: function(item) {
                    return {
                        volume: item.volume || 0,
                        unit: 'm³',
                        detail: `
                            <span><i class="fas fa-water"></i> ${item.material || 'Beton Bertulang'}</span>
                            <span><i class="fas fa-circle"></i> D${(item.diameter || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-arrows-alt"></i> ${(item.tinggi || 0).toFixed(2)} m</span>
                            <span><i class="fas fa-hashtag"></i> ${item.jumlah || 1} bh</span>
                            <span><i class="fas fa-vector-square"></i> ${(item.luasDinding || 0).toFixed(2)} m²</span>
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
                  }
