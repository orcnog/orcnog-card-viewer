import { MODULE_ID } from "./consts.mjs";

export const registerSettings = function() {
    // Enable/disable clickable card icons in Sidebar Card Stacks.
    game.settings.register(MODULE_ID, 'enableCardIconClick', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableCardIconClick.name"), // "Enable clickable card icons",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableCardIconClick.hint"), // "Enable/disable clickable card icons in Sidebar Card Stacks",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable displaying cards when they are dealt.
    game.settings.register(MODULE_ID, 'enableDisplayOnDeal', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDisplayOnDeal.name"), // "Display on deal",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDisplayOnDeal.hint"), // "Enable/disable displaying cards when they are dealt.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable displaying cards when they are passed.
    game.settings.register(MODULE_ID, 'enableDisplayOnPass', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDisplayOnPass.name"), // "Display on pass",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDisplayOnPass.hint"), // "Enable/disable displaying cards when they are passed.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable displaying cards when they are drawn into a hand.
    game.settings.register(MODULE_ID, 'enableDisplayOnDrawToHand', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDisplayOnDrawToHand.name"), // "Display on draw (to hand)",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDisplayOnDrawToHand.hint"), // "Enable/disable displaying cards when they are drawn into a hand.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    game.settings.register(MODULE_ID, 'whatDeterminesCardFace', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.whatDeterminesCardFace.name"), // "Select what determins initial card face",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.whatDeterminesCardFace.hint"), // "Logic that determines which card face is initially shown on display. "Source stack determines face" means a card may display initially face-up or face-down based on how it is facing in its source stack. "Always face-up" makes all cards always render face-up regardless of any other settings you've selected. "Always face-down" likewise means cards will never render face-up or do a dramatic flip reveal, no matter what other settings you've configured.",
        scope: 'world',
        config: true,
        default: "source",
        type: String,
        choices: {
            "alwaysdown": "Always face-down",
            "alwaysup": "Always face-up",
            "source": "Source stack determines face",
        },
      });
    // Enable/disable dramatic flip reveal when cards are dealt.
    game.settings.register(MODULE_ID, 'enableDramaticRevealOnDeal', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDramaticRevealOnDeal.name"), // "Dramatic reveal on Deal",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDramaticRevealOnDeal.hint"), // "When a Deal action is performed, enable/disable showing the card(s) facedown at first, then dramatically flipping them over automatically after a brief pause.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable dramatic flip reveal on when cards are passed.
    game.settings.register(MODULE_ID, 'enableDramaticRevealOnPass', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDramaticRevealOnPass.name"), // "Dramatic reveal reveal on Pass",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDramaticRevealOnPass.hint"), // "When a Pass action is performed, enable/disable showing the card(s) facedown at first, then dramatically flipping them over automatically after a brief pause.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable dramatic flip reveal on when cards are drawn into a hand.
    game.settings.register(MODULE_ID, 'enableDramaticRevealOnDrawToHand', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDramaticRevealOnDrawToHand.name"), // "Dramatic reveal on Draw (to hand)",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDramaticRevealOnDrawToHand.hint"), // "When a Draw action is performed, enable/disable showing the card(s) facedown at first, then dramatically flipping them over automatically after a brief pause.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable clickable card icons in Sidebar Card Stacks.
    game.settings.register(MODULE_ID, 'enableDramaticRevealOnCardIconClick', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDramaticRevealOnCardIconClick.name"), // "Dramatic reveal on card icon click",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDramaticRevealOnCardIconClick.hint"), // "On card icon clicks, enable/disable showing the card(s) facedown at first, then dramatically flipping them over automatically after a brief pause.",
        scope: 'world',
        config: true,
        default: false,
        type: Boolean
    });
    // Enable/disable whispering card details to the DM on view.
    game.settings.register(MODULE_ID, 'enableWhisperCardTextToDM', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableWhisperCardTextToDM.name"), // "Whisper card details to DM",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableWhisperCardTextToDM.hint"), // "Enable/disable whispering card details to the DM on view.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Configure default card border thickness.
    game.settings.register(MODULE_ID, 'defaultCardBorderWidth', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBorderWidth.name"), // "Default card border thickness",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBorderWidth.hint"), // "Configure the default card border thickness on displayed cards.",
        scope: 'world',
        config: true,
        default: '8px',
        type: String
    });
    // Configure default card border color.
    game.settings.register(MODULE_ID, 'defaultCardBorderColor', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBorderColor.name"), // "Default card border color",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBorderColor.hint"), // "Configure the default card border color on displayed cards.",
        scope: 'world',
        config: true,
        default: '#d29a38',
        type: String
    });
    // Configure default card back image.
    game.settings.register(MODULE_ID, 'defaultCardBackImage', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBackImage.name"), // "Default card back image",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBackImage.hint"), // "Configure the default card back image on images viewed as cards.",
        scope: 'world',
        config: true,
        default: `modules/${MODULE_ID}/assets/cardbacks/orcnogback.webp`,
        type: String,
        filePicker: 'image'
    });
}
