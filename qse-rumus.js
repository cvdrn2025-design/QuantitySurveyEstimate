// ============================================
// QUANTITY SURVEY ENGINEER - DATABASE RUMUS
// ============================================

const QSE_RUMUS = {
    // ===== BETON =====
    beton: {
        nama: 'Beton',
        icon: 'fa-cube',
        warna: '#2563eb',
        rumus: 'Volume = P × L × T × Koefisien',
        fields: [
            { id: 'namaItem', label: 'Nama Pekerjaan', type: 'text', default: 'Kolom Lantai 1' },
            { id: 'jenisPekerjaan', label: 'Jenis Pekerjaan', type: 'select', options: ['Struktur', 'Arsitektur', 'Mekanikal', 'Elektrikal', 'Finishing', 'Plumbing'], default: 'Arsitektur' },
            { id: 'materialSelect', label: 'Material', type: 'select', options: ['Beton K-250', 'Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-300' },
            { id: 'panjang', label: 'Panjang (m)', type: 'number', step: 0.001, default: 0.30 },
            { id: 'lebar', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.30 },
            { id: 'tinggi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50 },
            { id: 'koefisien', label: 'Koefisien', type: 'number', step: 0.001, default: 1.0 }
        ],
        hitung: function(data) {
            const vol = data.panjang * data.lebar * data.tinggi * data.koefisien;
            return { volume: isNaN(vol) || vol < 0 ? 0 : vol };
        },
        display: function(item) {
            return {
                volume: item.volume || 0,
                unit: 'm³',
                detail: `
                    <span><i class="fas fa-arrows-alt-h"></i> ${item.panjang.toFixed(3)} m</span>
                    <span><i class="fas fa-arrows-alt-v"></i> ${item.lebar.toFixed(3)} m</span>
                    <span><i class="fas fa-arrows-alt"></i> ${item.tinggi.toFixed(3)} m</span>
                    <span><i class="fas fa-times"></i> ${(item.koefisien || 1).toFixed(3)}</span>
                `
            };
        }
    },

    // ===== BALOK =====
    balok: {
        nama: 'Balok',
        icon: 'fa-grip-lines',
        warna: '#7c3aed',
        rumus: 'Volume = P × L × T × Jumlah | Besi = Tulangan × Panjang × Berat Jenis',
        fields: [
            { id: 'namaItemBalok', label: 'Nama Pekerjaan', type: 'text', default: 'Balok B1 30x50' },
            { id: 'jenisPekerjaanBalok', label: 'Jenis Pekerjaan', type: 'select', options: ['Struktur'], default: 'Struktur' },
            { id: 'materialBalok', label: 'Material', type: 'select', options: ['Beton K-250', 'Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-300' },
            { id: 'panjangBalok', label: 'Panjang (m)', type: 'number', step: 0.001, default: 6.00 },
            { id: 'lebarBalok', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.30 },
            { id: 'tinggiBalok', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.50 },
            { id: 'jumlahBalok', label: 'Jumlah', type: 'number', step: 1, default: 4 },
            { id: 'tulanganAtas', label: 'Tulangan Atas', type: 'number', step: 1, default: 4 },
            { id: 'tulanganBawah', label: 'Tulangan Bawah', type: 'number', step: 1, default: 3 },
            { id: 'beratJenisBalok', label: 'Berat Jenis (kg/m)', type: 'number', step: 0.001, default: 1.58 },
            { id: 'jarakSengkangBalok', label: 'Sengkang (cm)', type: 'number', step: 0.5, default: 15 }
        ],
        hitung: function(data) {
            const p = data.panjangBalok || 0;
            const l = data.lebarBalok || 0;
            const t = data.tinggiBalok || 0;
            const jml = data.jumlahBalok || 1;
            const tulAtas = data.tulanganAtas || 0;
            const tulBawah = data.tulanganBawah || 0;
            const berat = data.beratJenisBalok || 1.58;
            const jarak = data.jarakSengkangBalok || 15;

            const volume = p * l * t * jml;
            const totalTulangan = tulAtas + tulBawah;
            const beratBesi = p * totalTulangan * berat * jml;
            const jumlahSengkang = Math.floor(p / (jarak / 100)) * jml;
            const panjangSengkang = 2 * ((l - 0.08) + (t - 0.08)) + 0.1;
            const beratSengkang = jumlahSengkang * panjangSengkang * 0.617;
            const totalBeratBesi = beratBesi + beratSengkang;

            return { volume, totalBeratBesi, beratBesi, beratSengkang, jumlahSengkang };
        },
        display: function(item) {
            return {
                volume: item.volume || 0,
                unit: 'm³',
                detail: `
                    <span><i class="fas fa-grip-lines"></i> ${item.panjang.toFixed(2)}×${item.lebar.toFixed(2)}×${item.tinggi.toFixed(2)}</span>
                    <span><i class="fas fa-hashtag"></i> ${item.jumlah} bh</span>
                    <span><i class="fas fa-weight-hanging"></i> Besi: ${(item.totalBeratBesi || 0).toFixed(2)} kg</span>
                `
            };
        }
    },

    // ===== SLOOF =====
    sloof: {
        nama: 'Sloof',
        icon: 'fa-grip-lines-vertical',
        warna: '#0891b2',
        rumus: 'Volume = P × L × T | Besi = Tulangan × Panjang × Berat Jenis',
        fields: [
            { id: 'namaItemSloof', label: 'Nama Pekerjaan', type: 'text', default: 'Sloof 20x30' },
            { id: 'jenisPekerjaanSloof', label: 'Jenis Pekerjaan', type: 'select', options: ['Struktur'], default: 'Struktur' },
            { id: 'materialSloof', label: 'Material', type: 'select', options: ['Beton K-250', 'Beton K-300', 'Beton K-350'], default: 'Beton K-300' },
            { id: 'panjangSloof', label: 'Panjang Total (m)', type: 'number', step: 0.001, default: 45.00 },
            { id: 'lebarSloof', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.20 },
            { id: 'tinggiSloof', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.30 },
            { id: 'jumlahSloof', label: 'Jumlah', type: 'number', step: 1, default: 1 },
            { id: 'tulanganAtasSloof', label: 'Tulangan Atas', type: 'number', step: 1, default: 3 },
            { id: 'tulanganBawahSloof', label: 'Tulangan Bawah', type: 'number', step: 1, default: 3 },
            { id: 'beratJenisSloof', label: 'Berat Jenis (kg/m)', type: 'number', step: 0.001, default: 1.58 },
            { id: 'jarakSengkangSloof', label: 'Sengkang (cm)', type: 'number', step: 0.5, default: 15 }
        ],
        hitung: function(data) {
            const p = data.panjangSloof || 0;
            const l = data.lebarSloof || 0;
            const t = data.tinggiSloof || 0;
            const jml = data.jumlahSloof || 1;
            const tulAtas = data.tulanganAtasSloof || 0;
            const tulBawah = data.tulanganBawahSloof || 0;
            const berat = data.beratJenisSloof || 1.58;
            const jarak = data.jarakSengkangSloof || 15;

            const volume = p * l * t * jml;
            const totalTulangan = tulAtas + tulBawah;
            const beratBesi = p * totalTulangan * berat * jml;
            const jumlahSengkang = Math.floor(p / (jarak / 100)) * jml;
            const panjangSengkang = 2 * ((l - 0.08) + (t - 0.08)) + 0.1;
            const beratSengkang = jumlahSengkang * panjangSengkang * 0.617;
            const totalBeratBesi = beratBesi + beratSengkang;

            return { volume, totalBeratBesi, beratBesi, beratSengkang, jumlahSengkang };
        },
        display: function(item) {
            return {
                volume: item.volume || 0,
                unit: 'm³',
                detail: `
                    <span><i class="fas fa-grip-lines-vertical"></i> ${item.panjang.toFixed(2)}×${item.lebar.toFixed(2)}×${item.tinggi.toFixed(2)}</span>
                    <span><i class="fas fa-weight-hanging"></i> Besi: ${(item.totalBeratBesi || 0).toFixed(2)} kg</span>
                `
            };
        }
    },

    // ===== PILE CAP =====
    pilecap: {
        nama: 'Pile Cap',
        icon: 'fa-chess-queen',
        warna: '#059669',
        rumus: 'Volume = P × L × T × Jumlah | Besi = 2 × (P+L) × Tulangan × Berat Jenis',
        fields: [
            { id: 'namaItemPileCap', label: 'Nama Pekerjaan', type: 'text', default: 'Pile Cap PC1' },
            { id: 'jenisPekerjaanPileCap', label: 'Jenis Pekerjaan', type: 'select', options: ['Struktur'], default: 'Struktur' },
            { id: 'materialPileCap', label: 'Material', type: 'select', options: ['Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-350' },
            { id: 'panjangPileCap', label: 'Panjang (m)', type: 'number', step: 0.001, default: 1.20 },
            { id: 'lebarPileCap', label: 'Lebar (m)', type: 'number', step: 0.001, default: 1.20 },
            { id: 'tinggiPileCap', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.80 },
            { id: 'jumlahPileCap', label: 'Jumlah', type: 'number', step: 1, default: 6 },
            { id: 'tulanganAtasPileCap', label: 'Tulangan Atas', type: 'number', step: 1, default: 6 },
            { id: 'tulanganBawahPileCap', label: 'Tulangan Bawah', type: 'number', step: 1, default: 6 },
            { id: 'beratJenisPileCap', label: 'Berat Jenis (kg/m)', type: 'number', step: 0.001, default: 1.58 },
            { id: 'jarakSengkangPileCap', label: 'Sengkang (cm)', type: 'number', step: 0.5, default: 15 }
        ],
        hitung: function(data) {
            const p = data.panjangPileCap || 0;
            const l = data.lebarPileCap || 0;
            const t = data.tinggiPileCap || 0;
            const jml = data.jumlahPileCap || 1;
            const tulAtas = data.tulanganAtasPileCap || 0;
            const tulBawah = data.tulanganBawahPileCap || 0;
            const berat = data.beratJenisPileCap || 1.58;
            const jarak = data.jarakSengkangPileCap || 15;

            const volume = p * l * t * jml;
            const totalTulangan = tulAtas + tulBawah;
            const beratBesi = (p * totalTulangan * berat + l * totalTulangan * berat) * jml;
            const jumlahSengkang = Math.floor(Math.max(p, l) / (jarak / 100)) * jml;
            const panjangSengkang = 2 * ((p - 0.08) + (l - 0.08)) + 0.1;
            const beratSengkang = jumlahSengkang * panjangSengkang * 0.617;
            const totalBeratBesi = beratBesi + beratSengkang;

            return { volume, totalBeratBesi, beratBesi, beratSengkang, jumlahSengkang };
        },
        display: function(item) {
            return {
                volume: item.volume || 0,
                unit: 'm³',
                detail: `
                    <span><i class="fas fa-chess-queen"></i> ${item.panjang.toFixed(2)}×${item.lebar.toFixed(2)}×${item.tinggi.toFixed(2)}</span>
                    <span><i class="fas fa-hashtag"></i> ${item.jumlah} bh</span>
                    <span><i class="fas fa-weight-hanging"></i> Besi: ${(item.totalBeratBesi || 0).toFixed(2)} kg</span>
                `
            };
        }
    },

    // ===== DINDING =====
    dinding: {
        nama: 'Dinding Core/Shear Wall',
        icon: 'fa-layer-group',
        warna: '#d97706',
        rumus: 'Volume = P × T × Tebal × Lantai | Besi Vertikal + Horizontal',
        fields: [
            { id: 'namaItemDinding', label: 'Nama Pekerjaan', type: 'text', default: 'Core Lift LT1' },
            { id: 'jenisPekerjaanDinding', label: 'Jenis Pekerjaan', type: 'select', options: ['Struktur'], default: 'Struktur' },
            { id: 'materialDinding', label: 'Material', type: 'select', options: ['Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-350' },
            { id: 'panjangDinding', label: 'Panjang (m)', type: 'number', step: 0.001, default: 8.00 },
            { id: 'tinggiDinding', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50 },
            { id: 'tebalDinding', label: 'Tebal (m)', type: 'number', step: 0.001, default: 0.25 },
            { id: 'tulanganVertikal', label: 'Tulangan Vertikal (mm)', type: 'number', step: 1, default: 12 },
            { id: 'tulanganHorizontal', label: 'Tulangan Horizontal (mm)', type: 'number', step: 1, default: 10 },
            { id: 'jarakTulanganDinding', label: 'Jarak Tulangan (cm)', type: 'number', step: 0.5, default: 15 },
            { id: 'beratJenisVertikal', label: 'Berat Jenis Vertikal (kg/m)', type: 'number', step: 0.001, default: 0.888 },
            { id: 'beratJenisHorizontal', label: 'Berat Jenis Horizontal (kg/m)', type: 'number', step: 0.001, default: 0.617 },
            { id: 'jumlahLantai', label: 'Jumlah Lantai', type: 'number', step: 1, default: 1 },
            { id: 'selimutDinding', label: 'Selimut Beton (cm)', type: 'number', step: 0.5, default: 4 }
        ],
        hitung: function(data) {
            const p = data.panjangDinding || 0;
            const t = data.tinggiDinding || 0;
            const tebal = data.tebalDinding || 0;
            const jmlLantai = data.jumlahLantai || 1;
            const jarak = data.jarakTulanganDinding || 15;
            const beratV = data.beratJenisVertikal || 0.888;
            const beratH = data.beratJenisHorizontal || 0.617;

            const volume = p * t * tebal * jmlLantai;
            const jarakM = jarak / 100;
            const jumlahVertikal = Math.floor(p / jarakM) + 1;
            const panjangVertikal = t * jmlLantai;
            const beratVertikal = jumlahVertikal * panjangVertikal * beratV;
            const jumlahHorizontal = Math.floor((t * jmlLantai) / jarakM) + 1;
            const panjangHorizontal = p;
            const beratHorizontal = jumlahHorizontal * panjangHorizontal * beratH;
            const totalBeratBesi = beratVertikal + beratHorizontal;

            return { volume, beratVertikal, beratHorizontal, totalBeratBesi };
        },
        display: function(item) {
            return {
                volume: item.volume || 0,
                unit: 'm³',
                detail: `
                    <span><i class="fas fa-layer-group"></i> ${item.panjang.toFixed(2)}×${item.tinggi.toFixed(2)}×${item.tebal.toFixed(2)}</span>
                    <span><i class="fas fa-weight-hanging"></i> Besi: ${(item.totalBeratBesi || 0).toFixed(2)} kg</span>
                `
            };
        }
    },

    // ===== PEMBESIAN =====
    pembesian: {
        nama: 'Pembesian',
        icon: 'fa-vector-square',
        warna: '#2563eb',
        rumus: 'Besi Utama = Panjang × Jumlah × Berat Jenis | Sengkang = Jumlah × Panjang × Berat Jenis',
        fields: [
            { id: 'namaItemBesi', label: 'Nama Pekerjaan', type: 'text', default: 'Tulangan Kolom K1' },
            { id: 'jenisPekerjaanBesi', label: 'Jenis Pekerjaan', type: 'select', options: ['Struktur'], default: 'Struktur' },
            { id: 'materialBesi', label: 'Material', type: 'select', options: ['Besi Tulangan D10', 'Besi Tulangan D13', 'Besi Tulangan D16', 'Besi Tulangan D19', 'Besi Tulangan D22', 'Besi Tulangan D25', 'Besi Tulangan D28', 'Besi Tulangan D32'], default: 'Besi Tulangan D16' },
            { id: 'panjangBesi', label: 'Panjang (m)', type: 'number', step: 0.001, default: 3.50 },
            { id: 'jumlahTulangan', label: 'Jumlah Tulangan', type: 'number', step: 1, default: 8 },
            { id: 'beratJenisUtama', label: 'Berat Jenis Utama (kg/m)', type: 'number', step: 0.001, default: 1.58 },
            { id: 'lebarSengkang', label: 'Lebar Kolom (m)', type: 'number', step: 0.001, default: 0.30 },
            { id: 'tinggiSengkang', label: 'Tinggi Kolom (m)', type: 'number', step: 0.001, default: 0.30 },
            { id: 'jarakSengkang', label: 'Jarak Sengkang (cm)', type: 'number', step: 0.5, default: 15 },
            { id: 'selimutBeton', label: 'Selimut Beton (cm)', type: 'number', step: 0.5, default: 4 },
            { id: 'beratJenisSengkang', label: 'Berat Jenis Sengkang (kg/m)', type: 'number', step: 0.001, default: 0.617 },
            { id: 'panjangKait', label: 'Panjang Kait (m)', type: 'number', step: 0.001, default: 0.10 }
        ],
        hitung: function(data) {
            const panjang = data.panjangBesi || 0;
            const jml = data.jumlahTulangan || 0;
            const beratUtama = data.beratJenisUtama || 1.58;
            const lebar = data.lebarSengkang || 0;
            const tinggi = data.tinggiSengkang || 0;
            const jarak = data.jarakSengkang || 15;
            const selimut = data.selimutBeton || 4;
            const beratSengkangM = data.beratJenisSengkang || 0.617;
            const kait = data.panjangKait || 0.10;

            const beratTulangan = panjang * jml * beratUtama;
            const selimutM = selimut / 100;
            const lebarS = lebar - 2 * selimutM;
            const tinggiS = tinggi - 2 * selimutM;
            const panjangSengkang = 2 * (lebarS + tinggiS) + 2 * kait;
            const jumlahSengkang = Math.floor(panjang / (jarak / 100)) + 1;
            const beratSengkang = jumlahSengkang * panjangSengkang * beratSengkangM;
            const totalBerat = beratTulangan + beratSengkang;

            return { beratTulangan, beratSengkang, totalBerat, jumlahSengkang, panjangSengkang };
        },
        display: function(item) {
            return {
                volume: item.totalBerat || 0,
                unit: 'kg',
                detail: `
                    <span><i class="fas fa-arrow-up"></i> Utama: ${(item.beratTulangan || 0).toFixed(2)} kg</span>
                    <span><i class="fas fa-vector-square"></i> Sengkang: ${(item.beratSengkang || 0).toFixed(2)} kg</span>
                `
            };
        }
    },

    // ===== KOLOM BULAT =====
    kolom_bulat: {
        nama: 'Kolom Bulat',
        icon: 'fa-circle',
        warna: '#7c3aed',
        rumus: 'Volume = π × r² × T | Besi Utama + Spiral',
        fields: [
            { id: 'namaItemKolomBulat', label: 'Nama Pekerjaan', type: 'text', default: 'Kolom Bulat D400' },
            { id: 'jenisPekerjaanKolomBulat', label: 'Jenis Pekerjaan', type: 'select', options: ['Struktur'], default: 'Struktur' },
            { id: 'materialKolomBulat', label: 'Material', type: 'select', options: ['Beton K-300', 'Beton K-350', 'Beton K-400'], default: 'Beton K-350' },
            { id: 'diameterKolom', label: 'Diameter (m)', type: 'number', step: 0.001, default: 0.40 },
            { id: 'tinggiKolomBulat', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50 },
            { id: 'selimutKolomBulat', label: 'Selimut Beton (cm)', type: 'number', step: 0.5, default: 4 },
            { id: 'jmlTulanganBulat', label: 'Jumlah Tulangan', type: 'number', step: 1, default: 10 },
            { id: 'beratJenisBulat', label: 'Berat Jenis (kg/m)', type: 'number', step: 0.001, default: 1.58 },
            { id: 'panjangTulanganBulat', label: 'Panjang Tulangan (m)', type: 'number', step: 0.001, default: 3.50 },
            { id: 'jarakSpiral', label: 'Jarak Spiral (cm)', type: 'number', step: 0.5, default: 10 },
            { id: 'beratJenisSpiral', label: 'Berat Jenis Spiral (kg/m)', type: 'number', step: 0.001, default: 0.617 },
            { id: 'panjangKaitSpiral', label: 'Panjang Kait (m)', type: 'number', step: 0.001, default: 0.10 }
        ],
        hitung: function(data) {
            const d = data.diameterKolom || 0;
            const t = data.tinggiKolomBulat || 0;
            const selimut = data.selimutKolomBulat || 4;
            const jml = data.jmlTulanganBulat || 0;
            const beratUtama = data.beratJenisBulat || 1.58;
            const panjangTul = data.panjangTulanganBulat || t;
            const jarakSp = data.jarakSpiral || 10;
            const beratSpiral = data.beratJenisSpiral || 0.617;
            const kaitSp = data.panjangKaitSpiral || 0.10;

            const r = d / 2;
            const volumeBeton = Math.PI * r * r * t;
            const beratTulangan = panjangTul * jml * beratUtama;
            const selimutM = selimut / 100;
            const dSpiral = d - 2 * selimutM;
            const kelilingSpiral = Math.PI * dSpiral;
            const jarakSpM = jarakSp / 100;
            const jumlahLilitan = Math.floor(t / jarakSpM) + 1;
            const panjangSpiralTotal = kelilingSpiral * jumlahLilitan + kaitSp * 2;
            const beratSpiralTotal = panjangSpiralTotal * beratSpiral;
            const totalBerat = beratTulangan + beratSpiralTotal;

            return { volumeBeton, beratTulangan, beratSpiral: beratSpiralTotal, totalBerat, diameterSpiral: dSpiral, panjangSpiralTotal, jumlahLilitan };
        },
        display: function(item) {
            return {
                volume: item.totalBerat || 0,
                unit: 'kg',
                detail: `
                    <span><i class="fas fa-circle"></i> D${(item.diameter * 100).toFixed(0)}</span>
                    <span><i class="fas fa-arrow-up"></i> Utama: ${(item.beratTulangan || 0).toFixed(2)} kg</span>
                    <span><i class="fas fa-spiral"></i> Spiral: ${(item.beratSpiral || 0).toFixed(2)} kg</span>
                `
            };
        }
    },

    // ===== BEKISTING =====
    bekisting: {
        nama: 'Bekisting',
        icon: 'fa-border-all',
        warna: '#0891b2',
        rumus: 'Luas = (P×T + L×T) × (Sisi/2)',
        fields: [
            { id: 'namaItemBekisting', label: 'Nama Pekerjaan', type: 'text', default: 'Bekisting Kolom K1' },
            { id: 'jenisPekerjaanBekisting', label: 'Jenis Pekerjaan', type: 'select', options: ['Struktur', 'Arsitektur'], default: 'Struktur' },
            { id: 'materialBekisting', label: 'Material', type: 'select', options: ['Kayu Meranti', 'Kayu Kamper', 'Kayu Jati', 'Multiplek 12mm', 'Multiplek 15mm'], default: 'Kayu Kamper' },
            { id: 'panjangBekisting', label: 'Panjang (m)', type: 'number', step: 0.001, default: 0.30 },
            { id: 'lebarBekisting', label: 'Lebar (m)', type: 'number', step: 0.001, default: 0.30 },
            { id: 'tinggiBekisting', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 3.50 },
            { id: 'jumlahSisi', label: 'Jumlah Sisi', type: 'select', options: ['1 Sisi (Pelat)', '2 Sisi (Dinding)', '3 Sisi (Balok)', '4 Sisi (Kolom)'], default: '4' }
        ],
        hitung: function(data) {
            const p = data.panjangBekisting || 0;
            const l = data.lebarBekisting || 0;
            const t = data.tinggiBekisting || 0;
            const sisi = parseInt(data.jumlahSisi) || 4;
            const totalLuas = (p * t + l * t) * (sisi / 2);
            return { totalLuas };
        },
        display: function(item) {
            return {
                volume: item.totalLuas || 0,
                unit: 'm²',
                detail: `
                    <span><i class="fas fa-border-all"></i> ${item.jumlahSisi} sisi</span>
                    <span><i class="fas fa-arrows-alt-h"></i> ${item.panjang.toFixed(2)}×${item.tinggi.toFixed(2)}</span>
                `
            };
        }
    },

    // ===== PONDASI =====
    pondasi: {
        nama: 'Pondasi',
        icon: 'fa-chess-queen',
        warna: '#b45309',
        rumus: 'Volume = ((LA+LB)/2) × T × P',
        fields: [
            { id: 'namaItemPondasi', label: 'Nama Pekerjaan', type: 'text', default: 'Pondasi Batu Belah' },
            { id: 'jenisPekerjaanPondasi', label: 'Jenis Pekerjaan', type: 'select', options: ['Struktur'], default: 'Struktur' },
            { id: 'materialPondasi', label: 'Material', type: 'select', options: ['Batu Belah', 'Batu Kali', 'Batu Gunung'], default: 'Batu Belah' },
            { id: 'panjangPondasi', label: 'Panjang (m)', type: 'number', step: 0.001, default: 10.00 },
            { id: 'lebarAtasPondasi', label: 'Lebar Atas (m)', type: 'number', step: 0.001, default: 0.30 },
            { id: 'lebarBawahPondasi', label: 'Lebar Bawah (m)', type: 'number', step: 0.001, default: 0.60 },
            { id: 'tinggiPondasi', label: 'Tinggi (m)', type: 'number', step: 0.001, default: 0.80 },
            { id: 'persenBatu', label: 'Persentase Batu (%)', type: 'number', step: 1, default: 70 },
            { id: 'persenPasir', label: 'Persentase Pasir (%)', type: 'number', step: 1, default: 20 },
            { id: 'persenSemen', label: 'Persentase Semen (%)', type: 'number', step: 1, default: 10 }
        ],
        hitung: function(data) {
            const p = data.panjangPondasi || 0;
            const la = data.lebarAtasPondasi || 0;
            const lb = data.lebarBawahPondasi || 0;
            const t = data.tinggiPondasi || 0;
            const pb = data.persenBatu || 70;
            const pp = data.persenPasir || 20;
            const ps = data.persenSemen || 10;

            const rataLebar = (la + lb) / 2;
            const volumeTotal = rataLebar * t * p;
            const volumeBatu = volumeTotal * (pb / 100);
            const volumePasir = volumeTotal * (pp / 100);
            const volumeSemen = volumeTotal * (ps / 100);

            return { volumeTotal, volumeBatu, volumePasir, volumeSemen };
        },
        display: function(item) {
            return {
                volume: item.volumeTotal || 0,
                unit: 'm³',
                detail: `
                    <span><i class="fas fa-chess-queen"></i> ${item.panjang.toFixed(2)}m</span>
                    <span><i class="fas fa-percent"></i> Batu ${item.persenBatu}%</span>
                `
            };
        }
    }
};

// ============================================
// EKSPOR UNTUK DIGUNAKAN DI FILE UTAMA
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QSE_RUMUS;
             }
