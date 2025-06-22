# Card Viewer
#### A Module for Foundry VTT

## Purpose
After setting up a deck of many things in one of my games, I found there wasn't great out-of-the-box way to simply view and share a card.  Taking visual inspiration from a popular 5e toolset, I ported their card viewer UX over to the Foundry system.  Now, I can view cards beautifully in a 3d-feel viewer, flip the cards over to view the card art or read the card stats, and even share this beautiful view with my players on the fly.

## Dependencies
[socketlib](https://foundryvtt.com/packages/socketlib)

## Compatibility
This was built on Foundry v11 and, based on initial user feedback, appears to be currently mostly compatible with v10 but may have some bugs. As for compatibility with other modules, none have been tested, but the functionality of this mod doesn't mess with the core card system and only serves to enhance the UI in exactly one way, so I doubt there will be many conflicts. If you come across any issues in v10 or with mother modules, please feel free to log in the github [issues section](https://github.com/orcnog/orcnog-card-viewer/issues).

## Demo

A demo showing how to view a card from a deck, flip it, share it, dismiss it, and what output to expect in the DM chat:

![Demo of orcnog-card-viewer module](demo/orcnog-card-viewer-demo.gif)

___
A quick demo showcasing 2 macros that will draw a random card from a given deck and discard it, or peek at a card without drawing it:

![Demo of orcnog-card-viewer module](demo/orcnog-card-viewer-macro-demo.gif)

# Settings
* **Enable clickable card icons** - Enable/disable clickable card icons in Sidebar Card Stacks.
* **Enable display on deal** - Enable/disable displaying cards when they are dealt.
* **Enable whisper card details to DM** - Enable/disable whispering card details to the DM on view.
* **Default card border width** - Configure the default border width on displayed cards.
* **Default card border color** - Configure the default border color on displayed cards.
* **Default card back image** - Configure the default card back image on images viewed as cards.


# Macros
You'll need to import all the macros from the compendium in this module and customize them.

## Draw a Card
1. Replace `'Deck of Many Things'` with name of a deck in your world.
2. Replace `'My Discard Pile'` with the name of a pile in your world.
3. If you set `share` to true, everyone logged in FVTT will see the card immediately when drawn.
4. `face` determines how the card is initially displayed. This var can be ommitted, or set to "UP", "DOWN", or "REVEAL" to flip the card face-up with animation.

```
// Draws, views, and discards a card from a given deck name. Leave discardPile null to smart-match an existing discard pile name or auto-create a new one named "[your deck name] - Discard Pile".

let deckName = 'Deck of Many Things';
let discardPile = 'My Discard Pile';
let share = true;
let face = "reveal"; //either "up", "down", or "reveal" to flip up

OrcnogFancyCardDealer({
   deckName: deckName,
   discardPileName: discardPile
}).draw({share, face});
```

## Draw Multiple Cards
1. Replace `'Deck of Many Things'` with name of a deck in your world.
2. Replace `'My Discard Pile'` with the name of a pile in your world.
3. Set `quantity` to the number of cards you want to draw.
4. If you set `share` to true, everyone logged in FVTT will see the card immediately when drawn.
5. `face` determines how the card is initially displayed. This var can be ommitted, or set to "UP", "DOWN", or "REVEAL" to flip the card face-up with animation.

```
// Draws, views, and discards multiple card from a given deck name. Leave discardPile null to smart-match an existing discard pile name or auto-create a new one named "[your deck name] - Discard Pile".

let deckName = 'Deck of Many Things';
let discardPile = 'My Discard Pile';
let quantity = 5;
let share = true;

OrcnogFancyCardDealer({
   deckName: deckName ,
   discardPileName: discardPile
}).draw({quantity, share});
```

## View a Card
1. Replace `'Deck of Many Things'` with name of a deck in your world.
2. Replace `'Gem'` with the name of a card in the deck or the UID.
3. set faceDown to true and the card will shown flipped.
4. If you set share to true, everyone logged in FVTT will see the card.

```
// Peeks at a card, but does not draw and discard it.

let deckName = 'Deck of Many Things';
let card = 'Gem'; // card name or ID
let faceDown = true;
let whisper = false;
let share = false;

OrcnogFancyCardDealer({
   deckName: deckName,
}).view(card, faceDown, whisper, share);
```

## View Any Image as a Card

1. Replace `'modules/orcnog-card-viewer/assets/beefy-abraham-lincoln.webp'` with a path or URL to any image you want.
2. You can replace `'modules/orcnog-card-viewer/assets/orcnogback.webp'` with a path or URL to any card back image.
3. `borderColor` can change the border color.
5. `borderWidth` can change the colored border thickness.
4. `glowColor` can change the card glow color.
6. `shareToAll` will show to everyone.

```
// Requires Orcnog's Card Viewer
// This macro demonstrates the easiest way to view any image (URL or local path) as a flippable card. The card back image is automatically provided.

let img = 'modules/orcnog-card-viewer/assets/beefy-abraham-lincoln.webp';
let backImg = 'https://i.imgur.com/mStOCso.png'; // optional
let borderColor = '#543'; // optional
let borderWidth = '5px'; // optional
let glowColor = 'rgba(200,200,255,0.4)'; // optional
let shareToAll = true; // optional

OrcnogFancyDisplay({
   front: img,
   back: backImg,
   border: borderColor,
   borderWidth: borderWidth
   glowColor: glowColor,
}).render(shareToAll)
```

# API Methods

This module ships with several API methods that can be leveraged in code, and a couple of added global convenience functions.


* ## api.FancyDisplay( options )

    Expose the FancyDisplay constructor globally for modules and macros and such.

    ### Options:
    * `front` - a string path to an image. Try to keep this image card-shaped.
    * `back` (optional) - a string path to a card back image. If not provided, it will use `modules/orcnog-card-viewer/assets/orcnogback.webp`
    * `border` (optional) - a string (hex value) representing a custom border color. Ex: "#000"
    * `borderWidth` (optional) - a string (px value) representing a custom border width. Ex: "5px"
    * `faceDown` (optional) - boolean, whether the card will display face-down (default is true)

    ### Returns:
    * a newly created FancyDisplay instance

    ### Example:
    ```
    const myFancyViewer = await game.modules.get('orcnog-card-viewer').api.FancyDisplay({
        front: 'https://i.imgur.com/someAmazingCardFrontImage.jpg`,
        back: 'https://i.imgur.com/someAmazingCardBackImage.jpg`,
        border: '#990000',
        borderWidth: '6px',
        faceDown: false
    });

    // and later on...

    let doShare = true;
    myFancyViewer.render(doShare);
    ```

* ## api.CardDealer( options )

    Expose the CardDealer constructor as a global function for modules and macros and such.
    ### Options:
    * `deckName` {String} - a string name of the deck to set up this CardDealer for
    * `discardPileName` {String} (optional) - a string name of a discard pile. If not provided, this module will attempt to smart-match a likely discard pile, or create a new one when needed.

    ### Returns:
    * a newly created CardDealer instance

    ### Example:
    ```
    const myFancyDealer = await game.modules.get('orcnog-card-viewer').api.CardDealer({
        deckName: 'My Deck',
        discardPileName: 'My Discard Pile'
    });

    // and later on...

    let share = true;
    myFancyDealer.draw({share});
    ```

* ## .draw( options )
    
    Draws a Card from a given deck. This is a convenience method that simply constructs the same object as `api.CardDealer( options )`, and then automatically calls the `.draw( options )` method on that instance.

    Option Args:
    * `deckName` {String} - see: api.CardDealer > deckName
    * `discardPileName` {String} (optional) - see api.CardDealer > discardPileName
    * `quantity` {number} (optional) - the number of cards you want to draw (default is 1)
    * `share` {Boolean} (optional) - whether the drawn card will be shared to all players (default is true)
    * `face` {string} (optional) - Force the card to display as "UP", "DOWN", or "REVEAL" (for a dramatic reveal)

    Example:

    ```
    game.modules.get('orcnog-card-viewer').api.draw({
        deckName: someDeckName,
        discardPileName: someDiscardPileName,
        quantity: 3,
        share: true,
        face: 'down'
    });
    ```

* ## .view( args )
    
    Peeks at Card from a given deck (but doesn't draw it). This is a convenience method that simply constructs the same object as `api.CardDealer( options )`, and then automatically calls the `.view( args )` method on that instance.

    Args:
    * `deckName` {String} - see: api.CardDealer > deckName
    * `card` {String} - the name or ID of the card to view
    * `faceDown` {Boolean} - whether the card should display face-down (true) or face-up (false)
    * `whisper` {Boolean} - whether the card description text should be whispered to the DM
    * `share` {Boolean} (optional) - whether the card will be shared to all players on draw(default is true)

    Example:

    ```
    game.modules.get('orcnog-card-viewer').api.view(deckName, cardNameOrID, true, true, true);
    ```

* ## .viewImage( args )

    $${\color{red}Warning: Experimental!}$$
    This functionality is experimental at best.  It "works", but I'm having trouble with image sizing, webp/png transparency, and most non-card images tend to look bad with the glint/glare effect.

    View any image with the FancyViewer. No border. Can't flip.
    
    This is a (very experimental!) convenience method that simply constructs the same object as would `api.FancyDisplay( options )`, and then automatically calls the `.render( share )` method on it.

    Args:
    * `image` {String} - string path to an image. can be local, or a URL.
    * `share` {Boolean} (optional) - whether the image will be immediately shared to all players (default is true)

    Example:

    ```
    game.modules.get('orcnog-card-viewer').api.viewImage(imgPath, true);
    ```


# Global functions

These functions shuold be accessible at the global level. Use them in macros or in other module code as needed.  With the API methods exposed, I probably should just get rid of these... but they do clean up the macros' code.

* ## OrcnogFancyDisplay( options )

    An alias for the `api.FancyDisplay` method.  See: api.FancyDisplay above.

    Example:
    ```
    const myFancyViewer = await OrcnogFancyDisplay({
    front: myFrontImg,
    back: myBackImg,
    border: myCstomBorderColor,
    faceDown: false
    });

    // and later on...

    myFancyViewer.render(true);
    ```

* ## OrcnogFancyCardDealer( options )

    An alias for the `api.CardDealer` method.  See: api.CardDealer above.

    Example:
    ```
    const myFancyDealer = await OrcnogFancyCardDealer({
        deckName: myDeckName,
        discardPileName: myDiscardPileName
    });

    // and later on...

    myFancyDealer.draw({share: true});
    ```
* ## OrcnogFancyImage( options )

    An alias for the `api.viewImage` method.  See: api.viewImage above. Warning: this is only experimental functionality!

# Changelog

## v0.0.0
testing this github release functionality.

## v0.1.0
Orcnog Card Viewer's world debut! (or so i thought!)

## v0.1.1
Release 0.1.1 - ready for package submission! (or so i thought!)

## v0.1.2
Release 0.1.2 - some quick changes for package approval. removed possibly-copyrighted sabaac image. ACTUAL WORLD DEBUT HERE.  Hello world!

## v0.1.3
First round of bugfixes and me-aculpas. Added decent README (including this changelog section), and a demo video. Nerfed the compatibility to just v11, as user feedback indicates it's not compatible with v10 =/

## v0.1.4
Fixed Issue #10, 'Deck of Many Things' hardcoded. Also added a new GIF demo video.

## v0.1.5
Fixed a bug pointed out by @kristianserrano in this PR: https://github.com/orcnog/orcnog-card-viewer/pull/14/files

## v0.1.6
This release is for testing only!  It's a carbon copy of the v0.1.5 release, but the compatibility is lowered to include v10.

## v0.1.7
Added game settings for default border color & width and cardback image. Made borderWidth configurable in macros and api calls. Fixed Issue #18.

## v0.1.8
Completes localization or all client-facing or language-functional strings. Attempts to fix `.deal()` erroring out.

## v0.2.0
Handle for Pass and Draw (to a hand) actions, with new settings to handle whether those trigger card views. Module now depends on socketlib. Moevs several values to a new CONSTS file. Fixed an annoyance where it searched for a discard pile every time, even if just viewing a card.

## v0.3.0
Multiple cards are now grouped into a single display. "Dramatic reveal" (I know, corny name), is now implemented to show cards face-down at first, but then auto-flip them over after a small (dramatic?) delay.  Several new settings added to add fine control over display behaviors based on specific card actions, e.g. on the Deal action, always show cards face-up, but on Draw action, show them face-down, while on Pass actions, show them with a dramatic reveal (flip from face-down to -up automagically).  Settings menu has also been enhanced with collapsible groups of settings.  The grouping of multiple cards into a single viewer was enough to merit a new minor version on its own, but with all the enhancements to settings, dramatic reveal, and a few other things crossed off the TODO list, I'm happy with calling this a new minor version.  After a few weeks/months of beta testing, I may as well call this version 1.0, but cart/horse.

## v0.3.1
Quick bug fix: .viewImage and .viewImageAsCard api methods and global OrcnogFancyDisplay() and OrcnogFancyImage() functions broke in v0.3.0 after the image input for the fancyDisplay class was converted from singular fonr/back img params to an Array (to support multiple cards in one view).  This fix ought to solve that before ppl start logging bugs.

## v0.3.2
Updated to Foundry v12 (verified in module.json). Also updated the TODOs a bit.

## v0.3.3
Adds the ability to enable Share To All features for players (not just for GM)

## v0.3.4
Updates macros for v12. Updates hooks.mjs to be more DRY, updates Deal to Draw action in cardDealer.mjs, and also handles for the common error thrown by FVTT when you append something to an action string (ex: instead of 'draw', you pass 'draw ocv_nohook' as the action string, which fvtt doesn't like).

## v0.3.5
Added a setting to control the card glow color. You can set the value to "transparent" if desired.

## v0.3.6
Fixes a bug in the macro: Draw and Show Card in Regular Popout