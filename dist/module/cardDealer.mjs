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
                console.error("Error initializing CardDealer:", error);
            });
    }

    async _initialize(deckName, discardPileName) {
        if (!deckName) {
            ui.notifications.warn(game.i18n.localize("ORCNOG_CARD_VIEWER.notification.deckNameNotProvided")); // "Deck name not provided."
            return;
        }

        this.deckName = deckName;

        // Get the deck by name
        const deck = game.cards.getName(deckName);
        if (!deck) {
            ui.notifications.warn(game.i18n.localize("ORCNOG_CARD_VIEWER.notification.deckNotFound")); // "No deck by that name was found."
            return;
        }

        this.deck = deck;
        this.pile = await this._getDiscardPile(discardPileName); // may return null. at this point a discard pile is not mandatory though.

        // Resolve the initialization promise to indicate completion
        this._initPromiseResolve();
    }

    async draw(shareToAll = false) {
        try {
            await this.initPromise;
            const deck = this.deck;
            await game.settings.set('orcnog-card-viewer', 'shareToAll', shareToAll);
            // At this point, it is mandatory that we have a discard pile.
            // If there's not already a discard pile assigned to THIS, try to match an existing discard pile by name, or just create a new one.
            if (!this.pile) this.pile = await this._createNewDiscardPile();

            const pile = this.pile;

            // Deal 1 random card and grab reference to the dealt card
            await deck.deal([pile], 1, {
                how: CONST.CARD_DRAW_MODES.RANDOM,
                action: shareToAll ? 'deal orcnog_card_viewer_doshare' : 'deal',
                chatNotification: false
            });

            const card = pile.cards.contents[pile.cards.size - 1];

            if (!game.settings.get('orcnog-card-viewer', 'enableDisplayOnDeal')) {
                // Display with fancy card viewer module
                new FancyDisplay(card).render(shareToAll);

                if (!game.settings.get('orcnog-card-viewer', 'enableWhisperCardTextToDM')) {
                    // Whisper the card instructions to the DM
                    this._whisperCardInstructions(card);
                }
            }


        } catch (error) {
            console.error("Error rendering CardDraw.draw():", error);
        }
    }

    /**
     * View a card (but do not draw it)
     * @param {string} card This is the card object.
     * @param {boolean} whisper Optional, tells the viewer whether to whisper the card details to the DM on view (default is yes)
     * @param {boolean} shareToAll Optional, tells the viewer whether to share to all players or not (default is no)
     * @returns
     */
    async view(card, whisper, shareToAll) {
        try {
            let cardToDisplay = card;
            const deck = this.deck;
            if (typeof cardToDisplay === 'string') {
                cardToDisplay = deck.cards.find((c) => c.name === card);
            }
            const doWhisper = whisper;

            // Display with fancy card viewer module
            new FancyDisplay(cardToDisplay).render(shareToAll);

            if (doWhisper) {
                // Whisper the card instructions to the DM
                this._whisperCardInstructions(cardToDisplay);
            }

        } catch (error) {
            console.error("Error rendering CardView.view():", error);
        }
    }

    // Get the discard pile by name, or smart detect a discard pile's existence and get that, or create a new one.
    async _getDiscardPile(discardPileName) {
        let pile;
        if (!discardPileName) {
            // If no name provided, then lookup piles and try to smart-match by deck name.
            const matchedPileName = this._smartMatchDiscardName(this.deckName);
            pile = game.cards.getName(matchedPileName);
            if (pile) console.warn(`No discard pile name provided. Found a discard pile named "${matchedPileName}", which will be used.`);
        } else {
            // Try to get an existing discard pile by the name provided
            pile = game.cards.getName(discardPileName);
            // If that didn't work, create a new discard pile by the name provided.
            if (!pile) {
                ui.notifications.warn(game.i18n.format("ORCNOG_CARD_VIEWER.notification.pileNotFoundWillCreate", {"pileName": discardPileName})); // `No pile found by the name "${discardPileName}". Creating a new discard pile by that name.`
                pile = await Cards.create({ name: discardPileName, type: "pile" });
            }
        }
        return pile;
    }

    // Create a new discard pile by deck name.
    async _createNewDiscardPile(discardPileName) {
        const newPileName = discardPileName || `${this.deckName} - ${game.i18n.localize("ORCNOG_CARD_VIEWER.ui.discardPileLabel")}`;
        const pile = this.pile || await Cards.create({ name: newPileName, type: "pile" });
        return pile;
    }

    _smartMatchDiscardName(name) {
        // Words that can be ignored when attempting to match the deck name to a potential discard pile's name
        const stopwords = game.i18n.localize("ORCNOG_CARD_VIEWER.ui.ignoreWordsInDeckNameForDiscardPileMatch").split(/\s*,\s*/); // ["the", "thy", "a", "an", "in", "on", "of", "for", "de", "le", "la", "el", "los", "las", "deck", "cards", "card"]

        // Words that, if matched in a card stack's name, signify that it is potentially a discard pile
        const matchwordsOr = game.i18n.localize("ORCNOG_CARD_VIEWER.ui.keyWordsToIdentifyDiscardPile").split(/\s*,\s*/); // ["discard", "drawn", "played", "used"];

        const namePattern = new RegExp(name.replace(new RegExp(`\\b(?:${stopwords.join("|")})\\b\\s*`, "gi"), ""), "i");
        const discardPattern = new RegExp(`(?:${matchwordsOr.join("|")})`, "i");
        const fallbackPattern = /Discard(?:\s+Pile)?/i;

        for (const [deckId, deck] of game.cards.entries()) {
            if ((namePattern.test(deck.name) && discardPattern.test(deck.name)) || fallbackPattern.test(deck.name)) {
                console.log(`Discard Pile found for deck "${name}":`, deck.name);
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
        const border = '#d29a38';
        const faceDown = true;

        return { id, name, front, back, desc, border, isFaceDown };
    }

    _whisperCardInstructions(card) {
        const dm = game.users.find(u => u.isGM && u.active);
        if (!dm) {
            ui.notifications.warn(game.i18n.localize("ORCNOG_CARD_VIEWER.notification.gmNotFound")); //"GM user not found."
            return;
        }
        const cardImage = card.showFace ? card.faces[card.face].img : card.back.img;
        const cardText = card.showFace ? card.faces[card.face].text : card.name;
        const messageContent = `<div class="card-draw orcnog-card-viewer-msg flexrow" data-card="${card.id}">
                <img class="card-face" src="${cardImage}" alt="${card.name}" />
                <h4 class="card-name">${card.name}</h4>
            </div>
            <p>${cardText}</p>`;

        ChatMessage.create({ content: messageContent, whisper: [dm._id] });
    }
}

export default CardDealer;
