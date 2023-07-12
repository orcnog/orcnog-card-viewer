export const registerSettings = function() {
    // Enable/disable clickable card icons in Sidebar Card Stacks.
    game.settings.register('orcnog-card-viewer', 'enableCardIconClick', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableCardIconClick.name"), // "Enable clickable card icons",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableCardIconClick.hint"), // "Enable/disable clickable card icons in Sidebar Card Stacks",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable displaying cards when they are dealt.
    game.settings.register('orcnog-card-viewer', 'enableDisplayOnDeal', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDisplayOnDeal.name"), // "Enable display on deal",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDisplayOnDeal.hint"), // "Enable/disable displaying cards when they are dealt.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable displaying cards when they are drawn.
    game.settings.register('orcnog-card-viewer', 'enableDisplayOnDraw', {
        name: "Enable display on draw.",
        hint: "Enable/disable displaying cards when they are drawn from a deck.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable displaying cards when they are passed.
    game.settings.register('orcnog-card-viewer', 'enableDisplayOnPassToHand', {
        name: "Enable display on pass to hand.",
        hint: "Enable/disable displaying cards when they are passed to a hand.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable displaying cards when they are passed to a pile.
    game.settings.register('orcnog-card-viewer', 'enableDisplayOnPassToPile', {
        name: "Enable display on pass to pile.",
        hint: "Enable/disable displaying cards when they are passed to a pile.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable whispering card details to the DM on view.
    game.settings.register('orcnog-card-viewer', 'enableWhisperCardTextToDM', {
        name: "Enable whisper card details to DM.",
        hint: "Enable/disable whispering card details to the DM on view.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable whispering card details to the DM on view.
    game.settings.register('orcnog-card-viewer', 'enableWhisperCardTextToDM', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableWhisperCardTextToDM.name"), // "Enable whisper card details to DM",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableWhisperCardTextToDM.hint"), // "Enable/disable whispering card details to the DM on view.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Configure default card border thickness.
    game.settings.register('orcnog-card-viewer', 'defaultCardBorderWidth', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBorderWidth.name"), // "Default card border thickness",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBorderWidth.hint"), // "Configure the default card border thickness on displayed cards.",
        scope: 'world',
        config: true,
        default: '8px',
        type: String
    });
    // Configure default card border color.
    game.settings.register('orcnog-card-viewer', 'defaultCardBorderColor', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBorderColor.name"), // "Default card border color",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBorderColor.hint"), // "Configure the default card border color on displayed cards.",
        scope: 'world',
        config: true,
        default: '#d29a38',
        type: String
    });
    // Configure default card back image.
    game.settings.register('orcnog-card-viewer', 'defaultCardBackImage', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBackImage.name"), // "Default card back image",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBackImage.hint"), // "Configure the default card back image on images viewed as cards.",
        scope: 'world',
        config: true,
        default: 'modules/orcnog-card-viewer/assets/cardbacks/orcnogback.webp',
        type: String,
        filePicker: 'image'
    });
}
