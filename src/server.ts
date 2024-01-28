import https from 'node:https';
import fsPromises from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import * as constant from './const.js';
import * as database from './db.js';
import * as utils from './utils.js';

let http_port = 8443;

const dbname = 'main.db';

if (process.argv.length >= 4) {
    if (process.argv[2] === '--port') {
        http_port = parseInt(process.argv[3], 10);
    }
}



const server = https.createServer({
    cert: fs.readFileSync('certs/server.crt'),
    key: fs.readFileSync('certs/server.key'),
});
server.on('request', (request, response) => {
    const url = new URL(`https://localhost${request.url}`);
    console.log(request.url);
    let postdata = '';
    request.on('data', (chunk) => {
        postdata = postdata.concat(chunk);
    });
    request.on('end', () => {
        try
        {
            if (url.pathname === '/getCategoryList')
            {
                database.getCategoryList(dbname)
                    .then(values => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(values);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            }
            else if (url.pathname === '/getDirectoryList')
            {
                database.getDirectoryList(dbname)
                    .then(values => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(values);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            }
            else if (url.pathname === '/getSubCategoryList')
            {
                database.getSubCategoryList(dbname)
                    .then(values => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(values);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            }
            else if (url.pathname === '/getDirectorySubCategoryList')
            {
                database.getDirectorySubCategoryList(dbname)
                    .then(values => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(values);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            }
            else if (url.pathname === '/getPlaylistList')
            {
                database.getPlaylistList(dbname)
                    .then(values => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(values);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            }
            else if (url.pathname === '/getImage')
            {
                const filepath = url.searchParams.get('filepath');
                loadImage(decodeURIComponent(filepath !== null ? filepath : ""))
                    .then((image: constant.ImageFile) => {
                        response.writeHead(200, { "Content-Type": image.MIMEType });
                        response.end(image.file);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            }
            else if (url.pathname === '/getImageInfo')
            {
                const filepath = url.searchParams.get('filepath');
                database.getImageInfo(dbname, decodeURIComponent(filepath !== null ? filepath : ""))
                    .then(values => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(values);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            }
            else if (url.pathname === '/getThumbnailImage')
            {
                const filepath = url.searchParams.get('filepath');
                database.getThumbnailImage(dbname, decodeURIComponent(filepath !== null ? filepath : ""))
                    .then((image: constant.ImageFile) => {
                        response.writeHead(200, { "Content-Type": image.MIMEType });
                        response.end(image.file);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            }
            else if (url.pathname === '/getCategoryImageList')
            {
                const category = url.searchParams.get('category');
                const subcategory = url.searchParams.getAll('subcategory');
                database.getCategoryImageList(
                        dbname,
                        decodeURIComponent(category !== null ? category : ""),
                        subcategory !== null ? subcategory : [""],
                    )
                    .then(values => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(values);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            }
            else if (url.pathname === '/getDirectoryImageList')
            {
                const directory: string | null = url.searchParams.get('directory');
                const category: string | null = url.searchParams.get('category');
                const subcategories: string[] | null = url.searchParams.getAll('subcategory');
                database.getDirectoryImageList(
                        dbname,
                        directory !== null ? directory : "",
                        category !== null ? category : "",
                        subcategories !== null ? subcategories : []
                    )
                    .then(values => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(values);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            }
            else if (url.pathname === '/getNewerImageList')
            {
                const limit_s: string | null = url.searchParams.get('limit');
                const offset_s: string | null = url.searchParams.get('offset');
                const limit = parseInt(limit_s !== null ? limit_s : "0", 10);
                const offset = parseInt(offset_s !== null ? offset_s : "0", 10);
                database.getNewerImageList(dbname, limit, offset)
                    .then(values => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(values);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            }
            else if (url.pathname === '/getPlaylistImageList')
            {
                const playlist = url.searchParams.get('playlist');
                database.getPlaylistImageList(
                        dbname,
                        decodeURIComponent(playlist !== null ? playlist : "")
                    )
                    .then(values => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(values);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end('500 Interval Server Error');
                    });
            }
            else if (url.pathname === '/savePlaylistImageList')
            {
                database.savePlaylistImageList(
                        dbname,
                        JSON.parse(postdata)
                    )
                    .then(result => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(result);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "application/json" });
                        response.end(JSON.stringify(
                            { success: false, message: '500 Interval Server Error' }
                        ));
                    });
            }
            else if (url.pathname === '/deletePlaylist')
            {
                const playlist: string | null = url.searchParams.get('playlist');
                database.deletePlaylist(
                        dbname,
                        playlist !== null ? playlist : ""
                    )
                    .then(result => {
                        response.writeHead(200, { "Content-Type": "application/json" });
                        const body = JSON.stringify(result);
                        response.end(body);
                    })
                    .catch(err => {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "application/json" });
                        response.end(JSON.stringify(
                            { success: false, message: '500 Interval Server Error' }
                        ));
                    });
            }
            else if (url.pathname === '/')
            {
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
            }
            else
            {
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
        }
        catch (err)
        {
            console.error(err);
            response.writeHead(500, { "Content-Type": "text/plain" });
            const body = '500 Interval Server Error';
            response.end(body);
        }
    });
});


function loadImage(filepath: string)
{
    return new Promise<constant.ImageFile>(async (resolve, reject) => {
        try {
            if (!database.checkImageFilepath(dbname, filepath)) {
                // Filepath is not registered
                reject();
            }
            const file: Buffer | string = fs.readFileSync(filepath);
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


// Initial access to DB
database.getDirectoryImageList(
        dbname,
        "null",
        "null",
        []
    )
    .then(() => {});
// Start HTTPS server
server.listen(http_port);

