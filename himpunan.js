$(document).ready(function () {
  let daftarHimpunan = [];
  let mode = "manual";
  let operasiTerpilih = null;
  let filter = "semua";

  // Event klik tombol
  $(document).on("change", ".select-filter", function () {
    filter = $(this).find("option:selected").data("filter");
    renderTable();
  });

  // ====== TEMPLATE FORM ======
  function getFormManual() {
    return `
      <form id="formHimpunan">
        <div class="card-body">
          <div class="form-group">
            <label for="nama">Nama Himpunan</label>
            <input type="text" class="form-control" id="nama" placeholder="Masukkan nama" required />
          </div>

          <div class="form-group">
            <label for="keterangan">Notasi</label>
            <input type="text" class="form-control" id="keterangan" placeholder="Notasi" required />
          </div>

          <div class="form-group">
            <label>Elemen</label>
            <div id="elemen-container">
              <div class="input-group mb-2 elemen-item">
                <input type="text" class="form-control" placeholder="Elemen 1" required />
                <div class="input-group-append">
                  <button type="button" class="btn btn-danger btn-delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            <button type="button" id="add-element" class="btn btn-block btn-success btn-xs">+</button>
          </div>
        </div>
        <div class="card-footer">
          <button type="submit" class="btn btn-primary">Submit</button>
        </div>
      </form>
    `;
  }

  function getFormOperasi() {
    return `
      <form id="formHimpunan">
        <div class="card-body">
          <div class="form-group">
            <label for="nama">Nama Himpunan Baru</label>
            <input type="text" class="form-control" id="nama" placeholder="Masukkan nama" required />
          </div>
          <div class="form-group">
            <div id="elemen-container">
              <label for="nama">Himpunan Pertama</label>
              <div class="input-group mb-2 elemen-item">
              <select class="form-control select-himpunan"></select>
              </div>
              <label for="nama">Himpunan Kedua</label>
              <div class="input-group mb-2 elemen-item">
              <select class="form-control select-himpunan"></select>
              </div>
              <label for="nama">Operasi Himpunan</label>
              ${getOperationBlock()}
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button type="submit" class="btn btn-primary">Submit</button>
        </div>
      </form>
    `;
  }

  // ====== TEMPLATE BLOK OPERASI ======
  function getOperationBlock() {
    return `
        <div class="input-group mb-2 elemen-item">
          <select class="form-control select-operasi">
              <option class="btn-op" data-op="∩"><i class="fas">⋂</i> Irisan</option>
              <option class="btn-op" data-op="∪"><i class="fas">⋃</i> Gabungan</option>
              <option class="btn-op" data-op="-"><i class="fas">—</i> Selisih</option>
              <option class="btn-op" data-op="C"><i class="fas">C</i> Komplemen</option>
              <option class="btn-op" data-op="⊕"><i class="fas">⊕</i> BedaTangkup</option>
              <option class="btn-op" data-op="×"><i class="fas">×</i> Kartesian</option>
          </select>
        </div>
    `;
  }

  // ====== TOGGLE MODE FORM ======
  $("#ganti").on("click", function () {
    const card = $(".card.card-primary");
    const currentForm = card.find("#formHimpunan");

    if (mode === "manual") {
      currentForm.replaceWith(getFormOperasi());
      mode = "operasi";
      refreshSelectOptions();
    } else {
      currentForm.replaceWith(getFormManual());
      mode = "manual";
    }
  });

  // ====== TAMBAH INPUT BARU (MANUAL MODE) ======
  $(document).on("click", "#add-element", function () {
    const count = $("#elemen-container .elemen-item").length + 1;
    const newInput = `
      <div class="input-group mb-2 elemen-item">
        <input type="text" class="form-control" placeholder="Elemen ${count}" />
        <div class="input-group-append">
          <button type="button" class="btn btn-danger btn-delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>`;
    $("#elemen-container").append(newInput);
  });

  // ====== HAPUS INPUT / BLOK OPERASI ======
  $(document).on("click", ".btn-delete", function () {
    const block = $(this).closest(".operation-block");
    if (mode === "operasi" && block.length) {
      block.remove();
    } else {
      $(this).closest(".elemen-item").remove();
    }
  });

  // ====== SUBMIT FORM ======
  $(document).on("submit", "#formHimpunan", function (e) {
    e.preventDefault();

    if (mode === "manual") {
      const nama = $("#nama").val().trim();
      const keterangan = $("#keterangan").val().trim();
      const elemen = [];

      $("#elemen-container .elemen-item input").each(function () {
        const val = $(this).val().trim();
        if (val) elemen.push(val);
      });

      if (!nama || !keterangan === 0) {
        alert("Isi semua field sebelum submit!");
        return;
      }

      daftarHimpunan.push({
        nama,
        keterangan,
        jumlahHimpunan: 1,
        kardinalitas: elemen.length,
        elemen,
      });

      renderTable();
      resetForm();
      refreshSelectOptions();
    } else if (mode === "operasi") {
      const selects = $(".select-himpunan");
      if (selects.length < 2) {
        alert("Pilih minimal dua himpunan untuk operasi!");
        return;
      }

      const nama1 = $(selects[0]).val();
      const nama2 = $(selects[1]).val();
      operasiTerpilih = $(".select-operasi option:selected").data("op");
      const himp1 = daftarHimpunan.find((h) => h.nama === nama1);
      const himp2 = daftarHimpunan.find((h) => h.nama === nama2);

      if (!himp1 || !himp2) {
        alert("Himpunan tidak ditemukan!");
        return;
      }

      if (!operasiTerpilih) {
        alert("Pilih jenis operasi terlebih dahulu!");
        return;
      }

      let hasil = [];
      switch (operasiTerpilih) {
        case "∩":
          hasil = himp1.elemen.filter((e) => himp2.elemen.includes(e));
          break;
        case "∪":
          hasil = [...new Set([...himp1.elemen, ...himp2.elemen])];
          break;
        case "-":
          hasil = himp1.elemen.filter((e) => !himp2.elemen.includes(e));
          break;
        case "⊕":
          hasil = [
            ...himp1.elemen.filter((e) => !himp2.elemen.includes(e)),
            ...himp2.elemen.filter((e) => !himp1.elemen.includes(e)),
          ];
          break;
        case "C":
          alert("Operasi komplemen butuh himpunan semesta (belum diatur).");
          return;
        case "×":
          hasil = [];
          for (let a of himp1.elemen) {
            for (let b of himp2.elemen) {
              hasil.push(`(${a}, ${b})`);
            }
          }
          break;
      }

      const namaBaru = $("#nama").val().trim();
      const ketBaru = `${getKeteranganOperasi(operasiTerpilih, nama1, nama2)}`;
      let jumlah = himp1.jumlahHimpunan + 1;

      daftarHimpunan.push({
        nama: namaBaru,
        keterangan: ketBaru,
        jumlahHimpunan: jumlah,
        kardinalitas: hasil.length,
        elemen: hasil,
      });

      renderTable();
      refreshSelectOptions();
      alert(`Himpunan baru "${namaBaru}" berhasil dibuat!`);
    }
  });

  // ====== GET KETERANGAN OPERASI ======
  function getKeteranganOperasi(op, nama1, nama2) {
    switch (op) {
      case "∩":
        return `x Є ${nama1} dan x Є ${nama2}`;
      case "∪":
        return `x Є ${nama1} atau x Є ${nama2}`;
      case "-":
        return `x Є ${nama1} dan x ∉ ${nama2}`;
      case "⊕":
        return `(${nama1} U ${nama2}) – (${nama1} ∩ ${nama2})=`;
      case "C":
        return `Є U dan x ∉ ${nama1} dan x ∉ ${nama2}`;
      case "×":
        return `(${nama1}, ${nama2})| ${nama1} Є A dan ${nama2} Є B`;
      default:
        return "";
    }
  }

  // ====== REFRESH OPSI SELECT ======
  function refreshSelectOptions() {
    $(".select-himpunan").each(function () {
      const select = $(this);
      select.empty();
      if (daftarHimpunan.length === 0) {
        select.append(`<option disabled selected>Tidak ada himpunan</option>`);
      } else {
        daftarHimpunan.forEach((h) => {
          select.append(`<option>${h.nama}</option>`);
        });
      }
    });
  }

  // ====== RENDER TABEL ======
  function renderTable() {
    const tbody = $("table tbody");
    tbody.empty();
    let rows = [];

    if (filter === "lepas") {
      // Buat semua pasangan unik dari himpunan
      for (let i = 0; i < daftarHimpunan.length; i++) {
        for (let j = i + 1; j < daftarHimpunan.length; j++) {
          const himp1 = daftarHimpunan[i];
          const himp2 = daftarHimpunan[j];

          // Cek irisan elemen
          const irisan = himp1.elemen.filter((e) => himp2.elemen.includes(e));

          // Jika tidak ada elemen yang sama, tambahkan pasangan ke rows
          if (irisan.length === 0) {
            rows.push([himp1, himp2]); // simpan sebagai pasangan [a, b]
          }
        }
      }

      // ====== RENDER TABEL ======
      let toggleColor = true; // true = putih, false = abu-abu
      tbody.empty();

      rows.forEach((pair, pairIndex) => {
        const bgColor = toggleColor ? "white" : "#f0f0f0";

        pair.forEach((item, index) => {
          const elemenStr = JSON.stringify(item.elemen);
          const row = `
        <tr style="background-color: ${bgColor}">
          <td>${pairIndex * 2 + index + 1}.</td>
          <td>${item.nama}</td>
          <td>${item.keterangan}</td>
          <td>${item.kardinalitas}</td>
          <td class="text-right py-0 align-middle">
            <div class="btn-group btn-group-sm">
              <a href="#" class="btn btn-info btn-detail"
                data-nama="${item.nama}"
                data-keterangan="${item.keterangan}"
                data-kardinalitas="${item.kardinalitas}"
                data-elemen='${elemenStr}'>
                <i class="fas fa-eye"></i>
              </a>
              <a href="#" class="btn btn-warning btn-kuasa"
                data-nama="${item.nama}"
                data-keterangan="${item.keterangan}"
                data-kardinalitas="${item.kardinalitas}"
                data-elemen='${elemenStr}'>
                <i class="fas fa-pen"></i>
              </a>
              <a href="#" class="btn btn-danger btn-hapus" data-index="${index}">
                <i class="fas fa-trash"></i>
              </a>
            </div>
          </td>
        </tr>`;
          tbody.append(row);
        });

        // Setelah dua kolom (satu pasangan), ganti warna
        toggleColor = !toggleColor;
      });
    } else {
      // ====== FILTER DAFTAR HIMPUNAN ======
      let filteredHimpunan = daftarHimpunan.slice(); // copy array

      // Jika mau filter khusus (misal "kosong")
      if (filter === "kosong") {
        filteredHimpunan = filteredHimpunan.filter(
          (item) => item.elemen.length === 0
        );
      }
      if (filter === "kuasa") {
        filteredHimpunan = filteredHimpunan.filter((item) =>
          item.nama.includes("(Himpunan Kuasa)")
        );
      }

      // ====== URUTKAN BERDASARKAN KARDINALITAS DESC ======
      if (filter === "ekuivalen") {
        filteredHimpunan.sort((a, b) => b.kardinalitas - a.kardinalitas);
      }

      // ====== TANDAI LEVEL KARDINALITAS UNTUK WARNA ======
      let previousKardinal = null;
      let toggleColor = true; // true = putih, false = abu-abu

      filteredHimpunan.forEach((item, index) => {
        if (previousKardinal !== item.kardinalitas && filter === "ekuivalen") {
          toggleColor = !toggleColor; // ganti warna setiap level baru
          previousKardinal = item.kardinalitas;
        }

        const elemenStr = JSON.stringify(item.elemen);
        const bgColor = toggleColor ? "white" : "#f0f0f0"; // selang-seling
        const row = `
      <tr style="background-color: ${bgColor}">
        <td>${index + 1}.</td>
        <td>${item.nama}</td>
        <td>${item.keterangan}</td>
        <td>${item.kardinalitas}</td>
        <td class="text-right py-0 align-middle">
          <div class="btn-group btn-group-sm">
            <a href="#" class="btn btn-info btn-detail"
              data-nama="${item.nama}"
              data-keterangan="${item.keterangan}"
              data-kardinalitas="${item.kardinalitas}"
              data-elemen='${elemenStr}'>
              <i class="fas fa-eye"></i>
            </a>
              <a href="#" class="btn btn-warning btn-kuasa"
              data-nama="${item.nama}"
              data-keterangan="${item.keterangan}"
              data-kardinalitas="${item.kardinalitas}"
              data-elemen='${elemenStr}'>
              <i class="fas fa-pen"></i>
            </a>
            <a href="#" class="btn btn-danger btn-hapus" data-index="${index}">
              <i class="fas fa-trash"></i>
            </a>
          </div>
        </td>
      </tr>`;
        tbody.append(row);
      });
    }
  }

  // ====== HAPUS DARI TABEL ======
  $(document).on("click", ".btn-hapus", function (e) {
    e.preventDefault();
    const index = $(this).data("index");
    if (confirm("Hapus himpunan ini?")) {
      daftarHimpunan.splice(index, 1);
      renderTable();
      refreshSelectOptions();
    }
  });
  // ====== BUAT KUASA ======
  $(document).on("click", ".btn-kuasa", function (e) {
    e.preventDefault();
    const nama = $(this).data("nama") + " (Himpunan Kuasa)";
    const ket = "P(A) atau 2^A";
    let elemenList = [];

    // Ambil data elemen dari atribut
    try {
      elemenList = JSON.parse($(this).attr("data-elemen"));
    } catch (err) {
      elemenList = [$(this).attr("data-elemen")];
    }

    // ====== PROSES PEMBENTUKAN HIMPUNAN KUASA ======
    const elemenKuasa = [[]]; // mulai dengan himpunan kosong

    for (let i = 0; i < elemenList.length; i++) {
      const item = elemenList[i];
      const subsetBaru = elemenKuasa.map((subset) => [...subset, item]);
      elemenKuasa.push(...subsetBaru);
    }

    // Kardinalitas Kuasa
    const kar = elemenKuasa.length;

    // Tambahkan ke daftar himpunan baru
    daftarHimpunan.push({
      nama: nama,
      keterangan: ket,
      jumlahHimpunan: 1,
      kardinalitas: kar,
      elemen: elemenKuasa,
    });

    renderTable();
  });

  // ====== MODAL DETAIL ======
  $(document).on("click", ".btn-detail", function (e) {
    e.preventDefault();
    const nama = $(this).data("nama");
    const ket = $(this).data("keterangan");
    const kar = $(this).data("kardinalitas");
    let elemenList = [];

    try {
      elemenList = JSON.parse($(this).attr("data-elemen"));
    } catch (err) {
      elemenList = [$(this).attr("data-elemen")];
    }

    $("#detailNama").text(nama);
    $("#detailKeterangan").text(ket);
    $("#kardinalitas").text(kar);
    $("#detailElemen").empty();

    elemenList.forEach((el) => {
      $("#detailElemen").append(`<li class="list-group-item">${el}</li>`);
    });

    $("#modalHimpunan").modal("show");
  });

  function resetForm() {
    $("#formHimpunan")[0].reset();
    $("#elemen-container").html(`
          <div class="input-group mb-2 elemen-item">
            <input type="text" class="form-control" placeholder="Elemen 1" required />
            <div class="input-group-append">
              <button type="button" class="btn btn-danger btn-delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `);
  }
});
