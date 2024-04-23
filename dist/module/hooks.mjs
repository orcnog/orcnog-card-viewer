/**
 * A Foundry Virtual Tabletop module to make deck cards displayable in fancy, floaty, sparkly image popout.
 * Author: orcnog
 */

// Import JavaScript modules
import { MODULE_ID, MODULE_SHORT, MODULE_TITLE } from "./consts.mjs";
import { registerSettings, onRenderSettingsConfig } from './settings.mjs';
import { preloadTemplates } from './preloadTemplates.mjs';
import { LogUtility } from "./log.mjs";
import FancyDisplay from './fancyDisplay.mjs';
import CardDealer from './cardDealer.mjs';

/**
 * Exported socket object
 */
export let CardViewerSocket = {
    executeForEveryone: () => {
        LogUtility.error(`socketlib is required for ${MODULE_TITLE} to work properly. Please install and enable the socketlib module.`)
    },
    executeForOthers: () => {
        LogUtility.error(`socketlib is required for ${MODULE_TITLE} to work properly. Please install and enable the socketlib module.`)
    }
};

/**
 * Registers hooks needed throughout the module
 */
export default function registerHooks() {
    /* ------------------------------------ */
    /* Setup socketlib stuff                */
    /* ------------------------------------ */

    Hooks.once("socketlib.ready", () => {
        CardViewerSocket = socketlib.registerModule(MODULE_ID);
        CardViewerSocket.register("ShareToAll", (data) => {
            LogUtility.debug('ShareToAll hook fired');
            new FancyDisplay({
                ...data
            }).render(data.share);
        });
        CardViewerSocket.register("Ready", () => {
            LogUtility.debug('Ready hook fired');
            LogUtility.log('Ready');
        });
    });

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
    /* Initialize Settings                  */
    /* ------------------------------------ */
    Hooks.on('renderSettingsConfig', (app, html, data) => {
        onRenderSettingsConfig(app, html, data);
    });

    /* ------------------------------------ */
    /* Setup module                         */
    /* ------------------------------------ */
    Hooks.once('setup', function () {
        // Do anything after initialization but before ready
        game.modules.get(MODULE_ID).state = {
            cardsCurrentlyDisplayed: []
        };
        game.modules.get(MODULE_ID).api = {
            // Draw a card
            // Example: `game.modules.get('orcnog-card-viewer').api.draw(deckName, discardPileName, true, false, true);`
            draw: function (deckName, discardPileName, share = true, faceDown = true, dramaticReveal) {
                new CardDealer({
                    deckName: deckName,
                    discardPileName: discardPileName,
                    faceDown: faceDown,
                }).draw(share, dramaticReveal);
            },
            // View a card
            // Example: `game.modules.get('orcnog-card-viewer').api.view(deckName, cardNameOrID, true, true, true);`
            view: function (deckName, card, faceDown, whisper, share) {
                new CardDealer({
                    deckName: deckName
                }).view([card], faceDown, whisper, share);
            },
            // View an image. (no border, can't flip)
            // WARNING: Experimental! Having trouble with iamge sizing, webp/png transparency, and most non-card images look bad with the glint effect
            // Example: `game.modules.get('orcnog-card-viewer').api.viewImage(imgPath, true);`
            viewImage: function (image, share) {
                new FancyDisplay({
                    imgFrontPath: image
                }).render(share);
            },
            // View any image like a card
            // Example: `game.modules.get('orcnog-card-viewer').api.viewImageAsCard(imgPath, true);`
            viewImageAsCard: function (image, share) {
                new FancyDisplay({
                    imgFrontPath: image,
                    faceDown: true
                }).render(share);
            },
            // Create a FancyDisplay instance and expose the whole thing
            // Example: `const myFancyViewer = await game.modules.get('orcnog-card-viewer').api.FancyDisplay({ front: imgPath });`
            FancyDisplay: function ({ front, back = null, border = null, borderWidth = null, faceDown = true }) { // #d29a38
                return new FancyDisplay({
                    imgFrontPath: front,
                    imgBackPath: back,
                    borderColor: border,
                    borderWidth: borderWidth,
                    faceDown: faceDown
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
        LogUtility.log('Initializing');

        // Expose the FancyDisplay constructor as a global function for macros and such
        globalThis.OrcnogFancyDisplay = game.modules.get(MODULE_ID).api.FancyDisplay;

        // Expose the CardDealer constructor as a global function for macros and such
        globalThis.OrcnogFancyCardDealer = game.modules.get(MODULE_ID).api.CardDealer;

        // Construct a FancyDisplay for just a simple image
        // WARNING! Experimental! Having trouble with iamge sizing, webp/png transparency, and most non-card images look bad with the glint effect.
        globalThis.OrcnogFancyImage = function (image) {
            return new FancyDisplay({ imgFrontPath: image });
        };

        // Emit hook on init complete
        // Usage: game.socket.on('module.orcnog-card-viewer', ({ type, payload }) => type === 'INITIALIZED' && /* do stuff */);
        LogUtility.debug(`Firing 'READY' hook.`)
        CardViewerSocket.executeForEveryone("Ready", null);
    });

    // View on card image click in a stack window

    Hooks.on('renderApplication', (app, $html, data) => {
        // Exit early if necessary;
        if (app instanceof CardsConfig !== true) return;
        if (!game.settings.get(MODULE_ID, 'enableCardIconClick')) return;

        // Register card icon click handler
        const $card_icon = $html.find('img.card-face');
        $card_icon.on(`click.${MODULE_SHORT}`, (event) => {
            const id = $(event.target).closest('.card').data('card-id');
            const deckCard = data.cards.find(c => c._id === id);
            // Configs
            const faceDown = deckCard.face === null;
            const whisper = game.settings.get(MODULE_ID, 'enableWhisperCardTextToDM');
            const dramaticReveal = false;
            const shareToAll = false;
            // Set up viewer
            if (id) new CardDealer({
                deckName: deckCard.source.name
            }).view([id], faceDown, whisper, dramaticReveal, shareToAll);
        });
        // TODO: Drag to canvas - $content.on('dragstart', '.dice-tray__button, .dice-tray__ad', (event) => {
    });

    // View on card image click in chat messages

    Hooks.on('renderChatMessage', (app, $html, data) => {
        // Exit early if necessary;
        if (!game.settings.get(MODULE_ID, 'enableCardIconClick')) return;
        if (!$html.find(`.message-content .${MODULE_ID}-msg`).length) return;

        // Register card icon click handler
        const $message = $html.find(`.${MODULE_ID}-msg`);
        $message.on(`click.${MODULE_SHORT}`, 'img.card-face', (event) => {
            // Configs
            const faceDown = false;
            const whisper = false;
            const dramaticReveal = false;
            const shareToAll = false;
            // Set up viewer
            const deckName = $(event.target).closest(`.${MODULE_ID}-msg`).data('deck');
            const cardId = $(event.target).closest(`.${MODULE_ID}-msg`).data('card');
            if (deckName && cardId) new CardDealer({
                deckName: deckName
            }).view([cardId], faceDown, whisper, dramaticReveal, shareToAll);
        });

        // TODO: Drag to canvas
        // $content.on('dragstart', '.dice-tray__button, .dice-tray__ad', (event) => {
    });

    // View on card "Deal" action

    Hooks.on('dealCards', (origin, destinations, context) => {
        const isDeal = context.action.startsWith('deal');
        const isPass = context.action.startsWith('pass');

        // Exit early if necessary;
        if (context.action.includes(`${MODULE_SHORT}_nohook`)) return;
        if (!game.settings.get(MODULE_ID, 'enableDisplayOnDeal') && isDeal) return;
        if (!game.settings.get(MODULE_ID, 'enableDisplayOnPass') && isPass) return;
        if (context.toCreate.length === 0) return;
      
        // Show all cards that were dealt
        const viewer = new CardDealer({
            deckName: origin.name,
            discardPileName: destinations.length ? destinations[0].name : null
        });
        const cards = [];
        let drawnCards;
        const whisper = game.settings.get(MODULE_ID, 'enableWhisperCardTextToDM');
        const cardFaceLogic = game.settings.get(MODULE_ID, isDeal ? 'whatDeterminesCardFaceOnDraw' : 'whatDeterminesCardFaceOnPass');
        const dramaticReveal = game.settings.get(MODULE_ID, isDeal ? 'enableDramaticRevealOnDraw' : 'enableDramaticRevealOnPass');
        const shareToAll = context.action.includes(`${MODULE_SHORT}_doshare`);
        const doView = !context.action.includes(`${MODULE_SHORT}_noshow`);
        context.toCreate.forEach(dest => {
            drawnCards = dest;
            if (dest instanceof Array === false) drawnCards = [dest];
            cards.push(...drawnCards.map(item => item._id));
        });
        const faceDown = cardFaceLogic === 'source' ? drawnCards[0].face === null : cardFaceLogic === 'alwaysdown' ? true : false;
        if (doView) viewer.view(cards, faceDown, whisper, dramaticReveal, shareToAll);
    });

    // View on card "Draw" action performed within a "Hand" stack

    Hooks.on('passCards', (origin, destinations, context) => {
        const isDraw = context.action.startsWith('draw');
        const isPass = context.action.startsWith('pass');

        // Exit early if necessary;
        if (!game.settings.get(MODULE_ID, 'enableDisplayOnDraw') && isDraw) return;
        if (!game.settings.get(MODULE_ID, 'enableDisplayOnPass') && isPass) return;
        if (context.toCreate.length === 0) return;
      
        // Show any and all cards that were dealt
        const viewer = new CardDealer({
            deckName: origin.name,
            discardPileName: destinations instanceof Cards ? destinations.name : destinations.length ? destinations[0].name : null
        });
        const cards = [];
        let drawnCards;
        const whisper = game.settings.get(MODULE_ID, 'enableWhisperCardTextToDM');
        const cardFaceLogic = game.settings.get(MODULE_ID, isDraw ? 'whatDeterminesCardFaceOnDraw' : 'whatDeterminesCardFaceOnPass');
        const dramaticReveal = game.settings.get(MODULE_ID, isDraw ? 'enableDramaticRevealOnDraw' : 'enableDramaticRevealOnPass');
        const shareToAll = context.action.includes(`${MODULE_SHORT}_doshare`);
        const doView = !context.action.includes(`${MODULE_SHORT}_noshow`);
        context.toCreate.forEach(dest => {
            drawnCards = dest;
            if (dest instanceof Array === false) drawnCards = [dest];
            cards.push(...drawnCards.map(item => item._id));
        });
        const faceDown = cardFaceLogic === 'source' ? drawnCards[0].face === null : cardFaceLogic === 'alwaysdown' ? true : false;
        if (doView) viewer.view(cards, faceDown, whisper, dramaticReveal, shareToAll);
    });
}


// TOFIX: Use perspective(100vh) before and during flipping, to add some 3d depth to the flip.

// TOFIX: after a card is flipped, its perspective (expected to open face toward the cursor) is reversed.

// TOFIX: border thickness is fixed, no matter how small the cards get.  can i make this relative to the card's size (%)?


// TODO: Now that multiple card displays work, add a FLIP-ALL button... or a GESTURE? like click-dragging across all cards flips the whole group?

// TODO: I think I can remove the necessity for "deck" and "deckName" in many places. May only need it for manual .draw() calls (i.e. from the macro).

// TODO: Clean up hooks.mjs so it's just an index of hooks/events ponting to abstracted handler functions -- i.e. move all the handler code from hooks.mjs into another script.

// TODO: Convert all jQuery to raw JS.

// TODO: Add more custom macro icons to /assets? For drawing multiple cards?

// TODO: Support non-card images...
    // TODO: Support max-height sizing for images that aren't nec card-shaped.
    // TODO: Support png / webp transparency (might be contingent on removing glint effects)
    // TODO: Add options to remove glint affects (for non-card images)
    // TODO: Add simple image macros back once support is satisfactory.


// TODO: Stretch Goal - "Watch me flip".  Let the sharer control when the card is flipped for all other viewers (and suppress viewers' ability to flip).

// TODO: Stretch Goal - Display multiple cards more like hand-held - in a slight arc, maybe even overlapping.

// TODO: Stretch Goal - add a param to opt into launching the FancyDisplay in a popout (vs full-screen, as is the default view) - and make this a module Setting.


// TODO: MAYBE Stretch Goal - add functionality to display image with frayed / torn / rough edges (for non-card images).

// TODO: MAYBE Stretch Goal - add ability to rotate or zoom in on the displayed image.

// TODO: MAYBE Stretch Goal - Anything that has a click-to-show, should also support drag-to-canvas.

// TODO: MAYBE Stretch Goal - add Show to Players button to non-DMs... but this will get hairy... Need to somehow block immediate re-shares / sharing of an already dispalyed card/img.