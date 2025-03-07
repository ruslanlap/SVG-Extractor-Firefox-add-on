document.addEventListener('DOMContentLoaded', function() {
  const contentDiv = document.getElementById('content');
  const loadingDiv = document.getElementById('loading');
  const noSvgDiv = document.getElementById('no-svg');

  // Load SVGs from storage
  browser.storage.local.get('svgs').then((data) => {
    const svgs = data.svgs || [];

    loadingDiv.style.display = 'none';

    if (svgs.length === 0) {
      noSvgDiv.style.display = 'block';
      return;
    }

    contentDiv.style.display = 'flex';

    // Create element for each SVG
    svgs.forEach(svg => {
      const svgItem = document.createElement('div');
      svgItem.className = 'svg-item';

      // Preview section
      const previewDiv = document.createElement('div');
      previewDiv.className = 'svg-preview';

      if (svg.type === 'inline') {
        // For inline SVGs
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svg.content, "image/svg+xml");
        previewDiv.appendChild(document.importNode(svgDoc.documentElement, true));
      } else {
        // For external SVGs
        const img = document.createElement('img');
        img.src = svg.url;
        img.alt = svg.name;
        previewDiv.appendChild(img);
      }

      // Info section
      const infoDiv = document.createElement('div');
      infoDiv.className = 'svg-info';

      const nameElem = document.createElement('div');
      nameElem.className = 'svg-name';
      nameElem.textContent = svg.name;
      infoDiv.appendChild(nameElem);

      const sizeElem = document.createElement('div');
      sizeElem.className = 'svg-size';
      sizeElem.textContent = `${svg.width}×${svg.height}`;
      infoDiv.appendChild(sizeElem);

      // Download button
      const buttonsDiv = document.createElement('div');
      buttonsDiv.className = 'svg-buttons';

      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = 'Save SVG';
      downloadBtn.addEventListener('click', () => {
        if (svg.type === 'inline') {
          const blob = new Blob([svg.content], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          browser.downloads.download({
            url: url,
            filename: `${svg.name}.svg`,
            saveAs: true
          });
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } else {
          browser.downloads.download({
            url: svg.url,
            filename: `${svg.name}.svg`,
            saveAs: true
          });
        }
      });

      buttonsDiv.appendChild(downloadBtn);

      // Add all elements to container
      svgItem.appendChild(previewDiv);
      svgItem.appendChild(infoDiv);
      svgItem.appendChild(buttonsDiv);
      contentDiv.appendChild(svgItem);
    });
  }).catch(error => {
    loadingDiv.style.display = 'none';
    contentDiv.textContent = `Error loading SVGs: ${error.message}`;
    contentDiv.style.display = 'block';
  });
});