import React from 'react';

// ============================================================================
// FICHIER DE CONFIGURATION DU COMPOSANT <Calendar />
// Ce fichier regroupe toutes les props et fonctions demandées utiles pour
// utiliser pleinement les fonctionnalités du calendrier que vous possédez.
// ============================================================================

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. FONCTIONS DE RENDUS (Renders personnalisés)
 * Ces fonctions reçoivent des données en paramètre (`currentGroup`, `dayInfo`, etc.)
 * et retournent du code JSX (ReactNode) pour personnaliser l'apparence.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const groupRender = ({ currentGroup }) => {
  // Affiche l'entête du groupe (ex: Nom du développeur, d'une salle, d'un projet)
  return (
    <div className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 transition border-b border-gray-100 h-full">
      {/* Icône optionnelle ou avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
        {currentGroup?.label?.charAt(0) || '?'}
      </div>
      <span className="font-semibold text-gray-800 text-sm">{currentGroup?.label || "Sans nom"}</span>
    </div>
  );
};

export const dayRender = ({ dayIndex, dayDate }) => {
  // Affiche l'en-tête de la colonne d'un jour spécifique.
  const dateObj = new Date(dayDate);
  const isToday = new Date().toDateString() === dateObj.toDateString();

  return (
    <div className={`flex flex-col items-center justify-center p-2 border-b border-gray-200 h-full ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
      <span className={`text-xs uppercase font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
        {dateObj.toLocaleDateString('fr-FR', { weekday: 'short' })}
      </span>
      <span className={`text-lg font-bold ${isToday ? 'text-blue-700' : 'text-gray-800'}`}>
        {dateObj.getDate()}
      </span>
    </div>
  );
};

export const taskRender = ({ currentTask }) => {
  // Affiche une carte de tâche positionnée sur le calendrier
  return (
    <div className="flex flex-col justify-start p-2 h-full bg-indigo-100 hover:bg-indigo-200 border-l-4 border-indigo-500 rounded text-sm text-indigo-900 shadow-sm transition-all cursor-pointer">
      <span className="font-semibold truncate">{currentTask?.title || "Nouvelle tâche"}</span>
      <span className="text-xs opacity-75 truncate">{currentTask?.description || "Sans description"}</span>
    </div>
  );
};

export const addTaskRender = ({ currentGroup, dayInfo }) => {
  // Affiche la zone interactive sur laquelle on peut cliquer pour ajouter une tâche 
  // (souvent visible uniquement au survol du jour vide ou d'un bouton spécifique)
  return (
    <div className="flex items-center justify-center h-full min-h-[40px] m-1 rounded border-2 border-dashed border-transparent hover:border-green-300 hover:bg-green-50 transition-colors group cursor-pointer text-green-600">
      <span className="opacity-0 group-hover:opacity-100 font-medium text-xs flex items-center gap-1 transition-opacity">
        + Ajouter
      </span>
    </div>
  );
};

export const sumHoursRender = (data) => {
  // Affiche le total des heures (pour un groupe ou une journée selon le contexte)
  return (
    <div className="flex items-center justify-center h-full p-2 font-bold text-gray-700 bg-gray-50 border-l border-gray-200">
      {data?.totalHours || 0} h
    </div>
  );
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 2. GESTIONNAIRES D'ÉVÉNEMENTS (Event handlers)
 * Ces fonctions capturent les interactions de l'utilisateur (Cliquer, Glisser, etc.)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const handleAddTask = (group, dayInfo) => {
  // Déclenché quand l'utilisateur souhaite créer une nouvelle tâche
  console.log("👉 [Action] Ajouter une tâche cliqué:", { group, dayInfo });
  // Logique : ouvrir votre Modal d'ajout de tâche ici en pré-remplissant la date (dayInfo) et le groupe (group.id)
  alert(`Ajouter une tâche pour: ${group?.label} à la date du ${new Date(dayInfo).toLocaleDateString()}`);
};

export const handleClickTask = (task) => {
  // Déclenché quand l'utilisateur clique sur une tâche existante
  console.log("👉 [Action] Clic sur la tâche:", task);
  // Logique : ouvrir un panel ou modal pour modifier / supprimer cette tâche spécifique
};

export const handleClickGroup = (group) => {
  // Déclenché quand on clique sur la ligne complète ou l'entête d'un groupe
  console.log("👉 [Action] Clic sur le groupe:", group);
  // Logique : rediriger vers la page du profil ou afficher plus de stats sur ce groupe
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 3. ÉVÉNEMENTS DRAG & DROP
 * Utilisés si le calendrier permet de glisser/déposer les tâches.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const handleDragTask = (event, task) => {
  // Début du glissement d'une tâche
  console.log("🖱️ [Drag] Début du déplacement de la tâche:", task.id);
  // event.dataTransfer.setData("taskId", task.id); // Typiquement fait nativement ou géré par le paquet
};

export const handleDropTask = (event, dropInfo) => {
  // Relâchement (drop) de la tâche sur une nouvelle case temporelle
  console.log("🎯 [Drop] Tâche relâchée sur le slot:", dropInfo);
  // Logique : Mettre à jour la BDD ou le state de l'application avec la nouvelle date (dropInfo.date) et le groupe (dropInfo.group)
};

export const handleDragTaskEnd = (event) => {
  // Déclenché à la fin de l'action de drag (que la tâche soit droppée validement ou annulée)
  console.log("🛑 [DragEnd] Opération de drag terminée.");
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 4. CONFIGURATION DES STYLES et CLASSES (Styles / className)
 * Permettent d'écraser ou d'adapter les classes CSS du composant enfant
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const calendarStylesConfig = {
  // Classe appliquée à chaque "rangée" (la ligne d'un groupe complet)
  rowsClassName: "border-b border-gray-100 hover:bg-blue-50/10 transition-colors",
  
  // Classe appliquée à la colonne fixée à gauche contenant les noms des groupes
  groupsColsClassName: "bg-white sticky left-0 z-10 border-r border-gray-200 shadow-[1px_0_5px_rgba(0,0,0,0.02)]",
  
  // Classe appliquée aux colonnes représentant chaque jour de la semaine
  daysColsClassName: "border-r border-gray-100 min-w-[140px]",
  
  // Structure englobante d'une tâche rendue
  taskContainerClassName: "m-1 shadow-sm rounded-md overflow-hidden bg-white hover:z-20",
  
  // Structure englobante pour la zone de rendu d'ajout de tâche
  addTaskClassName: "", 
};
import React from 'react';

// Exemple de configuration et impl�mentation des fonctions du composant <Calendar />
// telles que d�crites dans la documentation.

/**
 * 1. RENDUS PERSONNALIS�S (Renders)
 * Ces fonctions vous permettent de personnaliser l'affichage des diff�rents
 * �l�ments du calendrier (groupes, jours, t�ches, etc.).
 */

// Rendu personnalis� pour l'en-t�te d'un groupe (ex: Salle, Professeur, Projet)
export const groupRender = ({ currentGroup }) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
      {/* On affiche par exemple une ic�ne suivie du libell� du groupe */}
      <span className="font-semibold text-gray-800">{currentGroup?.label}</span>
    </div>
  );
};

