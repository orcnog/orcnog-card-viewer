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
                new FancyDisplay(image, share).render();
            },
            FancyDisplay: function ({ image, share}) {
                return new FancyDisplay(image, null, null, null, share);
            },
            FancyCardDisplay: function ({ front, back = 'modules/card-viewer/assets/blackfloralback.webp', border = '#d29a38', showBackFirst = true, share }) {
                return new FancyDisplay(front, back, border, showBackFirst, share);
            }
        };
    });

    /* ------------------------------------ */
    /* When ready                           */
    /* ------------------------------------ */
    Hooks.once('ready', function () {
        console.log('card-viewer: initializing');

        // Expose the FancyDisplay constructor as a global function for macros and such
        globalThis.createFancyImageViewer = function ({ front, back, border, showBackFirst, share }) {
            return new FancyDisplay(front, back, border, showBackFirst, share);
        };

        function handleCardViewerSocketEvent({ type, payload }) {
            switch (type) {
                case 'VIEWCARD': {
                    const cardView = new FancyDisplay(payload.imgFrontPath, payload.imgBackPath, payload.border, payload.showBackFirst, payload.share);
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

//TODO: Add a "Share" button to the fancy floaty display if share was false