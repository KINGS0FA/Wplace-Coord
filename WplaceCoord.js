// ==UserScript==
// @name         WPlace Coords
// @description  Show correct pixel + region coords from backend.wplace.live
// @match        https://wplace.live/*
// ==/UserScript==

(function() {
    'use strict';

    const box = document.createElement("div");
    box.style.position = "fixed";
    box.style.top = "10px";
    box.style.left = "50%";
    box.style.transform = "translateX(-50%)";
    box.style.background = "rgba(0,0,0,0.7)";
    box.style.color = "lime";
    box.style.padding = "8px 12px";
    box.style.fontFamily = "monospace";
    box.style.fontSize = "14px";
    box.style.borderRadius = "8px";
    box.style.zIndex = 999999;
    box.style.pointerEvents = "none";
    box.innerText = "Click a Tile...";
    document.body.appendChild(box);


    function updateBox(tileX, tileY, px, py, globalX, globalY) {
        box.innerHTML = `
          <b>RegionCoord:</b> ${tileX}, ${tileY}<br>
          <b>PixelCoord:</b> ${px}, ${py}<br>
          <b>GlobalCoord:</b> ${globalX}, ${globalY}
        `;
    }

    const origFetch = window.fetch;
    window.fetch = async (...args) => {
        try {
            const url = args[0] instanceof Request ? args[0].url : args[0];
            if (typeof url === "string" && url.includes("/s0/pixel/")) {
                const u = new URL(url, location.href);
                const m = u.pathname.match(/\/s0\/pixel\/(\d+)\/(\d+)$/);
                if (m) {
                    const tileX = parseInt(m[1], 10);
                    const tileY = parseInt(m[2], 10);
                    const px = parseInt(u.searchParams.get("x") || "0", 10);
                    const py = parseInt(u.searchParams.get("y") || "0", 10);

                    const globalX = tileX * 1000 + px;
                    const globalY = tileY * 1000 + py;

                    updateBox(tileX, tileY, px, py, globalX, globalY);
                }
            }
        } catch (err) {
            console.error("Pixel debugger error:", err);
        }
        return origFetch.apply(this, args);
    };

})();
