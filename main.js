function sauvegarderDonnees() {
	// ex-Data
	const board = document.querySelector(".board");
	const lists = board.querySelectorAll(".list");
	const data = [];

	lists.forEach((list) => {
		const nomListe = list.querySelector(".list-header span").textContent;
		const taches = [];
		list.querySelectorAll(".task .task-text").forEach((task) => {
			taches.push(task.textContent);
		});
		data.push({ nomListe, taches });
	});

	localStorage.setItem("kanbanData", JSON.stringify(data));
}

function chargerDonnees() {
	// ex-loadData
	const savedData = JSON.parse(localStorage.getItem("kanbanData")) || [];
	savedData.forEach((list) => {
		ajouterListe(list.nomListe, list.taches);
	});
}

document.querySelector(".add-list-btn").addEventListener("click", () => {
	const nomListe = prompt("Nom de la liste :");
	if (nomListe) ajouterListe(nomListe);
});

function ajouterListe(nom, taches = []) {
	// ex-createList
	const board = document.querySelector(".board");

	const liste = document.createElement("div");
	liste.className = "list";

	const header = document.createElement("div");
	header.className = "list-header";
	header.innerHTML = `<span>${nom}</span>`;

	const boutonSupprimerListe = document.createElement("button");
	boutonSupprimerListe.textContent = "x";
	boutonSupprimerListe.onclick = () => {
		liste.remove();
		sauvegarderDonnees();
	};
	header.appendChild(boutonSupprimerListe);
	liste.appendChild(header);

	const boutonAjouterTache = document.createElement("button");
	boutonAjouterTache.className = "add-task-btn";
	boutonAjouterTache.textContent = "Ajouter une tâche";
	boutonAjouterTache.onclick = () => {
		const nomTache = prompt("Nom de la tâche :");
		if (nomTache) {
			ajouterTache(liste, nomTache);
			sauvegarderDonnees();
		}
	};
	liste.appendChild(boutonAjouterTache);

	board.appendChild(liste);

	taches.forEach((nomTache) => ajouterTache(liste, nomTache));

	liste.addEventListener("dragover", gererDragOver);

	sauvegarderDonnees();
}

function ajouterTache(liste, nomTache) {
	// ex-createTask
	const tache = document.createElement("div");
	tache.className = "task";
	tache.draggable = true;

	const texteTache = document.createElement("span");
	texteTache.className = "task-text";
	texteTache.textContent = nomTache;
	tache.appendChild(texteTache);

	const boutonSupprimerTache = document.createElement("button");
	boutonSupprimerTache.className = "remove-task";
	boutonSupprimerTache.textContent = "x";
	boutonSupprimerTache.onclick = () => {
		tache.remove();
		sauvegarderDonnees();
	};
	tache.appendChild(boutonSupprimerTache);

	liste.insertBefore(tache, liste.querySelector(".add-task-btn"));

	tache.addEventListener("dragstart", () => tache.classList.add("dragging"));
	tache.addEventListener("dragend", () => {
		tache.classList.remove("dragging");
		sauvegarderDonnees();
	});
}

function gererDragOver(e) {
	// ex-dragOverHandler
	e.preventDefault();
	const tacheEnCours = document.querySelector(".dragging");
	const container = e.currentTarget;
	const apresElement = trouverElementApres(container, e.clientY);
	const boutonAjouter = container.querySelector(".add-task-btn");
	if (!apresElement) {
		container.insertBefore(tacheEnCours, boutonAjouter);
	} else {
		container.insertBefore(tacheEnCours, apresElement);
	}
}

function trouverElementApres(container, y) {
	// ex-getDragAfterElement
	const elementsDraggables = [
		...container.querySelectorAll(".task:not(.dragging)"),
	];
	return elementsDraggables.reduce(
		(plusProche, enfant) => {
			const box = enfant.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;
			if (offset < 0 && offset > plusProche.offset) {
				return { offset, element: enfant };
			} else {
				return plusProche;
			}
		},
		{ offset: Number.NEGATIVE_INFINITY }
	).element;
}

window.addEventListener("load", chargerDonnees);

