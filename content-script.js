// content-script.js - Simplified
(function() {
  // Find all SVGs on the page
  function findSVGs() {
    const svgs = [];
    let index = 0;

    // Process inline SVG elements
    document.querySelectorAll('svg').forEach(svg => {
      const svgContent = new XMLSerializer().serializeToString(svg);
      const width = svg.getAttribute('width') || svg.viewBox?.baseVal?.width || 100;
      const height = svg.getAttribute('height') || svg.viewBox?.baseVal?.height || 100;
      const name = svg.getAttribute('id') || `svg-${index++}`;

      svgs.push({
        id: `inline-${index}`,
        name: name,
        type: 'inline',
        content: svgContent,
        width: parseFloat(width),
        height: parseFloat(height)
      });
    });

    // Process SVG images
    document.querySelectorAll('img[src*=".svg"]').forEach(img => {
      const name = img.src.split('/').pop().replace(/\.svg$/i, '') || `svg-${index++}`;
      svgs.push({
        id: `img-${index}`,
        name: name,
        type: 'image',
        url: img.src,
        width: img.naturalWidth || img.width || 100,
        height: img.naturalHeight || img.height || 100
      });
    });

    // Process object/embed SVGs
    document.querySelectorAll('object[data*=".svg"], embed[src*=".svg"]').forEach(obj => {
      const url = obj.data || obj.src;
      const name = url.split('/').pop().replace(/\.svg$/i, '') || `svg-${index++}`;
      svgs.push({
        id: `obj-${index}`,
        name: name,
        type: 'object',
        url: url,
        width: obj.width || 100,
        height: obj.height || 100
      });
    });

    return svgs;
  }

  // Find SVGs and send to background script
  const svgs = findSVGs();
  browser.runtime.sendMessage({ action: "foundSVGs", svgs: svgs });
})();