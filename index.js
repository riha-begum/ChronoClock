/* =====================================================
   CHRONOCLOCK
   ADVANCED TIME DASHBOARD
===================================================== */

/* =====================================================
   GLOBAL SETTINGS
===================================================== */

let is24Hour = true;

/* =====================================================
   CLOCK ELEMENTS
===================================================== */

const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

const digitalClock = document.getElementById("digitalClock");

const dateDisplay = document.getElementById("dateDisplay");

const dayName = document.getElementById("dayName");

const dateNumber = document.getElementById("dateNumber");

const monthName = document.getElementById("monthName");

const yearNumber = document.getElementById("yearNumber");

/* =====================================================
   HELPER
===================================================== */

function pad(number) {
  return String(number).padStart(2, "0");
}

/* =====================================================
   ANALOG CLOCK
===================================================== */

function drawClock() {
  const now = new Date();

  const width = canvas.width;

  const height = canvas.height;

  const centerX = width / 2;

  const centerY = height / 2;

  const radius = 120;

  ctx.clearRect(0, 0, width, height);

  /* Clock Background */

  ctx.beginPath();

  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

  ctx.fillStyle = document.body.classList.contains("light")
    ? "#ffffff"
    : "#0f172a";

  ctx.fill();

  /* Border */

  ctx.strokeStyle = "#22d3ee";

  ctx.lineWidth = 4;

  ctx.stroke();

  /* Numbers */

  ctx.fillStyle = document.body.classList.contains("light")
    ? "#0f172a"
    : "#f8fafc";

  ctx.font = "bold 18px Inter";

  ctx.textAlign = "center";

  ctx.textBaseline = "middle";

  for (let number = 1; number <= 12; number++) {
    const angle = (number * Math.PI) / 6;

    const x = centerX + Math.cos(angle - Math.PI / 2) * 98;

    const y = centerY + Math.sin(angle - Math.PI / 2) * 98;

    ctx.fillText(number, x, y);
  }

  /* Time */

  const seconds = now.getSeconds();

  const milliseconds = now.getMilliseconds();

  const minutes = now.getMinutes();

  const hours = now.getHours();

  const secondAngle = ((seconds + milliseconds / 1000) / 60) * Math.PI * 2;

  const minuteAngle = ((minutes + seconds / 60) / 60) * Math.PI * 2;

  const hourAngle = (((hours % 12) + minutes / 60) / 12) * Math.PI * 2;

  drawHand(hourAngle, 65, 6, "#f8fafc");

  drawHand(minuteAngle, 88, 4, "#22d3ee");

  drawHand(secondAngle, 100, 2, "#ef4444");

  /* Center */

  ctx.beginPath();

  ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);

  ctx.fillStyle = "#22d3ee";

  ctx.fill();

  /* Digital */

  let displayHour = hours;

  if (!is24Hour) {
    displayHour = hours % 12 || 12;
  }

  const period = hours >= 12 ? "PM" : "AM";

  digitalClock.textContent = is24Hour
    ? `${pad(displayHour)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(displayHour)}:${pad(minutes)}:${pad(seconds)} ${period}`;

  /* Date */

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = days[now.getDay()];

  const month = months[now.getMonth()];

  const date = now.getDate();

  const year = now.getFullYear();

  dateDisplay.textContent = `${day}, ${month} ${date}, ${year}`;

  dayName.textContent = day;

  dateNumber.textContent = pad(date);

  monthName.textContent = month;

  yearNumber.textContent = year;

  updateWorldClocks();

  requestAnimationFrame(drawClock);
}

function drawHand(angle, length, width, color) {
  const centerX = canvas.width / 2;

  const centerY = canvas.height / 2;

  ctx.beginPath();

  ctx.moveTo(centerX, centerY);

  ctx.lineTo(
    centerX + Math.cos(angle - Math.PI / 2) * length,

    centerY + Math.sin(angle - Math.PI / 2) * length,
  );

  ctx.strokeStyle = color;

  ctx.lineWidth = width;

  ctx.lineCap = "round";

  ctx.stroke();
}

