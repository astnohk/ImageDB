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
        directories: new Set(),
        categories: new Set(),
        subcategories: new Set(),
        directorySubcategories: new Set(),
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
                images.directories.add(root);
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
                        images.directorySubcategories.add({ directory: root, category: category, subcategory: split_[i] });
                        images.subcategoryImages.push({ category: category, subcategory: split_[i], filepath: filepath });
                    }
                }
                images.images.push({
                    ino: stat.ino,
                    filepath: filepath,
                    name: file.name,
                    category: category,
                    directory: root,
                    size: stat.size,
                    ctime: utils.getDatetimeISOStringWithOffset(stat.ctime),
                    mtime: utils.getDatetimeISOStringWithOffset(stat.mtime),
                });
            }
        } else if (file.isDirectory()) {
            const tmp = searchDirs(path.join(root, file.name));
            images.images = images.images.concat(tmp.images);
            for (let dir of tmp.directories.values()) {
                images.directories.add(dir);
            }
            for (let cat of tmp.categories.values()) {
                images.categories.add(cat);
            }
            for (let cat of tmp.subcategories.values()) {
                images.subcategories.add(cat);
            }
            for (let cat of tmp.directorySubcategories.values()) {
                images.directorySubcategories.add(cat);
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
    database.createTableDirectories(dbname);
    database.createTableCategories(dbname);
    database.createTableSubCategories(dbname);
    database.createTableDirectorySubCategories(dbname);
    database.createTableSubCategoryImages(dbname);
    database.createTablePlaylists(dbname);
    database.createTablePlaylistImages(dbname);

    // Search files
    console.log(process.argv);
    if (process.argv.length < 3) {
        console.error('You need to specify root dir.');
        return;
    }
    console.log(`Read '${process.argv[2]}'...`);
    let rootDir = process.argv[2];
    let rootDirMatch = rootDir.match(/([a-z]:)(.+)/);
    if (rootDirMatch && rootDirMatch.index == 0) {
        rootDir = `${rootDirMatch[1].toUpperCase()}${rootDirMatch[2]}`;
    }
    const images = searchDirs(rootDir);
    let directories = [];
    for (let dir of images.directories.values()) {
        directories.push({ directory: dir, displayName: path.basename(dir) });
    }
    let categories = [];
    for (let cat of images.categories.values()) {
        categories.push({ category: cat, displayName: cat });
    }
    let subcategories = [];
    for (let cat of images.subcategories.values()) {
        subcategories.push({ category: cat.category, subcategory: cat.subcategory, displayName: cat.subcategory });
    }
    let directorySubcategories = [];
    for (let cat of images.directorySubcategories.values()) {
        directorySubcategories.push({ directory: cat.directory, category: cat.category, subcategory: cat.subcategory });
    }

    // Insert to DB
    database.insertImages(dbname, images.images);
    database.insertDirectories(dbname, directories);
    database.insertCategories(dbname, categories);
    database.insertSubCategories(dbname, subcategories);
    database.insertDirectorySubCategories(dbname, directorySubcategories);
    database.insertSubCategoryImages(dbname, images.subcategoryImages);
}

// Call main
main();

