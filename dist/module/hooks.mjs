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
            draw: function (deckName, discardPileName, shareToAll) {
                new CardDealer({
                    deckName: deckName,
                    discardPileName: discardPileName
                }).draw(shareToAll);
            },
            // View a card
            // Example: `game.modules.get('orcnog-card-viewer').api.view(deckName, cardNameOrID, true, true, true);`
            view: function (deckName, card, whisper, shareToAll) {
                new CardDealer({
                    deckName
                }).view(card, whisper, shareToAll);
            },
            // View an image. (no border, can't flip)
            // WARNING: Experimental! Having trouble with iamge sizing, webp/png transparency, and most non-card images look bad with the glint effect
            // Example: `game.modules.get('orcnog-card-viewer').api.viewImage(imgPath, true);`
            viewImage: function (image, shareToAll) {
                new FancyDisplay({
                    imgFrontPath: image
                }).render(shareToAll);
            },
            // View any image like a card
            // Example: `game.modules.get('orcnog-card-viewer').api.viewImageAsCard(imgPath, true);`
            viewImageAsCard: function (image, shareToAll) {
                new FancyDisplay({
                    imgFrontPath: image,
                    faceDown: true
                }).render(shareToAll);
            },
            // Create a FancyDisplay instance and expose the whole thing
            // Example: `const myFancyViewer = await game.modules.get('orcnog-card-viewer').api.FancyDisplay({ front: imgPath });`
            FancyDisplay: function ({ card, borderColor = null, borderWidth = null}) { // #d29a38
                return new FancyDisplay({
                    card,
                    borderColor,
                    borderWidth,
                });
            },
            // Create a CardDealer instance and expose the whole thing
            // Example: `const myFancyDealer = await game.modules.get('orcnog-card-viewer').api.CardDealer({ deckName: 'My Deck' });`
            CardDealer: function ({ deckName, discardPileName }) {
                return new CardDealer({
                    deckName: deckName,
                    discardPileName: discardPileName
                });
            }
        };
    });

    /* ------------------------------------ */
    /* When ready                           */
    /* ------------------------------------ */
    Hooks.once('ready', function () {
        console.log('orcnog-card-viewer: initializing');

        // Expose the FancyDisplay constructor as a global function for macros and such

        globalThis.OrcnogFancyDisplay = game.modules.get('orcnog-card-viewer').api.FancyDisplay;

        // Expose the CardDealer constructor as a global function for macros and such
        globalThis.OrcnogFancyCardDealer = game.modules.get('orcnog-card-viewer').api.CardDealer;

        // Construct a FancyDisplay for just a simple image
        // WARNING! Experimental! Having trouble with iamge sizing, webp/png transparency, and most non-card images look bad with the glint effect.
        globalThis.OrcnogFancyImage = function (image) {
            return new FancyDisplay({ imgFrontPath: image });
        };

        async function handleCardViewerSocketEvent({ type, payload, front, back }) {
            switch (type) {
                case 'VIEWCARD': {
                    let card = payload.cardUuid ? await fromUuid(payload.cardUuid) : undefined;
                    /* if (!card) {
                        card = new PseudoCard(payload.front, payload.back);
                    } */
                    delete payload.cardUuid;
                    payload.card = card;
                    break;
                }
                case 'INITIALIZED': {
                    console.log('orcnog-card-viewer: initialized');
                    break;
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

    // View on card image click in a stack window

    Hooks.on('renderApplication', (app, $html, data) => {
        // Exit early if necessary;
        if (!game.settings.get('orcnog-card-viewer', 'enableCardIconClick')) return;
        if (app instanceof CardsConfig !== true) return;

        // Register card icon click handler
        const $card_icon = $html.find('img.card-face');
        $card_icon.on('click.orcnog_card_viewer', async (event) => {
            const id = $(event.target).closest('.card').data('card-id');
            const card = data.cards.find(c => c._id === id);
            const whisper = game.settings.get('orcnog-card-viewer', 'enableWhisperCardTextToDM');
            const shareToAll = false;

            if (id) new CardDealer({
                deckName: card.parent.name
            }).view(card, whisper, shareToAll);
        });
        // TODO: Drag to canvas - $content.on('dragstart', '.dice-tray__button, .dice-tray__ad', (event) => {
    });

    // View on card image click in chat messages

    Hooks.on('renderChatMessage', (app, $html, data) => {
        // Exit early if necessary;
        if (!game.settings.get('orcnog-card-viewer', 'enableCardIconClick')) return;
        if (!$html.find('.message-content .orcnog-card-viewer-msg').length) return;

        // Register card icon click handler
        const $message = $html.find('.orcnog-card-viewer-msg');
        $message.on('click.orcnog_card_viewer', 'img.card-face', (event) => {
            const deckName = $(event.target).closest('.orcnog-card-viewer-msg').data('deck');
            const cardName = $(event.target).closest('.orcnog-card-viewer-msg').data('card');
            const deck = game.cards.getName(deckName);
            const card = deck.cards.find(c => c.name === cardName);
            const whisper = false;
            const shareToAll = false;
            if (deckName && cardName) new CardDealer({
                deckName: deckName
            }).view(card, whisper, shareToAll);
        });

        // TODO: Drag to canvas
        // $content.on('dragstart', '.dice-tray__button, .dice-tray__ad', (event) => {
    });

    // View on card deal

    Hooks.on('dealCards', (origin, destinations, context) => {
        let doView = false;
        if (context.action === 'deal') {
            doView = game.settings.get('orcnog-card-viewer', 'enableDisplayOnDeal');
        } else if (context.action === 'pass') {
            if (origin.type === 'hand' && destinations[0].type === 'pile') {
                doView = game.settings.get('orcnog-card-viewer', 'enableDisplayOnPassToPile');
            } else if ((origin.type === 'hand' || origin.type === 'pile') && destinations[0].type === 'hand') {
                doView = game.settings.get('orcnog-card-viewer', 'enableDisplayOnPassToHand');
            }
        }
        // Exit early if necessary;
        if (context.toCreate.length === 0) return;
        if (!doView) return;

        for (const dest of context.toCreate) {
            for (const card of dest) {
                if (card.flags['orcnog-card-viewer']) {
                    card.flags['orcnog-card-viewer'].doView = doView;
                } else {
                    card.flags['orcnog-card-viewer'] = { doView: doView };
                }
            }
        }
    });

    Hooks.on('passCards', async (origin, destination, context) => {
        let doView = false;
        if (context.action === 'pass'){
            if (origin.type === 'hand' && destination.type === 'pile') {
                doView = game.settings.get('orcnog-card-viewer', 'enableDisplayOnPassToPile');
            } else if ((origin.type === 'hand' || origin.type === 'pile') && destination.type === 'hand') {
                doView = game.settings.get('orcnog-card-viewer', 'enableDisplayOnPassToHand');
            }
        } else if (context.action === 'draw'){
            doView = game.settings.get('orcnog-card-viewer', 'enableDisplayOnDraw');
        } else {
            doView = false;
        }
        // Exit early if necessary;
        if (!doView) return;
        if (context.toCreate.length === 0) return;

        for (const card of context.toCreate) {
            if (card.flags['orcnog-card-viewer']) {
                card.flags['orcnog-card-viewer'].doView = doView;
            } else {
                card.flags['orcnog-card-viewer'] = { doView: doView };
            }
        }
    });

    Hooks.on('createCard', async (card, options, userId) => {
        const doView = card.getFlag('orcnog-card-viewer', 'doView');
        if (!game.settings.get('orcnog-card-viewer', 'enableDisplayOnPassToHand')) return;
        if (!doView) return;
        const viewer = new CardDealer(card.parent.name);
        const whisper = game.settings.get('orcnog-card-viewer', 'enableWhisperCardTextToDM');
        if (doView && card.isOwner) viewer.view(card, whisper, game.settings.get('orcnog-card-viewer', 'shareToAll'));
    });
    // Hooks.on('getCardsDirectoryEntryContext', (html, itemDropDowns) => { }

    // Note:  this syntax worked to catch ANY renderApplication hook:
    // Hooks.on('renderApplication', (...args) => {
    //    console.log(...args);
    // });
}

//TODO: BUG FIX - when multiple cards are shared (e.g. multiple cards are DEALT and automatically shared simultaneouly), the Show to Players button is buggy
// Possible Solution: make the Show to Players button always share all currently-displayed cards / images simultaneouly?  Not sure.

//TODO: Add more custom macro icons to /assets?

//TODO: Support non-card images...
    //TODO: Support max-height sizing for images that aren't nec card-shaped.
    //TODO: Support png / webp transparency (might be contingent on removing glint effects)
    //TODO: Add options to remove glint affects (for non-card images)
    //TODO: Add simple image macros back once support is satisfactory.

//TODO: Stretch goal - Anything that has a click-to-show, shuold also support drag-to-canvas.

//TODO: Stretch goal - add a param to opt into launching the FancyDisplay in a popout (vs full-screen, as is the default view) - and make this a module Setting.

//TODO: Stretch goal - add Show to Players button to non-DMs... but this will get hairy... Need to somehow block immediate re-shares / sharing of an already dispalyed card/img.

//TODO: Stretch goal - add functionality to display image with frayed / torn / rough edges.

//TODO: Stretch goal - add ability to rotate the displayed image.