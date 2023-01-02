import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export const table_name_directories = 'directories';
export const table_name_categories = 'categories';
export const table_name_subcategories = 'subcategories';
export const table_name_directory_subcategories = 'directory_subcategories';
export const table_name_subcategory_images = 'subcategory_images';
export const table_name_images = 'images';
export const table_name_playlists = 'playlists';
export const table_name_playlist_images = 'playlist_images';



////////////////////////////////
// CREATE and INSERT
////////////////////////////////
export function createTableImages(dbname)
{
    const db = new Database(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_images} (` +
        'filepath TEXT NOT NULL,' +
        'name TEXT NOT NULL,' +
        'category TEXT NOT NULL,' +
        'directory TEXT NOT NULL,' +
        'size INTEGER NOT NULL,' +
        'ctime INTEGER NOT NULL,' +
        'mtime INTEGER NOT NULL,' +
        'image BLOB,' +
        'PRIMARY KEY (filepath))')
        .run();
}

export function insertImages(dbname, images)
{
    const db = new Database(dbname);
    const insert = db.prepare(`INSERT OR REPLACE INTO ${table_name_images} (` +
        'filepath,' +
        'name,' +
        'category,' +
        'directory,' +
        'size,' +
        'ctime,' +
        'mtime,' +
        'image' +
        ') VALUES (' +
        '@filepath,' +
        '@name,' +
        '@category,' +
        '@directory,' +
        '@size,' +
        '@ctime,' +
        '@mtime,' +
        '@image' +
        ')');
    const insertMany = db.transaction((vals) => {
        vals.forEach(val => { insert.run(val); });
    });

    insertMany(images);
}

export function createTableDirectories(dbname)
{
    const db = new Database(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_directories} (` +
        'directory TEXT NOT NULL,' +
        'displayName TEXT NOT NULL,' +
        'PRIMARY KEY (directory))')
        .run();
}

export function insertDirectories(dbname, directories)
{
    const db = new Database(dbname);
    const insert = db.prepare(`INSERT OR REPLACE INTO ${table_name_directories} (` +
        'directory,' +
        'displayName' +
        ') VALUES (' +
        '@directory,' +
        '@displayName' +
        ')');
    const insertMany = db.transaction((vals) => {
        vals.forEach(val => { insert.run(val); });
    });

    insertMany(directories);
}

export function createTableCategories(dbname)
{
    const db = new Database(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_categories} (` +
        'category TEXT NOT NULL,' +
        'displayName TEXT NOT NULL,' +
        'PRIMARY KEY (category))')
        .run();
}

export function insertCategories(dbname, categories)
{
    const db = new Database(dbname);
    const insert = db.prepare(`INSERT OR REPLACE INTO ${table_name_categories} (` +
        'category,' +
        'displayName' +
        ') VALUES (' +
        '@category,' +
        '@displayName' +
        ')');
    const insertMany = db.transaction((vals) => {
        vals.forEach(val => { insert.run(val); });
    });

    insertMany(categories);
}

export function createTableSubCategories(dbname)
{
    const db = new Database(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_subcategories} (` +
        'category TEXT NOT NULL,' +
        'subcategory TEXT NOT NULL,' +
        'displayName TEXT NOT NULL,' +
        'PRIMARY KEY (category, subcategory))')
        .run();
}

export function insertSubCategories(dbname, subcategories)
{
    const db = new Database(dbname);
    const insert = db.prepare(`INSERT OR IGNORE INTO ${table_name_subcategories} (` +
        'category,' +
        'subcategory,' +
        'displayName' +
        ') VALUES (' +
        '@category,' +
        '@subcategory,' +
        '@displayName' +
        ')');
    const insertMany = db.transaction((vals) => {
        vals.forEach(val => { insert.run(val); });
    });

    insertMany(subcategories);
}

export function createTableDirectorySubCategories(dbname)
{
    const db = new Database(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_directory_subcategories} (` +
        'directory TEXT NOT NULL,' +
        'category TEXT NOT NULL,' +
        'subcategory TEXT NOT NULL,' +
        'PRIMARY KEY (directory, category, subcategory))')
        .run();
}

export function insertDirectorySubCategories(dbname, values)
{
    const db = new Database(dbname);
    const insert = db.prepare(`INSERT OR IGNORE INTO ${table_name_directory_subcategories} (` +
        'directory,' +
        'category,' +
        'subcategory' +
        ') VALUES (' +
        '@directory,' +
        '@category,' +
        '@subcategory' +
        ')');
    const insertMany = db.transaction((vals) => {
        vals.forEach(val => { insert.run(val); });
    });

    insertMany(values);
}


export function createTableSubCategoryImages(dbname)
{
    const db = new Database(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_subcategory_images} (` +
        'category TEXT NOT NULL,' +
        'subcategory TEXT NOT NULL,' +
        'filepath TEXT NOT NULL,' +
        'PRIMARY KEY (category, subcategory, filepath))')
        .run();
}

export function insertSubCategoryImages(dbname, values)
{
    const db = new Database(dbname);
    const insert = db.prepare(`INSERT OR IGNORE INTO ${table_name_subcategory_images} (` +
        'category,' +
        'subcategory,' +
        'filepath' +
        ') VALUES (' +
        '@category,' +
        '@subcategory,' +
        '@filepath' +
        ')');
    const insertMany = db.transaction((vals) => {
        vals.forEach(val => { insert.run(val); });
    });

    insertMany(values);
}

export function createTablePlaylists(dbname)
{
    const db = new Database(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_playlists} (` +
        'playlist TEXT NOT NULL,' +
        'PRIMARY KEY (playlist))')
        .run();
}

export function insertPlaylist(dbname, playlist)
{
    const db = new Database(dbname);
    const insert = db.prepare(`INSERT OR REPLACE INTO ${table_name_playlists} (` +
        'playlist' +
        ') VALUES (' +
        '@playlist' +
        ')');
    insert.run(playlist);
}

export function createTablePlaylistImages(dbname)
{
    const db = new Database(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_playlist_images} (` +
        'playlist TEXT NOT NULL,' +
        'number INTEGER NOT NULL,' +
        'filepath TEXT NOT NULL,' +
        'PRIMARY KEY (playlist, number, filepath))')
        .run();
}

export function insertPlaylistImages(dbname, values)
{
    const db = new Database(dbname);
    const insert = db.prepare(`INSERT OR IGNORE INTO ${table_name_playlist_images} (` +
        'playlist,' +
        'number,' +
        'filepath' +
        ') VALUES (' +
        '@playlist,' +
        '@number,' +
        '@filepath' +
        ')');
    const insertMany = db.transaction((vals) => {
        vals.forEach(val => { insert.run(val); });
    });

    insertMany(values);
}


////////////////////////////////
// GET
////////////////////////////////
export function getDirectoryList(dbname)
{
    return new Promise((resolve, reject) => {
        try {
            const db = new Database(dbname);
            const values = db.prepare(`SELECT directory,displayName FROM ${table_name_directories}`).all();
            resolve(values);
        } catch (err) {
            reject(err);
        }
    });
}

export function getDirectorySubCategoryList(dbname)
{
    return new Promise((resolve, reject) => {
        try {
            const db = new Database(dbname);
            const values = db.prepare(`SELECT directory,category,subcategory FROM ${table_name_directory_subcategories}`).all();
            resolve(values);
        } catch (err) {
            reject(err);
        }
    });
}

export function getCategoryList(dbname)
{
    return new Promise((resolve, reject) => {
        try {
            const db = new Database(dbname);
            const values = db.prepare(`SELECT category,displayName FROM ${table_name_categories}`).all();
            values.sort((a, b) => a.displayName.localeCompare(b.displayName));
            resolve(values);
        } catch (err) {
            reject(err);
        }
    });
}

export function getSubCategoryList(dbname)
{
    return new Promise((resolve, reject) => {
        try {
            const db = new Database(dbname);
            const values = db.prepare(`SELECT category,subcategory,displayName FROM ${table_name_subcategories}`).all();
            resolve(values);
        } catch (err) {
            reject(err);
        }
    });
}

export function checkImageFilepath(dbname, filepath)
{
    return new Promise((resolve, reject) => {
        try {
            const db = new Database(dbname);
            const value = db.prepare(`SELECT name FROM ${table_name_images} WHERE filepath = ?`).get(decodeURIComponent(filepath));
            resolve(!!value);
        } catch (err) {
            reject(err);
        }
    });
}

export function getCategoryImageList(dbname, category, subcategories)
{
    return new Promise((resolve, reject) => {
        try {
            const db = new Database(dbname);
            let category_images = {};
            let filepath_filtered = new Set();
            if (!!subcategories && subcategories.length > 0) {
                // Get first subcategory images
                {
                    const subcategory = decodeURIComponent(subcategories[0]);
                    const filepaths = db.prepare(`SELECT ${table_name_subcategory_images}.filepath,ctime,mtime FROM ${table_name_subcategory_images} INNER JOIN ${table_name_images} ON ${table_name_subcategory_images}.filepath = ${table_name_images}.filepath WHERE ${table_name_subcategory_images}.category = ? AND subcategory = ?`).all(decodeURIComponent(category), decodeURIComponent(subcategory));
                    for (let row of filepaths) {
                        category_images[row.filepath] = row;
                        filepath_filtered.add(row.filepath);
                    }
                }
                // Filter by subcategories
                for (let i = 1; i < subcategories.length; ++i) {
                    const subcategory = decodeURIComponent(subcategories[i]);
                    const filepaths = db.prepare(`SELECT ${table_name_subcategory_images}.filepath,ctime,mtime FROM ${table_name_subcategory_images} INNER JOIN ${table_name_subcategory_images} ON ${table_name_subcategory_images}.filepath = ${table_name_images}.filepath WHERE ${table_name_subcategory_images}.category = ? AND subcategory = '`).all(decodeURIComponent(category), decodeURIComponent(subcategory));
                    let intersection = new Set();
                    for (let row of filepaths) {
                        if (filepath_filtered.has(row.filepath)) {
                            intersection.add(row.filepath);
                        }
                    }
                    filepath_filtered = intersection;
                }
            } else {
                const filepaths = db.prepare(`SELECT filepath,ctime,mtime FROM ${table_name_images} WHERE category = ?`).all(decodeURIComponent(category));
                for (let row of filepaths) {
                    category_images[row.filepath] = row;
                    filepath_filtered.add(row.filepath);
                }
            }
            // Get image filepath list
            let images = [];
            for (let filepath of filepath_filtered.values()) {
                images.push(category_images[filepath]);
            }
            images.sort((a, b) => {
                a = path.basename(a.filepath) + a.mtime;
                b = path.basename(b.filepath) + b.mtime;
                let A = '';
                let B = '';
                for (let i = 0; i < a.length; ++i) A += a.charCodeAt(i);
                for (let i = 0; i < b.length; ++i) B += b.charCodeAt(i);
                return A.localeCompare(B);
            });
            resolve(images);
        } catch (err) {
            reject(err);
        }
    });
}

export function getDirectoryImageList(dbname, directory, category, subcategories)
{
    return new Promise((resolve, reject) => {
        try {
            const db = new Database(dbname);
            let directory_images = {};
            let filepath_filtered = new Set();
            {
                let filepaths = [];
                if (!!category) {
                    filepaths = db.prepare(`SELECT filepath,ctime,mtime FROM ${table_name_images} WHERE directory = ? AND category = ?`).all(decodeURIComponent(directory), decodeURIComponent(category));
                } else {
                    filepaths = db.prepare(`SELECT filepath,ctime,mtime FROM ${table_name_images} WHERE directory = ?`).all(decodeURIComponent(directory));
                }
                for (let row of filepaths) {
                    directory_images[row.filepath] = row;
                    filepath_filtered.add(row.filepath);
                }
            }
            if (!!subcategories && subcategories.length > 0) {
                // Filter by subcategories
                for (let i = 0; i < subcategories.length; ++i) {
                    const subcategory = decodeURIComponent(subcategories[i]);
                    const filepaths = db.prepare(`SELECT filepath FROM ${table_name_subcategory_images} WHERE category = ? AND subcategory = ?`).all(decodeURIComponent(category), decodeURIComponent(subcategory));
                    let intersection = new Set();
                    for (let row of filepaths) {
                        if (filepath_filtered.has(row.filepath)) {
                            intersection.add(row.filepath);
                        }
                    }
                    filepath_filtered = intersection;
                }
            }
            // Get image filepath list
            let images = [];
            for (let filepath of filepath_filtered.values()) {
                images.push(directory_images[filepath]);
            }
            images.sort();
            resolve(images);
        } catch (err) {
            reject(err);
        }
    });
}

export function getPlaylistList(dbname)
{
    return new Promise((resolve, reject) => {
        try {
            const db = new Database(dbname);
            const rows = db.prepare(`SELECT playlist FROM ${table_name_playlists}`).all();
            rows.sort();
            resolve(rows);
        } catch (err) {
            reject(err);
        }
    });
}

export function getPlaylistImageList(dbname, playlist)
{
    return new Promise((resolve, reject) => {
        try {
            const db = new Database(dbname);
            const images = db.prepare(`SELECT number,${table_name_playlist_images}.filepath,ctime,mtime FROM ${table_name_playlist_images} INNER JOIN ${table_name_images} ON ${table_name_playlist_images}.filepath = ${table_name_images}.filepath WHERE playlist = ?`).all(decodeURIComponent(playlist));
            images.sort((a, b) => a.number - b.number);
            resolve(images);
        } catch (err) {
            reject(err);
        }
    });
}

export function savePlaylistImageList(dbname, playlist)
{
    return new Promise((resolve, reject) => {
        try {
            const db = new Database(dbname);
            // Delete old playlist
            db.prepare(`DELETE FROM ${table_name_playlist_images} WHERE playlist = ?`).run(playlist.playlist);
            // Add
            insertPlaylist(dbname, playlist);
            insertPlaylistImages(dbname, playlist.images);
            resolve({ success: true });
        } catch (err) {
            reject(err);
        }
    });
}

export function deletePlaylist(dbname, playlist)
{
    return new Promise((resolve, reject) => {
        try {
            const db = new Database(dbname);
            const name = decodeURIComponent(playlist);
            // Delete playlist
            db.prepare(`DELETE FROM ${table_name_playlists} WHERE playlist = ?`).run(name);
            db.prepare(`DELETE FROM ${table_name_playlist_images} WHERE playlist = ?`).run(name);
            resolve({ success: true });
        } catch (err) {
            reject(err);
        }
    });
}

export function getThumbnailImage(dbname, filepath)
{
    return new Promise((resolve, reject) => {
        try {
            const db = new Database(dbname);
            const row = db.prepare(`SELECT image FROM ${table_name_images} WHERE filepath = ?`).get(filepath);
            resolve({ file: row.image, MIMEType: 'image/png' });
        } catch (err) {
            reject(err);
        }
    });
}



////////////////////////////////
// DELETE
////////////////////////////////
export function deleteImage(dbname, filepath)
{
    const db = new Database(dbname);
    // Get directory, category, subcategory of target
    const info = db.prepare(`SELECT category,directory FROM ${table_name_images} WHERE filepath = ?`).get(filepath);
    const subcategories = db.prepare(`SELECT category,subcategory FROM ${table_name_subcategory_images} WHERE filepath = ?`).all(filepath);
    // Delete
    db.prepare(`DELETE FROM ${table_name_images} WHERE filepath = ?`).run(filepath);
    db.prepare(`DELETE FROM ${table_name_subcategory_images} WHERE filepath = ?`).run(filepath);
    db.prepare(`DELETE FROM ${table_name_playlist_images} WHERE filepath = ?`).run(filepath);
    // Search empty category, drectory and subcategory
    //// category
    const category_image = db.prepare(`SELECT filepath FROM ${table_name_images} WHERE category = ?`).all(info.category);
    if (category_image.length == 0) {
        db.prepare(`DELETE FROM ${table_name_directories} WHERE category = ?`).run(info.category);
        db.prepare(`DELETE FROM ${table_name_categories} WHERE category = ?`).run(info.category);
        db.prepare(`DELETE FROM ${table_name_subcategories} WHERE category = ?`).run(info.category);
    }
    //// directory
    const directory_image = db.prepare(`SELECT filepath FROM ${table_name_images} WHERE directory = ?`).all(info.directory);
    if (directory_image.length == 0) {
        db.prepare(`DELETE FROM ${table_name_directories} WHERE directory = ?`).run(info.directory);
        db.prepare(`DELETE FROM ${table_name_directory_subcategories} WHERE directory = ?`).run(info.directory);
    }
    //// subcategory
    for (let subcategory of subcategories) {
        const subcategory_image = db.prepare(`SELECT filepath FROM ${table_name_subcategory_images} WHERE category = ? AND subcategory = ?`).all(subcategory.category, subcategory.subcategory);
        if (subcategory_image.length == 0) {
            // Delete empty subcategory
            db.prepare(`DELETE FROM ${table_name_subcategories} WHERE category = ? AND subcategory = ?`).run(subcategory.category, subcategory.subcategory);
            db.prepare(`DELETE FROM ${table_name_directory_subcategories} WHERE category = ? AND subcategory = ?`).run(subcategory.category, subcategory.subcategory);
        }
    }
}

export function checkImageExistence(dbname)
{
    const db = new Database(dbname);
    const directories = db.prepare(`SELECT directory FROM ${table_name_directories}`).all();
    for (let directory of directories) {
        const filepaths = db.prepare(`SELECT filepath FROM ${table_name_images} WHERE directory = ?`).all(directory.directory);
        for (let val of filepaths) {
            const filepath = val.filepath;
            if (!fs.existsSync(filepath)) {
                console.log(`Can't find "${filepath}"`);
                // Not found
                deleteImage(dbname, filepath);
            }
        }
    }
}

