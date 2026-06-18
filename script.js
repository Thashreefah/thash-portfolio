// =========================================================
// 1. INITIALIZE SUPABASE CONNECTION
// =========================================================
// FIXED: Changed from the dashboard URL to your actual public API URL endpoints
const SUPABASE_URL = "https://rqltvmqdrmwhsarnlmzw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbHR2bXFkcm13aHNhcm5sbXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTQxMTEsImV4cCI6MjA5NzM3MDExMX0.f4kPweKB09VxXojrD4IJ5pvJT1mpaIxr2SX6bnKX-SY";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================================================
// 2. AUTOMATICALLY LOAD FROM CLOUD DATABASE
// =========================================================
async function loadPortfolioFromCloud() {
    const { data, error } = await supabase
        .from('portfolio_data')
        .select('summary_text')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Failed to load layout data from Supabase:", error.message);
        return;
    }

    if (data && data.length > 0) {
        // Replace the static HTML block with whatever layout was saved last
        document.getElementById("portfolio").innerHTML = data[0].summary_text;
        
        // Re-initialize layout tools depending on whether we are local or hosted live
        if (isLocal) {
            enableDragAndDrop();
        } else {
            disableEditingUI();
        }
    }
}

// Run the data fetch immediately when the webpage finishes structural layout generation
window.addEventListener('DOMContentLoaded', loadPortfolioFromCloud);

// =========================================================
// LOCAL-ONLY EDIT MODE CHECK
// =========================================================
const isLocal =
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "";

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
// SAVE PORTFOLIO (Saves to Cloud instead of disk)
// =========================================================
async function savePortfolio() {
    const portfolioContent = document.getElementById("portfolio").innerHTML;

    // Send the layout directly to your Supabase cloud database table
    const { data, error } = await supabase
        .from('portfolio_data')
        .insert([{ summary_text: portfolioContent }]);

    if (error) {
        alert("Failed to save to cloud database: " + error.message);
    } else {
        alert("Portfolio successfully saved to the cloud database!\n\nIt will now instantly update across Netlify, hosts, and other computers.");
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

    document.querySelectorAll('[contenteditable=\"true\"]').forEach(el => {
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