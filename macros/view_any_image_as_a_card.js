/***
 * name: View Any Image as a Card
 * type: script
 * author: orcnog
 * img: modules/orcnog-card-viewer/assets/image-view-fancy.svg
 * scope: global
 */

// Requires Orcnog's Card Viewer
// This macro demonstrates the easiest way to view any image (URL or local path) as a flippable card. The card back image is automatically provided.

let img = 'modules/orcnog-card-viewer/assets/beefy-abraham-lincoln.webp';
let backImg = 'https://i.imgur.com/mStOCso.png'; // optional
let borderColor = '#543'; // optional
let borderWidth = '5px'; // optional
let shareToAll = true; // optional

if (!game.modules.get("orcnog-card-viewer")?.active) {
    ui.notifications.warn('Card Viewer module not found.');
    return;
}

OrcnogFancyDisplay({
   front: img,
   back: backImg,
   border: borderColor,
   borderWidth: borderWidth
}).render(shareToAll)