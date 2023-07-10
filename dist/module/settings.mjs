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
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDisplayOnDeal.name"), // "Enable display on deal.",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableDisplayOnDeal.hint"), // "Enable/disable displaying cards when they are dealt.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable whispering card details to the DM on view.
    game.settings.register('orcnog-card-viewer', 'enableWhisperCardTextToDM', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableWhisperCardTextToDM.name"), // "Enable whisper card details to DM.",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.enableWhisperCardTextToDM.hint"), // "Enable/disable whispering card details to the DM on view.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Configure default card border thickness.
    game.settings.register('orcnog-card-viewer', 'defaultCardBorderWidth', {
        name: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBorderWidth.name"), // "Enable whisper card details to DM.",
        hint: game.i18n.localize("ORCNOG_CARD_VIEWER.settings.defaultCardBorderWidth.hint"), // "Enable/disable whispering card details to the DM on view.",
        scope: 'world',
        config: true,
        default: '8px',
        type: String,
        choices: {
            '0px': '0px',
            '4px': '4px',
            '8px': '8px',
            '12px': '12px',
            '16px': '16px',
            '20px': '20px',
            '24px': '24px',
            '28px': '28px',
            '32px': '32px'
        }
    });
}
