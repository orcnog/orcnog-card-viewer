/***
 * name: View a Card
 * type: script
 * author: orcnog
 * img: modules/orcnog-card-viewer/assets/card-view-fancy.svg
 * scope: global
 */

// Requires Orcnog's Card Viewer
// Peeks at a card, but does not draw and discard it.

let deckName = 'Deck of Many Things';
let card = 'Gem'; // card name or ID
let faceDown = true;
let whisper = false;
let share = false;

if (!game.modules.get("orcnog-card-viewer")?.active) {
    ui.notifications.warn('Card Viewer module not found.');
    return;
}

OrcnogFancyCardDealer({
   deckName: deckName,
}).view(card, faceDown, whisper, share);