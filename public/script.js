const days = document.querySelectorAll(".day");
const reminderInput = document.getElementById("reminderInput");
const reminderList = document.getElementById("reminderList");
const toggleDarkMode = document.getElementById("toggleDarkMode");

let draggedItem = null;

// ========================
// 🔁 Backend-Integration (SQLite)
// ========================

async function loadEntriesFromServer() {
  const res = await fetch('/api/entries');
  const data = await res.json();
  renderEntries(data);
}

async function saveEntryToServer(entry) {
  const res = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  const result = await res.json();
  return result.id;
}

async function deleteEntryFromServer(id) {
  await fetch(`/api/entries/${id}`, { method: 'DELETE' });
}

function renderEntries(entries) {
  reminderList.innerHTML = "";
  days.forEach(day => {
    day.innerHTML = "";
    const header = document.createElement("h3");
    header.textContent = day.dataset.day;
    day.appendChild(header);
  });

  entries.forEach(entry => {
    if (entry.type === 'lecture') {
      const day = Array.from(days).find(d => d.dataset.day === entry.day);
      if (day) {
        const block = createLectureEntry(entry);
        day.appendChild(block);
      }
    } else if (entry.type === 'reminder') {
      const item = createReminderEntry(entry);
      reminderList.appendChild(item);
    }
  });
}

function createLectureEntry(entry) {
  const block = document.createElement("div");
  block.className = "entry";
  block.dataset.id = entry.id;

  const input = document.createElement("input");
  input.type = "text";
  input.value = entry.content || "";

  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.className = "color-picker";
  colorPicker.value = entry.color || "#cccccc";
  block.style.backgroundColor = colorPicker.value;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "x";
  deleteBtn.className = "delete-btn";
  deleteBtn.addEventListener("click", () => {
    block.remove();
    deleteEntryFromServer(entry.id);
  });

  // Änderungen speichern, wenn Textfeld verlassen wird
  input.addEventListener("blur", () => {
    entry.content = input.value;
    entry.color = colorPicker.value;
    saveEntryToServer(entry);
  });

  // Änderungen speichern, wenn Farbe geändert wird
  colorPicker.addEventListener("change", () => {
    block.style.backgroundColor = colorPicker.value;
    entry.color = colorPicker.value;
    saveEntryToServer(entry);
  });

  block.appendChild(deleteBtn);
  block.appendChild(input);
  block.appendChild(colorPicker);

  makeDraggable(block);
  return block;
}

function createReminderEntry(entry) {
  const item = document.createElement("li");
  item.className = "reminder-item";
  item.dataset.id = entry.id;

  const span = document.createElement("span");
  span.textContent = entry.content;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "x";
  deleteBtn.className = "delete-btn";
  deleteBtn.addEventListener("click", () => {
    item.remove();
    deleteEntryFromServer(entry.id);
  });

  item.appendChild(span);
  item.appendChild(deleteBtn);
  makeDraggable(item);
  return item;
}

// Drag & Drop

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
    }, 0);
  });
}

days.forEach(day => {
  day.addEventListener("click", (e) => {
    if (e.target !== day) return;

    const entry = {
      type: 'lecture',
      day: day.dataset.day,
      content: '',
      color: '#cccccc'
    };

    saveEntryToServer(entry).then(() => loadEntriesFromServer());
  });

  day.addEventListener("dragover", (e) => e.preventDefault());
  day.addEventListener("dragenter", () => day.classList.add("drag-over"));
  day.addEventListener("dragleave", () => day.classList.remove("drag-over"));
  day.addEventListener("drop", () => {
    if (draggedItem && draggedItem.classList.contains("entry")) {
      day.appendChild(draggedItem);
    }
    day.classList.remove("drag-over");
  });
});

reminderInput.addEventListener("keypress", e => {
  if (e.key === "Enter" && reminderInput.value.trim() !== "") {
    const entry = {
      type: 'reminder',
      content: reminderInput.value
    };
    saveEntryToServer(entry).then(() => {
      reminderInput.value = "";
      loadEntriesFromServer();
    });
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
  }
});

toggleDarkMode.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// ⏬ Lade bestehende Daten vom Server
loadEntriesFromServer();