/* =====================================================
   SETTINGS
===================================================== */

const settingsBtn = document.getElementById("settingsBtn");

const closeSettings = document.getElementById("closeSettings");

const settingsPanel = document.getElementById("settingsPanel");

const settingsOverlay = document.getElementById("settingsOverlay");

const themeToggle = document.getElementById("themeToggle");

const formatToggle = document.getElementById("formatToggle");

settingsBtn.addEventListener("click", () => {
  settingsPanel.classList.add("active");

  settingsOverlay.classList.add("active");
});

function closeSettingsPanel() {
  settingsPanel.classList.remove("active");

  settingsOverlay.classList.remove("active");
}

closeSettings.addEventListener("click", closeSettingsPanel);

settingsOverlay.addEventListener("click", closeSettingsPanel);

/* =====================================================
   THEME
===================================================== */

const savedTheme = localStorage.getItem("chronoTheme");

if (savedTheme === "light") {
  document.body.classList.add("light");

  themeToggle.textContent = "☀️ Light";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");

  localStorage.setItem("chronoTheme", isLight ? "light" : "dark");

  themeToggle.textContent = isLight ? "☀️ Light" : "🌙 Dark";
});

/* =====================================================
   CLOCK FORMAT
===================================================== */

const savedFormat = localStorage.getItem("chronoFormat");

if (savedFormat === "12") {
  is24Hour = false;

  formatToggle.textContent = "12H";
}

formatToggle.addEventListener("click", () => {
  is24Hour = !is24Hour;

  formatToggle.textContent = is24Hour ? "24H" : "12H";

  localStorage.setItem("chronoFormat", is24Hour ? "24" : "12");

  renderAlarms();

  renderWorldClocks();
});

/* =====================================================
   STOPWATCH
===================================================== */

const stopwatchDisplay = document.getElementById("stopwatchDisplay");

const startStopwatch = document.getElementById("startStopwatch");

const lapBtn = document.getElementById("lapBtn");

const resetStopwatch = document.getElementById("resetStopwatch");

const lapList = document.getElementById("lapList");

let stopwatchInterval = null;

let stopwatchStartTime = 0;

let stopwatchElapsed = 0;

let lapNumber = 0;

let stopwatchRunning = false;

function formatStopwatchTime(milliseconds) {
  const totalCentiseconds = Math.floor(milliseconds / 10);

  const centiseconds = totalCentiseconds % 100;

  const totalSeconds = Math.floor(totalCentiseconds / 100);

  const seconds = totalSeconds % 60;

  const totalMinutes = Math.floor(totalSeconds / 60);

  const minutes = totalMinutes % 60;

  const hours = Math.floor(totalMinutes / 60);

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
}

function updateStopwatch() {
  if (!stopwatchRunning) {
    return;
  }

  stopwatchElapsed = Date.now() - stopwatchStartTime;

  stopwatchDisplay.textContent = formatStopwatchTime(stopwatchElapsed);
}

function startStopwatchTimer() {
  if (stopwatchRunning) {
    return;
  }

  stopwatchRunning = true;

  stopwatchStartTime = Date.now() - stopwatchElapsed;

  stopwatchInterval = setInterval(updateStopwatch, 10);

  startStopwatch.textContent = "⏸ Pause";
}

function pauseStopwatch() {
  stopwatchRunning = false;

  clearInterval(stopwatchInterval);

  stopwatchInterval = null;

  startStopwatch.textContent = "▶ Resume";
}

startStopwatch.addEventListener("click", () => {
  if (stopwatchRunning) {
    pauseStopwatch();
  } else {
    startStopwatchTimer();
  }
});

