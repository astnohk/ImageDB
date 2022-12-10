import Database from 'better-sqlite3';

export const table_name_categories = 'categories';
export const table_name_subcategories = 'subcategories';
export const table_name_subcategory_images = 'subcategory_images';
export const table_name_images = 'images';
export const table_name_directories = 'directories';
export const table_name_directory_images = 'directory_images';



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
        'size INTEGER NOT NULL,' +
        'ctime INTEGER NOT NULL,' +
        'mtime INTEGER NOT NULL,' +
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
        'size,' +
        'ctime,' +
        'mtime' +
        ') VALUES (' +
        '@filepath,' +
        '@name,' +
        '@category,' +
        '@size,' +
        '@ctime,' +
        '@mtime' +
        ')');
    const insertMany = db.transaction((vals) => {
        vals.forEach(val => { insert.run(val); });
    });

    insertMany(images);
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

export function createTableDirectories(dbname)
{
    const db = new Database(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_directories} (` +
        'directory TEXT NOT NULL,' +
        'PRIMARY KEY (directory))')
        .run();
}

export function insertDirectories(dbname, directories)
{
    const db = new Database(dbname);
    const insert = db.prepare(`INSERT OR REPLACE INTO ${table_name_directories} (` +
        'directory' +
        ') VALUES (' +
        '@directory' +
        ')');
    const insertMany = db.transaction((vals) => {
        vals.forEach(val => { insert.run(val); });
    });

    insertMany(directories);
}

export function createTableDirectoryImages(dbname)
{
    const db = new Database(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_directory_images} (` +
        'directory TEXT NOT NULL,' +
        'filepath TEXT NOT NULL,' +
        'PRIMARY KEY (directory, filepath))')
        .run();
}

export function insertDirectoryImages(dbname, values)
{
    const db = new Database(dbname);
    const insert = db.prepare(`INSERT OR IGNORE INTO ${table_name_directory_images} (` +
        'directory,' +
        'filepath' +
        ') VALUES (' +
        '@directory,' +
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

export function getImageList(dbname)
{
    return new Promise((resolve, reject) => {
        try {
            const db = new Database(dbname);
            const values = db.prepare(`SELECT filepath,name,category FROM ${table_name_images}`).all();
            resolve(values);
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
            // Get first subcategory images
            {
                const filepaths = db.prepare(`SELECT filepath FROM ${table_name_subcategory_images} WHERE category = '${category}' AND subcategory = '${subcategories[0]}'`).all();
                for (let filepath of filepaths) {
                    category_images.add(filepath);
                }
            }
            // Filter by subcategories
            for (let i = 1; i < subcategories.length; ++i) {
                const subcategory = subcategories[i];
                const filepaths = db.prepare(`SELECT filepath FROM ${table_name_subcategory_images} WHERE category = '${category}' AND subcategory = '${subcategory}'`).all();
                let intersection = new Set();
                for (let filepath of filepaths) {
                    if (category_images.has(filepath)) {
                        intersection.add(filepath);
                    }
                }
                category_images = intersection;
            }
            // Get image filepath list
            let images = [];
            for (let filepath of category_images.values()) {
                images.push(filepath);
            }
            resolve(images);
        } catch (err) {
            reject(err);
        }
    });
}

