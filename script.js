const days = document.querySelectorAll(".day");
let draggedItem = null;

// Hilfsfunktionen für lokalen Speicher
function saveData() {
  const timetableData = {};
  days.forEach(day => {
    const entries = Array.from(day.querySelectorAll(".entry")).map(entry => ({
      text: entry.querySelector('input[type="text"]').value,
      color: entry.querySelector('input[type="color"]').value
    }));
    timetableData[day.dataset.day] = entries;
  });
  localStorage.setItem("timetable", JSON.stringify(timetableData));

  const reminders = Array.from(document.querySelectorAll(".reminder-item span")).map(span => span.textContent);
  localStorage.setItem("reminders", JSON.stringify(reminders));

  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

function loadData() {
  const timetableData = JSON.parse(localStorage.getItem("timetable"));
  if (timetableData) {
    days.forEach(day => {
      const entries = timetableData[day.dataset.day] || [];
      entries.forEach(entryData => {
        createEntry(day, entryData.text, entryData.color);
      });
    });
  }

  const reminders = JSON.parse(localStorage.getItem("reminders"));
  if (reminders) {
    reminders.forEach(text => createReminder(text));
  }

  const darkMode = JSON.parse(localStorage.getItem("darkMode"));
  if (darkMode) {
    document.body.classList.add("dark");
  }
}

function createEntry(day, text = "", color = "#e0e0e0") {
  const block = document.createElement("div");
  block.className = "entry";

  const input = document.createElement("input");
  input.type = "text";
  input.value = text;
  input.placeholder = "Vorlesung, Uhrzeit, Raum...";
  input.addEventListener("input", saveData);

  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.className = "color-picker";
  colorPicker.value = color;
  colorPicker.addEventListener("input", () => {
    block.style.backgroundColor = colorPicker.value;
    saveData();
  });

  block.style.backgroundColor = color;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "x";
  deleteBtn.className = "delete-btn";
  deleteBtn.addEventListener("click", () => {
    block.remove();
    saveData();
  });

  block.appendChild(deleteBtn);
  block.appendChild(input);
  block.appendChild(colorPicker);
  day.appendChild(block);

  makeDraggable(block);
}

function createReminder(text) {
  const item = document.createElement("li");
  item.className = "reminder-item";

  const span = document.createElement("span");
  span.textContent = text;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "x";
  deleteBtn.className = "delete-btn";
  deleteBtn.addEventListener("click", () => {
    item.remove();
    saveData();
  });

  item.appendChild(span);
  item.appendChild(deleteBtn);
  reminderList.appendChild(item);

  makeDraggable(item);
}

function makeDraggable(el) {
  el.setAttribute("draggable", true);

  el.addEventListener("dragstart", () => {
    draggedItem = el;
    setTimeout(() => el.style.display = "none", 0);
  });

  el.addEventListener("dragend", () => {
    setTimeout(() => {
      draggedItem.style.display = "block";
      draggedItem = null;
      saveData();
    }, 0);
  });
}

// EventListener für die Tage
days.forEach(day => {
  day.addEventListener("click", (e) => {
    if (e.target !== day) return;
    createEntry(day);
    saveData();
  });

  day.addEventListener("dragover", (e) => e.preventDefault());
  day.addEventListener("dragenter", () => day.classList.add("drag-over"));
  day.addEventListener("dragleave", () => day.classList.remove("drag-over"));

  day.addEventListener("drop", () => {
    if (draggedItem && draggedItem.classList.contains("entry")) {
      day.appendChild(draggedItem);
      saveData();
    }
    day.classList.remove("drag-over");
  });
});

const reminderInput = document.getElementById("reminderInput");
const reminderList = document.getElementById("reminderList");

reminderInput.addEventListener("keypress", e => {
  if (e.key === "Enter" && reminderInput.value.trim() !== "") {
    createReminder(reminderInput.value);
    saveData();
    reminderInput.value = "";
  }
});

reminderList.addEventListener("dragover", (e) => e.preventDefault());
reminderList.addEventListener("drop", (e) => {
  if (draggedItem && draggedItem.classList.contains("reminder-item")) {
    const dropTarget = e.target.closest("li");
    if (dropTarget && dropTarget !== draggedItem) {
      reminderList.insertBefore(draggedItem, dropTarget);
    } else {
      reminderList.appendChild(draggedItem);
    }
    saveData();
  }
});

// Dark Mode Button
const toggleDarkMode = document.getElementById("toggleDarkMode");
toggleDarkMode.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  saveData();
});

// Beim Start alle Daten laden
loadData();
