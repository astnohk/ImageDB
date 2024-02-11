import fs from 'node:fs';
import path from 'node:path';
import DatabaseConstructor, { Database } from 'better-sqlite3';

import * as constant from './const.js';

export type DB = Database;

export const table_name_directories: string = 'directories';
export const table_name_categories: string = 'categories';
export const table_name_subcategories: string = 'subcategories';
export const table_name_directory_subcategories: string = 'directory_subcategories';
export const table_name_subcategory_images: string = 'subcategory_images';
export const table_name_images: string = 'images';
export const table_name_playlists: string = 'playlists';
export const table_name_playlist_images: string = 'playlist_images';



export type Image = {
    filepath: string,
    name: string,
    category: string,
    directory: string,
    size: number,
    ctime: number,
    mtime: number,
    image: Buffer,
};

export type Directory = {
    directory: string,
    displayName: string,
};

export type Category = {
    category: string,
    displayName: string,
};

export type Subcategory = {
    category: string,
    subcategory: string,
    displayName: string,
};

export type DirectorySubcategory = {
    directory: string,
    category: string,
    subcategory: string,
};

export type SubcategoryImage = {
    category: string,
    subcategory: string,
    filepath: string,
};

export type Playlist = {
    playlist: string,
};

export type PlaylistImage = {
    playlist: string,
    number: number,
    filepath: string,
};

export type InsertingPlaylistImages = {
    playlist: string,
    images: PlaylistImage[],
};

export type TableStats = {
    images: number,
    directories: number,
    categories: number,
    subcategories: number,
    playlists: number,
};



