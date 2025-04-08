const days = document.querySelectorAll(".day");

let draggedItem = null;

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
    const block = document.createElement("div");
    block.className = "entry";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Vorlesung, Uhrzeit, Raum...";

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.className = "color-picker";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "x";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => block.remove());

    colorPicker.addEventListener("input", () => {
      block.style.backgroundColor = colorPicker.value;
    });

    block.appendChild(deleteBtn);
    block.appendChild(input);
    block.appendChild(colorPicker);
    day.appendChild(block);

    makeDraggable(block);
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

const reminderInput = document.getElementById("reminderInput");
const reminderList = document.getElementById("reminderList");

reminderInput.addEventListener("keypress", e => {
  if (e.key === "Enter" && reminderInput.value.trim() !== "") {
    const item = document.createElement("li");
    item.className = "reminder-item";

    const span = document.createElement("span");
    span.textContent = reminderInput.value;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "x";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => item.remove());

    item.appendChild(span);
    item.appendChild(deleteBtn);
    reminderList.appendChild(item);

    makeDraggable(item);

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
  }
});

const toggleDarkMode = document.getElementById("toggleDarkMode");
toggleDarkMode.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});