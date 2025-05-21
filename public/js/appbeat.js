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
  fetchDataWithHeader(APPBEAT_URL, (data, dataSource) => {
    updateSectionHeader('.section-appbeat .header h1', 'Port Monitoring', dataSource);

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

    const rows = monitors.map(monitor => ({
      html: `<td>${monitor.name}</td><td>${monitor.responseTime} ms</td>`,
      status: monitor.status
    }));

    clearAndRenderTable("appbeatTable", rows);
  });
}

// Refresh data every 31 seconds, one second more than the php script
setInterval(fetchAndRenderAppBeatData, 31000);

// Initial fetch
fetchAndRenderAppBeatData();

