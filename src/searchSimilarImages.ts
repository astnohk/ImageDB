import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

import * as database from './db.js';

const threshold: number = 0.001;

// Parameters
const shrinked_size: number = 16;
const dbname: string = 'main.db';


let g_images: any = {};

async function createShrinkedImageList()
{
    try
    {
        const directories: any = await database.getDirectoryList(dbname);
        for (let i = 0; i < directories.length; ++i)
        {
            const directory: any = directories[i];
            const images: any = await database.getDirectoryImageList(dbname, directory.directory, null, null);
            for (let image of images)
            {
                const file: any = await database.getThumbnailImage(dbname, image.filepath);
                const data: any = await sharp(file.file)
                    .resize(
                        shrinked_size,
                        shrinked_size,
                        {
                            fit: 'fill',
                            kernel: sharp.kernel.cubic,
                        }
                    )
                    .removeAlpha()
                    .raw()
                    .toBuffer({ resolveWithObject: false })
                    .catch(err => console.error(err));
                const pixelArray = new Uint8ClampedArray(data.buffer);
                g_images[image.filepath] = pixelArray;
            }
            console.log(`${('  ' + Math.trunc((i + 1) / directories.length * 100)).slice(-3)}%`);
            console.log('\u001b[2A');
        }
        console.log('100%');
    }
    catch (err)
    {
        console.error(err);
    }
}


async function main()
{
    console.log('Load images from DB...');
    await createShrinkedImageList();
    console.log('done.');
    // Compare each images
    const filepaths: string[] = Object.keys(g_images);
    console.log('Start comparing...');
    let similarImages: any = {};
    for (let i = 0; i < filepaths.length; ++i)
    {
        const target_path: string = filepaths[i];
        const target: any = g_images[target_path];
        for (let k = i + 1; k < filepaths.length; ++k)
        {
            const comparative_path: string = filepaths[k];
            const comparative: any = g_images[comparative_path];
            // Compare bitwise
            let sum: number = 0;
            for (let i: number = 0; i < target.length; ++i)
            {
                sum += Math.abs(target[i] - comparative[i]) / 255;
            }
            // Normalize
            sum /= (3 * shrinked_size * shrinked_size);
            if (sum <= threshold)
            {
                console.log(`${target_path}:`);
                console.log(`    ${comparative_path}: ${sum}`);
                if (!similarImages[target_path])
                {
                    similarImages[target_path] = [];
                }
                similarImages[target_path].push(
                    {
                        score: sum,
                        target: target_path,
                        similar: comparative_path,
                    }
                );
            }
        }
    }
    console.log('done.');
}

// Call main
main()

