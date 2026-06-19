const SUPABASE_URL = "https://rqltvmqdrmwhsarnlmzw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbHR2bXFkcm13aHNhcm5sbXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTQxMTEsImV4cCI6MjA5NzM3MDExMX0.f4kPweKB09VxXojrD4IJ5pvJT1mpaIxr2SX6bnKX-SY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const isLocal =
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

// LOAD DATA
async function loadPortfolioFromCloud() {
    const { data } = await supabaseClient
        .from("portfolio_data")
        .select("summary_text")
        .order("created_at", { ascending: false })
        .limit(1);

    if (data && data.length > 0) {
        document.getElementById("portfolio").innerHTML = data[0].summary_text;
    }
}

// INIT
window.addEventListener("DOMContentLoaded", async () => {
    await loadPortfolioFromCloud();

    if (!isLocal) {
        document.querySelectorAll("[contenteditable='true']")
            .forEach(el => el.removeAttribute("contenteditable"));

        document.querySelectorAll(".actions")
            .forEach(el => el.style.display = "none");

        document.querySelectorAll(".edit-only")
            .forEach(el => el.style.display = "none");
    }
});

// SAVE
function savePortfolio() {
    if (!isLocal) return;

    const content = document.getElementById("portfolio").innerHTML;

    supabaseClient
        .from("portfolio_data")
        .insert([{ summary_text: content }])
        .then(() => alert("Saved Successfully"))
        .catch(err => alert(err.message));
}

// ADD SECTION
function addSection() {
    if (!isLocal) return;

    const title = prompt("Enter Title");
    if (!title) return;

    const section = document.createElement("section");
    section.className = "card";

    section.innerHTML = `
        <div class="actions">
            <button onclick="deleteSection(this)">Delete</button>
        </div>
        <h2 contenteditable="true">${title}</h2>
        <p contenteditable="true">Edit here...</p>
    `;

    document.getElementById("portfolio").appendChild(section);
}

// DELETE
function deleteSection(btn) {
    if (!isLocal) return;
    btn.closest(".card").remove();
}

// PDF
function downloadPDF() {
    if (!isLocal) return;
    window.print();
}