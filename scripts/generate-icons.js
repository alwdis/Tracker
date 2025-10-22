const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '..', 'assets', 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);
  
  const sizes = [
    { size: 16, name: 'icon-16.png' },
    { size: 32, name: 'icon-32.png' },
    { size: 48, name: 'icon-48.png' },
    { size: 64, name: 'icon-64.png' },
    { size: 128, name: 'icon-128.png' },
    { size: 256, name: 'icon-256.png' },
    { size: 512, name: 'icon-512.png' }
  ];
  
  console.log('Генерация иконок...');
  
  for (const { size, name } of sizes) {
    const outputPath = path.join(__dirname, '..', 'assets', name);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Создана ${name} (${size}x${size})`);
  }
  
  // Создаем ICO файл для Windows
  const icoPath = path.join(__dirname, '..', 'assets', 'icon.ico');
  await sharp(svgBuffer)
    .resize(256, 256)
    .png()
    .toFile(icoPath);
  
  console.log('✓ Создан icon.ico для Windows');
  console.log('Все иконки успешно сгенерированы!');
}

generateIcons().catch(console.error);
