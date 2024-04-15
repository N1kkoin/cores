document.addEventListener("DOMContentLoaded", function() {
    const hueSlider = document.getElementById("hue");
    const saturationSlider = document.getElementById("saturation");
    const lightnessSlider = document.getElementById("lightness");
    const colorPreview = document.querySelector(".color-preview");
    const hslInput = document.getElementById("hsl");
    const hexInput = document.getElementById("hex");
    const cmykInput = document.getElementById("cmyk");

    const rgbInput = document.getElementById("rgb");

    function updateColor() {
        const hue = hueSlider.value;
        const saturation = saturationSlider.value;
        const lightness = lightnessSlider.value;
        
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        colorPreview.style.backgroundColor = color;

        const rgbColor = hslToRgb(hue / 360, saturation / 100, lightness / 100);
        const hexColor = rgbToHex(rgbColor[0], rgbColor[1], rgbColor[2]);
        const cmykColor = rgbToCmyk(rgbColor[0], rgbColor[1], rgbColor[2]);


        hslInput.value = color;
        hexInput.value = hexColor;
        rgbInput.value = `rgb(${rgbColor.join(', ')})`;
        cmykInput.value = `cmyk(${cmykColor.join(', ')})`;

    }

    function hslToRgb(h, s, l){
        let r, g, b;

        if(s === 0){
            r = g = b = l; // achromatic
        }else{
            const hue2rgb = (p, q, t) => {
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    
    function rgbToCmyk(r, g, b) {
        const c = 1 - (r / 255);
        const m = 1 - (g / 255);
        const y = 1 - (b / 255);
        const k = Math.min(c, m, y);
        
        if (k === 1) {
            return [0, 0, 0, 1];
        }
        
        return [
            (c - k) / (1 - k),
            (m - k) / (1 - k),
            (y - k) / (1 - k),
            k
        ].map(value => Math.round(value * 100));
    }

    hueSlider.addEventListener("input", updateColor);
    saturationSlider.addEventListener("input", updateColor);
    lightnessSlider.addEventListener("input", updateColor);

    // Inicializa a cor ao carregar a página
    updateColor();
});
