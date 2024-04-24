import { MODULE_ID, MODULE_L18N_PREFIX } from "./consts.mjs";
import { LogUtility } from "./log.mjs";
import { CardViewerSocket } from './hooks.mjs';

class FancyDisplay {
    constructor({imgArray, borderColor, borderWidth, faceDown}) {
        this.imgArray = imgArray;  // This now holds an array of objects with imgFrontPath and imgBackPath
        this.borderColor = borderColor;
        this.borderWidth = borderWidth;
        this.faceDown = faceDown;
    }

    async render(shareToAll, dramaticReveal) {
        try {
            // Specify the image URL or file path
            const FancyDisplay = this;
            // Default paths for back images if not provided
            this.imgArray.forEach(image => {
                if (!image.back) {
                    image.back = game.settings.get(MODULE_ID, 'defaultCardBackImage');
                }
            });
            const renderFaceDown = this.faceDown;
            const renderDramaticReveal = dramaticReveal;
            const borderWidth = FancyDisplay._getBorderWidth(this.borderWidth);
            const borderColor = FancyDisplay._getBorderColor(this.borderColor, this.borderWidth);
            const share = shareToAll;
            const dramaticRevealDelayMs = game.settings.get(MODULE_ID, 'dramaticRevealDelay');
            
            if (this.imgArray.length > 0) {
                const dialogWidth = "100vw";
                const dialogHeight = "100vh";

                // Create the custom display
                class CustomPopout extends Application {
                    constructor(images, borderColor, borderWidth) {
                        super();
                        this.images = images; // This now holds the entire array of image objects
                        this.borderWidth = borderWidth;
                        this.borderColor = borderColor;
                    }

                    static get defaultOptions() {
                        return mergeObject(super.defaultOptions, {
                            template: `modules/${MODULE_ID}/templates/card-viewer.html`,
                            popOut: false,
                            minimizable: true,
                            resizable: true,
                            width: dialogWidth,
                            height: dialogHeight
                        });
                    }

                    activateListeners(html) {
                        LogUtility.debug("A popout was rendered.");
                        this.jsEvents(html[0]);
                    }

                    async jsEvents (html) {
                        // JS manipulation - 85 percent of this code is 100 percent ripped off from https://{FIVE}e.tools/js/decks.js
                        const wrpDrawn = html.querySelector('.decks-draw__stg');
                        const wrpCards = html.querySelectorAll('.decks-draw__wrp-card');
                        const wrpCardFlips = html.querySelectorAll('.decks-draw__wrp-card-flip');
                        const shareBtn = html.querySelector(`.${MODULE_ID}-share-btn`);
                    
                        wrpCardFlips.forEach(wrpCardFlip => {
                            const btnFlip = wrpCardFlip.querySelector(`.${MODULE_ID}-flip-button`);
                            if (btnFlip) {
                                btnFlip.addEventListener("click", (evt) => {
                                    evt.stopPropagation();
                                    wrpCardFlip.classList.toggle("decks-draw__wrp-card-flip--flipped");
                                });
                            }
                        });
                    
                        wrpCards.forEach(wrpCard => {
                            wrpCard.addEventListener("click", (evt) => {
                                evt.stopPropagation();
                            });
                        });
                    
                        if (shareBtn) {
                            shareBtn.addEventListener("click", (evt) => {
                                evt.stopPropagation();
                                shareBtn.disabled = true;
                                FancyDisplay._shareToAll();
                            });
                        }
                    
                        wrpDrawn.addEventListener("click", (evt) => {
                            evt.stopPropagation();
                            // html.remove(); // Consider more specific or controlled removal if needed
                            $(`.${MODULE_ID}`).remove(); // remove ALL
                        });
                    
                        wrpDrawn.addEventListener("mousemove", (evt) => {
                            const mouseX = evt.clientX;
                            const mouseY = evt.clientY;
                    
                            requestAnimationFrame(() => {
                                wrpCards.forEach(wrpCard => {
                                    const dispGlint = wrpCard.querySelector('.decks-draw__disp-glint');
                                    _pRenderStgCard_onMouseMove_mutElements({mouseX, mouseY, wrpCard, dispGlint});
                                });
                            });
                        });

                        // Automatically flip all cards over (animated), if they are supposed to be face up.
                        if (dramaticReveal && !renderFaceDown) {
                            setTimeout(() => {
                                // After 1/2 a second, start the interval
                                let flipAllIndex = 0;
                                let flipAll = setInterval(() => {
                                    wrpCardFlips[flipAllIndex]?.classList.remove('decks-draw__wrp-card-flip--flipped');
                                    flipAllIndex++;
                                    if (flipAllIndex === wrpCardFlips.length) clearInterval(flipAll);
                                }, 80);
                            }, dramaticRevealDelayMs);
                        }

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

                            const glintEdgeSpreadTop = parseInt(borderWidth) == 0 ? 110 : 100;
                            const glintEdgeSpreadBottom = parseInt(borderWidth) == 0 ? -10 : 0;
                        
                            return {
                                ..._pRenderStgCard_getPerspectiveStyles_card({mouseX, mouseY, bcr, hView, rotX, rotY}),
                                ..._pRenderStgCard_getPerspectiveStyles_glint({mouseX, mouseY, bcr, hView, rotX, rotY, glintEdgeSpreadTop, glintEdgeSpreadBottom}),
                            };
                        }

                        function _pRenderStgCard_getPerspectiveStyles_card ({rotX, rotY}) {
                            return {
                                cardTransform: `perspective(100vh) rotateX(${rotX}rad) rotateY(${rotY}rad)`,
                            };
                        }

                        function _pRenderStgCard_getPerspectiveStyles_glint ({mouseX, mouseY, bcr, hView, rotX, rotY, glintEdgeSpreadTop, glintEdgeSpreadBottom}) {
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
                                var(--rgb-card-glint--edge) ${glintEdgeSpreadBottom}%,
                                transparent 4%,
                                transparent 96%,
                                var(--rgb-card-glint--edge) ${glintEdgeSpreadTop}%
                            )`;
                        
                            return {
                                glintBackground: `${gradSpot}, ${gradSpotInv}, ${gradEdge}`,
                            };
                        }
                    } 

                    getData() {
                        const data = super.getData();
                        data.moduleId = MODULE_ID;
                        data.isGM = game.user.isGM;
                        data.showShareBtn = !share;
                        data.images = this.images;
                        data.dramaticReveal = renderDramaticReveal;
                        data.faceDown = renderFaceDown;
                        data.hasBorder = parseInt(this.borderWidth) !== 0;
                        data.borderColor = this.borderColor;
                        data.borderWidth = this.borderWidth;
                        data.glintColor = FancyDisplay._adjustToGlintColor(this.borderColor, );
                        return data;
                    }
                }

                const customPopout = new CustomPopout(this.imgArray, borderColor, borderWidth);
                customPopout.render(true);

                // Check if the user is the GM
                if (share && game.user.isGM) {
                    FancyDisplay._shareToAll(this.imgArray);
                }

            } else {
                LogUtility.warn(game.i18n.localize(MODULE_L18N_PREFIX + ".notification.imagePathNotProvded")); // "Image URL or file path not provided.");
            }
        } catch (error) {
            LogUtility.error("Error rendering FancyPopout:", error);
        }
    }

    _shareToAll () {
        // Emit a socket message to all players
        LogUtility.debug(`Firing 'ShareToAll' hook.`)
        CardViewerSocket.executeForOthers('ShareToAll', {
            imgArray: this.imgArray,
            borderColor: this.borderColor,
            borderWidth: this.borderWidth,
            faceDown: this.faceDown,
            shareToAll: true
        });
        LogUtility.log('You shared your card with everyone.')
    }

    _adjustToGlintColor (color) {
        if (!color || color == 'transparent') return null;
        const Y = 58; // yellow
        const [H, S, L] = this._convertHexToHSL(color);
        // const newH = (H + Y) / 2;
        const newH = (H > (Y+10) ? H-10 : H < (Y-10) ? H+10 : Y); // bring H up to 10 clicks closer to the number 58
        const newS = Math.pow(S, 1.08); // up the saturation exponentially ^1.08
        const newL = (L*10 + 100) / 11; // up the lightness by 9-ish percent
        const alpha = '100';
        return `hsl(${Math.round(newH)} ${Math.round(newS)}% ${Math.round(newL)}% / ${alpha})`;
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

    _getBorderWidth (input) {
        let bwidth;
        if (input == '0' || input == 'none') {
            // any zero value should be explicitly "0px" for CSS calc() purposes
            bwidth = '0px';
        } else if (input == null) {
            // no value provided? get the default from game settings. fallback to 8px
            bwidth = game.settings.get(MODULE_ID, 'defaultCardBorderWidth') || '8px';
        } else if (!isNaN(Number(input))) {
            // assume unitless number is a pixel value
            bwidth = input + 'px';
        } else {
            // assume a complex NaN string is some valid css value (e.g. '1rem', '15px', '2%', etc). If not, it's their own fault >=|
            bwidth = input;
        }
        return bwidth;
    }

    _getBorderColor (input, borderWidth) {
        let bcolor;
        if (input) {
            bcolor = input;
        } else if (parseInt(borderWidth) == 0) {
            // If no border setting this will at least give us some color to the glint edge effect.
            bcolor = '#fff296'; // #fff296 is the approx color of the sparkle floaties in the background.
        } else {
            // no value provided? get the default from game settings. fallback to #d29a38
            bcolor = game.settings.get(MODULE_ID, 'defaultCardBorderColor') || '#d29a38';
        }
        return bcolor;
    }

}

export default FancyDisplay;
