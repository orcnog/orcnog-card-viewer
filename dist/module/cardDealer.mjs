import { MODULE_ID, MODULE_SHORT, MODULE_L18N_PREFIX } from "./consts.mjs";
import { LogUtility } from "./log.mjs";
import FancyDisplay from './fancyDisplay.mjs';

class CardDealer {
    constructor({deckName, discardPileName}) {
        this.deckName = null;
        this.deck = null;
        this.pile = null;

        this.initPromise = new Promise((resolve) => {
            this._initPromiseResolve = resolve;
        });

        this._initialize(deckName, discardPileName)
            .catch((error) => {
                LogUtility.error("Error initializing CardDealer:", error);
            });
    }

    async _initialize(deckName, discardPileName) {
        if (!deckName) {
            LogUtility.warn(game.i18n.localize(MODULE_L18N_PREFIX + ".notification.deckNameNotProvided")); // "Deck name not provided."
            return;
        }

        this.deckName = deckName;

        // Get the deck by name
        const deck = game.cards.getName(deckName);
        if (!deck) {
            LogUtility.warn(game.i18n.localize(MODULE_L18N_PREFIX + ".notification.deckNotFound")); // "No deck by that name was found."
            return;
        }

        this.deck = deck;
        if (discardPileName) {
            this.pile = await this._getDiscardPile(discardPileName); // may return null. at this point a discard pile is not mandatory though.
        }

        // Resolve the initialization promise to indicate completion
        this._initPromiseResolve();
    }

    // Draw one random card and display it
    /**
     * draw function
     * @param {boolean} share whether to automatically share the card to all other players on display
     * @param {string} forcedFace force the card to display as "UP", "DOWN", or "REVEAL" (for a dramatic reveal)
     */
    async draw(share = true, forcedFace) {
        let deckName, deck, pile;
        try {
            await this.initPromise;

            deckName = this.deckName;
            deck = this.deck;

            // At this point, it is mandatory that we have a discard pile.
            // If there's not already a discard pile assigned to THIS, try to match an existing discard pile by name, or just create a new one.
            if (!this.pile) this.pile = await this._createNewDiscardPile();

            pile = this.pile;
        } catch (error) {
            LogUtility.error("Error rendering CardDraw.draw():", error);
        }

        try {
            // Deal 1 random card and grab reference to the dealt card
            await deck.deal([pile], 1, {
                how: CONST.CARD_DRAW_MODES.RANDOM,
                action: `deal ${MODULE_SHORT}_nohook`,
                chatNotification: false
            });
        } catch(error) {
            LogUtility.error(error, {ui: true});
            return null;
        }

        try {
            const drawnCard = pile.cards.contents[pile.cards.size - 1];
            const cardFaceLogic = game.settings.get(MODULE_ID, 'whatDeterminesCardFaceOnDraw');
            const faceDown = (forcedFace == null) ? 
                 (cardFaceLogic === "alwaysdown" ? true :
                  cardFaceLogic === "alwaysup" ? false :
                  drawnCard.face === null) :
                 (forcedFace === "DOWN" ? true :
                  (forcedFace === "UP" || forcedFace === "REVEAL") ? false : false);
            const dramaticReveal = forcedFace === 'REVEAL' || (!forcedFace && game.settings.get(MODULE_ID, 'enableDramaticRevealOnDraw') === true);

            // Extract card properties
            const { id, name, front, back, desc } = this._extractCardProperties(drawnCard);

            if (game.settings.get(MODULE_ID, 'enableDisplayOnDraw')) {
                // Display with fancy card viewer module
                new FancyDisplay({
                    imgArray: [{ front, back }],
                    faceDown: faceDown,
                }).render(share, dramaticReveal);
            }

            if (game.settings.get(MODULE_ID, 'enableWhisperCardTextToDM')) {
                // Whisper the card instructions to the DM
                this._whisperCardInstructions(deckName, id, name, front, desc);
            }
        } catch (error) {
            LogUtility.error("Error rendering CardDraw.draw():", error);
        }
    }

    /**
     * View a card (but do not draw it)
     * @param {Array|string} cards This can be an array of strings or a single string, which can be the card ID or exact name.
     * @param {boolean} faceDown Optional, tells the viewer whether to render the card face-down or not (default is yes)
     * @param {boolean} whisper Optional, tells the viewer whether to whisper the card details to the DM on view (default is yes)
     * @param {boolean} dramaticReveal Optional, tells the viewer whether to show the card facedown at first, then automatically flip it over after a 1/2 sec (default is no)
     * @param {boolean} share Optional, tells the viewer whether to share to all players or not (default is no)
     * @returns 
     */
    async view(cards, faceDown, whisper, dramaticReveal, share) {
        try {
            const deck = this.deck;
            const deckName = this.deckName;
            const showFaceDown = faceDown;
            const doWhisper = whisper;
            const shareToAll = share;

            // Normalize cards input to always be an array
            const cardsArray = Array.isArray(cards) ? cards : [cards];

            if (!cardsArray || cardsArray.length === 0) {
                LogUtility.warn(game.i18n.localize(MODULE_L18N_PREFIX + ".notification.cardIdNotProvided")); // "Please provide a card name or ID."
                return;
            }

            const cardImgsArray = [];

            cardsArray.forEach(async (card) => {
                let cardToView = this._findCardAnywhere(card);

                if (!cardToView) {
                    LogUtility.warn(card + ': ' + game.i18n.localize(MODULE_L18N_PREFIX + ".notification.cardNotFound")); // "No card by that ID or name was found."
                    return;
                }

                // Extract card properties
                const { id, name, front, back, desc } = this._extractCardProperties(cardToView);

                cardImgsArray.push({ front, back });

                if (doWhisper) {
                    // Whisper the card instructions to the DM
                    this._whisperCardInstructions(deckName, id, name, front, desc);
                }
            });

            // Display with fancy card viewer module
            new FancyDisplay({
                imgArray: cardImgsArray,
                faceDown: showFaceDown,
            }).render(shareToAll, dramaticReveal);

        } catch (error) {
            LogUtility.error("Error rendering CardView.view():", error);
        }
    }

