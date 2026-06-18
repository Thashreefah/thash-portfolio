// -------------------------
// LOCAL-ONLY EDIT MODE CHECK
// -------------------------
// Edit tools (Add Section, Save, drag-and-drop, contenteditable, file upload)
// only run when this file is opened directly on your PC (localhost / 127.0.0.1 /
// file://). On Netlify (or any other domain) editing is fully disabled and the
// site renders as a plain static portfolio.
const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "" ||
    window.location.protocol === "file:";

// -------------------------
// PROFILE IMAGE UPLOAD (local only, no persistence)
// -------------------------
// This only changes the image on screen while you're playing with it locally.
// It is NOT saved anywhere — if you want a new photo permanently, replace the
// image file/URL in index.html and re-run upload.bat.
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

// -------------------------
// ADD NEW SECTION (local only)
// -------------------------
function addSection(){
    if(!isLocal) return;
    const title =
    prompt("Enter Section Title");
    if(!title) return;
    const section =
    document.createElement("section");
    section.classList.add("card");
    section.setAttribute(
        "draggable",
        "true"
    );
    section.innerHTML = `
        <div class="actions">
            <button onclick="deleteSection(this)">
                Delete
            </button>
        </div>
        <h2 contenteditable="true">
            ${title}
        </h2>
        <p contenteditable="true">
            Click here and edit content.
        </p>
    `;
    document
    .getElementById("portfolio")
    .appendChild(section);
    enableDragAndDrop();
}
// -------------------------
// DELETE SECTION (local only)
// -------------------------
function deleteSection(button){
    if(!isLocal) return;
    if(confirm("Delete this section?")){
        button
        .parentElement
        .parentElement
        .remove();
    }
}
// -------------------------
// SAVE PORTFOLIO (local only — copies current HTML to clipboard
// so you can paste it into index.html and run upload.bat)
// -------------------------
function savePortfolio(){
    if(!isLocal) return;
    const portfolioHTML =
    document.getElementById("portfolio")
    .innerHTML;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(portfolioHTML).then(function () {
            alert(
                "Current portfolio HTML copied to clipboard!\n\n" +
                "Paste it into the <main id=\"portfolio\"> section of index.html, " +
                "save the file, then run upload.bat to publish it on Netlify."
            );
        }).catch(function () {
            console.log(portfolioHTML);
            alert(
                "Could not copy automatically. The portfolio HTML has been printed " +
                "to the browser console (press F12) — copy it from there into index.html."
            );
        });
    } else {
        console.log(portfolioHTML);
        alert(
            "The portfolio HTML has been printed to the browser console (press F12) " +
            "— copy it from there into index.html, then run upload.bat."
        );
    }
}
// -------------------------
// INITIAL SETUP ON LOAD
// -------------------------
window.addEventListener(
    "load",
    function(){
        if(isLocal){
            enableDragAndDrop();
        } else {
            disableEditingUI();
        }
    }
);
// -------------------------
// DRAG AND DROP (local only)
// -------------------------
function enableDragAndDrop(){
    if(!isLocal) return;
    const cards =
    document.querySelectorAll(".card");
    let draggedCard = null;
    cards.forEach(card => {
        card.setAttribute("draggable", "true");
        card.addEventListener(
            "dragstart",
            function(){
                draggedCard = this;
                this.classList.add(
                    "dragging"
                );
            }
        );
        card.addEventListener(
            "dragend",
            function(){
                this.classList.remove(
                    "dragging"
                );
            }
        );
        card.addEventListener(
            "dragover",
            function(e){
                e.preventDefault();
            }
        );
        card.addEventListener(
            "drop",
            function(){
                if(
                    draggedCard &&
                    draggedCard !== this
                ){
                    const parent =
                    this.parentNode;
                    parent.insertBefore(
                        draggedCard,
                        this
                    );
                }
            }
        );
    });
}
// -------------------------
// DISABLE EDITING UI (for live/Netlify site)
// -------------------------
function disableEditingUI(){
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
