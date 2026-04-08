import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function test() {
    console.log("PDFParse:", typeof PDFParse);
    const parser = new PDFParse({ data: Buffer.from("dummy") });
    try {
        console.log("parser ready");
    } catch(e) { console.error(e); }
}
test();
