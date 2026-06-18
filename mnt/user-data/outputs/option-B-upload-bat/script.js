// -------------------------
// LOCAL-ONLY EDIT MODE CHECK
// -------------------------
const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "";

// -------------------------
// IMAGE LINK (replaces old file upload)
// -------------------------
function setImageFromLink() {
    if (!isLocal) return;
    const input = document.getElementById("imageUrlInput");
    const url = input.value.trim();
    if (!url) {
        alert("Please paste an image URL first.");
        return;
    }
    document.getElementById("profileImage").src = url;
    input.value = "";
}

// -------------------------
// ADD NEW SECTION
// -------------------------
function addSection() {
    if (!isLocal) return;
    const title = prompt("Enter Section Title");
    if (!title) return;

    const section = document.createElement("section");
    section.classList.add("card");
    section.setAttribute("draggable", "true");
    section.innerHTML = `
        <div class="actions">
            <button onclick="deleteSection(this)">Delete</button>
        </div>
        <h2 contenteditable="true">${title}</h2>
        <p contenteditable="true">Click here and edit content.</p>
    `;
    document.getElementById("portfolio").appendChild(section);
    enableDragAndDrop();
}

// -------------------------
// DELETE SECTION
// -------------------------
function deleteSection(button) {
    if (!isLocal) return;
    if (confirm("Delete this section?")) {
        button.parentElement.parentElement.remove();
    }
}

// -------------------------
// SAVE PORTFOLIO
// Browsers cannot write directly to a file on disk for security reasons.
// So "Save" does two things:
//   1. Stores to localStorage as a backup for THIS browser only.
//   2. Builds a complete, updated index.html and downloads it.
// You then move that downloaded file into your project folder
// (overwriting the old index.html) and run upload.bat to push it live.
// -------------------------
function savePortfolio() {
    if (!isLocal) return;

    const portfolioHTML = document.getElementById("portfolio").innerHTML;
    localStorage.setItem("portfolioData", portfolioHTML);
    localStorage.setItem("profileImage", document.getElementById("profileImage").src);
    localStorage.setItem("headerName", document.querySelector("header h1").innerHTML);
    localStorage.setItem("headerTitle", document.querySelector("header p").innerHTML);

    downloadUpdatedHTML();

    alert(
        "Saved!\n\n" +
        "A new index.html file has just downloaded.\n" +
        "Move it into your project folder (replace the old one),\n" +
        "then run upload.bat to push it live on Netlify."
    );
}

// Builds a full standalone HTML file with your current edits baked in,
// and triggers a browser download of it.
function downloadUpdatedHTML() {
    // Clone the current document so we don't modify the live page
    const docClone = document.documentElement.cloneNode(true);

    // Remove edit-only controls and contenteditable attributes from the
    // downloaded copy, AND strip the isLocal gating so the live site
    // (anyone's phone) renders cleanly without edit buttons.
    docClone.querySelectorAll(".edit-only").forEach(el => el.remove());
    docClone.querySelectorAll(".actions").forEach(el => el.remove());
    docClone.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.removeAttribute("contenteditable");
    });
    docClone.querySelectorAll(".card").forEach(el => {
        el.removeAttribute("draggable");
    });

    const finalHTML = "<!DOCTYPE html>\n" + docClone.outerHTML;

    const blob = new Blob([finalHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// -------------------------
// LOAD SAVED PORTFOLIO (this browser only, from localStorage)
// -------------------------
window.addEventListener("load", function () {
    const savedPortfolio = localStorage.getItem("portfolioData");
    const savedImage = localStorage.getItem("profileImage");
    const savedName = localStorage.getItem("headerName");
    const savedTitle = localStorage.getItem("headerTitle");

    if (savedPortfolio) {
        document.getElementById("portfolio").innerHTML = savedPortfolio;
    }
    if (savedImage) {
        document.getElementById("profileImage").src = savedImage;
    }
    if (savedName) {
        document.querySelector("header h1").innerHTML = savedName;
    }
    if (savedTitle) {
        document.querySelector("header p").innerHTML = savedTitle;
    }

    if (isLocal) {
        enableDragAndDrop();
    } else {
        disableEditingUI();
    }
});

// -------------------------
// DRAG AND DROP
// -------------------------
function enableDragAndDrop() {
    if (!isLocal) return;
    const cards = document.querySelectorAll(".card");
    let draggedCard = null;

    cards.forEach((card) => {
        card.setAttribute("draggable", "true");
        card.addEventListener("dragstart", function () {
            draggedCard = this;
            this.classList.add("dragging");
        });
        card.addEventListener("dragend", function () {
            this.classList.remove("dragging");
        });
        card.addEventListener("dragover", function (e) {
            e.preventDefault();
        });
        card.addEventListener("drop", function () {
            if (draggedCard && draggedCard !== this) {
                this.parentNode.insertBefore(draggedCard, this);
            }
        });
    });
}

// -------------------------
// DISABLE EDITING UI (for live/Netlify site)
// -------------------------
function disableEditingUI() {
    document.querySelectorAll(".card").forEach(card => {
        card.removeAttribute("draggable");
    });
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.removeAttribute("contenteditable");
    });
    document.querySelectorAll(".actions").forEach(el => {
        el.style.display = "none";
    });
    document.querySelectorAll(".edit-only").forEach(el => {
        el.style.display = "none";
    });
}

function downloadPDF() {
    window.print();
}
