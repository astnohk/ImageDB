import fsPromises from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import * as database from './db.js';
import * as utils from './utils.js';


const dbname = 'main.db';


function searchDirs(root)
{
    let images = {
        categories: new Set(),
        subcategories: new Set(),
        subcategoryImages: [],
        images: [],
    };

    const dir = fs.readdirSync(root, { withFileTypes: true });
    dir.forEach((file) => {
        if (file.isFile()) {
            if (file.name.slice(-3).toLowerCase() === 'gif' ||
                file.name.slice(-3).toLowerCase() === 'jpg' || file.name.slice(-4).toLowerCase() === 'jpeg' ||
                file.name.slice(-3).toLowerCase() === 'png' ||
                file.name.slice(-3).toLowerCase() === 'webp')
            {
                const filepath = path.join(root, file.name);
                const stat = fs.lstatSync(filepath)
                const split_ = path.basename(file.name).split('_');
                let category = '';
                if (split_.length >= 2) {
                    category = split_[0];
                    images.categories.add(category);
                }
                if (split_.length >= 3) {
                    for (let i = 1; i < split_.length - 1; ++i) {
                        let rNumber = split_[i].match(/[0-9]+/);
                        if (!!rNumber && split_[i] === rNumber[0]) {
                            // the string is file number
                            continue;
                        }
                        let rPages = split_[i].match(/p[0-9]+/);
                        if (!!rPages && split_[i] === rPages[0]) {
                            // the string is page number
                            continue;
                        }
                        images.subcategories.add({ category: category, subcategory: split_[i] });
                        images.subcategoryImages.push({ category: category, subcategory: split_[i], filepath: filepath });
                    }
                }
                images.images.push({
                    ino: stat.ino,
                    filepath: filepath,
                    name: file.name,
                    category: category,
                    size: stat.size,
                    ctime: utils.getDatetimeISOStringWithOffset(stat.ctime),
                    mtime: utils.getDatetimeISOStringWithOffset(stat.mtime),
                });
            }
        } else if (file.isDirectory()) {
            const tmp = searchDirs(path.join(root, file.name));
            images.images = images.images.concat(tmp.images);
            for (let cat of tmp.categories.values()) {
                images.categories.add(cat);
            }
            for (let cat of tmp.subcategories.values()) {
                images.subcategories.add(cat);
            }
            images.subcategoryImages = images.subcategoryImages.concat(tmp.subcategoryImages);
        }
    });

    return images;
}


function main()
{
    // Create Tables
    database.createTableImages(dbname);
    database.createTableCategories(dbname);
    database.createTableSubCategories(dbname);
    database.createTableSubCategoryImages(dbname);
    database.createTableDirectories(dbname);
    database.createTableDirectoryImages(dbname);

    // Search files
    console.log(process.argv);
    if (process.argv.length < 3) {
        console.error('You need to specify root dir.');
        return;
    }
    console.log(`Read '${process.argv[2]}'...`);
    const images = searchDirs(process.argv[2]);
    let categories = [];
    for (let cat of images.categories.values()) {
        categories.push({ category: cat, displayName: cat });
    }
    let subcategories = [];
    for (let cat of images.subcategories.values()) {
        subcategories.push({ category: cat.category, subcategory: cat.subcategory, displayName: cat.subcategory });
    }

    // Insert to DB
    database.insertImages(dbname, images.images);
    database.insertCategories(dbname, categories);
    database.insertSubCategories(dbname, subcategories);
    database.insertSubCategoryImages(dbname, images.subcategoryImages);
    //database.insertDirectories(dbname, directories);
    //database.insertDirectoryImages(dbname, directoryImages);
}

// Call main
main();