////////////////////////////////
// CREATE and INSERT
////////////////////////////////
export function createTableImages(dbname: string)
{
    const db: Database = new DatabaseConstructor(dbname);
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

export function insertImages(dbname: string, images: Image[])
{
    const db: Database = new DatabaseConstructor(dbname);
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
    const insertMany = db.transaction((vals: Image[]) => {
        vals.forEach((val: Image) => { insert.run(val); });
    });

    insertMany(images);
}

export function createTableDirectories(dbname: string)
{
    const db: Database = new DatabaseConstructor(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_directories} (` +
        'directory TEXT NOT NULL,' +
        'displayName TEXT NOT NULL,' +
        'PRIMARY KEY (directory))')
        .run();
}

export function insertDirectories(dbname: string, directories: Directory[])
{
    const db: Database = new DatabaseConstructor(dbname);
    const insert = db.prepare(`INSERT OR REPLACE INTO ${table_name_directories} (` +
        'directory,' +
        'displayName' +
        ') VALUES (' +
        '@directory,' +
        '@displayName' +
        ')');
    const insertMany = db.transaction((vals: Directory[]) => {
        vals.forEach((val: Directory) => { insert.run(val); });
    });

    insertMany(directories);
}

export function createTableCategories(dbname: string)
{
    const db: Database = new DatabaseConstructor(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_categories} (` +
        'category TEXT NOT NULL,' +
        'displayName TEXT NOT NULL,' +
        'PRIMARY KEY (category))')
        .run();
}

export function insertCategories(dbname: string, categories: Category[])
{
    const db: Database = new DatabaseConstructor(dbname);
    const insert = db.prepare(`INSERT OR REPLACE INTO ${table_name_categories} (` +
        'category,' +
        'displayName' +
        ') VALUES (' +
        '@category,' +
        '@displayName' +
        ')');
    const insertMany = db.transaction((vals: Category[]) => {
        vals.forEach((val: Category) => { insert.run(val); });
    });

    insertMany(categories);
}

export function createTableSubCategories(dbname: string)
{
    const db: Database = new DatabaseConstructor(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_subcategories} (` +
        'category TEXT NOT NULL,' +
        'subcategory TEXT NOT NULL,' +
        'displayName TEXT NOT NULL,' +
        'PRIMARY KEY (category, subcategory))')
        .run();
}

export function insertSubCategories(dbname: string, subcategories: Subcategory[])
{
    const db: Database = new DatabaseConstructor(dbname);
    const insert = db.prepare(`INSERT OR IGNORE INTO ${table_name_subcategories} (` +
        'category,' +
        'subcategory,' +
        'displayName' +
        ') VALUES (' +
        '@category,' +
        '@subcategory,' +
        '@displayName' +
        ')');
    const insertMany = db.transaction((vals: Subcategory[]) => {
        vals.forEach((val: Subcategory) => { insert.run(val); });
    });

    insertMany(subcategories);
}

export function createTableDirectorySubCategories(dbname: string)
{
    const db: Database = new DatabaseConstructor(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_directory_subcategories} (` +
        'directory TEXT NOT NULL,' +
        'category TEXT NOT NULL,' +
        'subcategory TEXT NOT NULL,' +
        'PRIMARY KEY (directory, category, subcategory))')
        .run();
}

export function insertDirectorySubCategories(dbname: string, values: DirectorySubcategory[])
{
    const db: Database = new DatabaseConstructor(dbname);
    const insert = db.prepare(`INSERT OR IGNORE INTO ${table_name_directory_subcategories} (` +
        'directory,' +
        'category,' +
        'subcategory' +
        ') VALUES (' +
        '@directory,' +
        '@category,' +
        '@subcategory' +
        ')');
    const insertMany = db.transaction((vals: DirectorySubcategory[]) => {
        vals.forEach((val: DirectorySubcategory) => { insert.run(val); });
    });

    insertMany(values);
}


export function createTableSubCategoryImages(dbname: string)
{
    const db: Database = new DatabaseConstructor(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_subcategory_images} (` +
        'category TEXT NOT NULL,' +
        'subcategory TEXT NOT NULL,' +
        'filepath TEXT NOT NULL,' +
        'PRIMARY KEY (category, subcategory, filepath))')
        .run();
}

export function insertSubCategoryImages(dbname: string, values: SubcategoryImage[])
{
    const db: Database = new DatabaseConstructor(dbname);
    const insert = db.prepare(`INSERT OR IGNORE INTO ${table_name_subcategory_images} (` +
        'category,' +
        'subcategory,' +
        'filepath' +
        ') VALUES (' +
        '@category,' +
        '@subcategory,' +
        '@filepath' +
        ')');
    const insertMany = db.transaction((vals: SubcategoryImage[]) => {
        vals.forEach((val: SubcategoryImage) => { insert.run(val); });
    });

    insertMany(values);
}

export function createTablePlaylists(dbname: string)
{
    const db: Database = new DatabaseConstructor(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_playlists} (` +
        'playlist TEXT NOT NULL,' +
        'PRIMARY KEY (playlist))')
        .run();
}

export function insertPlaylist(dbname: string, playlist: Playlist)
{
    const db: Database = new DatabaseConstructor(dbname);
    const insert = db.prepare(`INSERT OR REPLACE INTO ${table_name_playlists} (` +
        'playlist' +
        ') VALUES (' +
        '@playlist' +
        ')');
    insert.run(playlist);
}

export function createTablePlaylistImages(dbname: string)
{
    const db: Database = new DatabaseConstructor(dbname);
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table_name_playlist_images} (` +
        'playlist TEXT NOT NULL,' +
        'number INTEGER NOT NULL,' +
        'filepath TEXT NOT NULL,' +
        'PRIMARY KEY (playlist, number, filepath))')
        .run();
}

export function insertPlaylistImages(dbname: string, values: PlaylistImage[])
{
    const db: Database = new DatabaseConstructor(dbname);
    const insert = db.prepare(`INSERT OR IGNORE INTO ${table_name_playlist_images} (` +
        'playlist,' +
        'number,' +
        'filepath' +
        ') VALUES (' +
        '@playlist,' +
        '@number,' +
        '@filepath' +
        ')');
    const insertMany = db.transaction((vals: PlaylistImage[]) => {
        vals.forEach((val: PlaylistImage) => { insert.run(val); });
    });

    insertMany(values);
}


////////////////////////////////
// GET
////////////////////////////////
export function getDirectoryList(dbname: string)
{
    return new Promise((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            const values = db.prepare(`SELECT directory,displayName FROM ${table_name_directories}`).all();
            resolve(values);
        }
        catch (err)
        {
            reject(err);
        }
    });
}

export function getDirectorySubCategoryList(dbname: string)
{
    return new Promise((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            const values = db.prepare(`SELECT directory,category,subcategory FROM ${table_name_directory_subcategories}`).all();
            resolve(values);
        }
        catch (err)
        {
            reject(err);
        }
    });
}

export function getCategoryList(dbname: string)
{
    return new Promise((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            const values = db.prepare(`SELECT category,displayName FROM ${table_name_categories}`).all();
            values.sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));
            resolve(values);
        }
        catch (err)
        {
            reject(err);
        }
    });
}

export function getSubCategoryList(dbname: string)
{
    return new Promise((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            const values = db.prepare(`SELECT category,subcategory,displayName FROM ${table_name_subcategories}`).all();
            resolve(values);
        }
        catch (err)
        {
            reject(err);
        }
    });
}

export function checkImageFilepath(dbname: string, filepath: string)
{
    return new Promise((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            const value = db.prepare(`SELECT name FROM ${table_name_images} WHERE filepath = ?`).get(decodeURIComponent(filepath));
            resolve(!!value);
        }
        catch (err)
        {
            reject(err);
        }
    });
}

export function getImageInfo(dbname: string, filepath: string)
{
    return new Promise((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            const value = db.prepare(`SELECT name,category,directory,size,ctime,mtime FROM ${table_name_images} WHERE filepath = ?`).get(decodeURIComponent(filepath));
            resolve(value);
        }
        catch (err)
        {
            reject(err);
        }
    });
}

export function getCategoryImageList(dbname: string, category: string, subcategories: string[])
{
    return new Promise((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            let category_images: any = {};
            let filepath_filtered: any = new Set();
            if (!!subcategories && subcategories.length > 0)
            {
                // Get first subcategory images
                {
                    const subcategory: string = decodeURIComponent(subcategories[0]);
                    const filepaths: any = db.prepare(`SELECT ${table_name_subcategory_images}.filepath,ctime,mtime FROM ${table_name_subcategory_images} INNER JOIN ${table_name_images} ON ${table_name_subcategory_images}.filepath = ${table_name_images}.filepath WHERE ${table_name_subcategory_images}.category = ? AND subcategory = ?`).all(decodeURIComponent(category), decodeURIComponent(subcategory));
                    for (let row of filepaths)
                    {
                        category_images[row.filepath] = row;
                        filepath_filtered.add(row.filepath);
                    }
                }
                // Filter by subcategories
                for (let i = 1; i < subcategories.length; ++i)
                {
                    const subcategory: string = decodeURIComponent(subcategories[i]);
                    const filepaths: any = db.prepare(`SELECT ${table_name_subcategory_images}.filepath,ctime,mtime FROM ${table_name_subcategory_images} INNER JOIN ${table_name_subcategory_images} ON ${table_name_subcategory_images}.filepath = ${table_name_images}.filepath WHERE ${table_name_subcategory_images}.category = ? AND subcategory = '`).all(decodeURIComponent(category), decodeURIComponent(subcategory));
                    let intersection: any = new Set();
                    for (let row of filepaths)
                    {
                        if (filepath_filtered.has(row.filepath))
                        {
                            intersection.add(row.filepath);
                        }
                    }
                    filepath_filtered = intersection;
                }
            }
            else
            {
                const filepaths: any = db.prepare(`SELECT filepath,ctime,mtime FROM ${table_name_images} WHERE category = ?`).all(decodeURIComponent(category));
                for (let row of filepaths)
                {
                    category_images[row.filepath] = row;
                    filepath_filtered.add(row.filepath);
                }
            }
            // Get image filepath list
            let images = [];
            for (let filepath of filepath_filtered.values())
            {
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
        }
        catch (err)
        {
            reject(err);
        }
    });
}

export function getDirectoryImageList(dbname: string, directory: string, category: string | null, subcategories: string[] | null)
{
    return new Promise((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            let directory_images: any = {};
            let filepath_filtered: any = new Set();
            {
                let filepaths: any = [];
                if (category !== null)
                {
                    filepaths = db.prepare(`SELECT filepath,ctime,mtime FROM ${table_name_images} WHERE directory = ? AND category = ?`).all(decodeURIComponent(directory), decodeURIComponent(category));
                }
                else
                {
                    filepaths = db.prepare(`SELECT filepath,ctime,mtime FROM ${table_name_images} WHERE directory = ?`).all(decodeURIComponent(directory));
                }
                for (let row of filepaths)
                {
                    directory_images[row.filepath] = row;
                    filepath_filtered.add(row.filepath);
                }
            }
            if (subcategories !== null &&
                subcategories.length > 0)
            {
                // Filter by subcategories
                for (let i = 0; i < subcategories.length; ++i)
                {
                    const subcategory: any = decodeURIComponent(subcategories[i]);
                    const filepaths: any = db.prepare(`SELECT filepath FROM ${table_name_subcategory_images} WHERE category = ? AND subcategory = ?`).all(decodeURIComponent(category ?? ""), decodeURIComponent(subcategory));
                    let intersection: any = new Set();
                    for (let row of filepaths)
                    {
                        if (filepath_filtered.has(row.filepath))
                        {
                            intersection.add(row.filepath);
                        }
                    }
                    filepath_filtered = intersection;
                }
            }
            // Get image filepath list
            let images: string[] = [];
            for (let filepath of filepath_filtered.values())
            {
                images.push(directory_images[filepath]);
            }
            images.sort();
            resolve(images);
        }
        catch (err)
        {
            reject(err);
        }
    });
}

