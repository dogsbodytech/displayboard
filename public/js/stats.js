const NETDATA_URL = "/php/netdataproxy.php";
const APPBEAT_URL = "/php/appbeatproxy.php";
const SIRPORTLY_URL = "/php/sirportlyproxy.php?query=stats";
const MULTIPLIER = 4.7;

async function fetchStats() {
  try {
    const [netdataResp, appbeatResp, sirportlyResp] = await Promise.all([
      fetch(NETDATA_URL),
      fetch(APPBEAT_URL),
      fetch(SIRPORTLY_URL)
    ]);

    const netdataData = await netdataResp.json();
    const appbeatData = await appbeatResp.json();
    const sirportlyData = await sirportlyResp.json();

    const nodesCount = Array.isArray(netdataData.nodes) ? netdataData.nodes.length : 0;

    let servicesCount = 0;
    if (Array.isArray(appbeatData.Services)) {
      appbeatData.Services.forEach(service => {
        if (Array.isArray(service.Checks)) {
          servicesCount += service.Checks.length;
        }
      });
    }

    let ticketsCount = 0;
    if (sirportlyData.results && sirportlyData.results.length > 0 &&
        sirportlyData.results[0].length > 0) {
      const val = parseInt(sirportlyData.results[0][0], 10);
      if (!isNaN(val)) ticketsCount = val;
    }

    const scaledNodes = Math.ceil(nodesCount * MULTIPLIER);
    const scaledServices = Math.ceil(servicesCount * MULTIPLIER);
    const scaledTickets = Math.ceil(ticketsCount * MULTIPLIER);

    const container = document.querySelector('body div') || document.body;
    container.innerHTML =
      `Nodes Monitored: ${nodesCount}<br>` +
      `Services Monitored: ${servicesCount}<br>` +
      `Tickets Actioned: ${ticketsCount}<br><br>` +
      `Multiplier: ${MULTIPLIER}<br><br>` +
      `Nodes Monitored: ${scaledNodes}<br>` +
      `Services Monitored: ${scaledServices}<br>` +
      `Tickets Actioned: ${scaledTickets}`;
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

document.addEventListener('DOMContentLoaded', fetchStats);
