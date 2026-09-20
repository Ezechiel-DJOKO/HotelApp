const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// On utilise TON nouveau logo.jpg comme source
const LOGO_PATH = path.join(__dirname, "../public/logo.jpg");
const OUTPUT_DIR = path.join(__dirname, "../public/icons");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log("🎨 Régénération des icônes PWA depuis logo.jpg...\n");

  if (!fs.existsSync(LOGO_PATH)) {
    console.error("❌ Fichier public/logo.jpg introuvable !");
    process.exit(1);
  }

  // S'assurer que le dossier public/icons existe
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const size of sizes) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    try {
      await sharp(LOGO_PATH)
        .resize(size, size, { fit: 'cover' })
        .png()
        .toFile(outputPath);
      console.log(`✅ Icône PWA ${size}x${size} créée`);
    } catch (error) {
      console.error(`❌ Erreur pour ${size}x${size}:`, error.message);
    }
  }

  // Favicon (32x32)
  try {
    await sharp(LOGO_PATH)
      .resize(32, 32)
      .png()
      .toFile(path.join(OUTPUT_DIR, "favicon.png"));

    fs.copyFileSync(
      path.join(OUTPUT_DIR, "favicon.png"),
      path.join(__dirname, "../public/favicon.ico")
    );
    console.log("✅ Favicon mis à jour");
  } catch (error) {
    console.error("❌ Erreur favicon:", error.message);
  }

  // Apple Touch Icon (180x180)
  try {
    await sharp(LOGO_PATH)
      .resize(180, 180)
      .png()
      .toFile(path.join(OUTPUT_DIR, "apple-touch-icon.png"));
    console.log("✅ Apple Touch Icon créée");
  } catch (error) {
    console.error("❌ Erreur apple-touch-icon:", error.message);
  }

  console.log("\n🎉 Toutes les icônes PWA ont été mises à jour avec ton nouveau logo !");
}

generateIcons().catch(console.error);