lapBtn.addEventListener("click", () => {
  if (!stopwatchRunning) {
    return;
  }

  lapNumber++;

  const lap = document.createElement("div");

  lap.className = "lap-item";

  lap.innerHTML = `

            <span>
                Lap ${lapNumber}
            </span>

            <strong>
                ${formatStopwatchTime(stopwatchElapsed)}
            </strong>

        `;

  lapList.prepend(lap);
});

resetStopwatch.addEventListener("click", () => {
  clearInterval(stopwatchInterval);

  stopwatchInterval = null;

  stopwatchStartTime = 0;

  stopwatchElapsed = 0;

  lapNumber = 0;

  stopwatchRunning = false;

  stopwatchDisplay.textContent = "00:00:00.00";

  startStopwatch.textContent = "▶ Start";

  lapList.innerHTML = "";
});

/* =====================================================
   COUNTDOWN
===================================================== */

const minutesInput = document.getElementById("minutesInput");

const secondsInput = document.getElementById("secondsInput");

const countdownDisplay = document.getElementById("countdownDisplay");

const countdownMessage = document.getElementById("countdownMessage");

const startCountdown = document.getElementById("startCountdown");

const pauseCountdown = document.getElementById("pauseCountdown");

const resetCountdown = document.getElementById("resetCountdown");

const progressCircle = document.getElementById("progressCircle");

const radius = 110;

const circumference = 2 * Math.PI * radius;

progressCircle.style.strokeDasharray = circumference;

progressCircle.style.strokeDashoffset = circumference;

let countdownInterval = null;

let countdownTotal = 0;

let countdownRemaining = 0;

let countdownRunning = false;

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = seconds % 60;

  return `${pad(minutes)}:${pad(remainingSeconds)}`;
}

function updateCountdownDisplay() {
  countdownDisplay.textContent = formatCountdown(countdownRemaining);

  if (countdownTotal > 0) {
    const progress = countdownRemaining / countdownTotal;

    const offset = circumference * (1 - progress);

    progressCircle.style.strokeDashoffset = offset;
  }
}

function getInputTime() {
  let minutes = parseInt(minutesInput.value) || 0;

  let seconds = parseInt(secondsInput.value) || 0;

  if (seconds > 59) {
    minutes += Math.floor(seconds / 60);

    seconds = seconds % 60;
  }

  return minutes * 60 + seconds;
}

startCountdown.addEventListener("click", () => {
  if (countdownRunning) {
    return;
  }

  if (countdownRemaining <= 0) {
    countdownRemaining = getInputTime();

    countdownTotal = countdownRemaining;
  }

  if (countdownRemaining <= 0) {
    countdownMessage.textContent = "Please set a valid time.";

    return;
  }

  countdownRunning = true;

  countdownMessage.textContent = "Countdown is running...";

  countdownInterval = setInterval(() => {
    countdownRemaining--;

    updateCountdownDisplay();

    if (countdownRemaining <= 0) {
      clearInterval(countdownInterval);

      countdownInterval = null;

      countdownRunning = false;

      countdownMessage.textContent = "⏰ Time is up!";
    }
  }, 1000);
});

pauseCountdown.addEventListener("click", () => {
  if (!countdownRunning) {
    return;
  }

  clearInterval(countdownInterval);

  countdownInterval = null;

  countdownRunning = false;

  countdownMessage.textContent = "Countdown paused.";
});

resetCountdown.addEventListener("click", () => {
  clearInterval(countdownInterval);

  countdownInterval = null;

  countdownRunning = false;

  countdownTotal = 0;

  countdownRemaining = 0;

  countdownDisplay.textContent = "00:00";

  progressCircle.style.strokeDashoffset = circumference;

  countdownMessage.textContent = "Set your time and start the countdown.";
});

/* Quick Add */

document.querySelectorAll(".quick-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const minutes = Number(button.dataset.minutes);

    const current = getInputTime();

    const newTime = current + minutes * 60;

    minutesInput.value = Math.floor(newTime / 60);

    secondsInput.value = newTime % 60;

    if (!countdownRunning) {
      countdownRemaining = newTime;

      countdownTotal = newTime;

      updateCountdownDisplay();
    }
  });
});

