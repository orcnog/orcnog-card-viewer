/***
 * name: Draw a Card
 * type: script
 * author: orcnog
 * img: modules/orcnog-card-viewer/assets/card-draw-fancy.svg
 * scope: global
 */

// Requires Orcnog's Card Viewer
// Draws, views, and discards a card from a given deck name. Leave discardPile null to smart-match an existing discard pile name or auto-create a new one named "[your deck name] - Discard Pile".

let deckName = 'Deck of Many Things';
let discardPile = 'My Discard Pile';
let share = true;
let face = "reveal"; //either "up", "down", or "reveal" to flip up

if (!game.modules.get("orcnog-card-viewer")?.active) {
    ui.notifications.warn('Card Viewer module not found.');
    return;
}

OrcnogFancyCardDealer({
   deckName: deckName,
   discardPileName: discardPile
}).draw({share, face});