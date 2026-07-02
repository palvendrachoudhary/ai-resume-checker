import { PDFParse } from 'pdf-parse';
import fs from 'fs';
const parser = new PDFParse({ data: new Uint8Array(fs.readFileSync('package.json')) });
console.log(typeof parser.getText);
