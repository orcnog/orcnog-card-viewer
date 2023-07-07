export const registerSettings = function() {
    // Enable/disable clickable card icons in Sidebar Card Stacks.
    game.settings.register('orcnog-card-viewer', 'enableCardIconClick', {
        name: "Enable clickable card icons",
        hint: "Enable/disable clickable card icons in Sidebar Card Stacks",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });
    // Enable/disable displaying cards when they are dealt.
    game.settings.register('orcnog-card-viewer', 'enableDisplayOnDeal', {
        name: "Enable display on deal.",
        hint: "Enable/disable displaying cards when they are dealt.",
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
    game.settings.register('orcnog-card-viewer', 'share', {
        name: "Share Card to Chat",
        hint: "Determines whether or not to share the card to chat.",
        scope: 'world',
        config: false,
        default: true,
        type: Boolean
    });
    game.settings.register('orcnog-card-viewer', 'view', {
        name: "View Card(s)",
        hint: "Determines whether or not to view the cards for a given action.",
        scope: 'world',
        config: false,
        default: true,
        type: Boolean
    });
};
