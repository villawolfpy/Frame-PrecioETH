import { createCanvas, registerFont } from "canvas";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { Currency } from './enums';

export const createTextAndImageOverlay = async (currency: Currency) => {
    const apiKeyToken = process.env.ETHERSCAN;
    const url = `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${apiKeyToken}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        const textCurrency = currency === Currency.USD ? data.result.ethusd : data.result.ethbtc;

        const canvas = createCanvas(256, 417);
        const ctx = canvas.getContext('2d');

        // Asegúrate de que la ruta al fuente es correcta y accesible
        registerFont(path.resolve('./public/fonts/Montserrat-BoldItalic.ttf'), { 
            family: 'Montserrat-BoldItalic',
        });

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Montserrat'; 
        ctx.fillText(textCurrency, 10, 180);

        const textBuffer = canvas.toBuffer('image/png');
        const ethImagePath = path.resolve("./public/ETH.png");
        const ethImageBuffer = fs.readFileSync(ethImagePath);

        
        const newImageBuffer = await sharp(ethImageBuffer)
            .composite([{ input: textBuffer }])
            .toBuffer();
            
        return { textCurrent: textCurrency, newImageBuffer }; 
    } catch (error) {
        console.error('Error:', error);
        const ethImagePath = path.resolve('./public/ETH.png');
        
        return { textCurrent: 'Error', newImageBuffer: fs.readFileSync(ethImagePath) };
    }
};