export function getNewerImageList(dbname: string, limit: number, offset: number)
{
    return new Promise((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            const images: any = db.prepare(`SELECT filepath,ctime,mtime FROM ${table_name_images} ORDER BY mtime DESC LIMIT ? OFFSET ?`).all(limit, offset);
            images.sort((a: any, b: any) => {
                return a.mtime < b.mtime;
            });
            resolve(images);
        }
        catch (err)
        {
            reject(err);
        }
    });
}

export function getPlaylistList(dbname: string)
{
    return new Promise((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            const rows: any = db.prepare(`SELECT playlist FROM ${table_name_playlists}`).all();
            rows.sort();
            resolve(rows);
        }
        catch (err)
        {
            reject(err);
        }
    });
}

export function getPlaylistImageList(dbname: string, playlist: string)
{
    return new Promise((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            const images: any = db
                .prepare(`SELECT number,${table_name_playlist_images}.filepath,ctime,mtime FROM ${table_name_playlist_images} INNER JOIN ${table_name_images} ON ${table_name_playlist_images}.filepath = ${table_name_images}.filepath WHERE playlist = ?`)
                .all(decodeURIComponent(playlist));
            images.sort((a: any, b: any) => a.number - b.number);
            resolve(images);
        }
        catch (err)
        {
            reject(err);
        }
    });
}

