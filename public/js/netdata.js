/*
 * Description: Display the JSON provided by the proxy in the way that we want.
 */

const NETDATA_URL = "/php/netdataproxy.php";

function fetchAndRenderNetdataData() {
  fetchDataWithHeader(NETDATA_URL, (data, dataSource) => {
    updateSectionHeader('.section-netdata .header h1', 'Resource Monitoring', dataSource);

    const nodes = data.nodes
      .filter(node => node.state !== "stale")
      .map(node => {
        const hostname = node.labels._hostname || "Unknown";
        const health = node.health || {};
        const alerts = health.alerts || {};

        let colour = "green";
        if (alerts.critical > 0) {
          colour = "red";
        } else if (alerts.warning > 0) {
          colour = "yellow";
        }

        return {
          name: hostname,
          status: colour
        };
      })
      .sort((a, b) => {
        const priority = { red: 1, yellow: 2, green: 3 };
        if (priority[a.status] === priority[b.status]) {
          return a.name.localeCompare(b.name);
        }
        return priority[a.status] - priority[b.status];
      });

    const rows = nodes.map(node => ({
      html: `<td>${node.name}</td>`,
      status: node.status
    }));

    clearAndRenderTable("netdataTable", rows);
  });
}

// Refresh data every 30 seconds
setInterval(fetchAndRenderNetdataData, 30000);

// Initial fetch
fetchAndRenderNetdataData();

