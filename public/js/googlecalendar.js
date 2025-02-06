const CALENDER_URL = "https://displayboard.dogsbody.com/php/googlecalendar.php";

async function fetchCalendar() {
  const response = await fetch(CALENDER_URL);
  const data = await response.json();
  displayCalendar(data);
}

function displayCalendar(events) {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';
  const groupedEvents = {};
  
  events.forEach(event => {
    const date = new Date(event.start).toDateString();
    if (!groupedEvents[date]) {
      groupedEvents[date] = [];
    }
    groupedEvents[date].push(event);
  });
  
  for (const [date, events] of Object.entries(groupedEvents)) {
    const dateDiv = document.createElement('div');
    dateDiv.className = 'date';
    dateDiv.textContent = new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'long' });
    calendar.appendChild(dateDiv);
    
    events.forEach(event => {
      const eventDiv = document.createElement('div');
      eventDiv.className = 'event';
      const startTime = new Date(event.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      const endTime = new Date(event.end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      
      eventDiv.textContent = event.start.includes("00:00") && event.end.includes("00:00") 
        ? event.summary
        : `${startTime} - ${endTime}: ${event.summary}`;
      calendar.appendChild(eventDiv);
    });
  }
}

// Initial fetch
fetchCalendar();

// Refresh every 5 minutes
setInterval(fetchCalendar, 300000);