export function savePlaylistImageList(dbname: string, playlist: InsertingPlaylistImages)
{
    return new Promise((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            // Delete old playlist
            db.prepare(`DELETE FROM ${table_name_playlist_images} WHERE playlist = ?`).run(playlist.playlist);
            // Add
            insertPlaylist(dbname, playlist);
            insertPlaylistImages(dbname, playlist.images);
            resolve({ success: true });
        }
        catch (err)
        {
            reject(err);
        }
    });
}

export function deletePlaylist(dbname: string, playlist: string)
{
    return new Promise((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            const name = decodeURIComponent(playlist);
            // Delete playlist
            db.prepare(`DELETE FROM ${table_name_playlists} WHERE playlist = ?`).run(name);
            db.prepare(`DELETE FROM ${table_name_playlist_images} WHERE playlist = ?`).run(name);
            resolve({ success: true });
        }
        catch (err)
        {
            reject(err);
        }
    });
}

export function getThumbnailImage(dbname: string, filepath: string)
{
    return new Promise<constant.ImageFile>((resolve, reject) => {
        try
        {
            const db: Database = new DatabaseConstructor(dbname);
            const row: any = db.prepare(`SELECT image FROM ${table_name_images} WHERE filepath = ?`).get(filepath);
            resolve({ file: row.image, MIMEType: 'image/png' });
        }
        catch (err)
        {
            reject(err);
        }
    });
}



