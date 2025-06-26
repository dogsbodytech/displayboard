const SIRPORTLY_URL = "/php/sirportlyproxy.php";

function fetchAndRenderSirportlyData() {
  fetchDataWithHeader(SIRPORTLY_URL, (data, dataSource) => {
    updateSectionHeader('.section-sirportly .header h1', 'Sirportly', dataSource);

    const results = data.results || [];
    let counts = { new: 0, daily: 0, waiting: 0 };
    const usersMap = {};

    results.forEach(row => {
      const count = row[0];
      const first = row[1];
      const last = row[2];
      const statusName = row[3];
      const statusType = row[4];

      if (first === null && last === null) {
        if (statusName === 'Waiting for Triage') counts.new += count;
        else if (statusName === 'Daily Ticket') counts.daily += count;
        else if (statusName === 'Waiting for Staff') counts.waiting += count;
      } else {
        const key = `${first} ${last}`;
        if (!usersMap[key]) {
          usersMap[key] = { name: first, blue: 0, red: 0, green: 0, total: 0 };
        }
        if (statusName === 'Internal') {
          usersMap[key].green += count;
        } else if (statusType === 2) {
          usersMap[key].blue += count;
        } else if (statusType === 0) {
          usersMap[key].red += count;
        }
        usersMap[key].total += count;
      }
    });

    const users = Object.values(usersMap).sort((a, b) => a.name.localeCompare(b.name));
    const maxCount = Math.max(counts.new, counts.daily, counts.waiting, ...users.map(u => u.total), 1);

    function segment(value, className) {
      if (value === 0) return '';
      const width = (value / maxCount) * 100;
      return `<div class="bar-segment ${className}" style="width:${width}%"></div>`;
    }

    function barHTML(segments) {
      return `<div class="bar-container">${segments.join('')}</div>`;
    }

    const rows = [];
    rows.push({ html: `<td>New ${counts.new}</td><td>${barHTML([segment(counts.new, 'bar-yellow')])}</td>`, status: '' });
    rows.push({ html: `<td>Daily ${counts.daily}</td><td>${barHTML([segment(counts.daily, 'bar-yellow')])}</td>`, status: '' });
    rows.push({ html: `<td>Waiting ${counts.waiting}</td><td>${barHTML([segment(counts.waiting, 'bar-yellow')])}</td>`, status: '' });

    users.forEach(user => {
      const segs = [
        segment(user.blue, 'bar-blue'),
        segment(user.red, 'bar-red'),
        segment(user.green, 'bar-green'),
      ];
      rows.push({ html: `<td>${user.name} ${user.total}</td><td>${barHTML(segs)}</td>`, status: '' });
    });

    clearAndRenderTable('sirportlyTable', rows);
  });
}

setInterval(fetchAndRenderSirportlyData, 30000);
fetchAndRenderSirportlyData();

