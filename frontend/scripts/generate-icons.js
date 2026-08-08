const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SVG_PATH = path.join(__dirname, "../public/icons/logo.svg");
const OUTPUT_DIR = path.join(__dirname, "../public/icons");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log("🎨 Génération des icônes HotelBenin...\n");

  // Vérifier que le SVG existe
  if (!fs.existsSync(SVG_PATH)) {
    console.error("❌ Fichier logo.svg introuvable :", SVG_PATH);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(SVG_PATH);

  for (const size of sizes) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Icône ${size}x${size} créée`);
    } catch (error) {
      console.error(`❌ Erreur pour ${size}x${size}:`, error.message);
    }
  }

  // Bonus : Créer un favicon.ico (32x32)
  try {
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(OUTPUT_DIR, "favicon.png"));
    
    // Copier aussi comme favicon principal
    fs.copyFileSync(
      path.join(OUTPUT_DIR, "favicon.png"),
      path.join(__dirname, "../public/favicon.ico")
    );
    
    console.log("✅ Favicon créé");
  } catch (error) {
    console.error("❌ Erreur favicon:", error.message);
  }

  // Bonus : Apple Touch Icon
  try {
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(OUTPUT_DIR, "apple-touch-icon.png"));
    
    console.log("✅ Apple Touch Icon créée");
  } catch (error) {
    console.error("❌ Erreur apple-touch-icon:", error.message);
  }

  console.log("\n🎉 Toutes les icônes ont été générées avec succès !");
  console.log(`📂 Dossier : ${OUTPUT_DIR}`);
}

generateIcons().catch(console.error);