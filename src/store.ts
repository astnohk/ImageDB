import fsPromises from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

import * as database from './db.js';
import * as utils from './utils.js';

const thumbnail_size: number = 100;
const dbname: string = 'main.db';



const fileReadingPromisesCountMax: number = 2000;
let fileReadingPromisesCount: number = 0; // Current file reding promises

function waitFileReadingPromises()
{
    return new Promise(
        (resolve) => {
            const check = () => {
                if (fileReadingPromisesCount < fileReadingPromisesCountMax)
                {
                    fileReadingPromisesCount += 1;
                    resolve(true);
                }
                else
                {
                    setTimeout(check, 100);
                }
            };
            check();
        }
    );
}


type Images = {
    directories: Set<string>,
    categories: Set<string>,
    subcategories: Set<database.Subcategory>,
    directorySubcategories: Set<database.DirectorySubcategory>,
    subcategoryImages: database.SubcategoryImage[],
    images: database.Image[],
};

async function searchDirs(root: string)
{
    let images: Images = {
        directories: new Set(),
        categories: new Set(),
        subcategories: new Set(),
        directorySubcategories: new Set(),
        subcategoryImages: [],
        images: [],
    };

    const dir: fs.Dirent[] = fs.readdirSync(
        root,
        {
            withFileTypes: true,
        },
    );
    for (let file of dir)
    {
        if (file.isFile())
        {
            if (file.name.slice(-3).toLowerCase() === 'gif' ||
                file.name.slice(-3).toLowerCase() === 'jpg' || file.name.slice(-4).toLowerCase() === 'jpeg' ||
                file.name.slice(-3).toLowerCase() === 'png' ||
                file.name.slice(-3).toLowerCase() === 'webp')
            {
                images.directories.add(root);
                const filepath: string = path.join(root, file.name);
                const stat = fs.lstatSync(filepath)
                const ind_ext: number = file.name.indexOf(path.extname(file.name));
                const split_: string[] = path.basename(file.name.slice(0, ind_ext)).split('_');
                // Parse Category
                let category: string = '';
                if (split_.length >= 2)
                {
                    category = split_[0];
                    images.categories.add(category);
                }
                // Parse Subcategories
                if (split_.length >= 3)
                {
                    for (let i: number = 1; i < split_.length; ++i)
                    {
                        let rNumber: string[] | null = split_[i].match(/[0-9]+/);
                        if (rNumber !== null &&
                            split_[i] === rNumber[0])
                        {
                            // the string is file number
                            continue;
                        }
                        let rPages: string[] | null = split_[i].match(/p[0-9]+/);
                        if (rPages !== null &&
                            split_[i] === rPages[0])
                        {
                            // the string is page number
                            continue;
                        }
                        images.subcategories.add(
                            {
                                category: category,
                                subcategory: split_[i],
                                displayName: "",
                            }
                        );
                        images.directorySubcategories.add(
                            {
                                directory: root,
                                category: category,
                                subcategory: split_[i],
                            }
                        );
                        images.subcategoryImages.push(
                            {
                                category: category,
                                subcategory: split_[i],
                                filepath: filepath,
                            }
                        );
                    }
                }
                // Get timestamp as number
                const basetime: Date = new Date(0);
                const ctime: number = stat.ctime.valueOf() - basetime.valueOf();
                const mtime: number = stat.mtime.valueOf() - basetime.valueOf();
                // Check mtime
                const image_info: database.ImageInfo | null = await database.getImageInfo(
                        dbname,
                        filepath,
                    )
                    .catch((err) => {
                        console.error("[ERROR] async function searchDirs(root: string): Check mtime:");
                        console.error(err);
                        return;
                    }) as database.ImageInfo;
                let image: Buffer;
                if (! image_info ||
                    mtime !== image_info.mtime)
                {
                    // Create thumbnail image
                    image = await createThumbnailImage(filepath)
                        .catch((err) => {
                            console.error("[ERROR] async function searchDirs(root: string): Create thumbnail:");
                            console.error(err);
                            return;
                        }) as Buffer;
                }
                else
                {
                    // Use old image
                    const image_file: database.ImageFile = await database.getThumbnailImage(
                            dbname,
                            filepath,
                        )
                        .catch((err) => {
                            console.error("[ERROR] async function searchDirs(root: string): Load thumbnail from DB:");
                            console.error(err);
                            return;
                        }) as database.ImageFile;
                    image = image_file.file;
                }
                images.images.push(
                    {
                        filepath: filepath,
                        name: file.name,
                        category: category,
                        directory: root,
                        size: stat.size,
                        ctime: ctime,
                        mtime: mtime,
                        image: image,
                    }
                );
            }
        }
        else if (file.isDirectory())
        {
            const tmp = await searchDirs(path.join(root, file.name));
            images.images = images.images.concat(tmp.images);
            for (let dir of tmp.directories.values())
            {
                images.directories.add(dir);
            }
            for (let cat of tmp.categories.values())
            {
                images.categories.add(cat);
            }
            for (let cat of tmp.subcategories.values())
            {
                images.subcategories.add(cat);
            }
            for (let cat of tmp.directorySubcategories.values())
            {
                images.directorySubcategories.add(cat);
            }
            images.subcategoryImages = images.subcategoryImages.concat(tmp.subcategoryImages);
        }
    }
    return images;
}

