function sauvegarderDonnees() {
	const board = document.querySelector(".board");
	if (!board) return;

	const data = [...board.querySelectorAll(".list")].map((list) => ({
		nomListe: list.querySelector(".list-header span")?.textContent || "",
		taches: [...list.querySelectorAll(".task .task-text")].map(
			(task) => task.textContent
		),
	}));

	const newData = JSON.stringify(data);
	if (localStorage.getItem("kanbanData") !== newData) {
		localStorage.setItem("kanbanData", newData);
	}
}

function chargerDonnees() {
	const board = document.querySelector(".board");
	if (!board) return;

	const savedData = JSON.parse(localStorage.getItem("kanbanData") || "[]");
	for (const { nomListe, taches } of savedData) {
		ajouterListe(nomListe, taches);
	}
}

function ajouterListe(nom, taches = []) {
	const board = document.querySelector(".board");
	if (!board) return;

	const liste = document.createElement("div");
	liste.className = "list";
	liste.setAttribute("aria-label", `Liste ${nom}`);

	const header = document.createElement("div");
	header.className = "list-header";
	header.innerHTML = `<span>${nom}</span>`;

	const boutonSupprimerListe = document.createElement("button");
	boutonSupprimerListe.textContent = "x";
	boutonSupprimerListe.setAttribute("aria-label", `Supprimer la liste ${nom}`);
	boutonSupprimerListe.onclick = () => {
		liste.remove();
		sauvegarderDonnees();
	};

	header.appendChild(boutonSupprimerListe);
	liste.appendChild(header);

	const boutonAjouterTache = document.createElement("button");
	boutonAjouterTache.className = "add-task-btn";
	boutonAjouterTache.textContent = "Ajouter une tâche";
	boutonAjouterTache.setAttribute(
		"aria-label",
		`Ajouter une tâche à la liste ${nom}`
	);
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

function ajouterTache(liste, nomTache, save = true) {
	const tache = document.createElement("div");
	tache.className = "task";
	tache.draggable = true;
	tache.setAttribute("aria-label", `Tâche: ${nomTache}`);

	const texteTache = document.createElement("span");
	texteTache.className = "task-text";
	texteTache.textContent = nomTache;

	const boutonSupprimerTache = document.createElement("button");
	boutonSupprimerTache.className = "remove-task";
	boutonSupprimerTache.textContent = "x";
	boutonSupprimerTache.setAttribute(
		"aria-label",
		`Supprimer la tâche ${nomTache}`
	);
	boutonSupprimerTache.addEventListener("click", () => {
		tache.remove();
		sauvegarderDonnees();
	});

	tache.append(texteTache, boutonSupprimerTache);

	const addBtn = liste.querySelector(".add-task-btn");
	liste.insertBefore(tache, addBtn);

	tache.addEventListener("dragstart", () => tache.classList.add("dragging"));
	tache.addEventListener("dragend", () => {
		tache.classList.remove("dragging");
		sauvegarderDonnees();
	});

	if (save) sauvegarderDonnees();

	return tache;
}

function gererDragOver(e) {
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

window.addEventListener("load", () => {
	const board = document.querySelector(".board");
	if (!board) return;

	const addListBtn = document.querySelector(".add-list-btn");
	addListBtn?.setAttribute("aria-label", "Ajouter une nouvelle liste");
	addListBtn?.addEventListener("click", () => {
		const nomListe = prompt("Nom de la liste :");
		if (nomListe) ajouterListe(nomListe);
	});

	chargerDonnees();
});