// Rendu personnalis� pour l'en-t�te d'une journ�e (ex: Lun 12)
export const dayRender = ({ dayIndex, dayDate }) => {
  return (
    <div className="flex flex-col items-center justify-center p-1">
      <span className="text-sm font-medium text-gray-500">Jour {dayIndex + 1}</span>
      {dayDate && <span className="text-xs text-gray-400">{new Date(dayDate).toLocaleDateString('fr-FR')}</span>}
    </div>
  );
};

// Rendu personnalis� pour l'affichage d'une t�che existante
export const taskRender = ({ currentTask }) => {
  return (
    <div className="p-2 bg-blue-100 border-l-4 border-blue-500 rounded text-sm text-blue-900 shadow-sm hover:shadow-md transition">
      <strong>{currentTask?.title || "Nouvelle t�che"}</strong>
      <div className="text-xs mt-1">{currentTask?.description}</div>
    </div>
  );
};

// Rendu personnalis� de la cellule permettant d'ajouter une t�che (quand on survole un jour vide)
export const addTaskRender = ({ currentGroup, dayInfo }) => {
  return (
    <div className="flex justify-center flex-col items-center h-full w-full bg-green-50/50 hover:bg-green-100/50 border-dashed border-2 border-green-200 cursor-pointer rounded transition-colors group">
      <span className="text-green-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
        + Ajouter
      </span>
    </div>
  );
};

