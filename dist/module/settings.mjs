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
    game.settings.register('orcnog-card-viewer', 'shareToAll', {
        name: "Render FancyDisplay for everyone",
        hint: "This is a hidden programmatic setting for determining whether or not to display a card to everyone using FancyDisplay.",
        scope: 'world',
        config: false,
        default: false,
        type: Boolean
    });
};
