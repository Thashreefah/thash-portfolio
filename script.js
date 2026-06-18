// 1. Initialize Supabase Connection
const SUPABASE_URL = "https://supabase.com/dashboard/project/rqltvmqdrmwhsarnlmzw/settings/api-keys"; // <-- Paste your Project URL here
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbHR2bXFkcm13aHNhcm5sbXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTQxMTEsImV4cCI6MjA5NzM3MDExMX0.f4kPweKB09VxXojrD4IJ5pvJT1mpaIxr2SX6bnKX-SY";      // <-- Paste your anon/public key here
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Automatically load your saved website whenever anyone visits it online
async function loadPortfolioFromCloud() {
    const { data, error } = await supabase
        .from('portfolio_data')
        .select('summary_text')
        .order('created_at', { ascending: false })
        .limit(1);

    if (!error && data && data.length > 0) {
        // This replaces your static text with your saved cloud changes!
        document.getElementById("portfolio").innerHTML = data[0].summary_text;
        
        // Keep your layout working nicely after loading
        if (typeof enableDragAndDrop === "function") enableDragAndDrop();
        if (!isLocal && typeof disableEditingUI === "function") disableEditingUI();
    }
}
window.addEventListener('DOMContentLoaded', loadPortfolioFromCloud);


// =========================================================
// LOCAL-ONLY EDIT MODE CHECK
// =========================================================
// Editing tools (Add Section, Save, Delete, drag-and-drop,
// contenteditable text, image upload) ONLY run when this
// page is opened locally on your PC:
//   - by double-clicking index.html (file:// protocol), or
//   - via localhost / 127.0.0.1 (e.g. node server.js, or
//     VS Code Live Server)
//
// On Netlify, or ANY other domain, isLocal is false and
// disableEditingUI() runs, removing every editing feature.
// =========================================================
const isLocal =
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "";

// True only when running through node server.js (http/https + localhost),
// not when just double-clicking the file (file:// protocol).
const hasLocalServer =
    (window.location.protocol === "http:" || window.location.protocol === "https:") &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

// =========================================================
// PROFILE IMAGE UPLOAD (local preview only — not saved)
// =========================================================
const imageUpload = document.getElementById("imageUpload");
const profileImage = document.getElementById("profileImage");

if (imageUpload && isLocal) {
    imageUpload.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// =========================================================
// ADD NEW SECTION (local only)
// =========================================================
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

// =========================================================
// DELETE SECTION (local only)
// =========================================================
function deleteSection(button) {
    if (!isLocal) return;
    if (confirm("Delete this section?")) {
        button.parentElement.parentElement.remove();
    }
}

// =========================================================
// SAVE PORTFOLIO (local only)
//
// If running through node server.js (hasLocalServer = true):
//   Sends the HTML to the local server, which writes it
//   directly into index.html on disk. Nothing to copy/paste.
//
// If just opened by double-clicking the file (no server):
//   Falls back to copying the HTML to your clipboard so you
//   can paste it into index.html manually.
// =========================================================

async function savePortfolio() {
    const portfolioContent = document.getElementById("portfolio").innerHTML;

    // Send the layout directly to your Supabase cloud database table
    const { data, error } = await supabase
        .from('portfolio_data')
        .insert([{ summary_text: portfolioContent }]);

    if (error) {
        alert("Failed to save to cloud: " + error.message);
    } else {
        alert("Portfolio successfully saved to the cloud database!");
    }
}
// =========================================================
// INITIAL SETUP ON LOAD
// =========================================================
window.addEventListener("load", function () {
    if (isLocal) {
        enableDragAndDrop();
    } else {
        disableEditingUI();
    }
});

// =========================================================
// DRAG AND DROP (local only)
// =========================================================
function enableDragAndDrop() {
    if (!isLocal) return;

    const cards = document.querySelectorAll(".card");
    let draggedCard = null;

    cards.forEach(card => {
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

// =========================================================
// DISABLE EDITING UI (runs on Netlify / any live domain)
// =========================================================
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
