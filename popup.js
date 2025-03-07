// popup.js - виправлена версія
document.addEventListener('DOMContentLoaded', function() {
  const contentDiv = document.getElementById('content');
  const loadingDiv = document.getElementById('loading');
  const noSvgDiv = document.getElementById('no-svg');

  // Функція для безпечного вставлення SVG через DOM API замість innerHTML
  function createSVGElement(svgString) {
    // Створюємо елемент div для тимчасового контейнера
    const temp = document.createElement('div');

    // Створюємо SVG елемент
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    // Парсимо строку SVG для отримання атрибутів і контенту
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
    const originalSvg = svgDoc.documentElement;

    // Копіюємо всі атрибути
    for (const attr of originalSvg.attributes) {
      svg.setAttribute(attr.name, attr.value);
    }

    // Копіюємо вміст
    // Clone all child nodes from the original SVG
    while (originalSvg.firstChild) {
      svg.appendChild(originalSvg.firstChild.cloneNode(true));
    } // Це використання innerHTML є безпечним, 
                                          // оскільки ми парсимо SVG через DOMParser

    return svg;
  }

  // Функція для створення попередніх переглядів і кнопок збереження
  function displaySVGs(svgs) {
    loadingDiv.style.display = 'none';

    if (svgs.length === 0) {
      noSvgDiv.style.display = 'block';
      return;
    }

    contentDiv.style.display = 'flex';

    // Створити елемент для кожного SVG
    svgs.forEach(svg => {
      const svgItem = document.createElement('div');
      svgItem.className = 'svg-item';

      const previewDiv = document.createElement('div');
      previewDiv.className = 'svg-preview';

      // Відображаємо SVG в залежності від типу
      if (svg.type === 'inline') {
        // Безпечно вставляємо SVG (замість використання innerHTML)
        const svgElement = createSVGElement(svg.content);
        previewDiv.appendChild(svgElement);
      } else {
        const img = document.createElement('img');
        img.src = svg.url;
        previewDiv.appendChild(img);
      }

      // Кнопки
      const buttonsDiv = document.createElement('div');
      buttonsDiv.className = 'svg-buttons';

      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = 'Зберегти';
      downloadBtn.addEventListener('click', () => downloadSVG(svg));

      buttonsDiv.appendChild(downloadBtn);

      // Додати все до контейнера
      svgItem.appendChild(previewDiv);
      svgItem.appendChild(buttonsDiv);
      contentDiv.appendChild(svgItem);
    });
  }

  // Функція для збереження SVG
  function downloadSVG(svg) {
    if (svg.type === 'inline') {
      // Створюємо blob з SVG-кодом
      const blob = new Blob([svg.content], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      // Завантажуємо SVG
      browser.downloads.download({
        url: url,
        filename: `svg-${svg.id}.svg`,
        saveAs: true
      });

      // Очищаємо URL
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      // Для зовнішніх SVG просто завантажуємо URL
      browser.downloads.download({
        url: svg.url,
        filename: `svg-${svg.id}.svg`,
        saveAs: true
      });
    }
  }

  // Запитати у вкладки дані SVG
  browser.tabs.executeScript({
    file: 'content-script.js'
  }).catch(error => {
    loadingDiv.style.display = 'none';

    // Створюємо елементи замість використання innerHTML для повідомлення про помилку
    const errorDiv = document.createElement('div');
    errorDiv.className = 'no-svg';
    const errorText = document.createTextNode(`Помилка: ${error.message}`);
    errorDiv.appendChild(errorText);

    // Очищаємо та додаємо новий вміст
    contentDiv.textContent = '';
    contentDiv.appendChild(errorDiv);
    contentDiv.style.display = 'block';
  });

  // Отримати повідомлення з SVG від content-script
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === "foundSVGs") {
      displaySVGs(message.svgs);
    }
  });
});