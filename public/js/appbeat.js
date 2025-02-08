/*
 * Description: Display the JSON provided by the proxy in the way that we want.
 */

const APPBEAT_URL = "/php/appbeatproxy.php";

const statusMapping = {
  "Good": "green",
  "SystemTimeout": "red",
  "UserTimeout": "red",
  "Undefined": "red",
  "Error": "red",
  "RuleMismatch": "red",
  null: "blue",
};

function fetchAndRenderAppBeatData() {
  fetch(APPBEAT_URL)
    .then((response) => {
    const dataSource = response.headers.get('X-Data-Source');
    return response.json().then((data) => ({ data, dataSource }));
    })
    .then(({ data, dataSource }) => {
      // Select the specific <h1> inside .section-appbeat
      const header = document.querySelector('.section-appbeat .header h1');
      // Ensure the header exists before modifying it
      if (header && dataSource && dataSource !== "Live") {
        header.textContent += ` (Using ${dataSource})`;
      }

      const monitors = [];
      data.Services.forEach(service => {
        const serviceIsPaused = service.IsPaused === true;
        service.Checks.forEach(check => {
          const checkIsPaused = check.IsPaused === true;
          const status = serviceIsPaused || checkIsPaused ? "blue" : statusMapping[check.Status];
          monitors.push({
            name: `${service.Name} ${check.Name}`,
            responseTime: check.ResTime || "N/A",
            status: status,
          });
        });
      });

      renderAppBeatTable(monitors);
    })
    .catch(error => {
      console.error("Error fetching AppBeat data:", error);
    });
}

function renderAppBeatTable(monitors) {
  const tableBody = document.getElementById("appbeatTable");
  tableBody.innerHTML = "";

  monitors.sort((a, b) => {
    if (a.status === b.status) {
      if (a.status === "green") {
        return b.responseTime - a.responseTime;
      }
      return 0;
    }
    const statusOrder = { "red": 1, "blue": 2, "green": 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  monitors.forEach(monitor => {
    const row = document.createElement("tr");
    row.className = `row-${monitor.status}`;
    row.innerHTML = `
      <td>${monitor.name}</td>
      <td>${monitor.responseTime} ms</td>
    `;
    tableBody.appendChild(row);
  });
}

// Refresh data every 30 seconds
setInterval(fetchAndRenderAppBeatData, 30000);

// Initial fetch
fetchAndRenderAppBeatData();

