/*
 * Description: Display the JSON provided by the proxy in the way that we want.
 */

const NETDATA_URL = "https://minder.dogsbody.com/api/v2/nodes";

function fetchAndRenderNetdataData() {
  fetch(NETDATA_URL)
    .then(response => response.json())
    .then(nodesData => {
      const nodes = nodesData.nodes
        .filter(node => node.state !== "stale")
        .map(node => {
          const hostname = node.labels._hostname || "Unknown";
          const state = node.state || "unknown";
          const health = node.health || {};
          const alerts = health.alerts || {};

          colour = "green";
          if (alerts.critical > 0) {
            colour = "red";
          } else if (alerts.warning > 0) {
            colour = "yellow";
          }

          return {
            name: hostname,
            state: colour
          };
        })
        .sort((a, b) => {
          const priority = { red: 1, yellow: 2, green: 3 };
          if (priority[a.state] === priority[b.state]) {
            return a.name.localeCompare(b.name);
          }
          return priority[a.state] - priority[b.state];
        });

      renderNetdataTable(nodes);
    })
    .catch(error => {
      console.error("Error fetching Netdata data:", error);
    });
}

function renderNetdataTable(nodes) {
  const tableBody = document.getElementById("netdataTable");
  tableBody.innerHTML = "";

  nodes.forEach(node => {
    const row = document.createElement("tr");
    row.className = `row-${node.state}`;

    row.innerHTML = `
      <td>${node.name}</td>
    `;

    tableBody.appendChild(row);
  });
}

// Refresh data every 30 seconds
setInterval(fetchAndRenderNetdataData, 30000);

// Initial fetch
fetchAndRenderNetdataData();

