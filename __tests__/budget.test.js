// __tests__/budget.test.js

function buildDOM() {
  document.body.innerHTML = `
    <div class="balance">
      <div class="value"><small>$</small>0</div>
    </div>

    <div class="income-total"><small>$</small>0</div>
    <div class="outcome-total"><small>$</small>0</div>

    <div class="first-tab">Expenses</div>
    <div class="second-tab">Income</div>
    <div class="third-tab focus">All</div>

    <div id="expense" class="hide">
      <ul class="list"></ul>
      <input id="expense-title-input" />
      <input id="expense-amount-input" />
      <div class="add-expense"></div>
    </div>

    <div id="income" class="hide">
      <ul class="list"></ul>
      <input id="income-title-input" />
      <input id="income-amount-input" />
      <div class="add-income"></div>
    </div>

    <div id="all">
      <ul class="list"></ul>
    </div>
  `;
}

function bootstrapApp(initialEntries = []) {
  jest.resetModules();
  buildDOM();

  localStorage.clear();
  localStorage.setItem("entry_list", JSON.stringify(initialEntries));

  // budget.js 里会直接调用全局 updateChart()
  global.updateChart = jest.fn();

  // 每个测试都重新加载一次有副作用的脚本
  jest.isolateModules(() => {
    require("../budget.js");
  });
}

test("adds an income entry and updates totals", () => {
  bootstrapApp();

  document.getElementById("income-title-input").value = "Salary";
  document.getElementById("income-amount-input").value = "2000";
  document.querySelector(".add-income").click();

  expect(document.querySelector(".income-total").textContent).toContain("2000");
  expect(document.querySelector(".balance .value").textContent).toContain("2000");
  expect(document.querySelector("#income .list").textContent).toContain("Salary");
  expect(document.querySelector("#all .list").textContent).toContain("Salary");
  expect(global.updateChart).toHaveBeenLastCalledWith(2000, 0);
});

test("does not add an expense when a field is empty", () => {
  bootstrapApp();

  document.getElementById("expense-title-input").value = "";
  document.getElementById("expense-amount-input").value = "50";
  document.querySelector(".add-expense").click();

  expect(document.querySelector("#expense .list").children.length).toBe(0);
  expect(document.querySelector(".outcome-total").textContent).toContain("0");
  expect(global.updateChart).toHaveBeenCalledTimes(1); // 只有初始化那次
});

test("switches to income tab and hides the other sections", () => {
  bootstrapApp();

  document.querySelector(".second-tab").click();

  expect(document.getElementById("income").classList.contains("hide")).toBe(false);
  expect(document.getElementById("expense").classList.contains("hide")).toBe(true);
  expect(document.getElementById("all").classList.contains("hide")).toBe(true);
  expect(document.querySelector(".second-tab").classList.contains("focus")).toBe(true);
});

test("renders saved entries from localStorage on startup", () => {
  bootstrapApp([{ type: "income", title: "Freelance", amount: 800 }]);

  expect(document.querySelector(".income-total").textContent).toContain("800");
  expect(document.querySelector(".balance .value").textContent).toContain("800");
  expect(document.querySelector("#income .list").textContent).toContain("Freelance");
  expect(document.querySelector("#all .list").textContent).toContain("Freelance");
});