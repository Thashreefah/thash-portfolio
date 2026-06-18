// =========================================================
// 1. INITIALIZE SUPABASE CONNECTION
// =========================================================
const SUPABASE_URL = "https://rqltvmqdrmwhsarnlmzw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbHR2bXFkcm13aHNhcm5sbXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTQxMTEsImV4cCI6MjA5NzM3MDExMX0.f4kPweKB09VxXojrD4IJ5pvJT1mpaIxr2SX6bnKX-SY";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================================================
// 2. AUTOMATICALLY LOAD SAVED LAYOUT FROM CLOUD
// =========================================================
async function loadPortfolioFromCloud() {
    const { data, error } = await supabase
        .from('portfolio_data')
        .select('summary_text')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Failed to load from database:", error.message);
        return;
    }

    if (data && data.length > 0) {
        // This injects your latest saved changes on Netlify and other PCs!
        document.getElementById("portfolio").innerHTML = data[0].summary_text;
    }
}

// Fetch the saved text from the cloud as soon as the page opens
window.addEventListener('DOMContentLoaded', loadPortfolioFromCloud);

// =========================================================
// LOCAL-ONLY EDIT MODE CHECK
// =========================================================
const isLocal =
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "";

// =========================================================
// PROFILE IMAGE UPLOAD (local preview only)
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
// ADD NEW SECTION
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
// DELETE SECTION
// =========================================================
function deleteSection(button) {
    if (!isLocal) return;
    if (confirm("Delete this section?")) {
        button.parentElement.parentElement.remove();
    }
}

// =========================================================
// SAVE PORTFOLIO (Sends data directly to the internet database)
// =========================================================
async function savePortfolio() {
    const portfolioContent = document.getElementById("portfolio").innerHTML;

    // Send the changes straight up to the Supabase Cloud
    const { data, error } = await supabase
        .from('portfolio_data')
        .insert([{ summary_text: portfolioContent }]);

    if (error) {
        alert("Failed to save to cloud database: " + error.message);
    } else {
        alert("Portfolio successfully saved to the cloud database!\n\nRefresh your Netlify page on any computer right now—it's updated!");
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
// DRAG AND DROP
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
// DISABLE EDITING UI (runs on Netlify)
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