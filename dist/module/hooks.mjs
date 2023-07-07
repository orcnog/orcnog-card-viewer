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
        game.modules.get('orcnog-card-viewer').state = {
            cardsCurrentlyDisplayed: []
        };
        game.modules.get('orcnog-card-viewer').api = {
            // Draw a card
            // Example: `game.modules.get('orcnog-card-viewer').api.draw(deckName, discardPileName, true);`
            draw: function (deckName, discardPileName, share) {
                new CardDealer(deckName, discardPileName).draw(share);
            },
            // View a card
            // Example: `game.modules.get('orcnog-card-viewer').api.view(deckName, cardNameOrID, true, true, true);`
            view: function (deckName, card, faceDown, whisper, share) {
                new CardDealer(deckName).view(card, faceDown, whisper, share);
            },
            // View an image. (no border, can't flip)
            // WARNING: Experimental! Having trouble with iamge sizing, webp/png transparency, and most non-card images look bad with the glint effect
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
        globalThis.OrcnogFancyDisplay = function ({ front = null, back = 'modules/orcnog-card-viewer/assets/orcnogback.webp', border = '#da6', faceDown = true }) {
            return new FancyDisplay(front, back, border, faceDown);
        };

        // Expose the CardDealer constructor as a global function for macros and such
        globalThis.OrcnogFancyCardDealer = function ({ deckName, discardPileName }) {
            return new CardDealer(deckName, discardPileName);
        };

        // Construct a FancyDisplay for just a simple image
        // WARNING! Experimental! Having trouble with iamge sizing, webp/png transparency, and most non-card images look bad with the glint effect.
        globalThis.OrcnogFancyImage = function (image) {
            return new FancyDisplay(image, null, null, null);
        };

        function handleCardViewerSocketEvent({ type, payload }) {
            switch (type) {
                case 'VIEWCARD': {
                    const cardView = new FancyDisplay(payload.imgFrontPath, payload.imgBackPath, payload.border, payload.faceDown, payload.share);
                    cardView.render();
                }
                case 'INITIALIZED': {
                    console.log('orcnog-card-viewer: initialized');
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
    });

    Hooks.on('renderApplication', (app, $html, data) => {
        // Exit early if necessary;
        if (!game.settings.get('orcnog-card-viewer', 'enableCardIconClick')) return;
        if (app instanceof CardsConfig !== true) return;

        // Register card icon click handler
        const $card_icon = $html.find('img.card-face');
        $card_icon.on('click.orcnog_card_viewer', (event) => {
            const id = $(event.target).closest('.card').data('card-id');
            const deckCard = data.cards.find(c => c._id === id);
            const faceDown = deckCard.face === null;
            const whisper = game.settings.get('orcnog-card-viewer', 'enableWhisperCardTextToDM');
            const shareToAll = false;
            if (id) new CardDealer(deckCard.source.name).view(id, faceDown, whisper, shareToAll);
        });

        // TODO: Drag to canvas
        // $content.on('dragstart', '.dice-tray__button, .dice-tray__ad', (event) => {
    });

    Hooks.on('renderChatMessage', (app, $html, data) => {
        // Exit early if necessary;
        if (!game.settings.get('orcnog-card-viewer', 'enableCardIconClick')) return;
        if (!$html.find('.message-content .orcnog-card-viewer-msg').length) return;

        // Register card icon click handler
        const $message = $html.find('.orcnog-card-viewer-msg');
        $message.on('click.orcnog_card_viewer', 'img.card-face', (event) => {
            const deckName = $(event.target).closest('.orcnog-card-viewer-msg').data('deck');
            const cardName = $(event.target).closest('.orcnog-card-viewer-msg').data('card');
            const faceDown = false;
            const whisper = false;
            const shareToAll = false;
            if (deckName && cardName) new CardDealer(deckName).view(cardName, faceDown, whisper, shareToAll);
        });

        // TODO: Drag to canvas
        // $content.on('dragstart', '.dice-tray__button, .dice-tray__ad', (event) => {
    });

    Hooks.on('dealCards', (origin, destinations, context) => {
        // Exit early if necessary;
        if (!game.settings.get('orcnog-card-viewer', 'enableDisplayOnDeal')) return;
        if (context.toCreate.length === 0) return;

        // Show any and all cards that were dealt
        // TODO: show multiple cards in one render (instead of multiple renders)
        // Temporary TODO^ fix: on click of background, close all popped up cards.
        const viewer = new CardDealer(origin.name);
        context.toCreate.forEach(dest => {
            dest.forEach(card => {
                const faceDown = true;
                const whisper = game.settings.get('orcnog-card-viewer', 'enableWhisperCardTextToDM');
                const shareToAll = context.action.includes('orcnog_card_viewer_doshare');
                const doView = !context.action.includes('orcnog_card_viewer_noshow');
                if (doView) viewer.view(card._id, faceDown, whisper, shareToAll);
            });
        });
    });

    // Hooks.on('getCardsDirectoryEntryContext', (html, itemDropDowns) => { }

    // Note:  this syntax worked to catch ANY renderApplication hook:
    // Hooks.on('renderApplication', (...args) => {
    //    console.log(...args);
    // });
}

//TODO: BUG FIX - when multiple cards are shared (e.g. multiple cards are DEALT and automatically shared simultaneouly), the Show to Players button is buggy
// Possible Solution: make the Show to Players button always share all currently-displayed cards / images simultaneouly?  Not sure.

//TODO: show card on DRAW and PASS (currently it's on DEAL macro click).  Add settings to enable/disable this.

//TODO: make the FancyDisplay constructor take a config object, rather than multiple params in order

//TODO: Set a default card back image if none is provided yet display is definitely in a "card" context.

//TODO: Add more custom macro icons to /assets?

//TODO: Support non-card images...
    //TODO: Support max-height sizing for images that aren't nec card-shaped.
    //TODO: Support png / webp transparency (might be contingent on removing glint effects)
    //TODO: Add options to remove glint affects (for non-card images)
    //TODO: Add simple image macros back once support is satisfactory.

//TODO: Stretch goal - Anything that has a click-to-show, shuold also support drag-to-canvas.

//TODO: Stretch goal - set up a module setting to let the user choose the default card back image? Include ability to define a URL.

//TODO: Stretch goal - add a param to opt into launching the FancyDisplay in a popout (vs full-screen, as is the default view) - and make this a module Setting.

//TODO: Stretch goal - add Show to Players button to non-DMs... but this will get hairy... Need to somehow block immediate re-shares / sharing of an already dispalyed card/img.

//TODO: Stretch goal - add functionality to display image with frayed / torn / rough edges.

//TODO: Stretch goal - add ability to rotate the displayed image.