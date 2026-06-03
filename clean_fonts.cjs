const fs = require('fs');
const path = require('path');

const directories = ['src/pages', 'src/components'];
const fileRegex = /\.jsx$/;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace relative fonts with exact pixels from brand scale
  content = content.replace(/fontSize:\s*['"]0\.85rem['"]/g, "fontSize: '13px'");
  content = content.replace(/fontSize:\s*['"]0\.8rem['"]/g, "fontSize: '13px'");
  content = content.replace(/fontSize:\s*['"]0\.78rem['"]/g, "fontSize: '13px'");
  content = content.replace(/fontSize:\s*['"]0\.75rem['"]/g, "fontSize: '11px'");
  content = content.replace(/fontSize:\s*['"]0\.7rem['"]/g, "fontSize: '11px'");
  content = content.replace(/fontSize:\s*['"]0\.68rem['"]/g, "fontSize: '11px'");
  content = content.replace(/fontSize:\s*['"]0\.65rem['"]/g, "fontSize: '11px'");
  content = content.replace(/fontSize:\s*['"]0\.6rem['"]/g, "fontSize: '10px'");
  content = content.replace(/fontSize:\s*['"]0\.58rem['"]/g, "fontSize: '10px'");
  
  content = content.replace(/fontSize:\s*['"]1\.8rem['"]/g, "fontSize: '32px'"); // Typically H1
  content = content.replace(/fontSize:\s*['"]1\.6rem['"]/g, "fontSize: '22px'"); // Typically H2
  content = content.replace(/fontSize:\s*['"]1\.5rem['"]/g, "fontSize: '22px'");
  content = content.replace(/fontSize:\s*['"]1\.4rem['"]/g, "fontSize: '18px'"); // Main metrics
  content = content.replace(/fontSize:\s*['"]1\.35rem['"]/g, "fontSize: '22px'");
  content = content.replace(/fontSize:\s*['"]1\.2rem['"]/g, "fontSize: '16px'");
  content = content.replace(/fontSize:\s*['"]1rem['"]/g, "fontSize: '14px'");
  content = content.replace(/fontSize:\s*['"]1\.05rem['"]/g, "fontSize: '14px'");
  content = content.replace(/fontSize:\s*['"]0\.9rem['"]/g, "fontSize: '14px'");
  content = content.replace(/fontSize:\s*['"]0\.875rem['"]/g, "fontSize: '13px'");
  content = content.replace(/fontSize:\s*['"]0\.82rem['"]/g, "fontSize: '13px'");
  content = content.replace(/fontSize:\s*['"]0\.72rem['"]/g, "fontSize: '11px'");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fileRegex.test(fullPath)) {
      processFile(fullPath);
    }
  }
}

directories.forEach(dir => traverseDir(path.join(__dirname, dir)));