    // Given a card ID string, find and return the card no matter what stack it currently lives in (because it can move around)
    _findCardAnywhere(cardStr) {
        let card = game.cards.find(stack => stack.cards.get(cardStr))?.cards.get(cardStr);
        card = card || game.cards.find(stack => stack.cards.getName(cardStr))?.cards.getName(cardStr);
        return card;
    }

    // Get the discard pile by name, or smart detect a discard pile's existence and get that, or create a new one.
    async _getDiscardPile(discardPileName) {
        let pile;
        if (!discardPileName) {
            // If no name provided, then lookup piles and try to smart-match by deck name.
            const matchedPileName = this._smartMatchDiscardName(this.deckName);
            pile = game.cards.getName(matchedPileName);
            if (pile) LogUtility.warn(`No discard pile name provided. Found a discard pile named "${matchedPileName}", which will be used.`);
        } else {
            // Try to get an existing discard pile by the name provided
            pile = game.cards.getName(discardPileName);
            // If that didn't work, create a new discard pile by the name provided.
            if (!pile) {
                LogUtility.warn(game.i18n.format(MODULE_L18N_PREFIX + ".notification.pileNotFoundWillCreate", {"pileName": discardPileName})); // `No pile found by the name "${discardPileName}". Creating a new discard pile by that name.`
                pile = await Cards.create({ name: discardPileName, type: "pile" });
            }
        }
        return pile;
    }

    // Create a new discard pile by deck name.
    async _createNewDiscardPile(discardPileName) {
        const newPileName = discardPileName || `${this.deckName} - ${game.i18n.localize(MODULE_L18N_PREFIX + ".ui.discardPileLabel")}`;
        const pile = this.pile || await Cards.create({ name: newPileName, type: "pile" });
        return pile;
    }

    _smartMatchDiscardName(name) {
        // Words that can be ignored when attempting to match the deck name to a potential discard pile's name
        const stopwords = game.i18n.localize(MODULE_L18N_PREFIX + ".ui.ignoreWordsInDeckNameForDiscardPileMatch").split(/\s*,\s*/); // ["the", "thy", "a", "an", "in", "on", "of", "for", "de", "le", "la", "el", "los", "las", "deck", "cards", "card"]

        // Words that, if matched in a card stack's name, signify that it is potentially a discard pile
        const matchwordsOr = game.i18n.localize(MODULE_L18N_PREFIX + ".ui.keyWordsToIdentifyDiscardPile").split(/\s*,\s*/); // ["discard", "drawn", "played", "used"];

        const namePattern = new RegExp(name.replace(new RegExp(`\\b(?:${stopwords.join("|")})\\b\\s*`, "gi"), ""), "i");
        const discardPattern = new RegExp(`(?:${matchwordsOr.join("|")})`, "i");
        const fallbackPattern = /Discard(?:\s+Pile)?/i;

        for (const [deckId, deck] of game.cards.entries()) {
            if ((namePattern.test(deck.name) && discardPattern.test(deck.name)) || fallbackPattern.test(deck.name)) {
                LogUtility.debug(`Discard Pile found for deck "${name}":`, deck.name);
                return deck.name;
            }
        }

        return null;
    }

    _extractCardProperties(card) {
        const id = card._id;
        const name = card.faces[0].name;
        const front = card.faces[0].img;
        const back = card.back.img;
        const desc = card.faces[0].text;
        const faceDown = true;

        return { id, name, front, back, desc, faceDown };
    }

    _whisperCardInstructions(deckName, cardId, cardName, front, desc) {
        const dm = game.users.find(u => u.isGM && u.active);
        if (!dm) {
            LogUtility.warn(game.i18n.localize(MODULE_L18N_PREFIX + ".notification.gmNotFound")); //"GM user not found."
            return;
        }

        const messageContent = `<div class="card-draw ${MODULE_ID}-msg flexrow" data-deck="${deckName}" data-card="${cardId}">
                <img class="card-face" src="${front}" alt="${cardName}" />
                <h4 class="card-name">${cardName}</h4>
            </div>
            <p>${desc}</p>`;

        ChatMessage.create({ content: messageContent, whisper: [dm._id] });
    }
}

export default CardDealer;
