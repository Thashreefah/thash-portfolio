// -------------------------
// LOCAL-ONLY EDIT MODE CHECK
// -------------------------
const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "";

// -------------------------
// PROFILE IMAGE UPLOAD
// -------------------------
const imageUpload = document.getElementById("imageUpload");
const profileImage = document.getElementById("profileImage");
imageUpload.addEventListener("change", function () {
    const file = this.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(e){
            profileImage.src = e.target.result;
            localStorage.setItem(
                "profileImage",
                e.target.result
            );
        };
        reader.readAsDataURL(file);
    }
});
// -------------------------
// LOAD SAVED IMAGE
// -------------------------
const savedImage =
localStorage.getItem("profileImage");
if(savedImage){
    profileImage.src = savedImage;
}
// -------------------------
// ADD NEW SECTION
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
// DELETE SECTION
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
// SAVE PORTFOLIO
// -------------------------
function savePortfolio(){
    if(!isLocal) return;
    const portfolioHTML =
    document.getElementById("portfolio")
    .innerHTML;
    localStorage.setItem(
        "portfolioData",
        portfolioHTML
    );
    alert(
        "Portfolio Saved Successfully!"
    );
}
// -------------------------
// LOAD SAVED PORTFOLIO
// -------------------------
window.addEventListener(
    "load",
    function(){
        const savedPortfolio =
        localStorage.getItem(
            "portfolioData"
        );
        if(savedPortfolio){
            document.getElementById(
                "portfolio"
            ).innerHTML =
            savedPortfolio;
        }

        if(isLocal){
            enableDragAndDrop();
        } else {
            disableEditingUI();
        }
    }
);
// -------------------------
// DRAG AND DROP
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
    // remove draggable attribute and contenteditable from all cards
    document.querySelectorAll(".card").forEach(card => {
        card.removeAttribute("draggable");
    });
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.removeAttribute("contenteditable");
    });

    // hide image upload input
    if(imageUpload){
        imageUpload.style.display = "none";
    }

    // hide all action buttons (Delete, Add Section, Save, etc.)
    document.querySelectorAll(".actions").forEach(el => {
        el.style.display = "none";
    });

    // hide any element marked with class "edit-only"
    document.querySelectorAll(".edit-only").forEach(el => {
        el.style.display = "none";
    });
}

function downloadPDF() {
    window.print();
}