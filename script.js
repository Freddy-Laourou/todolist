const button = document.querySelector('.add_task button');
const formulaire = document.querySelector('.formulaire');
const champ_saisi = document.getElementById('input_field');
const date_saisie = document.getElementById('date_field');
const heure_saisie = document.getElementById('hour_field');
const cancel_button = document.querySelector('.cancel_btn');
const add_button = document.querySelector('.add_btn');
const premiere_task = document.getElementById('task0');
const liste_taches = document.querySelector('.task_grid');
let tache_en_edition = null;

let compteur_id = 0;

function close_formulaire() {
    formulaire.classList.toggle('hidden');
}

function cancel_formulaire() {
    champ_saisi.value = '';
    date_saisie.value = '';
    heure_saisie.value = '';
    tache_en_edition = null;
    close_formulaire();
}

async function add_task() {
    let texte_actuel = champ_saisi.value;
    let date_value = date_saisie.value;
    let hour_value = heure_saisie.value;

    if (texte_actuel != '' && date_value != '' && hour_value != '') {

        if (tache_en_edition != null) {
            let span = tache_en_edition.querySelector('span');
            let date = tache_en_edition.querySelector('.date');
            let heure = tache_en_edition.querySelector('.hour');

            span.textContent = texte_actuel;
            date.textContent = date_value;
            heure.textContent = hour_value;

            tache_en_edition = null;

        } else {
            compteur_id++;

            let clone_task = premiere_task.cloneNode(true);
            let span = clone_task.querySelector('span');
            let checkbox = clone_task.querySelector('input[type="checkbox"]');
            let label = clone_task.querySelector('label');
            let date = clone_task.querySelector('.date');
            let heure = clone_task.querySelector('.hour');

            span.textContent = texte_actuel;
            checkbox.id = `t${compteur_id}`;
            clone_task.id = `task${compteur_id}`;
            checkbox.checked = false;
            label.htmlFor = `t${compteur_id}`;
            date.textContent = date_value;
            heure.textContent = hour_value;

            clone_task.classList.remove('hidden');
            liste_taches.appendChild(clone_task);
        }

        champ_saisi.value = '';
        date_saisie.value = '';
        heure_saisie.value = '';

        close_formulaire();
        trier_tasks();
        await save_tasks();
    }
}

function pull_task() {
    let all_tasks = document.querySelectorAll('.a_task');
    let tasks_data = [];

    all_tasks.forEach(function(task) {

        if (task.id === "task0") return;

        let checkbox = task.querySelector('input[type="checkbox"]');
        let span = task.querySelector('span');
        let date = task.querySelector('.date');
        let heure = task.querySelector('.hour');

        tasks_data.push({
            checkbox_state: checkbox.checked,
            text: span.textContent,
            date: date.textContent,
            heure: heure.textContent
        });
    });
    return tasks_data;
}

async function sauvergarder_taches(tableau) {
    await fetch ('/tasks', {
        method : 'POST',
        headers : { 'Content-Type': 'application/json'},
        body :JSON.stringify(tableau)
    });
}


async function save_tasks() {
    let tasks_data = pull_task();
    await sauvergarder_taches(tasks_data);
}

async function push_tasks() {
    compteur_id = 0;

    let reponse = await fetch('/tasks');
    let donnees = await reponse.json();

    if (donnees != null) {
        let tasks_data = donnees;

        tasks_data.forEach(function(task_object) {
            let clone_task = premiere_task.cloneNode(true);
            let span = clone_task.querySelector('span');
            let checkbox = clone_task.querySelector('input[type="checkbox"]');
            let label = clone_task.querySelector('label');
            let date = clone_task.querySelector('.date');
            let heure = clone_task.querySelector('.hour');

            compteur_id++;

            span.textContent = task_object.text;
            checkbox.id = `t${compteur_id}`;
            clone_task.id = `task${compteur_id}`;
            checkbox.checked = task_object.checkbox_state;
            label.htmlFor = `t${compteur_id}`;
            date.textContent = task_object.date;
            heure.textContent = task_object.heure;

            clone_task.classList.remove('hidden');
            liste_taches.appendChild(clone_task);
        });
    }
    trier_tasks();
}

async function delete_task(tache) {
    tache.remove();
    trier_tasks();
    await save_tasks();
}

function edit_task(tache) {
    tache_en_edition = tache;

    let span = tache.querySelector('span');
    let date = tache.querySelector('.date');
    let heure = tache.querySelector('.hour');

    champ_saisi.value = span.textContent;
    date_saisie.value = date.textContent;
    heure_saisie.value = heure.textContent;

    formulaire.classList.remove('hidden');
}

function trier_tasks() {
    let all_tasks = document.querySelectorAll(".a_task:not(#task0)");
    let tableau = Array.from(all_tasks);
    let selected_tasks = [];
    let non_selected_tasks = [];
    tableau.forEach(function(tache){
        let checkbox = tache.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            selected_tasks.push(tache);
        } else {
            non_selected_tasks.push(tache);
        }
    })
    
    non_selected_tasks.sort((a,b) => {
        const date_a = a.querySelector('.date').textContent;
        const heure_a = a.querySelector('.hour').textContent;
        const date_b = b.querySelector('.date').textContent;
        const heure_b = b.querySelector('.hour').textContent;

        const date_aComplete = new Date(`${date_a}T${heure_a}`);
        const date_bComplete = new Date(`${date_b}T${heure_b}`);
        
        return date_aComplete - date_bComplete
    } );
    
    non_selected_tasks.forEach(function(tache) {
        liste_taches.appendChild(tache);
    })
    selected_tasks.forEach(function(tache) {
        liste_taches.appendChild(tache);
    })
    
}

button.addEventListener('click', close_formulaire);
cancel_button.addEventListener('click', cancel_formulaire);
add_button.addEventListener('click', add_task);
liste_taches.addEventListener('click', async function(event) {
    if (event.target.classList.contains('delete_btn')) {
        let tache = event.target.closest('.a_task');
        await delete_task(tache);
    }

    if (event.target.classList.contains('edit_btn')) {
        let tache = event.target.closest('.a_task');
        edit_task(tache);
    }
});
liste_taches.addEventListener('change', async function(event){
    if (event.target.matches('input[type="checkbox"]')) {
        trier_tasks();
        await save_tasks();
    }
})

push_tasks();