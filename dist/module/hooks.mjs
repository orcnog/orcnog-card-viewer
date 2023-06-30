/**
 * A Foundry Virtual Tabletop module to make deck cards displayable in fancy, foaty, sparkly image popout.
 * Author: orcnog
 */

// Import JavaScript modules
import { registerSettings } from './settings.mjs';
import { preloadTemplates } from './preloadTemplates.mjs';
import FancyDisplay from './fancyDisplay.mjs';
import CardDealer from './cardDealer.mjs';

/**
 * Registers hooks needed throughout the module
 */
export default function registerHooks() {
    /* ------------------------------------ */
    /* Initialize module                    */
    /* ------------------------------------ */
    Hooks.once('init', async function () {
        // Assign custom classes and constants here

        // Register custom module settings
        registerSettings();
        // Preload Handlebars templates
        await preloadTemplates();

        // Register custom sheets (if any)
    });

    /* ------------------------------------ */
    /* Setup module                         */
    /* ------------------------------------ */
    Hooks.once('setup', function () {
        // Do anything after initialization but before ready
        game.modules.get('orcnog-card-viewer').api = {
            // Draw a card
            // Example: `game.modules.get('orcnog-card-viewer').api.draw(deckName, discardPileName, true);`
            draw: function (deckName, discardPileName, share) {
                new CardDealer(deckName, discardPileName).draw(share);
            },
            // View a card
            // Example: `game.modules.get('orcnog-card-viewer').api.view(deckName, cardName, true);`
            view: function (deckName, card, share) {
                new CardDealer(deckName).view(card, share);
            },
            // View an image (no border, can't flip)
            // Example: `game.modules.get('orcnog-card-viewer').api.viewImage(imgPath, true);`
            viewImage: function (image, share) {
                new FancyDisplay(image).render(share);
            },
            // View any image like a card
            // Example: `game.modules.get('orcnog-card-viewer').api.viewImageAsCard(imgPath, true);`
            viewImageAsCard: function (image, share) {
                new FancyDisplay(image, 'modules/orcnog-card-viewer/assets/orcnogback.webp', '#da6', true).render(share);
            },
            // Create a FancyDisplay instance and expose the whole thing
            // Example: `const myFancyViewer = await game.modules.get('orcnog-card-viewer').api.FancyDisplay({ front: imgPath });`
            FancyDisplay: function ({ front, back = 'modules/orcnog-card-viewer/assets/orcnogback.webp', border = '#da6', faceDown = true }) { // #d29a38
                return new FancyDisplay(front, back, border, faceDown);
            },
            // Create a CardDealer instance and expose the whole thing
            // Example: `const myFancyDealer = await game.modules.get('orcnog-card-viewer').api.CardDealer({ deckName: 'My Deck' });`
            CardDealer: function ({ deckName, discardPileName }) {
                return new CardDealer(deckName, discardPileName);
            }
        };
    });

    /* ------------------------------------ */
    /* When ready                           */
    /* ------------------------------------ */
    Hooks.once('ready', function () {
        console.log('orcnog-card-viewer: initializing');

        // Expose the FancyDisplay constructor as a global function for macros and such
        globalThis.OrcnogFancyDisplay = function ({ image = null, front = null, back = 'modules/orcnog-card-viewer/assets/orcnogback.webp', border = '#da6', faceDown = true }) {
            return new FancyDisplay(front, back, border, faceDown);
        };

        // Expose the CardDealer constructor as a global function for macros and such
        globalThis.OrcnogFancyCardDealer = function ({ deckName, discardPileName }) {
            return new CardDealer(deckName, discardPileName);
        };

        // Construct a FancyDisplay for just a simple image
        globalThis.OrcnogFancyImage = function (image) {
            return new FancyDisplay(image, null, null, null);
        };

        function handleCardViewerSocketEvent({ type, payload }) {
            switch (type) {
                case 'VIEWCARD': {
                    const cardView = new FancyDisplay(payload.imgFrontPath, payload.imgBackPath, payload.border, payload.faceDown, payload.share);
                    cardView.render();
                }
                default:
                    throw new Error('unknown type');
            }
        }

        game.socket.on('module.orcnog-card-viewer', handleCardViewerSocketEvent);

        // Emit hook on init complete
        // Usage: game.socket.on('module.orcnog-card-viewer', ({ type, payload }) => type === 'INITIALIZED' && /* do stuff */);
        game.socket.emit('module.orcnog-card-viewer', {
            type: 'INITIALIZED',
            payload: {}
        });
        console.log('orcnog-card-viewer: initialized');
    });

    Hooks.once('getCardsDirectoryEntryContext', (html, itemDropDowns) => {
        // add to HTML
    });

    // Note:  this syntax worked to catch ANY renderApplication hook:
    // Hooks.on('renderApplication', (...args) => {
    //    console.log(...args);
    // });
}

//TOFIX: don't create new discard pile if we're just viewing a card. adjust Fancy Card Viewer macro so a discard pile name isn't included.
//TODO: make the FancyDisplay constructor take a config object, rather than multiple params in order

//TODO: Add a "Share" button to the fancy floaty display if share was false

//TODO: Set a default card back image if none is provided but display is definitely in a "card" context.

//TODO: Add macros to the module. Add macro icons to /assets

//TODO: Add a click handler to cards in the CardConfig application: on click, launch the FancyDisplay of the card (with option to share)

//TODO: Stretch goal - set up a module setting to let the user choose the default card back image? Include ability to define a URL.

//TODO: Stretch goal - add a param to opt into launching the FancyDisplay in a popout (vs full-screen, as is the default view) - and make this a module Setting.

//TODO: Stretch goal - add functionality to display image with frayed / torn / rough edges.

//TODO: Stretch goal - add ability to rotate the displayed image.