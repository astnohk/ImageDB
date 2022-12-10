import https from 'node:https';
import fsPromises from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import * as database from './db.js';
import * as utils from './utils.js';


const dbname = 'main.db';


const server = https.createServer({
    cert: fs.readFileSync('certs/server.crt'),
    key: fs.readFileSync('certs/server.key'),
});
server.on('request', (request, response) => {
    const url = new URL(`https://localhost${request.url}`);
    request.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    request.on('end', () => {
        try {
            if (url.pathname === '/getCategoryList') {
                database.getCategoryList(dbname)
                    .then(categories => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(categories);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            } else if (url.pathname === '/getSubCategoryList') {
                database.getSubCategoryList(dbname)
                    .then(subcategories => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(subcategories);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            } else if (url.pathname === '/getImageList') {
                database.getImageList(dbname)
                    .then(images => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(images);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            } else if (url.pathname === '/getImage') {
                loadImage(decodeURIComponent(url.searchParams.get('filepath')))
                    .then(image => {
                        response.writeHead(200, { "Content-Type": image.MIMEType });
                        response.end(image.file);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            } else if (url.pathname === '/getCategoryImageList') {
                database.getCategoryImageList(dbname, url.searchParams.get('category'), url.searchParams.getAll('subcategory'))
                    .then(images => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(images);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            } else if (url.pathname === '/') {
                fsPromises.readFile('html/index.html', { encoding: 'utf-8' })
                    .then(file => {
                        response.writeHead(200, { "Content-Type": "text/html" });
                        response.end(file);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            } else {
                if (url.pathname === '/main.js') {
                    fsPromises.readFile('html/main.js', { encoding: 'utf-8' })
                        .then(file => {
                            response.writeHead(200, { "Content-Type": "text/javascript" });
                            response.end(file);
                        })
                        .catch(err => {
                            console.error(err);
                            response.writeHead(500, { "Content-Type": "text/plain" });
                            response.end('500 Interval Server Error');
                        });
                } else {
                    response.writeHead(200, { "Content-Type": "text/plain" });
                    response.end('null');
                }
            }
        } catch (err) {
            console.error(err);
            response.writeHead(500, { "Content-Type": "text/plain" });
            const body = '500 Interval Server Error';
            response.end(body);
        }
    });
});


function loadImage(filepath)
{
    return new Promise((resolve, reject) => {
        try {
            const file = fs.readFileSync(filepath);
            let mime = '';
            const ext = path.extname(filepath).toLowerCase();
            if (ext === '.bmp') {
                mime = 'image/bmp';
            } else if (ext === '.gif') {
                mime = 'image/gif';
            } else if (ext === '.jpg' || ext === '.jpeg') {
                mime = 'image/jpeg';
            } else if (ext === '.png') {
                mime = 'image/png';
            }
            resolve({
                file: file,
                MIMEType: mime,
            });
        } catch (err) {
            console.error(`loadImage(${filepath}): ${err}`);
            reject();
        }
    });
}



server.listen('8443');