////////////////////////////////
// DELETE
////////////////////////////////
export function deleteImage(dbname: string, filepath: string)
{
    const db: Database = new DatabaseConstructor(dbname);
    // Get directory, category, subcategory of target
    const info: any = db.prepare(`SELECT category,directory FROM ${table_name_images} WHERE filepath = ?`).get(filepath);
    const subcategories: any = db.prepare(`SELECT category,subcategory FROM ${table_name_subcategory_images} WHERE filepath = ?`).all(filepath);
    // Delete
    db.prepare(`DELETE FROM ${table_name_images} WHERE filepath = ?`).run(filepath);
    db.prepare(`DELETE FROM ${table_name_subcategory_images} WHERE filepath = ?`).run(filepath);
    db.prepare(`DELETE FROM ${table_name_playlist_images} WHERE filepath = ?`).run(filepath);
    // Search empty category, drectory and subcategory
    //// category
    const category_image: any = db.prepare(`SELECT filepath FROM ${table_name_images} WHERE category = ?`).all(info.category);
    if (category_image.length == 0)
    {
        db.prepare(`DELETE FROM ${table_name_categories} WHERE category = ?`).run(info.category);
        db.prepare(`DELETE FROM ${table_name_subcategories} WHERE category = ?`).run(info.category);
    }
    //// directory
    const directory_image: any = db.prepare(`SELECT filepath FROM ${table_name_images} WHERE directory = ?`).all(info.directory);
    if (directory_image.length == 0)
    {
        db.prepare(`DELETE FROM ${table_name_directories} WHERE directory = ?`).run(info.directory);
        db.prepare(`DELETE FROM ${table_name_directory_subcategories} WHERE directory = ?`).run(info.directory);
    }
    //// subcategory
    for (let subcategory of subcategories)
    {
        const subcategory_image: any = db.prepare(`SELECT filepath FROM ${table_name_subcategory_images} WHERE category = ? AND subcategory = ?`).all(subcategory.category, subcategory.subcategory);
        if (subcategory_image.length == 0)
        {
            // Delete empty subcategory
            db.prepare(`DELETE FROM ${table_name_subcategories} WHERE category = ? AND subcategory = ?`).run(subcategory.category, subcategory.subcategory);
            db.prepare(`DELETE FROM ${table_name_directory_subcategories} WHERE category = ? AND subcategory = ?`).run(subcategory.category, subcategory.subcategory);
        }
    }
}

export function checkImageExistence(dbname: string)
{
    const db: Database = new DatabaseConstructor(dbname);
    const directories: any = db.prepare(`SELECT directory FROM ${table_name_directories}`).all();
    for (let directory of directories) {
        const filepaths: any = db.prepare(`SELECT filepath FROM ${table_name_images} WHERE directory = ?`).all(directory.directory);
        for (let val of filepaths)
        {
            const filepath: string = val.filepath;
            if (!fs.existsSync(filepath))
            {
                console.log(`Can't find "${filepath}"`);
                // Not found
                deleteImage(dbname, filepath);
            }
        }
    }
}

export type ImagesCount = { 'COUNT(filepath)': number };
export type DirectoriesCount = { 'COUNT(directory)': number };
export type CategoriesCount = { 'COUNT(category)': number };
export type SubCategoriesCount = { 'COUNT(subcategory)': number };
export type PlaylistsCount = { 'COUNT(playlist)': number };

export function getStatsOfTables(dbname: string) : TableStats
{
    const db: Database = new DatabaseConstructor(dbname);
    const images: ImagesCount = db.prepare(`SELECT COUNT(filepath) FROM ${table_name_images}`).get() as ImagesCount;
    const directories: DirectoriesCount = db.prepare(`SELECT COUNT(directory) FROM ${table_name_directories}`).get() as DirectoriesCount;
    const categories: CategoriesCount = db.prepare(`SELECT COUNT(category) FROM ${table_name_categories}`).get() as CategoriesCount;
    const subcategories: SubCategoriesCount = db.prepare(`SELECT COUNT(subcategory) FROM ${table_name_subcategories}`).get() as SubCategoriesCount;
    const playlists: PlaylistsCount = db.prepare(`SELECT COUNT(playlist) FROM ${table_name_playlists}`).get() as PlaylistsCount;
    return {
        images: images['COUNT(filepath)'],
        directories: directories['COUNT(directory)'],
        categories: categories['COUNT(category)'],
        subcategories: subcategories['COUNT(subcategory)'],
        playlists: playlists['COUNT(playlist)'],
    };
}

