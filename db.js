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
        'displayName TEXT NOT NULL,' +
        'PRIMARY KEY (playlist))')
        .run();
}

export function insertPlaylists(dbname, playlists)
{
    const db = new Database(dbname);
    const insert = db.prepare(`INSERT OR REPLACE INTO ${table_name_playlists} (` +
        'playlist,' +
        'displayName' +
        ') VALUES (' +
        '@playlist,' +
        '@displayName' +
        ')');
    const insertMany = db.transaction((vals) => {
        vals.forEach(val => { insert.run(val); });
    });

    insertMany(playlists);
}

export function createTablePlaylistImages(dbname)
{
    const db = new Database(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_playlist_images} (` +
        'playlist TEXT NOT NULL,' +
        'filepath TEXT NOT NULL,' +
        'PRIMARY KEY (playlist, filepath))')
        .run();
}

export function insertPlaylistImages(dbname, values)
{
    const db = new Database(dbname);
    const insert = db.prepare(`INSERT OR IGNORE INTO ${table_name_playlist_images} (` +
        'playlist,' +
        'filepath' +
        ') VALUES (' +
        '@playlist,' +
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
            const value = db.prepare(`SELECT name FROM ${table_name_images} WHERE filepath = '${decodeURIComponent(filepath)}'`).get();
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
            let category_images = new Set();
            if (!!subcategories && subcategories.length > 0) {
                // Get first subcategory images
                {
                    const subcategory = decodeURIComponent(subcategories[0]);
                    const filepaths = db.prepare(`SELECT filepath FROM ${table_name_subcategory_images} WHERE category = '${decodeURIComponent(category)}' AND subcategory = '${decodeURIComponent(subcategory)}'`).all();
                    for (let row of filepaths) {
                        category_images.add(row.filepath);
                    }
                }
                // Filter by subcategories
                for (let i = 1; i < subcategories.length; ++i) {
                    const subcategory = decodeURIComponent(subcategories[i]);
                    const filepaths = db.prepare(`SELECT filepath FROM ${table_name_subcategory_images} WHERE category = '${decodeURIComponent(category)}' AND subcategory = '${decodeURIComponent(subcategory)}'`).all();
                    let intersection = new Set();
                    for (let row of filepaths) {
                        if (category_images.has(row.filepath)) {
                            intersection.add(row.filepath);
                        }
                    }
                    category_images = intersection;
                }
            } else {
                const filepaths = db.prepare(`SELECT filepath FROM ${table_name_images} WHERE category = '${decodeURIComponent(category)}'`).all();
                for (let row of filepaths) {
                    category_images.add(row.filepath);
                }
            }
            // Get image filepath list
            let images = [];
            for (let filepath of category_images.values()) {
                images.push({ filepath: filepath });
            }
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
            let directory_images = new Set();
            {
                let filepaths = [];
                if (!!category) {
                    filepaths = db.prepare(`SELECT filepath FROM ${table_name_images} WHERE directory = '${decodeURIComponent(directory)}' AND category = '${decodeURIComponent(category)}'`).all();
                } else {
                    filepaths = db.prepare(`SELECT filepath FROM ${table_name_images} WHERE directory = '${decodeURIComponent(directory)}'`).all();
                }
                for (let row of filepaths) {
                    directory_images.add(row.filepath);
                }
            }
            if (!!subcategories && subcategories.length > 0) {
                // Filter by subcategories
                for (let i = 0; i < subcategories.length; ++i) {
                    const subcategory = decodeURIComponent(subcategories[i]);
                    const filepaths = db.prepare(`SELECT filepath FROM ${table_name_subcategory_images} WHERE category = '${decodeURIComponent(category)}' AND subcategory = '${decodeURIComponent(subcategory)}'`).all();
                    let intersection = new Set();
                    for (let row of filepaths) {
                        if (directory_images.has(row.filepath)) {
                            intersection.add(row.filepath);
                        }
                    }
                    directory_images = intersection;
                }
            }
            // Get image filepath list
            let images = [];
            for (let filepath of directory_images.values()) {
                images.push({ filepath: filepath });
            }
            resolve(images);
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
            const images = db.prepare(`SELECT filepath FROM ${table_name_playlist_images} WHERE playlist = '${decodeURIComponent(playlist)}'`).all();
            resolve(images);
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

