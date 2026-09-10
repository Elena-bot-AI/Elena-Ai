const https = require("https");
const fs = require("fs");
const path = require("path");

const BASE = "https://coresg-normal.trae.ai/api/ide/v1/text_to_image";
const OUT = path.resolve(process.cwd(), "public", "avatars");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const list = [
  {
    file: "avatar1-lotus.png",
    prompt:
      "minimalist avatar icon for a women's health menopause medical bot, friendly trust-worthy, soft rose and teal palette, sacred lotus flower silhouette inside a circle, flat vector illustration, 512x512 transparent background, no text, professional, clinic-grade design",
    size: "square_hd",
  },
  {
    file: "avatar2-petals.png",
    prompt:
      "soft gradient circle avatar for telegram bot women's health doctor, overlapping pastel petals like chamomile around a gentle heart, calm peach teal lavender, dribbble-style flat design, 512x512 png, no words, high quality logo mark",
    size: "square_hd",
  },
  {
    file: "avatar3-stethoscope.png",
    prompt:
      "avatar icon for menopause health guidance bot, minimal stethoscope intertwined with butterfly wings, warm rose gold and soft mint palette, circle shape, flat vector logo, 512x512, no text, very clean and trustful for a clinic",
    size: "square_hd",
  },
  {
    file: "avatar4-moon.png",
    prompt:
      "cozy avatar for a women hormonal health telegram bot, crescent moon surrounded by tiny stars and pastel flower buds, sage green and blush gradient circle, flat vector illustration, 512x512, no text, calm and trustful",
    size: "square_hd",
  },
  {
    file: "avatar5-tree.png",
    prompt:
      "elegant tree of life mini logo inside circle, autumn warm tones, menopause wisdom bot avatar, strong roots, delicate leaves, gold and mauve palette, flat vector, 512x512, no text, feminine and powerful",
    size: "square_hd",
  },
];

async function main() {
  for (const item of list) {
    const url = BASE + "?prompt=" + encodeURIComponent(item.prompt) + "&image_size=" + item.size;
    const target = path.join(OUT, item.file);
    const label = `→ ${item.file}`;
    process.stdout.write(label + " downloading... ");
    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(target);
      https.get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // one redirect follow
          https.get(res.headers.location, (r2) => {
            r2.pipe(file);
            file.on("finish", () => {
              file.close(() => {
                const s = fs.statSync(target).size;
                console.log(`done (${s} bytes, HTTP ${r2.statusCode || "?"})`);
                resolve();
              });
            });
          }).on("error", reject);
          return;
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close(() => {
            const s = fs.statSync(target).size;
            console.log(`done (${s} bytes, HTTP ${res.statusCode || "?"})`);
            resolve();
          });
        });
      }).on("error", reject);
    });
  }
  console.log("\n✅ All 5 avatars saved to public/avatars/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