function createThumbnailImage(filepath: string): Promise<Buffer>
{
    return new Promise(async (resolve, reject) => {
        try
        {
            await waitFileReadingPromises();
            const file: Buffer = await fsPromises.readFile(filepath);
            fileReadingPromisesCount -= 1;
            const image: Buffer = await sharp(file)
                .resize(
                    thumbnail_size,
                    thumbnail_size,
                    {
                        fit: 'contain',
                        kernel: sharp.kernel.cubic,
                        background: { r: 0, g: 0, b: 0, alpha: 0.0 },
                    }
                )
                .png()
                .toBuffer({ resolveWithObject: false })
                .catch(err => reject(err)) as Buffer;
            resolve(image);
        }
        catch (err)
        {
            reject(err);
        }
    });
}


async function main()
{
    // Create Tables
    database.createTableImages(dbname);
    database.createTableDirectories(dbname);
    database.createTableCategories(dbname);
    database.createTableSubCategories(dbname);
    database.createTableDirectorySubCategories(dbname);
    database.createTableSubCategoryImages(dbname);
    database.createTablePlaylists(dbname);
    database.createTablePlaylistImages(dbname);

    // Search files
    if (process.argv.length < 3)
    {
        console.error('You need to specify root dir.');
        return;
    }
    if (process.argv[2] === '--clean')
    {
        // Check all filepath and cleanup broken links
        database.checkImageExistence(dbname);
    }
    else if (process.argv[2] === '--stats')
    {
        // Check all filepath and cleanup broken links
        const stats = database.getStatsOfTables(dbname);
        console.log('stats:\n' +
            `    images: ${stats['images']}\n` +
            `    directories: ${stats['directories']}\n` +
            `    categories: ${stats['categories']}\n` +
            `    subcategories: ${stats['subcategories']}\n` +
            `    playlists: ${stats['playlists']}\n`);
    }
    else
    {
        // Search specified directory and store image paths
        console.log(`Read '${process.argv[2]}'...`);
        let rootDir = process.argv[2];
        let rootDirMatch = rootDir.match(/([a-z]:)(.+)/);
        if (rootDirMatch && rootDirMatch.index == 0) {
            rootDir = `${rootDirMatch[1].toUpperCase()}${rootDirMatch[2]}`;
        }
        console.log('Read image files...');
        const images: Images = await searchDirs(rootDir);
        console.log('done.');
        console.log('Parse results...');
        let directories: database.Directory[] = [];
        for (let dir of images.directories.values()) {
            directories.push({ directory: dir, displayName: path.basename(dir) });
        }
        let categories: database.Category[] = [];
        for (let cat of images.categories.values()) {
            categories.push({ category: cat, displayName: cat });
        }
        let subcategories: database.Subcategory[] = [];
        for (let cat of images.subcategories.values()) {
            subcategories.push({ category: cat.category, subcategory: cat.subcategory, displayName: cat.subcategory });
        }
        let directorySubcategories: database.DirectorySubcategory[] = [];
        for (let cat of images.directorySubcategories.values())
        {
            directorySubcategories.push({ directory: cat.directory, category: cat.category, subcategory: cat.subcategory });
        }
        console.log('done.');

        console.log('Create thumbnail images...');
        try
        {
            for (let i = 0; i < images.images.length; ++i)
            {
                const image: Buffer = await images.images[i].image;
                images.images[i].image = image;
            }
        }
        catch (err)
        {
            console.error(err);
            return;
        }
        console.log('done.');

        console.log(`Insert data to DB (${dbname})`);
        database.insertImages(dbname, images.images);
        database.insertDirectories(dbname, directories);
        database.insertCategories(dbname, categories);
        database.insertSubCategories(dbname, subcategories);
        database.insertDirectorySubCategories(dbname, directorySubcategories);
        database.insertSubCategoryImages(dbname, images.subcategoryImages);
    }
}

// Call main
main()

