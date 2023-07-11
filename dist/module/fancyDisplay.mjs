class FancyDisplay {
    constructor({imgFrontPath, imgBackPath, borderColor, borderWidth, faceDown}) {
        this.imgFrontPath = imgFrontPath;
        this.imgBackPath = imgBackPath;
        this.borderColor = borderColor;
        this.borderWidth = borderWidth;
        this.faceDown = faceDown;
    }

    async render(shareToAll) {
        try {
            // Specify the image URL or file path
            const FancyDisplay = this;
            if (!this.imgBackPath) this.imgBackPath = game.settings.get('orcnog-card-viewer', 'defaultCardBackImage');
            const imgFrontPath = this.faceDown ? this.imgBackPath : this.imgFrontPath;
            const imgBackPath = this.faceDown ? this.imgFrontPath : this.imgBackPath;
            const borderWidth = FancyDisplay._getBorderWidth(this.borderWidth);
            const borderColor = FancyDisplay._getBorderColor(this.borderColor, this.borderWidth);
            const share = shareToAll;

            if (imgFrontPath) {
                const dialogWidth = "100vw";
                const dialogHeight = "100vh";

                // Create the custom display
                class CustomPopout extends Application {
                    constructor(front, back, borderColor, borderWidth) {
                        super();
                        this.imgFrontPath = front;
                        this.imgBackPath = back;
                        this.borderWidth = borderWidth;
                        this.borderColor = borderColor;
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
                        // JS manipulation - 85 percent of this code is 100 percent ripped off from https://{FIVE}e.tools/js/decks.js
                        const wrpDrawn = html.querySelector('.decks-draw__stg');
                        const dispGlint = html.querySelector('.decks-draw__disp-glint');
                        const wrpCard = html.querySelector('.decks-draw__wrp-card');
                        const wrpCardFlip = html.querySelector('.decks-draw__wrp-card-flip');
                        const shareBtn = html.querySelector('.orcnog-card-viewer-share-btn');

                        if (imgBackPath) {
                            const btnFlip = html.querySelector('.orcnog-card-viewer-flip-button');
                            btnFlip.addEventListener("click", (evt) => {
                                evt.stopPropagation();
                                wrpCardFlip.classList.toggle("decks-draw__wrp-card-flip--flipped");
                            });
                        }

                        wrpCard.addEventListener("click", (evt) => {
                            evt.stopPropagation();
                        });

                        shareBtn?.addEventListener("click", (evt) => {
                            evt.stopPropagation();
                            shareBtn.disabled = true;
                            FancyDisplay._shareToAll();
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
                        data.isGM = game.user.isGM;
                        data.showShareBtn = !share;
                        data.imgFront = this.imgFrontPath;
                        data.imgBack = this.imgBackPath;
                        data.hasBorder = parseInt(this.borderWidth) !== 0;
                        data.borderColor = this.borderColor;
                        data.borderWidth = this.borderWidth;
                        data.glintColor = FancyDisplay._adjustToGlintColor(this.borderColor, );
                        return data;
                    }
                }

                const customPopout = new CustomPopout(imgFrontPath, imgBackPath, borderColor, borderWidth);
                customPopout.render(true);

                // Check if the user is the GM
                if (share && game.user.isGM) {
                    this._shareToAll();
                }

            } else {
                ui.notifications.warn(game.i18n.localize("ORCNOG_CARD_VIEWER.notification.imagePathNotProvded")); // "Image URL or file path not provided.");
            }
        } catch (error) {
            console.error("Error rendering FancyPopout:", error);
        }
    }

    _shareToAll () {
        // Emit a socket message to all players
        game.socket.emit('module.orcnog-card-viewer', {
            type: 'VIEWCARD',
            payload: {
                imgFrontPath: this.imgFrontPath,
                imgBackPath: this.imgBackPath,
                borderColor: this.borderColor,
                borderWidth: this.borderWidth,
                faceDown: this.faceDown,
                shareToAll: true
            }
        });
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
            bwidth = game.settings.get('orcnog-card-viewer', 'defaultCardBorderWidth') || '8px';
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
            bcolor = game.settings.get('orcnog-card-viewer', 'defaultCardBorderColor') || '#d29a38';
        }
        return bcolor;
    }

}

export default FancyDisplay;
