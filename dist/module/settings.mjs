import { MODULE_ID, MODULE_L18N_PREFIX, MODULE_SHORT } from "./consts.mjs";

export const registerSettings = function() {
    // Enable/disable clickable card icons in Sidebar Card Stacks.
    game.settings.register(MODULE_ID, 'enableCardIconClick', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableCardIconClick.name`), // "Enable clickable card icons",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableCardIconClick.hint`), // "Enable/disable clickable card images thumbnails in the Sidebar and in Card Stack app windows",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
    // Enable/disable whispering card details to the DM on view.
    game.settings.register(MODULE_ID, 'enableWhisperCardTextToDM', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableWhisperCardTextToDM.name`), // "Whisper card details to DM",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableWhisperCardTextToDM.hint`), // "Enable/disable whispering card details to the DM on view.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
    // Enable/disable displaying cards when they are drawn into a hand, or with the Draw a Card macro or other cardDealer.draw() call.
    game.settings.register(MODULE_ID, 'enableDisplayOnDraw', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableDisplayOnDraw.name`), // "Display on Draw",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableDisplayOnDraw.hint`), // "Enable/disable displaying cards full-screen when the built-in \"Draw a Card\" macro or api.draw() call is used, or when cards are drawn into a hand with the Draw action.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
    game.settings.register(MODULE_ID, 'whatDeterminesCardFaceOnDraw', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.whatDeterminesCardFaceOnDraw.name`), // "Show face-up/down on Draw",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.whatDeterminesCardFaceOnDraw.hint`), // "Select the logic that determines which card face is initially shown on display when performing a Draw action, or executing the macro or other api.draw() calls. "Source stack determines face" means a card may display initially face-up or face-down based on how it is facing in its source stack. "Always face-up" makes all cards always render face-up regardless of any other settings you've selected. "Always face-down" likewise means cards will never render face-up or do a dramatic flip reveal, no matter what other settings you've configured. Note: parameters passed into the \"Draw a Card\" macro or an api.draw() call wlil override this setting.",
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
    // Enable/disable dramatic flip reveal on when cards are drawn into a hand.
    game.settings.register(MODULE_ID, 'enableDramaticRevealOnDraw', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableDramaticRevealOnDraw.name`), // "Dramatic reveal on Draw (to hand)",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableDramaticRevealOnDraw.hint`), // "When a Draw action is performed, if the card should be shown face-up, enable/disable showing the card(s) facedown at first, then dramatically flipping them over automatically after a brief pause. Note: parameters passed into the \"Draw a Card\" macro or an api.draw() call wlil override this setting.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
    // Enable/disable displaying cards when they are dealt.
    game.settings.register(MODULE_ID, 'enableDisplayOnDeal', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableDisplayOnDeal.name`), // "Display on Deal",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableDisplayOnDeal.hint`), // "Enable/disable displaying cards full-screen when they are dealt using the Deal action.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
    game.settings.register(MODULE_ID, 'whatDeterminesCardFaceOnDeal', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.whatDeterminesCardFaceOnDeal.name`), // "Show face-up/down on Deal",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.whatDeterminesCardFaceOnDeal.hint`), // "Select the logic that determines which card face is initially shown on display when performing a Deal action. "Source stack determines face" means a card may display initially face-up or face-down based on how it is facing in its source stack. "Always face-up" makes all cards always render face-up regardless of any other settings you've selected. "Always face-down" likewise means cards will never render face-up or do a dramatic flip reveal, no matter what other settings you've configured.",
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
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableDramaticRevealOnDeal.name`), // "Dramatic reveal on Deal",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableDramaticRevealOnDeal.hint`), // "When a Deal action is performed, if the card should be shown face-up, enable/disable showing the card(s) facedown at first, then dramatically flipping them over automatically after a brief pause.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
    // Enable/disable displaying cards when they are passed.
    game.settings.register(MODULE_ID, 'enableDisplayOnPass', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableDisplayOnPass.name`), // "Display on Pass",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableDisplayOnPass.hint`), // "Enable/disable displaying cards full-screen when they are passed using the Pass action.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
    game.settings.register(MODULE_ID, 'whatDeterminesCardFaceOnPass', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.whatDeterminesCardFaceOnPass.name`), // "Show face-up/down on Pass",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.whatDeterminesCardFaceOnPass.hint`), // "Select the logic that determines which card face is initially shown on display when performing a Pass action. "Source stack determines face" means a card may display initially face-up or face-down based on how it is facing in its source stack. "Always face-up" makes all cards always render face-up regardless of any other settings you've selected. "Always face-down" likewise means cards will never render face-up or do a dramatic flip reveal, no matter what other settings you've configured.",
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
    // Enable/disable dramatic flip reveal on when cards are passed.
    game.settings.register(MODULE_ID, 'enableDramaticRevealOnPass', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableDramaticRevealOnPass.name`), // "Dramatic reveal reveal on Pass",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.enableDramaticRevealOnPass.hint`), // "When a Pass action is performed, if the card should be shown face-up, enable/disable showing the card(s) facedown at first, then dramatically flipping them over automatically after a brief pause.",
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
    // Configure default card border thickness.
    game.settings.register(MODULE_ID, 'defaultCardBorderWidth', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.defaultCardBorderWidth.name`), // "Default card border thickness",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.defaultCardBorderWidth.hint`), // "Configure the default card border thickness on displayed cards.",
        scope: 'world',
        config: true,
        default: '8px',
        type: String,
    });
    // Configure default card border color.
    game.settings.register(MODULE_ID, 'defaultCardBorderColor', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.defaultCardBorderColor.name`), // "Default card border color",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.defaultCardBorderColor.hint`), // "Configure the default card border color on displayed cards.",
        scope: 'world',
        config: true,
        default: '#d29a38',
        type: String,
    });
    // Configure default card back image.
    game.settings.register(MODULE_ID, 'defaultCardBackImage', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.defaultCardBackImage.name`), // "Default card back image",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.defaultCardBackImage.hint`), // "Configure the default card back image on images viewed as cards.",
        scope: 'world',
        config: true,
        default: `modules/${MODULE_ID}/assets/cardbacks/orcnogback.webp`,
        type: String,
        filePicker: 'image',
    });
    // Configure dramatic reveal delay (ms).
    game.settings.register(MODULE_ID, 'dramaticRevealDelay', {
        name: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.dramaticRevealDelay.name`), // "Dramatic reveal delay (ms)",
        hint: game.i18n.localize(`${MODULE_L18N_PREFIX}.settings.dramaticRevealDelay.hint`), // "Configure the number of milliseconds to delay before automiatcally flipping a card to face-up, when a \"Dramtic Reveal\" setting is enabled for a particular action. Default is 500 (half a second).",
        scope: 'world',
        config: true,
        default: 500,
        type: Number,
    });
}

export function onRenderSettingsConfig(settingsConfig, html, user) {
    /**
     * Handle the "renderSettingsConfig" hook.
     * This is fired when Foundry's settings window is opened.
     * Enable / disable interaction with various settings, depending on whether "Notify Typing" is enabled.
     */
    const formGroups = html[0].querySelectorAll(`div.form-group[data-setting-id^="${MODULE_ID}"]`);

    // Add an "active" class to checked Display On ___ groups on check, to control visibility of other settings fields in that group.
    const displayOnGroups = [...formGroups].filter(fg => {
        return !!fg.querySelector(`input[name^="${MODULE_ID}.enableDisplayOn"]`);
    });
    displayOnGroups.forEach(fg => {
        fg.classList.add(`${MODULE_SHORT}-displaygroup`);
        fg.addEventListener("change", (event) => {
            if (event.target.checked) {
                fg.classList.add('active');
            } else {
                fg.classList.remove('active');
            }
        })
    });
    const activeDisplayOnGroups = [...displayOnGroups].filter(fg => {
        return !!fg.querySelector('input:checked');
    });
    activeDisplayOnGroups.forEach(fg => {
        fg.classList.add('active');
    });

    // Add an "active" class to "Show face-up/down" groups that have an option selected other than "Always face-down". Controls visibility of "Dramatic Reveal" fields via CSS.
    const faceUpLogicGroups = [...formGroups].filter(fg => {
        return !!fg.querySelector(`select[name^="${MODULE_ID}.whatDeterminesCardFaceOn"]`);
    });
    faceUpLogicGroups.forEach(fg => {
        fg.classList.add(`${MODULE_SHORT}-facelogicgroup`);
        fg.addEventListener("change", (event) => {
            if (event.target.value !== 'alwaysdown' ) {
                fg.classList.add('active');
            } else {
                fg.classList.remove('active');
            }
        })
    });
    const activeFaceUpLogicGroups = [...faceUpLogicGroups].filter(fg => {
        return !fg.querySelector('option[value="alwaysdown"][selected]');
    });
    activeFaceUpLogicGroups.forEach(fg => {
        fg.classList.add('active');
    });
}