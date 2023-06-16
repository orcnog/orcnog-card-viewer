import FancyDisplay from './fancyDisplay.mjs';

class CardDealer {
    constructor(deckName, discardPileName) {
        this.deckName = null;
        this.deck = null;
        this.pile = null;

        this.initPromise = new Promise((resolve) => {
            this.initPromiseResolve = resolve;
        });

        this.initialize(deckName, discardPileName)
            .catch((error) => {
                console.error("Error initializing CardDealer:", error);
            });
    }

    async initialize(deckName, discardPileName) {
        if (!deckName) {
            ui.notifications.warn("Deck name not provided.");
            return;
        }

        this.deckName = deckName;

        // Get the deck by name
        const deck = game.cards.getName(deckName);
        if (!deck) {
            ui.notifications.warn("No deck by that name was found.");
            return;
        }

        this.deck = deck;

        // Get the discard pile by name, or smart detect a discard pile's existence and get that, or create a new one.
        let pileName = discardPileName;
        let pile = game.cards.getName(pileName);
        if (!pile) {
            // No pile found, but if the user did provide a name, go ahead and make a new pile with that name.
            if (discardPileName) {
                pile = await Cards.create({ name: discardPileName, type: "pile" });
            } else {
                // No discard pile name provided. Lookup piles and try to smart-match.
                const matchedPileName = this._smartMatchDiscardName(deckName);
                pile = game.cards.getName(matchedPileName);
                if (pile && discardPileName) ui.notifications.warn(`Found a discard pile named "${matchedPileName}" which will be used.`);
            }
            // No match found. Create a new pile.
            if (!pile) pile = await Cards.create({ name: deckName + " - Discard Pile", type: "pile" });
        }

        this.pile = pile;

        // Resolve the initialization promise to indicate completion
        this.initPromiseResolve();
    }

    async draw() {
        try {
            await this.initPromise;

            const deckName = this.deckName;
            const deck = this.deck;
            const pile = this.pile;

            // Deal 1 random card and grab reference to the dealt card
            await deck.deal([pile], 1, { how: CONST.CARD_DRAW_MODES.RANDOM });
            const drawnCard = pile.cards.contents[pile.cards.size - 1];

            // Extract card properties
            const { name, front, back, desc, border, faceDown } = this._extractCardProperties(drawnCard);

            // Display with fancy card viewer module
            new FancyDisplay(front, back, border, faceDown).render(true);

            // Whisper the card instructions to the DM
            this._whisperCardInstructions(name, front, desc);

        } catch (error) {
            console.error("Error rendering CardDraw.draw():", error);
        }
    }

    async view(cardName) {
        try {
            const deck = this.deck;

            if (!cardName) {
                ui.notifications.warn("Card name not provided.");
                return;
            }

            // Get card by name
            const card = deck.cards.getName(cardName);
            if (!card) {
                ui.notifications.warn("No card by that name was found.");
                return;
            }

            // Extract card properties
            const { name, front, back, desc, border, faceDown } = this._extractCardProperties(card);

            // Display with fancy card viewer module
            new FancyDisplay(front, back, border, faceDown).render(true);

            // Whisper the card instructions to the DM
            this._whisperCardInstructions(name, front, desc);

        } catch (error) {
            console.error("Error rendering CardView.view():", error);
        }
    }

    _smartMatchDiscardName(name) {
        // Words that can be ignored when attempting to match the deck name to a potential discard pile's name
        const stopwords = ["deck", "cards", "card", "of", "in", "on", "the", "a", "an"];

        // Words that, if matched in a card stack's name, signify that it is potentially a discard pile
        const matchwordsOr = ["discard", "drawn", "played", "used"];

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
        const name = card.faces[0].name;
        const front = card.faces[0].img;
        const back = card.back.img;
        const desc = card.faces[0].text;
        const border = '#d29a38';
        const faceDown = true;

        return { name, front, back, desc, border, faceDown };
    }

    _whisperCardInstructions(name, front, desc) {
        const dm = game.users.find(u => u.isGM && u.active);
        if (!dm) {
            ui.notifications.warn("DM user not found.");
            return;
        }

        const messageContent = `<div class="card-draw card-viewer-msg flexrow" data-font="${front}">
                <img class="card-face" src="${front}" alt="${name}" />
                <h4 class="card-name">${name}</h4>
            </div>
            <p>${desc}</p>`;

        ChatMessage.create({ content: messageContent, whisper: [dm._id] });
    }
}

export default CardDealer;
