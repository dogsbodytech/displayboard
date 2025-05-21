
function fetchDataWithHeader(url, callback) {
  fetch(url)
    .then(response => {
      const dataSource = response.headers.get('X-Data-Source');
      return response.json().then(data => ({ data, dataSource }));
    })
    .then(result => callback(result.data, result.dataSource))
    .catch(err => {
      console.error(`Error fetching ${url}:`, err);
    });
}

function updateSectionHeader(selector, title, dataSource) {
  const header = document.querySelector(selector);
  if (header) {
    header.textContent = title;
    if (dataSource && dataSource !== "Live") {
      header.textContent += ` (${dataSource})`;
    }
  }
}

function clearAndRenderTable(containerId, rowDataArray) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  rowDataArray.forEach(row => {
    const tr = document.createElement("tr");
    tr.className = `row-${row.status}`;
    tr.innerHTML = row.html;
    container.appendChild(tr);
  });
}

