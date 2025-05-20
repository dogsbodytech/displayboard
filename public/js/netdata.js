/*
 * Description: Display the JSON provided by the proxy in the way that we want.
 */

const NETDATA_URL = "/php/netdataproxy.php";

function fetchAndRenderNetdataData() {
  fetch(NETDATA_URL)
    .then((response) => {
    const dataSource = response.headers.get('X-Data-Source');
    return response.json().then((data) => ({ data, dataSource }));
    })
    .then(({ data, dataSource }) => {
      // Select the specific <h1> inside .section-netdata
      const header = document.querySelector('.section-netadata .header h1');
      // Ensure the header exists before modifying it
      if (header) {
        // Reset the header text to its original state
        header.textContent = "Resource Monitoring";
        // If dataSource is not "Live", append the source info
        if (dataSource && dataSource !== "Live") {
          header.textContent += ` (${dataSource})`;
        }
      }

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

