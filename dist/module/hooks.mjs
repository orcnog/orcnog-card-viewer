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
        game.modules.get('card-viewer').api = {
            draw: function (deckName, discardPileName) {
                new CardDealer(deckName, discardPileName).draw();
            },
            view: function (deckName, cardName) {
                new CardDealer(deckName).view(cardName);
            },
            viewImage: function (image, share) {
                new FancyDisplay(image).render(share);
            },
            viewImageAsCard: function (image, share) {
                new FancyDisplay(image, 'modules/card-viewer/assets/orcnogback.webp', '#da6', true).render(share);
            },
            // expose the class itself
            FancyDisplay: function ({ front, back = 'modules/card-viewer/assets/orcnogback.webp', border = '#da6', faceDown = true }) { // #d29a38
                return new FancyDisplay(front, back, border, faceDown);
            }
        };
    });

    /* ------------------------------------ */
    /* When ready                           */
    /* ------------------------------------ */
    Hooks.once('ready', function () {
        console.log('card-viewer: initializing');

        // Expose the FancyDisplay constructor as a global function for macros and such
        globalThis.FancyImageViewer = function ({ front, back, border, faceDown, share }) {
            return new FancyDisplay(front, back, border, faceDown, share);
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

        game.socket.on('module.card-viewer', handleCardViewerSocketEvent);
    });

    Hooks.once('getCardsDirectoryEntryContext', (html, itemDropDowns) => {
        // add to HTML
    });

    // Note:  this syntax worked to catch ANY renderApplication hook:
    // Hooks.on('renderApplication', (...args) => {
    //    console.log(...args);
    // });
}

//TODO: make the FancyDisplay constructor take a config object, rather than multiple params in order

//TODO: Add a "Share" button to the fancy floaty display if share was false

//TODO: Set a default card back image if none is provided but display is definitely in a "card" context.

//TODO: Add macros to the module. Add macro icons to /assets

//TODO: Add a click handler to cards in the CardConfig application: on click, launch the FancyDisplay of the card (with option to share)

//TODO: Stretch goal - set up a module setting to let the user choose the default card back image? Include ability to define a URL.

//TODO: Stretch goal - add a param to opt into launching the FancyDisplay in a popout (vs full-screen, as is the default view) - and make this a module Setting.

//TODO: Stretch goal - add functionality to display image with frayed / torn / rough edges.

//TODO: Stretch goal - add ability to rotate the displayed image.