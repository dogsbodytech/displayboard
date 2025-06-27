/*
 * Description: Display the ICS calendar provided by the proxy in the same style as the Google calendar.
 */

const ICS_URL = "/php/icsproxy.php";

async function fetchIcsCalendar() {
  const response = await fetch(ICS_URL);
  const text = await response.text();
  const events = parseICS(text);
  displayIcsCalendar(events);
}

function unfoldICS(data) {
  return data.replace(/\r?\n[ \t]/g, "");
}

function parseICS(icsText) {
  const events = [];
  const lines = unfoldICS(icsText).split(/\r?\n/);
  let event = null;
  lines.forEach(line => {
    if (line.startsWith("BEGIN:VEVENT")) {
      event = {};
    } else if (line.startsWith("END:VEVENT")) {
      if (event) events.push(event);
      event = null;
    } else if (event) {
      if (line.startsWith("DTSTART")) {
        event.start = parseIcsDate(line.split(":" ).pop());
      } else if (line.startsWith("DTEND")) {
        event.end = parseIcsDate(line.split(":" ).pop());
      } else if (line.startsWith("SUMMARY")) {
        event.summary = line.substring(line.indexOf(":") + 1).trim();
      }
    }
  });
  const sorted = events.sort((a, b) => new Date(a.start) - new Date(b.start));

  // Filter out events before today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return sorted.filter(e => new Date(e.start) >= today);
}

function parseIcsDate(value) {
  value = value.trim();
  if (value.length === 8) {
    return `${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)} 00:00`;
  } else if (value.length >= 15) {
    const year = value.slice(0,4);
    const month = value.slice(4,6);
    const day = value.slice(6,8);
    const hour = value.slice(9,11);
    const minute = value.slice(11,13);
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
  return value;
}

function displayIcsCalendar(events) {
  const calendar = document.getElementById('icsCalendar');
  calendar.innerHTML = '';
  const groupedEvents = {};

  events.forEach(event => {
    const date = new Date(event.start).toDateString();
    if (!groupedEvents[date]) {
      groupedEvents[date] = [];
    }
    groupedEvents[date].push(event);
  });

  for (const [date, dayEvents] of Object.entries(groupedEvents)) {
    const dateDiv = document.createElement('div');
    dateDiv.className = 'date';
    dateDiv.textContent = new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'long' });
    calendar.appendChild(dateDiv);

    dayEvents.forEach(event => {
      const eventDiv = document.createElement('div');
      eventDiv.className = 'event';
      const startTime = new Date(event.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      const endTime = new Date(event.end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      eventDiv.textContent = event.start.includes('00:00') && event.end.includes('00:00')
        ? event.summary
        : `${startTime} - ${endTime}: ${event.summary}`;
      calendar.appendChild(eventDiv);
    });
  }
}

// Initial fetch
fetchIcsCalendar();
// Refresh every 5 minutes
setInterval(fetchIcsCalendar, 300000);
