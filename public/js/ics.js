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
        const parsed = parseIcsDate(line.split(":" ).pop());
        event.start = parsed.date;
        event.allDay = !parsed.hasTime;
      } else if (line.startsWith("DTEND")) {
        const parsed = parseIcsDate(line.split(":" ).pop());
        event.end = parsed.date;
      } else if (line.startsWith("SUMMARY")) {
        event.summary = line.substring(line.indexOf(":") + 1).trim();
      }
    }
  });
  const sorted = events.sort((a, b) => a.start - b.start);

  // Filter out events that have already ended
  const now = new Date();
  return sorted.filter(e => e.end >= now);
}

function parseIcsDate(value) {
  value = value.trim();
  let utc = false;
  if (value.endsWith('Z')) {
    utc = true;
    value = value.slice(0, -1);
  }

  if (value.length === 8) {
    const year = parseInt(value.slice(0, 4), 10);
    const month = parseInt(value.slice(4, 6), 10) - 1;
    const day = parseInt(value.slice(6, 8), 10);
    const date = utc
      ? new Date(Date.UTC(year, month, day))
      : new Date(year, month, day);
    return { date, hasTime: false };
  } else if (value.length >= 15) {
    const year = parseInt(value.slice(0, 4), 10);
    const month = parseInt(value.slice(4, 6), 10) - 1;
    const day = parseInt(value.slice(6, 8), 10);
    const hour = parseInt(value.slice(9, 11), 10);
    const minute = parseInt(value.slice(11, 13), 10);
    let second = 0;
    if (value.length >= 15) {
      const sec = value.slice(13, 15);
      if (!isNaN(parseInt(sec, 10))) second = parseInt(sec, 10);
    }
    const date = utc
      ? new Date(Date.UTC(year, month, day, hour, minute, second))
      : new Date(year, month, day, hour, minute, second);
    return { date, hasTime: true };
  }

  return { date: new Date(value), hasTime: true };
}

function displayIcsCalendar(events) {
  const calendar = document.getElementById('icsCalendar');
  calendar.innerHTML = '';
  const groupedEvents = {};

  events.forEach(event => {
    const date = event.start.toDateString();
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

      let text;
      if (event.allDay) {
        // All day events may span multiple days. DTEND for all day events is
        // exclusive, so subtract one day when comparing.
        const endDate = new Date(event.end.getTime());
        endDate.setDate(endDate.getDate() - 1);
        if (event.start.toDateString() === endDate.toDateString()) {
          text = event.summary;
        } else {
          const endDateStr = endDate.toLocaleDateString(undefined, { day: '2-digit', month: 'long' });
          text = `${event.summary} (until ${endDateStr})`;
        }
      } else {
        const startTime = event.start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        const endTime = event.end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        if (event.start.toDateString() === event.end.toDateString()) {
          text = `${startTime} - ${endTime}: ${event.summary}`;
        } else {
          const endDateStr = event.end.toLocaleDateString(undefined, { day: '2-digit', month: 'long' });
          text = `${startTime} - ${endTime} ${endDateStr}: ${event.summary}`;
        }
      }

      eventDiv.textContent = text;
      calendar.appendChild(eventDiv);
    });
  }
}

// Initial fetch
fetchIcsCalendar();
// Refresh every 5 minutes
setInterval(fetchIcsCalendar, 300000);
