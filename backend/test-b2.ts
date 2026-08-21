import { uploadToB2 } from "./src/config/b2";
import fs from "fs";

async function main() {
  const filePath = "./test-upload.txt";

  fs.writeFileSync(
    filePath,
    "Ellevadz B2 upload test"
  );

  const buffer = fs.readFileSync(filePath);

  const file = {
    fieldname: "file",
    originalname: "test-upload.txt",
    encoding: "7bit",
    mimetype: "text/plain",
    size: buffer.length,
    destination: "",
    filename: "test-upload.txt",
    path: filePath,
    buffer,
    stream: undefined as any,
  } as Express.Multer.File;

  console.log("⏳ Uploading to Backblaze B2...");

  const url = await uploadToB2(file, "test");

  console.log("✅ B2 upload successful!");
  console.log("🌐 URL:");
  console.log(url);
}

main().catch((error) => {
  console.error("❌ B2 upload failed!");
  console.error(error);
});