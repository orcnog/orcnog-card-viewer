class FancyDisplay {
    constructor(imgFrontPath, imgBackPath, border, showBackFirst, share) {
        this.imgFrontPath = imgFrontPath;
        this.imgBackPath = imgBackPath;
        this.border = border;
        this.showBackFirst = showBackFirst;
        this.share = share;
    }

    async render() {
        try {
            // Specify the image URL or file path
            const imgFrontPath = this.showBackFirst ? this.imgBackPath : this.imgFrontPath;
            const imgBackPath = this.showBackFirst ? this.imgFrontPath : this.imgBackPath;
            const borderColor = this.border;
            const FancyDisplay = this;

            if (imgFrontPath) {
                // Calculate the canvas viewable area
                const sidebarWidth = ui.sidebar.position.width;
                const controlsWidth = ui.controls.position.width;
                const dialogWidth = "100vw"; //window.innerWidth - (controlsWidth + sidebarWidth);
                const dialogHeight = "100vh";

                // Create the custom display
                class CustomPopout extends Application {
                    constructor(front, back, border) {
                        super();
                        this.imgFrontPath = front;
                        this.imgBackPath = back;
                        this.border = border;
                    }

                    static get defaultOptions() {
                        return mergeObject(super.defaultOptions, {
                            template: "modules/card-viewer/templates/card-viewer.html",
                            popOut: false,
                            minimizable: true,
                            resizable: true,
                            width: dialogWidth,
                            height: dialogHeight
                        });
                    }

                    activateListeners (html) {
                        console.log("card-viewer popout has rendered")
                        this.jsEvents(html[0]);
                    }

                    async jsEvents (html) {
                        // JS manipulation - 95 percent of this code is 100 percent ripped off from https://{FIVE}e.tools/js/decks.js
                        const wrpDrawn = html.querySelector('.decks-draw__stg');
                        const dispGlint = html.querySelector('.decks-draw__disp-glint');
                        const wrpCard = html.querySelector('.decks-draw__wrp-card');
                        const wrpCardFlip = html.querySelector('.decks-draw__wrp-card-flip');

                        if (imgBackPath) {
                            const btnFlip = html.querySelector('.card-viewer-flip-button');
                            btnFlip.addEventListener("click", (evt) => {
                                evt.stopPropagation();
                                wrpCardFlip.classList.toggle("decks-draw__wrp-card-flip--flipped");
                            });
                        }

                        wrpCard.addEventListener("click", (evt) => {
                            evt.stopPropagation();
                        });

                        wrpDrawn.addEventListener("click", (evt) => {
                            evt.stopPropagation();
                            html.remove();
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
                        data.imgFront = this.imgFrontPath;
                        data.imgBack = this.imgBackPath;
                        data.borderColor = this.border;
                        data.glintColor = FancyDisplay._adjustToGlintColor(this.border);
                        return data;
                    }
                }

                const customPopout = new CustomPopout(imgFrontPath, imgBackPath, borderColor);
                customPopout.render(true);

                // Check if the user is the GM
                if (this.share && game.user.isGM) {
                    // Emit a socket message to all players
                    game.socket.emit('module.card-viewer', {
                        type: 'VIEWCARD',
                        payload: {
                            imgFrontPath: this.imgFrontPath,
                            imgBackPath: this.imgBackPath,
                            border: this.border,
                            showBackFirst: this.showBackFirst,
                            share: this.share
                        }
                    });
                }

            } else {
                ui.notifications.warn("Image URL or file path not provided.");
            }
        } catch (error) {
            console.error("Error rendering FancyPopout:", error);
        }
    }

    _adjustToGlintColor (color) {
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