countdownRemaining = getInputTime();

countdownTotal = countdownRemaining;

updateCountdownDisplay();

/* =====================================================
   ALARM MANAGER
===================================================== */

const alarmTime = document.getElementById("alarmTime");

const alarmLabel = document.getElementById("alarmLabel");

const addAlarm = document.getElementById("addAlarm");

const alarmList = document.getElementById("alarmList");

const notificationBtn = document.getElementById("notificationBtn");

let alarms = JSON.parse(localStorage.getItem("chronoAlarms")) || [];

function saveAlarms() {
  localStorage.setItem("chronoAlarms", JSON.stringify(alarms));
}

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

function formatAlarmTime(time) {
  const [hour, minute] = time.split(":");

  let h = Number(hour);

  if (is24Hour) {
    return `${pad(h)}:${minute}`;
  }

  const period = h >= 12 ? "PM" : "AM";

  h = h % 12 || 12;

  return `${pad(h)}:${minute} ${period}`;
}

function renderAlarms() {
  alarmList.innerHTML = "";

  if (alarms.length === 0) {
    alarmList.innerHTML = `

            <div class="empty-alarm">
                No alarms added yet.
            </div>

        `;

    return;
  }

  alarms.sort((a, b) => a.time.localeCompare(b.time));

  alarms.forEach((alarm) => {
    const item = document.createElement("div");

    item.className = "alarm-item";

    item.dataset.id = alarm.id;

    item.innerHTML = `

                <div class="alarm-info">

                    <div class="alarm-icon">
                        🔔
                    </div>

                    <div>

                        <div class="alarm-time">
                            ${formatAlarmTime(alarm.time)}
                        </div>

                        <div class="alarm-label">
                            ${escapeHTML(alarm.label)}
                        </div>

                    </div>

                </div>


                <div class="alarm-actions">

                    <button
                        class="alarm-toggle ${alarm.enabled ? "active" : ""}"
                        data-id="${alarm.id}"
                    ></button>


                    <button
                        class="delete-alarm"
                        data-id="${alarm.id}"
                    >
                        🗑️
                    </button>

                </div>

            `;

    alarmList.appendChild(item);
  });
}

addAlarm.addEventListener("click", () => {
  const time = alarmTime.value;

  const label = alarmLabel.value.trim();

  if (!time) {
    alert("Please select an alarm time.");

    return;
  }

  alarms.push({
    id: Date.now(),

    time: time,

    label: label || "Alarm",

    enabled: true,

    lastTriggered: null,
  });

  saveAlarms();

  renderAlarms();

  alarmTime.value = "";

  alarmLabel.value = "";
});

alarmList.addEventListener("click", (event) => {
  const toggle = event.target.closest(".alarm-toggle");

  const deleteButton = event.target.closest(".delete-alarm");

  if (toggle) {
    const id = Number(toggle.dataset.id);

    const alarm = alarms.find((item) => item.id === id);

    if (alarm) {
      alarm.enabled = !alarm.enabled;

      saveAlarms();

      renderAlarms();
    }

    return;
  }

  if (deleteButton) {
    const id = Number(deleteButton.dataset.id);

    alarms = alarms.filter((item) => item.id !== id);

    saveAlarms();

    renderAlarms();
  }
});

function checkAlarms() {
  const now = new Date();

  const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const currentDate = now.toDateString();

  alarms.forEach((alarm) => {
    if (!alarm.enabled || alarm.time !== currentTime) {
      return;
    }

    if (alarm.lastTriggered === currentDate) {
      return;
    }

    alarm.lastTriggered = currentDate;

    triggerAlarm(alarm);
  });

  saveAlarms();
}

function triggerAlarm(alarm) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("⏰ ChronoClock Alarm", {
      body: alarm.label || "Your alarm is ringing!",
    });
  }

  playAlarmSound();

  alert(`⏰ ${alarm.label || "Alarm"}`);
}

function playAlarmSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  const audio = new AudioContext();

  const oscillator = audio.createOscillator();

  const gain = audio.createGain();

  oscillator.type = "sine";

  oscillator.frequency.value = 880;

  gain.gain.value = 0.15;

  oscillator.connect(gain);

  gain.connect(audio.destination);

  oscillator.start();

  setTimeout(() => {
    oscillator.stop();

    audio.close();
  }, 1000);
}

notificationBtn.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    notificationBtn.textContent = "❌ Not Supported";

    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    notificationBtn.textContent = "✅ Notifications Enabled";
  } else {
    notificationBtn.textContent = "❌ Notifications Blocked";
  }
});

setInterval(checkAlarms, 1000);

renderAlarms();

/* =====================================================
   WORLD CLOCK
===================================================== */

const timezoneSelect = document.getElementById("timezoneSelect");

const addTimezone = document.getElementById("addTimezone");

const worldClockGrid = document.getElementById("worldClockGrid");

const cityData = {
  "Asia/Dhaka": {
    city: "Dhaka",
    country: "Bangladesh",
    flag: "🇧🇩",
  },

  "Europe/London": {
    city: "London",
    country: "United Kingdom",
    flag: "🇬🇧",
  },

  "America/New_York": {
    city: "New York",
    country: "USA",
    flag: "🇺🇸",
  },

  "America/Los_Angeles": {
    city: "Los Angeles",
    country: "USA",
    flag: "🇺🇸",
  },

  "Asia/Tokyo": {
    city: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
  },

  "Asia/Dubai": {
    city: "Dubai",
    country: "UAE",
    flag: "🇦🇪",
  },

  "Asia/Kolkata": {
    city: "Kolkata",
    country: "India",
    flag: "🇮🇳",
  },

  "Australia/Sydney": {
    city: "Sydney",
    country: "Australia",
    flag: "🇦🇺",
  },

  "Europe/Paris": {
    city: "Paris",
    country: "France",
    flag: "🇫🇷",
  },

  "Asia/Singapore": {
    city: "Singapore",
    country: "Singapore",
    flag: "🇸🇬",
  },
};

let selectedTimezones = JSON.parse(localStorage.getItem("chronoTimezones")) || [
  "Asia/Dhaka",
  "Europe/London",
  "America/New_York",
  "Asia/Tokyo",
];

function saveTimezones() {
  localStorage.setItem("chronoTimezones", JSON.stringify(selectedTimezones));
}

function formatWorldTime(date, timezone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,

    hour: "2-digit",

    minute: "2-digit",

    second: "2-digit",

    hour12: !is24Hour,
  }).format(date);
}

function formatWorldDate(date, timezone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,

    weekday: "long",

    month: "short",

    day: "numeric",

    year: "numeric",
  }).format(date);
}

function getTimezoneOffset(timezone) {
  const date = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,

    timeZoneName: "shortOffset",
  }).formatToParts(date);

  const offsetPart = parts.find((part) => part.type === "timeZoneName");

  return offsetPart ? offsetPart.value : "";
}

function renderWorldClocks() {
  worldClockGrid.innerHTML = "";

  selectedTimezones.forEach((timezone) => {
    const data = cityData[timezone];

    if (!data) {
      return;
    }

    const card = document.createElement("div");

    card.className = "world-clock-card";

    card.dataset.timezone = timezone;

    card.innerHTML = `

                <div class="world-clock-top">

                    <div>

                        <div class="city-name">
                            ${data.flag}
                            ${data.city}
                        </div>

                        <div class="city-zone">
                            ${data.country}
                        </div>

                    </div>


                    <button
                        class="remove-city"
                        data-timezone="${timezone}"
                        title="Remove city"
                    >
                        ×
                    </button>

                </div>


                <div class="world-time">
                    ${formatWorldTime(new Date(), timezone)}
                </div>


                <div class="world-date">
                    ${formatWorldDate(new Date(), timezone)}
                </div>


                <div class="city-zone">
                    ${getTimezoneOffset(timezone)}
                </div>

            `;

    worldClockGrid.appendChild(card);
  });
}

