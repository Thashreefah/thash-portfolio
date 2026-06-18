// -------------------------
// LOCAL-ONLY EDIT MODE CHECK
// (only YOU, on localhost, get edit buttons / contenteditable)
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
// SAVE PORTFOLIO -> FIREBASE
// This is the part that makes edits show up on Netlify for everyone.
// Instead of localStorage (which never leaves your browser), this writes
// to a shared Firebase Realtime Database that the live site also reads from.
// -------------------------
function savePortfolio() {
    if (!isLocal) return;

    const portfolioHTML = document.getElementById("portfolio").innerHTML;
    const profileImageSrc = document.getElementById("profileImage").src;
    const nameHTML = document.querySelector("header h1").innerHTML;
    const titleHTML = document.querySelector("header p").innerHTML;

    showStatus("Saving...", false);

    db.ref("portfolio").set({
        html: portfolioHTML,
        image: profileImageSrc,
        name: nameHTML,
        title: titleHTML,
        updatedAt: Date.now()
    })
    .then(() => {
        showStatus("Saved! This is now live on the Netlify site for everyone.", false);
    })
    .catch((error) => {
        showStatus("Save failed: " + error.message, true);
        console.error("Firebase save error:", error);
    });
}

function showStatus(message, isError) {
    const el = document.getElementById("saveStatus");
    if (!el) return;
    el.textContent = message;
    el.className = "save-status visible" + (isError ? " error" : "");
    setTimeout(() => {
        el.className = "save-status";
    }, 3500);
}

// -------------------------
// LOAD PORTFOLIO FROM FIREBASE
// Runs for EVERY visitor (local or live). This is what makes your
// localhost edits appear on other people's phones on Netlify.
// -------------------------
function loadPortfolioFromFirebase() {
    db.ref("portfolio").once("value")
        .then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                if (data.html) {
                    document.getElementById("portfolio").innerHTML = data.html;
                }
                if (data.image) {
                    document.getElementById("profileImage").src = data.image;
                }
                if (data.name) {
                    document.querySelector("header h1").innerHTML = data.name;
                }
                if (data.title) {
                    document.querySelector("header p").innerHTML = data.title;
                }
            }
        })
        .catch((error) => {
            console.error("Firebase load error:", error);
        })
        .finally(() => {
            if (isLocal) {
                enableDragAndDrop();
            } else {
                disableEditingUI();
            }
        });
}

// Optional: keep the live site updating in real time without a refresh
// (every visitor's page updates the instant you click Save)
function listenForLiveUpdates() {
    db.ref("portfolio").on("value", (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        if (data.html) document.getElementById("portfolio").innerHTML = data.html;
        if (data.image) document.getElementById("profileImage").src = data.image;
        if (data.name) document.querySelector("header h1").innerHTML = data.name;
        if (data.title) document.querySelector("header p").innerHTML = data.title;

        if (!isLocal) {
            disableEditingUI();
        }
    });
}

window.addEventListener("load", function () {
    loadPortfolioFromFirebase();
    listenForLiveUpdates();
});

// -------------------------
// DRAG AND DROP (edit mode only)
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
// DISABLE EDITING UI (for the live Netlify site)
// -------------------------
function disableEditingUI() {
    document.querySelectorAll(".card").forEach((card) => {
        card.removeAttribute("draggable");
    });
    document.querySelectorAll('[contenteditable="true"]').forEach((el) => {
        el.removeAttribute("contenteditable");
    });
    document.querySelectorAll(".actions").forEach((el) => {
        el.style.display = "none";
    });
    document.querySelectorAll(".edit-only").forEach((el) => {
        el.style.display = "none";
    });
}

function downloadPDF() {
    window.print();
}
