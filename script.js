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

        enableDragAndDrop();
    }
);

// -------------------------
// DRAG AND DROP
// -------------------------

function enableDragAndDrop(){

    const cards =
    document.querySelectorAll(".card");

    let draggedCard = null;

    cards.forEach(card => {

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
function downloadPDF() {

    window.print();

}