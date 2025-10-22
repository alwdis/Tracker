const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

async function createIco() {
  try {
    console.log('Creating ICO file from PNG...');
    
    // Читаем PNG файл 256x256
    const pngPath = path.join(__dirname, '..', 'assets', 'icon-256.png');
    const pngBuffer = fs.readFileSync(pngPath);
    
    // Создаем ICO файл
    const ico = await pngToIco([pngBuffer]);
    
    // Сохраняем ICO файл
    const icoPath = path.join(__dirname, '..', 'assets', 'icon.ico');
    fs.writeFileSync(icoPath, ico);
    
    console.log('✓ ICO file created successfully');
  } catch (error) {
    console.error('Error creating ICO:', error);
  }
}

createIco();