function updateWorldClocks() {
  const cards = document.querySelectorAll(".world-clock-card");

  const now = new Date();

  cards.forEach((card) => {
    const timezone = card.dataset.timezone;

    const time = card.querySelector(".world-time");

    const date = card.querySelector(".world-date");

    if (time) {
      time.textContent = formatWorldTime(now, timezone);
    }

    if (date) {
      date.textContent = formatWorldDate(now, timezone);
    }
  });
}

addTimezone.addEventListener("click", () => {
  const timezone = timezoneSelect.value;

  if (!timezone) {
    return;
  }

  if (selectedTimezones.includes(timezone)) {
    alert("This city is already added.");

    return;
  }

  selectedTimezones.push(timezone);

  saveTimezones();

  renderWorldClocks();

  timezoneSelect.value = "";
});

worldClockGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-city");

  if (!button) {
    return;
  }

  const timezone = button.dataset.timezone;

  selectedTimezones = selectedTimezones.filter((item) => item !== timezone);

  saveTimezones();

  renderWorldClocks();
});

renderWorldClocks();

/* =====================================================
   TIME ZONE CONVERTER
===================================================== */

const fromTimezone = document.getElementById("fromTimezone");

const toTimezone = document.getElementById("toTimezone");

const converterDate = document.getElementById("converterDate");

const converterTime = document.getElementById("converterTime");

const convertTime = document.getElementById("convertTime");

const convertedResult = document.getElementById("convertedResult");

function getLocalTimezoneParts(date, timezone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,

    year: "numeric",

    month: "2-digit",

    day: "2-digit",

    hour: "2-digit",

    minute: "2-digit",

    second: "2-digit",

    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);

  const result = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  });

  return result;
}

function convertTimezone(date, fromZone, toZone) {
  const fromParts = getLocalTimezoneParts(date, fromZone);

  const targetParts = getLocalTimezoneParts(date, toZone);

  return targetParts;
}

convertTime.addEventListener("click", () => {
  const dateValue = converterDate.value;

  const timeValue = converterTime.value;

  const fromZone = fromTimezone.value;

  const toZone = toTimezone.value;

  if (!dateValue || !timeValue) {
    convertedResult.textContent = "Please select date and time.";

    return;
  }

  const [year, month, day] = dateValue.split("-").map(Number);

  const [hour, minute] = timeValue.split(":").map(Number);

  /*
            We create an approximate UTC
            reference and then calculate
            the target timezone.
        */

  const inputUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));

  const fromParts = getLocalTimezoneParts(inputUTC, fromZone);

  const fromAsUTC = Date.UTC(
    Number(fromParts.year),
    Number(fromParts.month) - 1,
    Number(fromParts.day),
    Number(fromParts.hour),
    Number(fromParts.minute),
    Number(fromParts.second),
  );

  const difference = fromAsUTC - inputUTC.getTime();

  const actualUTC = inputUTC.getTime() - difference;

  const result = getLocalTimezoneParts(new Date(actualUTC), toZone);

  const resultDate = `${result.year}-${result.month}-${result.day}`;

  const resultTime = `${result.hour}:${result.minute}`;

  const targetLabel =
    toTimezone.options[toTimezone.selectedIndex].textContent.trim();

  convertedResult.innerHTML = `

            ${dateValue} ${timeValue}

            <br>

            ↓

            <br>

            <strong>
                ${resultDate}
                &nbsp;
                ${resultTime}
            </strong>

            <br>

            <small>
                ${targetLabel}
            </small>

        `;
});

/* =====================================================
   SET DEFAULT CONVERTER DATE & TIME
===================================================== */

const now = new Date();

converterDate.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
  now.getDate(),
)}`;

converterTime.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

/* =====================================================
   START MAIN CLOCK
===================================================== */

drawClock();
