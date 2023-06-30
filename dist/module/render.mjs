"use strict";

class AnimationUtil {
  /**
   * See: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Tips
   *
   * requestAnimationFrame() [...] gets executed just before the next repaint of the document. [...] because it's
   * before the repaint, the style recomputation hasn't actually happened yet!
   * [...] calls requestAnimationFrame() a second time! This time, the callback is run before the next repaint,
   * which is after the style recomputation has occurred.
   */
  static async pRecomputeStyles () {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  }

  static pLoadImage (uri) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onerror = err => reject(err);
      img.onload = () => resolve(img);
      img.src = uri;
    });
  }
};

class RenderCard {

  /* -------------------------------------------- */

  static async pRenderStgCard ({front, back, text}) {

    const imgBack = back ? await AnimationUtil.pLoadImage(back) : null;
    if (imgBack) {
      imgBack.className = "decks-draw__img-card-back absolute";
    }

    const imgCard = await AnimationUtil.pLoadImage(front);
    if (imgCard) {
      imgCard.className = "decks-draw__img-card";
    }

    const dispGlint = document.createElement("div");
    dispGlint.className = "decks-draw__disp-glint no-events no-select absolute";

    const wrpCard = document.createElement("div");
    wrpCard.className = "decks-draw__wrp-card relative";
    wrpCard.appendChild(imgBack);
    wrpCard.appendChild(imgCard);
    wrpCard.appendChild(dispGlint);

    const wrpCardFlip = document.createElement("div");
    wrpCardFlip.className = "decks-draw__wrp-card-flip";
    wrpCardFlip.appendChild(wrpCard);

    const wrpCardSway = document.createElement("div");
    wrpCardSway.className = "decks-draw__wrp-card-sway ve-flex-col no-select relative";
    wrpCardSway.appendChild(wrpCardFlip);
    wrpCardSway.addEventListener("click", (evt) => evt.stopPropagation());

    const metasSparkles = await Promise.all([...Array(8)].map(async (_, i) => {
        const imgSparkle = new Image();
        imgSparkle.className = "decks-draw__img-sparkle relative";
      
        const imgSrc = i % 2 ? "https://5e.tools/img/decks/page/medium-2.webp" : "https://5e.tools/img/decks/page/medium-1.webp";
        await new Promise((resolve, reject) => {
          imgSparkle.onload = resolve;
          imgSparkle.onerror = reject;
          imgSparkle.src = imgSrc;
        });

        imgSparkle.style.animationDuration = `${4_500 + Math.random() * 3_000}ms, ${60_000 + Math.random() * 60_000}ms`;
        imgSparkle.style.animationDelay = `-${i + 1}00ms, -${i + 1}00ms`;
      
        const wrpSparkleSway = document.createElement("div");
        wrpSparkleSway.className = "decks-draw__wrp-sparkle-sway ve-flex-col absolute";
        wrpSparkleSway.appendChild(imgSparkle);
      
        wrpSparkleSway.style.top = `${-10 + 120 * Math.random()}%`;
        wrpSparkleSway.style.left = `${-10 + 120 * Math.random()}%`;
      
        wrpSparkleSway.style.width = `min(67%, ${imgSparkle.width}px)`;
        wrpSparkleSway.style.height = `min(67%, ${imgSparkle.height}px)`;
      
        wrpSparkleSway.style.animationDuration = `${10_000 + Math.random() * 4_000}ms`;
        wrpSparkleSway.style.animationDelay = `-${3_000 + Math.random() * 1_500}ms`;
      
        return { wrpSparkleSway, imgSparkle };
    }));

    const wrpCardOuter = document.createElement("div");
    wrpCardOuter.className = "ve-flex-col no-select relative";

    metasSparkles.forEach((meta) => {
      wrpCardOuter.appendChild(meta.wrpSparkleSway);
      wrpCardOuter.appendChild(wrpCardSway);
    });

    const wrpInfo = document.createElement("div");
    wrpInfo.className = "stats stats--book decks-draw__wrp-desc mobile__hidden px-2 text-center mb-4";
    wrpInfo.textContent = text;
    wrpInfo.addEventListener("click", (evt) => evt.stopPropagation());

    const btnFlip = imgBack ? document.createElement("button") : null;
    if (btnFlip) {
      btnFlip.className = "btn btn-default btn-xs px-3";
      btnFlip.title = "Flip Card";
      btnFlip.innerHTML = '<i class="fas fa-rotate"></i> Flip';
    
      btnFlip.addEventListener("click", (evt) => {
        evt.stopPropagation();
        wrpCardFlip.classList.toggle("decks-draw__wrp-card-flip--flipped");
      });
    }

    const wrpRhs = document.createElement("div");
    wrpRhs.className = "decks-draw__wrp-rhs ve-flex-col mobile__ml-0";
    wrpRhs.addEventListener("click", (evt) => evt.stopPropagation());

    wrpRhs.appendChild(wrpInfo);

    const veFlexVhCenter = document.createElement("div");
    veFlexVhCenter.className = "ve-flex-vh-center mobile__mt-5";
    veFlexVhCenter.appendChild(btnFlip);

    wrpRhs.appendChild(veFlexVhCenter);

    const veFlexVCenter = document.createElement("div");
    veFlexVCenter.className = "ve-flex-v-center mobile__ve-flex-col";
    
    veFlexVCenter.appendChild(wrpCardOuter);
    veFlexVCenter.appendChild(wrpRhs);

    const wrpDrawn = document.createElement("div");
    wrpDrawn.className = "decks-draw__stg ve-flex-vh-center";
    wrpDrawn.appendChild(veFlexVCenter);
    wrpDrawn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      wrpDrawn.remove();
    });
    wrpDrawn.addEventListener("mousemove", (evt) => {
      const mouseX = evt.clientX;
      const mouseY = evt.clientY;

      requestAnimationFrame(() => {
        this._pRenderStgCard_onMouseMove_mutElements({ mouseX, mouseY, wrpCard, dispGlint });
      });
    });

    //   const mouseX = evt.clientX;
    //   const mouseY = evt.clientY;
    //   this._pRenderStgCard_onMouseMove_mutElements({ mouseX, mouseY, wrpCard, dispGlint });

    // document.body.appendChild(wrpDrawn);      

    await AnimationUtil.pRecomputeStyles();

    wrpDrawn.classList.add("decks-draw__stg--visible");
    wrpCard.classList.add("decks-draw__wrp-card--visible");
    wrpRhs.classList.add("decks-draw__wrp-rhs--visible");
    metasSparkles.forEach(it => it.imgSparkle.classList.add("decks-draw__img-sparkle--visible"));
    
    const cardViewer = document.createElement("div");
    cardViewer.className = "orcnog-card-viewer";
    cardViewer.appendChild(wrpDrawn);

    // Return HTML
    return cardViewer;
  }

  static _pRenderStgCard_onMouseMove_mutElements ({mouseX, mouseY, wrpCard, dispGlint}) {
    const perStyles = this._pRenderStgCard_getPerspectiveStyles({mouseX, mouseY, ele: wrpCard});
    wrpCard.style.transform = perStyles.cardTransform;
    dispGlint.style.background = perStyles.glintBackground;
  }

  static _pRenderStgCard_getPerspectiveStyles ({mouseX, mouseY, ele}) {
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
      ...this._pRenderStgCard_getPerspectiveStyles_card({mouseX, mouseY, bcr, hView, rotX, rotY}),
      ...this._pRenderStgCard_getPerspectiveStyles_glint({mouseX, mouseY, bcr, hView, rotX, rotY}),
    };
  }

  static _pRenderStgCard_getPerspectiveStyles_card ({rotX, rotY}) {
    return {
      cardTransform: `perspective(100vh) rotateX(${rotX}rad) rotateY(${rotY}rad)`,
    };
  }

  static _pRenderStgCard_getPerspectiveStyles_glint ({mouseX, mouseY, bcr, hView, rotX, rotY}) {
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

export default RenderCard