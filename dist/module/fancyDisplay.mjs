import PsuedoCard from './PseudoCard.mjs';

class FancyDisplay {
    constructor(card, border, front, back) {
        this.card = card;
        this.border = border;
        this.front = front;
        this.back = back;
    }

    async render(shareToAll) {
        try {
            // Specify the image URL or file path
            let imgFrontPath = this.card?.showFace ? this.card?.faces[this.card?.face]?.img : this.card?.faces[0]?.img;
            let imgBackPath = this.card?.back?.img;
            if (!imgFrontPath) {
                this.card = new PsuedoCard(this.front, this.back);
                imgFrontPath = this.card.faces[0]?.img;
                imgBackPath = this.card.back?.img
            }
            const FancyDisplay = this;

            if (imgFrontPath) {
                // Calculate the canvas viewable area
                const sidebarWidth = ui.sidebar.position.width;
                const controlsWidth = ui.controls.position.width;
                const dialogWidth = "100vw"; //window.innerWidth - (controlsWidth + sidebarWidth);
                const dialogHeight = "100vh";

                // Create the custom display
                class CustomPopout extends Application {
                    constructor(card, border, front, back) {
                        super();
                        this.card = card;
                        this.border = border;
                        this.front = front;
                        this.back = back;
                    }

                    static get defaultOptions() {
                        return mergeObject(super.defaultOptions, {
                            template: "modules/orcnog-card-viewer/templates/orcnog-card-viewer.html",
                            popOut: false,
                            minimizable: true,
                            resizable: true,
                            width: dialogWidth,
                            height: dialogHeight
                        });
                    }

                    activateListeners (html) {
                        console.log("orcnog-card-viewer popout has rendered")
                        this.jsEvents(html[0]);
                    }

                    async jsEvents (html) {
                        // JS manipulation - 95 percent of this code is 100 percent ripped off from https://{FIVE}e.tools/js/decks.js
                        const wrpDrawn = html.querySelector('.decks-draw__stg');
                        const dispGlint = html.querySelector('.decks-draw__disp-glint');
                        const wrpCard = html.querySelector('.decks-draw__wrp-card');
                        const wrpCardFlip = html.querySelector('.decks-draw__wrp-card-flip');
                        const shareBtn = html.querySelector('.orcnog-card-viewer-share-btn');

                        if (imgBackPath) {
                            const btnFlip = html.querySelector('.orcnog-card-viewer-flip-button');
                            btnFlip.addEventListener("click", async (evt) => {
                                evt.stopPropagation();
                                const card = await fromUuid(evt.currentTarget.dataset.cardUuid);
                                if (card) await card.flip();
                                wrpCardFlip.classList.toggle("decks-draw__wrp-card-flip--flipped");
                            });
                        }

                        wrpCard.addEventListener("click", (evt) => {
                            evt.stopPropagation();
                        });

                        shareBtn?.addEventListener("click", async (evt) => {
                            evt.stopPropagation();
                            const cardsCurrentlyDisplayed = document.querySelectorAll('.decks-draw__wrp-card');
                            for (const cardDisplayed of cardsCurrentlyDisplayed) {
                                if (cardDisplayed.dataset.cardUuid !== '') {
                                    FancyDisplay._shareToAll(cardDisplayed.dataset.cardUuid);
                                } else {

                                }
                            }
                            shareBtn.disabled = true;
                        });

                        wrpDrawn.addEventListener("click", (evt) => {
                            evt.stopPropagation();
                            // html.remove(); // remove this
                            $('.orcnog-card-viewer').remove(); // remove ALL
                        });

                        wrpDrawn.addEventListener("mousemove", (evt) => {
                            const mouseX = evt.clientX;
                            const mouseY = evt.clientY;

                            requestAnimationFrame(() => {
                                _pRenderStgCard_onMouseMove_mutElements({ mouseX, mouseY, wrpCard, dispGlint });
                            });
                        });

                        function _pRenderStgCard_onMouseMove_mutElements ({mouseX, mouseY, wrpCard, dispGlint}) {
                            const perStyles = _pRenderStgCard_getPerspectiveStyles({mouseX, mouseY, ele: wrpCard});
                            wrpCard.style.transform = perStyles.cardTransform;
                            dispGlint.style.background = perStyles.glintBackground;
                        }

                        function _pRenderStgCard_getPerspectiveStyles ({mouseX, mouseY, ele}) {
                            const bcr = ele.getBoundingClientRect();
                            const hView = window.innerHeight;

                            const cCenterX = bcr.left + bcr.width / 2;
                            const cCenterY = bcr.top + bcr.height / 2;

                            const cMouseX = mouseX - cCenterX;
                            const cMouseY = (hView - mouseY) - (hView - cCenterY);

                            const scaleFactor = hView * 2;

                            const rotX = cMouseY / scaleFactor;
                            const rotY = cMouseX / scaleFactor;

                            return {
                                ..._pRenderStgCard_getPerspectiveStyles_card({mouseX, mouseY, bcr, hView, rotX, rotY}),
                                ..._pRenderStgCard_getPerspectiveStyles_glint({mouseX, mouseY, bcr, hView, rotX, rotY}),
                            };
                        }

                        function _pRenderStgCard_getPerspectiveStyles_card ({rotX, rotY}) {
                            return {
                                cardTransform: `perspective(100vh) rotateX(${rotX}rad) rotateY(${rotY}rad)`,
                            };
                        }

                        function _pRenderStgCard_getPerspectiveStyles_glint ({mouseX, mouseY, bcr, hView, rotX, rotY}) {
                            const cCenterX = bcr.left + bcr.width / 2;
                            const cCenterY = bcr.top + bcr.height / 2;

                            const cMouseX = mouseX - cCenterX;
                            const cMouseY = (hView - mouseY) - (hView - cCenterY);

                            const glintDist = Math.sqrt(Math.pow(cMouseX, 2) + Math.pow(cMouseY, 2));
                            const glintDistRatio = glintDist / hView;

                            const pctLeft = ((mouseX - bcr.left) / bcr.width) * 100;
                            const pctTop = ((mouseY - bcr.top) / bcr.height) * 100;

                            const pctLeftClamped = Math.max(0, Math.min(100, pctLeft));
                            const pctTopClamped = Math.max(0, Math.min(100, pctTop));

                            const glintOpacityFalloff = glintDistRatio * 0.33;

                            const gradSpot = `radial-gradient(
                                circle at left ${pctLeftClamped}% top ${pctTopClamped}%,
                                rgba(255, 255, 255, 0.73) 0%,
                                rgba(255, 255, 255, ${1.0 - glintOpacityFalloff}) 1%,
                                rgba(255, 255, 255, ${1.0 - glintOpacityFalloff}) ${1 + (glintDistRatio * 2)}%,
                                rgba(255, 255, 255, 0.53) ${2 + (glintDistRatio * 2)}%,
                                transparent ${5 + (glintDistRatio * 13)}%
                            )`;

                            const gradSpotInv = `radial-gradient(
                                circle at left ${100 - pctLeftClamped}% top ${100 - pctTopClamped}%,
                                #fff2 0%,
                                #fff2 ${10 + (glintDistRatio * 2)}%,
                                transparent ${20 + (glintDistRatio * 5)}%
                            )`;

                            const gradEdge = `linear-gradient(
                                ${-rotX + rotY}rad,
                                var(--rgb-card-glint--edge) 0%,
                                transparent 4%,
                                transparent 96%,
                                var(--rgb-card-glint--edge) 100%
                            )`;

                            return {
                                glintBackground: `${gradSpot}, ${gradSpotInv}, ${gradEdge}`,
                            };
                        }
                    }

                    getData() {
                        const data = super.getData();
                        data.isGM = game.user.isGM;
                        if (this.card) {
                            data.card = this.card;
                        } else {
                            data.card = new PsuedoCard(front, back);
                        }
                        data.showShareBtn = !shareToAll;
                        data.borderColor = this.border;
                        data.glintColor = FancyDisplay._adjustToGlintColor(this.border);
                        return data;
                    }
                }

                const customPopout = new CustomPopout(this.card, this.border);
                customPopout.render(true);

                // Check if the user is the GM
                if (shareToAll && this.card?.faces?.length > 0 && game.user.isGM) {
                    this._shareToAll();
                }

            } else {
                ui.notifications.warn("Image URL or file path not provided.");
            }
        } catch (error) {
            console.error("Error rendering FancyPopout:", error);
        }
    }

