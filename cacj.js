document.addEventListener("DOMContentLoaded", () => {
  /* SPLASH OVERLAY */
  const splashBtn = document.getElementById("splash-btn");
  splashBtn.addEventListener("click", () => {
    document.getElementById("splash-overlay").style.display = "none";
  });

  /* CHUYỂN TAB */
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabContents.forEach(tab => tab.style.display = "none");
      tabButtons.forEach(b => b.classList.remove("active"));

      const targetId = btn.dataset.tab;
      document.getElementById(targetId).style.display = "block";
      btn.classList.add("active");
    });
  });
  document.getElementById("fruits").style.display = "block";

  /* DỮ LIỆU TÊN VẬT PHẨM (CÀI ĐẶT) */
  let savedData = {
    fruits: [],
    account: [],
    gamepass: []
  };

  const savedJSON = localStorage.getItem("savedData");
  if (savedJSON) {
    savedData = JSON.parse(savedJSON);
  }

  function updateDropdowns() {
    // Fruits
    const fruitSelect = document.getElementById("fruit-name");
    fruitSelect.innerHTML = "";
    savedData.fruits.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.textContent = item;
      fruitSelect.appendChild(opt);
    });
    // Account
    const accountSelect = document.getElementById("account-name");
    accountSelect.innerHTML = "";
    savedData.account.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.textContent = item;
      accountSelect.appendChild(opt);
    });
    // Gamepass
    const gpSelect = document.getElementById("gamepass-name");
    gpSelect.innerHTML = "";
    savedData.gamepass.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.textContent = item;
      gpSelect.appendChild(opt);
    });
  }

  function updateSavedItemsUI() {
    const ul = document.getElementById("saved-items");
    ul.innerHTML = "";
    Object.keys(savedData).forEach(type => {
      savedData[type].forEach(item => {
        const li = document.createElement("li");
        li.textContent = `[${type}] ${item}`;
        ul.appendChild(li);
      });
    });
  }

  updateDropdowns();
  updateSavedItemsUI();

  document.getElementById("save-item").addEventListener("click", () => {
    const type = document.getElementById("save-type").value;
    const name = document.getElementById("new-item-name").value.trim();
    if (!name) {
      alert("Vui lòng nhập tên vật phẩm!");
      return;
    }
    if (!savedData[type].includes(name)) {
      savedData[type].push(name);
      localStorage.setItem("savedData", JSON.stringify(savedData));
      updateDropdowns();
      updateSavedItemsUI();
      document.getElementById("new-item-name").value = "";
    } else {
      alert("Vật phẩm này đã tồn tại!");
    }
  });

  /* AUTO FORMAT (THÊM DẤU PHẨY) KHI NHẬP SỐ */
  [
    "fruit-buy","fruit-sell","fruit-qty",
    "account-buy","account-sell","account-qty",
    "gamepass-buy","gamepass-sell","gamepass-qty",
    "fruits-stock-qty","fruits-stock-buy",
    "account-stock-qty","account-stock-buy"
  ].forEach(id => {
    let el = document.getElementById(id);
    el.addEventListener("input", autoFormatVN);
  });

  function autoFormatVN(e) {
    let val = e.target.value.replace(/\D/g, '');
    if (!val) {
      e.target.value = "";
      return;
    }
    e.target.value = Number(val).toLocaleString('vi-VN');
  }

  function parseVN(str) {
    if (!str) return 0;
    return parseInt(str.replace(/\./g, '')) || 0;
  }

  function formatVN(num) {
    return num.toLocaleString("vi-VN");
  }

  /* THÊM DỮ LIỆU (FRUITS, ACCOUNT, GAMEPASS) */
  document.getElementById("fruit-add").addEventListener("click", () => addItem("fruit"));
  document.getElementById("account-add").addEventListener("click", () => addItem("account"));
  document.getElementById("gamepass-add").addEventListener("click", () => addItem("gamepass"));

  function addItem(prefix) {
    const name = document.getElementById(`${prefix}-name`).value;
    const buy = parseVN(document.getElementById(`${prefix}-buy`).value);
    const sell = parseVN(document.getElementById(`${prefix}-sell`).value);
    const qty = parseVN(document.getElementById(`${prefix}-qty`).value);

    if (!name || !buy || !sell || !qty) {
      alert("Vui lòng nhập đủ thông tin!");
      return;
    }

    const profit = (sell - buy) * qty;
    const table = document.getElementById(`${prefix}-table`);
    table.classList.remove("hidden");
    const tbody = table.querySelector("tbody");

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${name}</td>
      <td>${formatVN(buy)}</td>
      <td>${formatVN(sell)}</td>
      <td>${formatVN(qty)}</td>
      <td>${formatVN(profit)}</td>
      <td class="action-cell">
        <button class="btn-delete"><i class="fa fa-times"></i></button>
        <button class="btn-edit"><i class="fa fa-edit"></i></button>
        <button class="btn-refresh"><i class="fa fa-sync-alt"></i></button>
      </td>
    `;
    tbody.appendChild(row);

    updateTotalProfit(prefix);
  }

  function updateTotalProfit(prefix) {
    const table = document.getElementById(`${prefix}-table`);
    const rows = table.querySelectorAll("tbody tr");
    let sum = 0;
    rows.forEach(r => {
      const profitCell = r.cells[4].textContent.replace(/\./g, '');
      sum += parseInt(profitCell) || 0;
    });
    document.getElementById(`${prefix}-total`).textContent = `Tổng Tiền Lời: ${formatVN(sum)}`;
  }

  /* 3 NÚT: X (3 lần xóa), > (Sửa), O (Làm Mới) */
  document.addEventListener("click", e => {
    // NÚT X => 3 lần xóa
    if (e.target.classList.contains("btn-delete") || e.target.closest(".btn-delete")) {
      let btn = e.target.classList.contains("btn-delete") ? e.target : e.target.closest(".btn-delete");
      let count = parseInt(btn.dataset.clickCount) || 0;
      count++;
      btn.dataset.clickCount = count;

      if (count === 1) {
        // Lần 1 => vàng
        btn.style.backgroundColor = "yellow";
        btn.style.color = "black";
      } else if (count === 2) {
        // Lần 2 => đỏ
        btn.style.backgroundColor = "red";
        btn.style.color = "white";
      } else if (count === 3) {
        // Lần 3 => xóa dòng
        const tr = btn.closest("tr");
        const tableId = tr.closest("table").id;
        const prefix = tableId.split("-")[0];
        tr.remove();
        updateTotalProfit(prefix);
      }
    }

    // NÚT > => Sửa
    if (e.target.classList.contains("btn-edit") || e.target.closest(".btn-edit")) {
      let btn = e.target.classList.contains("btn-edit") ? e.target : e.target.closest(".btn-edit");
      let tr = btn.closest("tr");

      // Nếu đang editing => Lưu
      if (tr.classList.contains("editing")) {
        const buyInput = tr.querySelector(".buy-input");
        const sellInput = tr.querySelector(".sell-input");
        const qtyInput = tr.querySelector(".qty-input");

        const buyVal = parseVN(buyInput.value);
        const sellVal = parseVN(sellInput.value);
        const qtyVal = parseVN(qtyInput.value);

        if (!buyVal || !sellVal || !qtyVal) {
          alert("Thông tin không hợp lệ!");
          return;
        }

        tr.cells[1].textContent = formatVN(buyVal);
        tr.cells[2].textContent = formatVN(sellVal);
        tr.cells[3].textContent = formatVN(qtyVal);

        let profit = (sellVal - buyVal) * qtyVal;
        tr.cells[4].textContent = formatVN(profit);

        btn.innerHTML = `<i class="fa fa-edit"></i>`;
        tr.classList.remove("editing");

        const tableId = tr.closest("table").id;
        const prefix = tableId.split("-")[0];
        updateTotalProfit(prefix);
      } else {
        // Bấm '>' => chuyển sang "L"
        tr.classList.add("editing");
        btn.innerHTML = "L";

        let buyOld = parseVN(tr.cells[1].textContent);
        let sellOld = parseVN(tr.cells[2].textContent);
        let qtyOld = parseVN(tr.cells[3].textContent);

        tr.cells[1].innerHTML = `<input class="buy-input" value="${formatVN(buyOld)}">`;
        tr.cells[2].innerHTML = `<input class="sell-input" value="${formatVN(sellOld)}">`;
        tr.cells[3].innerHTML = `<input class="qty-input" value="${formatVN(qtyOld)}">`;
      }
    }

    // NÚT O => làm mới nút X
    if (e.target.classList.contains("btn-refresh") || e.target.closest(".btn-refresh")) {
      let btn = e.target.classList.contains("btn-refresh") ? e.target : e.target.closest(".btn-refresh");
      const td = btn.closest("td");
      const xBtn = td.querySelector(".btn-delete");
      if (xBtn) {
        xBtn.dataset.clickCount = 0;
        xBtn.style.backgroundColor = "";
        xBtn.style.color = "#ffd700";
      }
    }
  });

  /* FRUITS HIỆN CÓ */
  document.getElementById("fruits-stock-add").addEventListener("click", () => {
    const name = document.getElementById("fruits-stock-name").value.trim();
    const qty = parseVN(document.getElementById("fruits-stock-qty").value);
    const buy = parseVN(document.getElementById("fruits-stock-buy").value);
    if (!name || !qty || !buy) {
      alert("Vui lòng nhập đủ thông tin!");
      return;
    }
    const table = document.getElementById("fruits-stock-table");
    table.classList.remove("hidden");
    const tbody = table.querySelector("tbody");

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${name}</td>
      <td>${formatVN(qty)}</td>
      <td>${formatVN(buy)}</td>
      <td class="action-cell">
        <button class="btn-delete"><i class="fa fa-times"></i></button>
        <button class="btn-edit"><i class="fa fa-edit"></i></button>
        <button class="btn-refresh"><i class="fa fa-sync-alt"></i></button>
      </td>
    `;
    tbody.appendChild(row);

    // Reset
    document.getElementById("fruits-stock-name").value = "";
    document.getElementById("fruits-stock-qty").value = "";
    document.getElementById("fruits-stock-buy").value = "";
  });

  /* ACCOUNT HIỆN CÓ */
  document.getElementById("account-stock-add").addEventListener("click", () => {
    const name = document.getElementById("account-stock-name").value.trim();
    const qty = parseVN(document.getElementById("account-stock-qty").value);
    const buy = parseVN(document.getElementById("account-stock-buy").value);
    if (!name || !qty || !buy) {
      alert("Vui lòng nhập đủ thông tin!");
      return;
    }
    const table = document.getElementById("account-stock-table");
    table.classList.remove("hidden");
    const tbody = table.querySelector("tbody");

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${name}</td>
      <td>${formatVN(qty)}</td>
      <td>${formatVN(buy)}</td>
      <td class="action-cell">
        <button class="btn-delete"><i class="fa fa-times"></i></button>
        <button class="btn-edit"><i class="fa fa-edit"></i></button>
        <button class="btn-refresh"><i class="fa fa-sync-alt"></i></button>
      </td>
    `;
    tbody.appendChild(row);

    // Reset
    document.getElementById("account-stock-name").value = "";
    document.getElementById("account-stock-qty").value = "";
    document.getElementById("account-stock-buy").value = "";
  });
});
