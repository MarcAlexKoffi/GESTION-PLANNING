import React from "react";
import {
  Calendar,
  CalendarTaskContextProvider,
  useCalendarTaskContext,
} from "react-headless-planning";

// ============================================================================
// DÉMARRAGE RAPIDE
// Exemple complet montrant comment intégrer le calendrier avec son "Context".
// Le "Context" est crucial car il gère automatiquement le stockage et 
// l'état partagé (tâches, dates, groupes) pour tous les sous-composants.
// ============================================================================

/**
 * 1. SOUS-COMPOSANT DU CALENDRIER (MyCalendarContent)
 * Ce composant doit OBLIGATOIREMENT être rendu à l'intérieur du <CalendarTaskContextProvider>
 * pour que les "hooks" comme useCalendarTaskContext() puissent fonctionner.
 */
const MyCalendarContent = () => {
  // On extrait "updateTask" depuis le contexte pour valider le Drag & Drop !
  const { updateTask } = useCalendarTaskContext();

  // Liste minimale des groupes (les lignes ou colonnes principales selon votre vue)
  const groups = [
    { id: "1", label: "Développeur A" },
    { id: "2", label: "Développeur B" },
  ];

  return (
    // Le composant <Calendar /> est l'élément qui dessine la grille.
    // Il reçoit vos props de configuration (définies potentiellement dans CalendarConfig.jsx)
    <Calendar
      groups={groups}         // Définit les entités que l'on planifie (personnes, salles, etc.)
      date={new Date()}       // La date pivot de référence (affichée actuellement)
      weekOffset={0}          // Écart de semaine (0 = semaine actuelle, -1 = semaine précédente, etc.)
      
      // ✅ DRAG AND DROP : Initialisation
      // Optionnel mais donne accès à l'info de l'élément glissé si vous devez faire une vérification
      handleDragTask={(event, currentTask) => {
        console.log("👉 La tâche glissée est :", currentTask);
        // ⭐ PRINCIPE FONDAMENTAL DU DRAG AND DROP POUR CE PACKAGE ⭐
        // Vous DEVEZ sérialiser et attacher l'ID et les infos de base de la tâche dans l'événement dataTransfer.
        // Sinon le onDrop (interne du calendrier) ne trouve rien à actualiser.
        if (event && event.dataTransfer) {
            event.dataTransfer.setData(
                "application/json",
                JSON.stringify({
                    id: currentTask.id,
                    taskStart: currentTask.taskStart,
                    taskEnd: currentTask.taskEnd,
                    dayIndex: currentTask.dayIndex,
                    hash: currentTask.hash || undefined // Utilisé en interne
                })
            );
        }
      }}

      // ✅ DRAG AND DROP : Relâchement de la tâche (Drop)
      // La librairie calcule les nouvelles coordonnées et vous renvoie 'newTask'.
      // Vous devez OBLIGATOIREMENT accepter cette nouvelle version et la passer à 'updateTask'
      // pour que le composant de la grille Headless sache que la donnée a été modifiée !
      handleDropTask={(event, taskStart, taskEnd, taskDate, groupId, dayIndex, newTask, newTasksArray) => {
        console.log("🎯 Tâche relâchée ! L'API renvoie la nouvelle tâche mutée :", newTask);
        
        if (newTask) {
          // On valide la mise à jour de la tâche dans le package Headless !
          updateTask(newTask);
        }
      }}

      // ✅ DRAG AND DROP : Fin de l'opération
      handleDragTaskEnd={(event) => {
         console.log("🛑 Drag and Drop expiré / terminé !");
      }}

      // Rendu personnalisé pour la case "ajouter une tâche" (quand on survole un emplacement vide).
      // On passe les infos de la case au composant <AddTask />, qui gèrera le "clic".
      addTaskRender={({ currentGroup, dayInfo }) => (
        <AddTask currentGroup={currentGroup} dayInfo={dayInfo} />
      )}
    />
  );
};

/**
 * 2. COMPOSANT BOUTON / LOGIQUE D'AJOUT (AddTask)
 * Il accède au Context pour utiliser la fonction `addTask` de la librairie.
 */
const AddTask = ({ currentGroup, dayInfo }) => {
  // `useCalendarTaskContext` permet de récupérer l'API interne du calendrier,
  // notamment les fonctions pour interagir avec le "store" (ajouter, modifier, etc.).
  const { addTask } = useCalendarTaskContext();

  const handleAddTask = () => {
    // timestamp actuel, utile pour générer un ID unique rapide ou définir une heure brute
    const now = Date.now();

    // ⚠️ STRUCTURE D'UNE TÂCHE :
    // C'est l'objet standard attendu par le package pour positionner
    // correctement un événement sur la grille.
    const newTask = {
      id: `task-${now}`,              // Identifiant unique
      task: "Nouvelle Réunion",       // Titre ou description
      taskStart: now,                 // Heure de début (timestamp)
      taskEnd: now + 2 * 60 * 60 * 1000, // Heure de fin (ici : + 2 heures)
      taskDate: dayInfo.day,          // Date au format attendu (YYYY-MM-DD ou objet Date selon paramétrage interne)
      groupId: currentGroup.id,       // L'ID du groupe rattaché ("1" ou "2")
      dayIndex: dayInfo.positionDay,  // Position dans la semaine (0 à 6)
      
      // La date d'expiration permet au state interne de nettoyer les tâches obsolètes si nécessaire
      taskExpiryDate: new Date(now + 86400000), // expire dans 24h
    };

    // On utilise la fonction extraite de `useCalendarTaskContext` pour injecter la tâche.
    addTask(newTask); 
    console.log("Nouvelle tâche ajoutée ✅:", newTask);
  };

  return (
    // Le bouton de déclenchement : il est invisible (opacity-0) jusqu'à ce 
    // que l'utilisateur survole l'emplacement avec sa souris.
    <button
      onClick={handleAddTask}
      className="w-full h-full opacity-0 hover:opacity-100 bg-blue-100 text-blue-800 text-sm font-semibold transition-opacity rounded border border-blue-300 flex items-center justify-center"
      title={`Ajouter pour ${currentGroup?.label}`}
    >
      + Nouvelle tâche
    </button>
  );
};

/**
 * 3. COMPOSANT RACINE (AppWrapper ou Démarrage Rapide)
 * C'est le niveau le plus haut. Il déclare le "Provider" (distributeur de contexte)
 * pour envelopper toute l'application Planning. 
 */
const DemarrageRapide = () => {
  return (
    // Ce "Provider" enveloppe MyCalendarContent pour distribuer les données 
    // aux `useCalendarTaskContext()` qui se trouvent à l'intérieur.
    <CalendarTaskContextProvider>
      <div className="h-screen w-full bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto h-[80vh] bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 p-2">
          <MyCalendarContent />
        </div>
      </div>
    </CalendarTaskContextProvider>
  );
};

export default DemarrageRapide;
