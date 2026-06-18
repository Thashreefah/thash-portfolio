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
// SAVE PORTFOLIO (Sends data to node server.js on your computer)
// =========================================================
function savePortfolio() {
    if (!isLocal) return;

    const portfolioHTML = document.getElementById("portfolio").innerHTML;

    if (hasLocalServer) {
        fetch("/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ portfolioHTML })
        })
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    alert(
                        "Saved! index.html has been updated on disk.\n\n" +
                        "Run upload.bat to publish these changes to Netlify."
                    );
                } else {
                    alert("Save failed: " + (data.error || "Unknown error"));
                }
            })
            .catch(err => {
                alert(
                    "Could not reach the local server.\n" +
                    "Make sure you started it with: node server.js\n\n" +
                    "(Error: " + err.message + ")"
                );
            });
        return;
    }

    // Fallback: no local server running, use clipboard
    const showInstructions = function () {
        alert(
            "Portfolio HTML copied to clipboard!\n\n" +
            "Next steps:\n" +
            "1. Open index.html in your code editor\n" +
            "2. Find <main id=\"portfolio\"> ... </main>\n" +
            "3. Replace everything between those tags with the copied HTML\n" +
            "4. Save the file\n" +
            "5. Run upload.bat to publish to Netlify\n\n" +
            "Tip: run 'node server.js' and open localhost:3000 instead, " +
            "and Save will write the file for you automatically."
        );
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(portfolioHTML)
            .then(showInstructions)
            .catch(function () {
                console.log(portfolioHTML);
                alert("Could not copy automatically. Open the browser console (F12) to copy the HTML manually.");
            });
    } else {
        console.log(portfolioHTML);
        alert("Open the browser console (F12) to copy the portfolio HTML manually.");
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