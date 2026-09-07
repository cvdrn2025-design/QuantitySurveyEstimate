// ============================================
// QSE PRO - DATABASE JENIS PEKERJAAN & RUMUS
// Versi: 3.1 - Update Berat Jenis Tulangan Otomatis
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
            // ... (item sebelumnya tetap sama)
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
            // ... (item sebelumnya tetap sama)
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
            // ----- BETON -----
            beton: {
                id: 'beton',
                nama: 'Beton',
                icon: 'fa-cube',
                kategori: 'Struktur Beton',
                rumus: 'Volume = P × L × T × Koefisien',
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

            // ----- BALOK -----
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
                    
                    // ----- TULANGAN UTAMA -----
                    { id: 'tulanganAtas', label: 'Tulangan Atas (Jumlah)', type: 'number', step: 1, default: 4 },
                    { id: 'tulanganBawah', label: 'Tulangan Bawah (Jumlah)', type: 'number', step: 1, default: 3 },
                    { id: 'ukuranUtama', label: 'Ukuran Tulangan Utama', type: 'select', options: ['D6', 'D8', 'D10', 'D12', 'D13', 'D16', 'D19', 'D22', 'D25', 'D28', 'D32', 'D36', 'D40'], default: 'D16' },
                    
                    // ----- SENGKANG -----
                    { id: 'ukuranSengkang', label: 'Ukuran Sengkang', type: 'select', options: ['D4', 'D6', 'D8', 'D10', 'D12', 'D13', 'D16'], default: 'D10' },
                    { id: 'jarakSengkang', label: 'Jarak Sengkang (cm)', type: 'number', step: 0.5, default: 15 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tinggi || 0;
                    const jml = data.jumlah || 1;
                    const vol = p * l * t * jml;
                    
                    // Berat jenis tulangan berdasarkan ukuran
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

            // ----- SLOOF -----
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
                    
                    // ----- TULANGAN UTAMA -----
                    { id: 'tulanganAtas', label: 'Tulangan Atas (Jumlah)', type: 'number', step: 1, default: 3 },
                    { id: 'tulanganBawah', label: 'Tulangan Bawah (Jumlah)', type: 'number', step: 1, default: 3 },
                    { id: 'ukuranUtama', label: 'Ukuran Tulangan Utama', type: 'select', options: ['D6', 'D8', 'D10', 'D12', 'D13', 'D16', 'D19', 'D22', 'D25'], default: 'D16' },
                    
                    // ----- SENGKANG -----
                    { id: 'ukuranSengkang', label: 'Ukuran Sengkang', type: 'select', options: ['D4', 'D6', 'D8', 'D10', 'D12', 'D13'], default: 'D10' },
                    { id: 'jarakSengkang', label: 'Jarak Sengkang (cm)', type: 'number', step: 0.5, default: 15 }
                ],
                hitung: function(data) {
                    const p = data.panjang || 0;
                    const l = data.lebar || 0;
                    const t = data.tinggi || 0;
                    const vol = p * l * t;
                    
                    // Berat jenis tulangan berdasarkan ukuran
                    const beratJenisMap = {
                        'D4': 0.099, 'D6': 0.222, 'D8': 0.395, 'D10': 0.617, 
                        'D12': 0.888, 'D13': 1.040, 'D16': 1.580, 'D19': 2.230,
                        'D22': 2.980, 'D25': 3.850, 'D28': 4.830, 'D32': 6.310
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

            // ----- KOLOM -----
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
                    
                    // ----- TULANGAN UTAMA -----
                    { id: 'tulanganUtama', label: 'Jumlah Tulangan Utama', type: 'number', step: 1, default: 8 },
                    { id: 'ukuranUtama', label: 'Ukuran Tulangan Utama', type: 'select', options: ['D6', 'D8', 'D10', 'D12', 'D13', 'D16', 'D19', 'D22', 'D25', 'D28', 'D32', 'D36', 'D40'], default: 'D16' },
                    
                    // ----- SENGKANG -----
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
                    
                    // Berat jenis tulangan berdasarkan ukuran
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

            // ----- KOLOM BULAT -----
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
                    
                    // ----- TULANGAN UTAMA -----
                    { id: 'jmlTulangan', label: 'Jumlah Tulangan Utama', type: 'number', step: 1, default: 10 },
                    { id: 'ukuranUtama', label: 'Ukuran Tulangan Utama', type: 'select', options: ['D6', 'D8', 'D10', 'D12', 'D13', 'D16', 'D19', 'D22', 'D25', 'D28', 'D32'], default: 'D16' },
                    
                    // ----- SPIRAL -----
                    { id: 'ukuranSpiral', label: 'Ukuran Spiral', type: 'select', options: ['D4', 'D6', 'D8', 'D10', 'D12', 'D13'], default: 'D10' },
                    { id: 'jarakSpiral', label: 'Jarak Spiral (cm)', type: 'number', step: 0.5, default: 10 }
                ],
                hitung: function(data) {
                    const d = data.diameter || 0;
                    const t = data.tinggi || 0;
                    const jml = data.jumlah || 1;
                    const r = d / 2;
                    const volBeton = Math.PI * r * r * t * jml;
                    
                    // Berat jenis tulangan berdasarkan ukuran
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

            // ----- LANTAI KERJA -----
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
            // ... (item sebelumnya tetap sama)
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
            // ... (item sebelumnya tetap sama)
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
            // ... (item sebelumnya tetap sama)
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
            // ----- PEMBESIAN -----
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
                    
                    // ----- TULANGAN UTAMA -----
                    { id: 'ukuranUtama', label: 'Ukuran Tulangan Utama', type: 'select', options: ['D6', 'D8', 'D10', 'D12', 'D13', 'D16', 'D19', 'D22', 'D25', 'D28', 'D32', 'D36', 'D40'], default: 'D16' },
                    { id: 'jmlUtama', label: 'Jumlah Tulangan Utama', type: 'number', step: 1, default: 8, required: true },
                    { id: 'panjangUtama', label: 'Panjang Tulangan (m)', type: 'number', step: 0.001, default: 3.50, required: true },
                    
                    // ----- SENGKANG -----
                    { id: 'ukuranSengkang', label: 'Ukuran Sengkang', type: 'select', options: ['D4', 'D6', 'D8', 'D10', 'D12', 'D13', 'D16'], default: 'D10' },
                    { id: 'lebarKolom', label: 'Lebar Kolom (m)', type: 'number', step: 0.001, default: 0.30 },
                    { id: 'tinggiKolom', label: 'Tinggi Kolom (m)', type: 'number', step: 0.001, default: 0.30 },
                    { id: 'jarakSengkang', label: 'Jarak Sengkang (cm)', type: 'number', step: 0.5, default: 15 },
                    { id: 'selimut', label: 'Selimut Beton (cm)', type: 'number', step: 0.5, default: 4 },
                    { id: 'kait', label: 'Panjang Kait (m)', type: 'number', step: 0.001, default: 0.10 }
                ],
                hitung: function(data) {
                    // Berat jenis tulangan berdasarkan ukuran
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

            // ----- WIREMESH -----
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
            // ... (item sebelumnya tetap sama)
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
            // ... (item sebelumnya tetap sama)
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
            // ... (item sebelumnya tetap sama)
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
            // ... (item sebelumnya tetap sama)
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
            // ... (item sebelumnya tetap sama)
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
            // ... (item sebelumnya tetap sama)
        }
    }
};

