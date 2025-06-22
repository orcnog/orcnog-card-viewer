/***
 * name: Draw and Show Card in Regular Popout
 * type: script
 * author: orcnog
 * img: modules/orcnog-card-viewer/assets/card-draw.svg
 * scope: global
 */

// Does not actually require Orcnog's Card Viewer!
// A helper macro to automate drawing a random card and viewing it in a native Image Popout.
// Updated for v12.

let dealFrom_stackName = "Deck of Many Things"
let dealTo_stackName = "My Discard Pile"
let drawMethod = "RANDOM" // either "RANDOM" or "TOP"
let showToAll = true

// Get reference to src/dst cards objects
const src_cards = game.cards.getName(dealFrom_stackName)
const dst_cards = game.cards.getName(dealTo_stackName) || await Cards.create({ name: dealFrom_stackName + " - Discard Pile", type: "pile" })
console.log('dst_cards', dst_cards)

// Deal 1 card and grab reference to the dealt card
let isLikelySuccess = true
let drawnCardsArr; // Variable to store the drawn card if module is not active

try {
  drawnCardsArr = await dst_cards.draw(src_cards, 1, {
    how: CONST.CARD_DRAW_MODES[drawMethod],
    action: getActionString()
  })
} catch (e) {
  console.error('error drawing card:', e)
  // Foundry doesn't like "draw ocv_nohook". Anything more than "draw" makes the Promise throw an error... yet it still draws the card before throwing the error... so, for our purposes, it worked!
  // If it throws this known error, assume it actually succeeded.  Otherwise notify user of the error.
  if (e && e.message
        && !e.message.toLowerCase().includes('replace') // Chrom/Safari/Electron error msg
        && !e.message.toLowerCase().includes('str is undefined') // Firefox error msg
    ){
    ui.notifications.warn(e.message)
    isLikelySuccess = false
  }
}
if (isLikelySuccess) {
  let most_recent_drawn;
  if (isModuleActive()) {
    most_recent_drawn = dst_cards.cards.contents[dst_cards.cards.size - 1]
  } else {
    most_recent_drawn = drawnCardsArr?.[0]; // Use the drawnCard variable if module is not active
  }
  console.log('Drawn Card:', most_recent_drawn)
  const cardId = most_recent_drawn?._id
  const name = most_recent_drawn?.faces?.[0]?.name
  const front = most_recent_drawn?.faces?.[0]?.img
  const back = most_recent_drawn?.back?.img
  const desc = most_recent_drawn?.faces?.[0]?.text

  // Show it as an Image Popout...
  const ip = new ImagePopout(front, {})
  if (ip.render(true)) {
    if (showToAll) {
      // Share the image with other connected players
      ip.shareImage()
    }
  }

  // Whisper the card instructions to the DM
  const dm = game.users.find(u => u.isGM && u.active)
  if (dm) {
    const messageContent = `<p>Card(s) drawn:</p>
      <div class="card-draw orcnog-card-viewer-msg flexrow" data-deck="${dealFrom_stackName}" data-card="${cardId}" data-back="${back}">
        <img class="card-face" src="${front}" alt="${name}"/>
        <h4 class="card-name">${name}</h4>
      </div>
      <p>${desc}</p>`
    ChatMessage.create({ content: messageContent, whisper: [dm._id] })
  } else {
    ui.notifications.warn("DM user not found.")
  }
}

function isModuleActive() {
  return game.modules.get("orcnog-card-viewer")?.active
}

function getActionString() {
  return isModuleActive() ? 'draw ocv_nohook' : 'draw'
}