import { MODULE_ID, MODULE_L18N_PREFIX } from "./consts.mjs";
import { LogUtility } from "./log.mjs";
import { CardViewerSocket } from './hooks.mjs';

class FancyDisplay {
    constructor({imgArray, borderColor, borderWidth, glowColor, faceDown}) {
        this.imgArray = imgArray;
        this.borderColor = borderColor;
        this.borderWidth = borderWidth;
        this.glowColor = glowColor;
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
            const glowColor = FancyDisplay._getGlowColor(this.glowColor);
            const share = shareToAll;
            const playersCanShareToAll = game.settings.get(MODULE_ID, 'playersCanShareToAll');
            const dramaticRevealDelayMs = game.settings.get(MODULE_ID, 'dramaticRevealDelay');
            
            if (this.imgArray.length > 0) {
                const dialogWidth = "100vw";
                const dialogHeight = "100vh";

                // Create the custom display
                class CustomPopout extends Application {
                    constructor(images, borderColor, borderWidth, glowColor) {
                        super();
                        this.images = images; // This now holds the entire array of image objects
                        this.borderWidth = borderWidth;
                        this.borderColor = borderColor;
                        this.glowColor = glowColor;
                    }

                    static get defaultOptions() {
                        return foundry.utils.mergeObject(super.defaultOptions, {
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
                        const wrpCardArcs = html.querySelectorAll('.decks-draw__wrp-card-arc');
                        const wrpCardPerspectives = html.querySelectorAll('.decks-draw__wrp-card-perspective');
                        const wrpCardFlips = html.querySelectorAll('.decks-draw__wrp-card-flip');
                        const shareBtn = html.querySelector(`.${MODULE_ID}-share-btn`);
                        const numOfCards = wrpCards.length;
                    
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

                        _arcThis(wrpCardArcs, {
                            dir: 1, // 1 = frown, -1 = smile
                            rotate: true
                        });
                    
                        wrpDrawn.addEventListener("mousemove", (evt) => {
                            const mouseX = evt.clientX;
                            const mouseY = evt.clientY;
                    
                            requestAnimationFrame(() => {
                                wrpCardPerspectives.forEach((wrpCardPersp, index) => {
                                    const wrpCard = wrpCardPersp;
                                    const dispGlint = wrpCardPersp.querySelector('.decks-draw__disp-glint');
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

                        function _arcThis(things, options = {}) {
                            const dir = options.dir ?? 1; // 1 = frown, -1 = smile
                            const rotate = options.rotate ?? true;
                            let radius = options.radius ?? 200;
                            
                            // Step 1: measure total width, and record each item center
                            let totalWidth = 0;
                            const centers = [];

                            things.forEach(thing => {
                                const widthPx = thing.offsetWidth;
                                const widthVh = (widthPx / window.innerHeight) * 100;
                                const center = totalWidth + widthVh / 2;
                                centers.push(center);
                                totalWidth += widthVh;
                            });
                            
                            // Step 2: adjust radius if needed
                            if (radius < totalWidth / 2) radius = totalWidth / 2;
                            
                            // Step 3: compute arc length and angle
                            const baseArc = totalWidth;
                            const angle = 2 * Math.asin(baseArc / (2 * radius));
                            const fullArcLength = radius * angle;
                            
                            // Step 4: position each letter
                            let iteratorX = 0;
                            things.forEach((thing, i) => {
                                const widthPx = thing.offsetWidth;
                                const widthVh = (widthPx / window.innerHeight) * 100;
                            
                                const arcLetter = (widthVh / totalWidth) * fullArcLength;
                                const beta = arcLetter / radius;
                                const h = radius * Math.cos(beta / 2);
                            
                                const alpha = Math.acos((totalWidth / 2 - iteratorX) / radius);
                                const theta = alpha + beta / 2;
                            
                                const x = Math.cos(theta) * h;
                                const y = Math.sin(theta) * h;
                                const xpos = iteratorX + Math.abs(totalWidth / 2 - x - iteratorX);
                            
                                const xval = xpos - centers[i];
                                const yval = dir * (radius - y);
                                const ang = rotate ? dir * -Math.asin(x / radius) * (180 / Math.PI) : 0;
                            
                                thing.style.display = `inline-block`;
                                thing.style.position = `relative`;
                                thing.style.left = `${xval}vh`;
                                thing.style.top = `${yval}vh`;
                                thing.style.transform = `rotate(${ang}deg)`;
                                thing.style.transformOrigin = `bottom center`;
                            
                                iteratorX = 2 * xpos - iteratorX;
                            });
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
                        
                            const distance = Math.sqrt(Math.pow(cMouseX, 2) + Math.pow(cMouseY, 2));
                            const falloffFactor = 3 * Math.max(0.1, 1 - Math.pow(distance / scaleFactor, 0.5));
                        
                            const rotX = (cMouseY / scaleFactor) * falloffFactor;
                            const rotY = (cMouseX / scaleFactor) * falloffFactor;

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
                                circle at left ${pctLeft}% top ${pctTop}%,
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

                        function applySparkleStyles(element, { top, left, width, height, animationDuration, animationDelay }) {
                            element.style.top = `${top}%`;
                            element.style.left = `${left}%`;
                            element.style.width = `min(${width}%, 280px)`;
                            element.style.height = `min(${height}%, 280px)`;
                            element.style.animationDuration = `${animationDuration}ms`;
                            element.style.animationDelay = `${animationDelay}ms`;
                        }

                        function createSparkleElements(container, sparkleData) {
                            sparkleData.forEach(data => {
                                const sparkleDiv = document.createElement('div');
                                sparkleDiv.classList.add('decks-draw__wrp-sparkle-sway', 've-flex-col', 'absolute');

                                const sparkleImg = document.createElement('img');
                                sparkleImg.classList.add('decks-draw__img-sparkle', 'relative', 'decks-draw__img-sparkle--visible');
                                sparkleImg.src = `modules/${MODULE_ID}/assets/${data.image}`;
                                sparkleImg.style.animationDuration = `${data.imgAnimationDuration}ms, ${data.imgAnimationDurationLong}ms`;
                                sparkleImg.style.animationDelay = `${data.imgAnimationDelay}ms, ${data.imgAnimationDelay}ms`;

                                applySparkleStyles(sparkleDiv, data);
                                sparkleDiv.appendChild(sparkleImg);
                                container.appendChild(sparkleDiv);
                            });
                        }

                        // Example usage
                        const sparkleContainer = document.querySelector(`.${MODULE_ID}-cards-display`);
                        const sparkleData = [
                            { top: 78.5134, left: 87.2804, width: 67, height: 67, animationDuration: 12750.1, animationDelay: -3181.44, image: 'medium-1.webp', imgAnimationDuration: 6560.72, imgAnimationDurationLong: 87796.3, imgAnimationDelay: -100 },
                            { top: 29.5109, left: 45.5432, width: 67, height: 67, animationDuration: 11311.4, animationDelay: -3104.61, image: 'medium-2.webp', imgAnimationDuration: 5521.82, imgAnimationDurationLong: 81275.7, imgAnimationDelay: -200 },
                            { top: 25.9402, left: 56.6874, width: 67, height: 67, animationDuration: 12914.1, animationDelay: -3770.11, image: 'medium-1.webp', imgAnimationDuration: 4546.16, imgAnimationDurationLong: 98302.2, imgAnimationDelay: -300 },
                            { top: 10.9033, left: 97.3561, width: 67, height: 67, animationDuration: 10148.3, animationDelay: -4424.06, image: 'medium-2.webp', imgAnimationDuration: 5751.86, imgAnimationDurationLong: 65571.1, imgAnimationDelay: -400 },
                            { top: 41.881, left: 65.8967, width: 67, height: 67, animationDuration: 12322.6, animationDelay: -3002.72, image: 'medium-1.webp', imgAnimationDuration: 5003.85, imgAnimationDurationLong: 105826, imgAnimationDelay: -500 },
                            { top: 46.8005, left: 41.6034, width: 67, height: 67, animationDuration: 10815.5, animationDelay: -4480.06, image: 'medium-2.webp', imgAnimationDuration: 6731.36, imgAnimationDurationLong: 64226.1, imgAnimationDelay: -600 },
                            { top: 21.1848, left: 97.3039, width: 67, height: 67, animationDuration: 13813.4, animationDelay: -3261.31, image: 'medium-1.webp', imgAnimationDuration: 7056.58, imgAnimationDurationLong: 70953.5, imgAnimationDelay: -700 },
                            { top: 70.2644, left: -2.09925, width: 67, height: 67, animationDuration: 13649.4, animationDelay: -3397.81, image: 'medium-2.webp', imgAnimationDuration: 6529.58, imgAnimationDurationLong: 89931, imgAnimationDelay: -800 },
                        ];

                        createSparkleElements(sparkleContainer, sparkleData);
                    } 

                    getData() {
                        const data = super.getData();
                        data.moduleId = MODULE_ID;
                        data.isGM = game.user.isGM;
                        data.showShareBtn = !share && (game.user.isGM || playersCanShareToAll);
                        data.images = this.images;
                        data.dramaticReveal = renderDramaticReveal;
                        data.faceDown = renderFaceDown;
                        data.hasBorder = parseInt(this.borderWidth) !== 0;
                        data.glowColor = this.glowColor;
                        data.borderColor = this.borderColor;
                        data.borderWidth = this.borderWidth;
                        data.glintColor = FancyDisplay._adjustToGlintColor(this.borderColor, );
                        return data;
                    }
                }

                const customPopout = new CustomPopout(this.imgArray, borderColor, borderWidth, glowColor);
                customPopout.render(true);

                // Check if the user is the GM
                if (share && (game.user.isGM || playersCanShareToAll)) {
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
            glowColor: this.glowColor,
            shareToAll: true
        });
        LogUtility.log('You shared your card with everyone.')
        ui.notifications.info(game.i18n.localize(MODULE_L18N_PREFIX + ".notification.sharedWithAll")); // "Shared with all players."
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

    _getGlowColor (input) {
        let gcolor;
        if (input) {
            gcolor = input;
        } else {
            gcolor = game.settings.get(MODULE_ID, 'defaultCardGlowColor') || `rgb(210 154 56 / 30%)`;
        }
        return gcolor;
    }

}

export default FancyDisplay;