    _shareToAll(cardUuid = this.card?.uuid) {
        // Emit a socket message to all players
        game.socket.emit('module.orcnog-card-viewer', {
            type: 'VIEWCARD',
            payload: {
                cardUuid: this.card?.uuid,
                border: this.border,
                front: this.front,
                back: this.back
            }
        });
    }

    _adjustToGlintColor (color) {
        if (!color) return null;
        const Y = 58; // yellow
        const [H, S, L] = this._convertHexToHSL(color);
        // const newH = (H + Y) / 2;
        const newH = (H > (Y+10) ? H-10 : H < (Y-10) ? H+10 : Y); // bring H up to 10 clicks closer to the number 58
        const newS = Math.pow(S, 1.08); // up the saturation exponentially ^1.08
        const newL = (L*10 + 100) / 11; // up the lightness by 9-ish percent
        return `hsl(${Math.round(newH)}, ${Math.round(newS)}%, ${Math.round(newL)}%)`;
    }

    _convertHexToHSL (color) {
        let r, g, b;

        if (color.startsWith("#")) {
          // Hexadecimal color
          let hex = color.slice(1);
          if (hex.length === 3) hex = [hex[0], hex[0], hex[1], hex[1], hex[2], hex[2]].join('');
          r = parseInt(hex.substr(0, 2), 16) / 255;
          g = parseInt(hex.substr(2, 2), 16) / 255;
          b = parseInt(hex.substr(4, 2), 16) / 255;
        } else if (color.startsWith("rgb")) {
          // RGB or RGBA color
          const rgb = color.match(/(\d+)/g);
          r = parseInt(rgb[0]) / 255;
          g = parseInt(rgb[1]) / 255;
          b = parseInt(rgb[2]) / 255;
        } else {
          throw new Error("Invalid color format");
        }

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
          h = 6.2069;
          s = 0; // achromatic
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }

        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

}

export default FancyDisplay;

Handlebars.registerHelper("getFaceImg", function (card) {
    return card.face ? card.faces[card.face].img : card.faces[0].img;
});