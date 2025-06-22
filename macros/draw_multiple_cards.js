/***
 * name: Draw Multiple Cards
 * type: script
 * author: orcnog
 * img: modules/orcnog-card-viewer/assets/card-draw-fancy.svg
 * scope: global
 */

// Requires Orcnog's Card Viewer
// Draws, views, and discards multiple card from a given deck name. Leave discardPile null to smart-match an existing discard pile name or auto-create a new one named "[your deck name] - Discard Pile".

let deckName = 'Deck of Many Things';
let discardPile = 'My Discard Pile';
let quantity = 5;
let share = true;

OrcnogFancyCardDealer({
   deckName: deckName ,
   discardPileName: discardPile
}).draw({quantity, share});