// ============================================
// DATA BERAT JENIS TULANGAN (untuk referensi)
// ============================================
const BERAT_JENIS_BESI = {
    'D4': 0.099, 'D5': 0.154, 'D6': 0.222, 
    'D8': 0.395, 'D9': 0.499, 'D10': 0.617, 
    'D12': 0.888, 'D13': 1.040, 'D14': 1.210, 
    'D16': 1.580, 'D18': 1.999, 'D19': 2.230,
    'D20': 2.470, 'D22': 2.980, 'D25': 3.850, 
    'D28': 4.830, 'D30': 5.550, 'D32': 6.310,
    'D36': 7.990, 'D40': 9.860
};

// ============================================
// EKSPOR
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DATABASE;
    module.exports.BERAT_JENIS_BESI = BERAT_JENIS_BESI;
}

if (typeof window !== 'undefined') {
    window.DATABASE = DATABASE;
    window.BERAT_JENIS_BESI = BERAT_JENIS_BESI;
    console.log('✅ Database loaded!');
    console.log('📊 Berat Jenis Besi tersedia untuk ' + Object.keys(BERAT_JENIS_BESI).length + ' ukuran');
    const totalJenis = Object.keys(DATABASE).length;
    const totalItems = Object.values(DATABASE).reduce((acc, j) => acc + Object.keys(j.items).length, 0);
    console.log(`📋 ${totalJenis} jenis pekerjaan, ${totalItems} item pekerjaan`);
              }