// Rendu personnalis� pour la colonne affichant le total des heures
export const sumHoursRender = (data) => {
  return (
    <div className="font-bold text-gray-700 p-2 text-center bg-gray-100 rounded">
      {data?.totalHours || 0} h
    </div>
  );
};

/**
 * 2. GESTIONNAIRES D'�V�NEMENTS (Handlers)
 * Ces fonctions sont appel�es lors des interactions de l'utilisateur.
 */

// Gestionnaire appel� lors du clic sur le bouton d'ajout d'une t�che
export const handleAddTask = (group, dayInfo) => {
  console.log("-> Action: Ajouter une t�che", {
    groupeCible: group.label,
    dateOuJour: dayInfo
  });
  // TODO: Ouvrir un modal ou ajouter une t�che par d�faut au state
};

// Gestionnaire appel� lors du clic sur une t�che pour la modifier ou voir ses d�tails
export const handleClickTask = (task) => {
  console.log("-> Action: Clic sur la t�che", task);
  // TODO: Afficher les d�tails de la t�che s�lectionn�e
};

// Gestionnaire appel� lors du clic sur un groupe
export const handleClickGroup = (group) => {
  console.log("-> Action: Clic sur le groupe", group);
  // TODO: Filtrer par groupe ou afficher les d�tails du groupe
};

// Gestionnaires de Drag and Drop (Glisser-D�poser)
export const handleDragTask = (event, task) => {
  console.log("-> Action: D�but du glissement de la t�che", task);
  // Le syst�me Drag & Drop commence. Stockez si besoin des infos dans event.dataTransfer
};

export const handleDropTask = (event, dropInfo) => {
  console.log("-> Action: D�p�t de la t�che termin�", dropInfo);
  // TODO: Mettre � jour l'�tat de la t�che avec son nouveau groupe et sa nouvelle date
};

export const handleDragTaskEnd = (event) => {
  console.log("-> Action: Fin du glissement (sans n�cessairement d�poser)");
  // Nettoyage visuel si besoin
};

/**
 * 3. STYLES ET CLASSES CSS (Styles/Classes)
 * Ces objets permettent d'injecter du CSS ou des classes (ex: Tailwind)
 * dans les �l�ments de la grille.
 */
export const calendarStyles = {
  // Styles pour la ligne g�n�rale compl�te (un groupe + tous ses jours)
  rowsClassName: "border-b border-gray-100 hover:bg-gray-50/20 transition-colors",
  
  // Style de la colonne listant les groupes (� gauche)
  groupsColsClassName: "bg-white border-r border-gray-200 z-10 shadow-[1px_0_5px_rgba(0,0,0,0.05)]",
  
  // Style des colonnes de chaque jour
  daysColsClassName: "border-r border-gray-100 min-w-[120px]",
  
  // Style du bouton/zone d'ajout de t�che
  addTaskClassName: "m-1",
  
  // Structure globale du conteneur d'une t�che
  taskContainerClassName: "m-1 shadow-sm rounded-md overflow-hidden",
};
