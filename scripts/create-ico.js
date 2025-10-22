const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

async function createIco() {
  try {
    // Читаем PNG файлы разных размеров
    const png16 = fs.readFileSync(path.join(__dirname, '..', 'assets', 'icon-16.png'));
    const png32 = fs.readFileSync(path.join(__dirname, '..', 'assets', 'icon-32.png'));
    const png48 = fs.readFileSync(path.join(__dirname, '..', 'assets', 'icon-48.png'));
    const png64 = fs.readFileSync(path.join(__dirname, '..', 'assets', 'icon-64.png'));
    const png128 = fs.readFileSync(path.join(__dirname, '..', 'assets', 'icon-128.png'));
    const png256 = fs.readFileSync(path.join(__dirname, '..', 'assets', 'icon-256.png'));
    
    // Создаем ICO файл с несколькими размерами
    const ico = await pngToIco([png16, png32, png48, png64, png128, png256]);
    
    // Сохраняем ICO файл
    const icoPath = path.join(__dirname, '..', 'assets', 'icon.ico');
    fs.writeFileSync(icoPath, ico);
    
    console.log('✓ Создан правильный icon.ico файл');
  } catch (error) {
    console.error('Ошибка создания ICO:', error);
  }
}

createIco();
