const storageKey = "mmd_crud";

let notes = loadNotes();

const createForm = document.getElementById("createForm");
const noteInput = document.getElementById("noteInput");
const notesList = document.getElementById("notesList");

function loadNotes() {
    const raw = localStorage.getItem(storageKey);

    if(raw === null){
        return[
            {id: 1, text: "klik 'Rediger' for at ændre noten ✏️", done: false},
            {id: 2, text: "klik 'Done' for at markere færdig ✅️", done: true}
        ];
    }

    try{
        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch (error) {
        return [];
    }
}

function saveNotes(){
    localStorage.setItem(storageKey, JSON.stringify(notes));
}

function generateId(){
    if (notes.length === 0) return 1;
    const ids = notes.map(n => n.id);
    return Math.max(...ids) + 1;
}


function renderNotes() {
    notesList.innerHTML = "";

    if (notes.length === 0) {
        notesList.innerHTML = "<li class='muted'>Ingen noter endnu. Tilføj en 👆</li>";
        return;
    }

    notes.forEach(note => {
        const li = document.createElement("li");

        /***************
         * DONE/UNDONE
         * En knap der toggler note.done mellem true/false
         ***************/
        const doneBtn = document.createElement("button");
        doneBtn.className = "small";
        doneBtn.textContent = note.done ? "Undone" : "Done";

        doneBtn.addEventListener("click", () => {
            toggleDone(note.id);
        });

        li.appendChild(doneBtn);

        /***************
         * INLINE EDIT UI
         * Vi viser forskelligt afhængigt af note.editing
         ***************/
        if (note.editing === true) {
            // EDIT MODE: input + gem + annuller
            const editInput = document.createElement("input");
            editInput.value = note.text; // eksisterende tekst i input
            editInput.setAttribute("aria-label", "Rediger note");

            // Gem-knap
            const saveBtn = document.createElement("button");
            saveBtn.className = "small";
            saveBtn.textContent = "Gem";

            // Annullér-knap
            const cancelBtn = document.createElement("button");
            cancelBtn.className = "small";
            cancelBtn.textContent = "Annullér";

            // Klik "Gem" → update note.text og slå editing fra
            saveBtn.addEventListener("click", () => {
                saveEdit(note.id, editInput.value);
            });

            // Klik "Annullér" → bare slå editing fra uden ændring
            cancelBtn.addEventListener("click", () => {
                cancelEdit(note.id);
            });

            // Bonus: hvis man trykker Enter i input → gem
            editInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    saveEdit(note.id, editInput.value);
                }
                // Escape → annuller
                if (e.key === "Escape") {
                    cancelEdit(note.id);
                }
            });

            // Put i DOM
            editInput.className = "note-text";
            li.appendChild(editInput);
            li.appendChild(saveBtn);
            li.appendChild(cancelBtn);

            // Sæt fokus når vi renderer edit-mode
            setTimeout(() => editInput.focus(), 0);
        } else {
            // VIEW MODE: tekst + redigér + slet
            const span = document.createElement("span");
            span.className = "note-text";

            // Hvis note.done er true, giver vi span en class som streger over
            span.textContent = note.text;
            if (note.done) span.classList.add("done");

            const editBtn = document.createElement("button");
            editBtn.className = "small";
            editBtn.textContent = "Redigér";
            editBtn.addEventListener("click", () => startEdit(note.id));

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "small";
            deleteBtn.textContent = "Slet";
            deleteBtn.addEventListener("click", () => deleteNote(note.id));

            li.appendChild(span);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
        }

        notesList.appendChild(li);
    });
}


function addNote(text) {
    if(text.trim() === " "){
        alert("Du skal skrive noget før du kan tilføje en note!");
    }
    const newNote = {
        id: generateId(),
        text: text.trim(),
        done: false
    };
    notes.push(newNote);
    saveNotes();
    renderNotes();
}

function deleteNote(id) {
    const ok = confirm("Er du sikker på at du vil slette noten?");
    if(!ok) return;

    notes = notes.filter(n => n.id !== id);
    saveNotes();
    renderNotes();
}

function toggleDone(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    note.done = !note.done;
    saveNotes();
    renderNotes();
}

function startEdit(id) {
    notes.forEach(n => n.editing = false);

    const note = notes.find(n => n.id === id);
    if(!note) return;

    note.editing = true;
    renderNotes();
}

function saveEdit(id, newText) {
    if (newText.trim() === " " ){
        alert("Noten må ikke være tom!");
        return;
    }

    const note = notes.find(n => n.id === id);
    if (!note) return;

    note.text = newText.trim();
    note.editing = false;

    saveNotes();
    renderNotes();
}


function cancelEdit(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    note.editing = false;
    renderNotes();
}

createForm.addEventListener("submit", (event) =>{
    event.preventDefault();

    addNote(noteInput.value);

    noteInput.value = " ";
    noteInput.focus();
})


renderNotes();
