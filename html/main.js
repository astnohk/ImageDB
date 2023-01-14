'use strict';


const url = new URL(window.location.href);
const click_max_interval = 300; // [msec]
var g_current_viewer = null;
var g_dragging = null;
var g_mousedown_time = new Date();
var g_vertical_split = false;
var g_insertbox = null;

const g_playlist_elements = {};

window.onload = () => {
    initVerticalSplitButton();
    initClearImagesButton();
    initSearchBar();

    const category_displayName = {};
    const subcategory_displayName = {};
    const directory_displayName = {};
    const playlist_displayName = {};
    const category_elements = {};
    const directory_elements = {};

    const category_menu_mode = document.getElementById('category_menu_mode')
    category_menu_mode.addEventListener(
        'change',
        (e) => {
            const mode = category_menu_mode.value;
            const categories = document.getElementById('categories');
            // Append to web page
            if (mode === 'Category') {
                for (let i = categories.childElementCount - 1; i >= 0; --i) {
                    categories.removeChild(categories.children[i]);
                }
                setCategoryInCategories(category_elements);
            } else if (mode === 'Directory') {
                for (let i = categories.childElementCount - 1; i >= 0; --i) {
                    categories.removeChild(categories.children[i]);
                }
                setCategoryInCategories(directory_elements);
            } else if (mode === 'Playlist') {
                for (let i = categories.childElementCount - 1; i >= 0; --i) {
                    categories.removeChild(categories.children[i]);
                }
                setCategoryInCategories(g_playlist_elements);
            } else if (mode === 'NewComing') {
                for (let i = categories.childElementCount - 1; i >= 0; --i) {
                    categories.removeChild(categories.children[i]);
                }
                setNewerImagesInCategories();
            }
        });
    // Get list form server
    const getMenuList = () => {
        return fetch(`${url.origin}/getCategoryList`)
            .then(res => res.json()) // { category:, displayName: category_displayName }
            .then(list => {
                list.forEach(row => {
                    category_displayName[row.category] = row.displayName;
                    const category_element = createCategoryElement(row, category_displayName[row.category], categoryNameClickFunction(row.category));
                    category_element.subcategories = {};
                    category_elements[row.category] = category_element;
                });
            })
            .then(res => fetch(`${url.origin}/getSubCategoryList`))
            .then(res => res.json()) // { category:, subcategory:, displayName: subcategory_displayName }
            .then(list => {
                list.forEach(row => {
                    subcategory_displayName[row.subcategory] = row.displayName;
                });
                list.forEach(row => {
                    let category_element = category_elements[row.category];
                    if (!category_element.subcategories[row.subcategory]) {
                        const subcategory = createSubCategoryElement(row);
                        category_element.subcategories[row.subcategory] = subcategory;
                    }
                });
                // Do NOT append to WebGUI yet.
            })
            .catch(err => {
                console.error(err);
            })
            .then(arg => fetch(`${url.origin}/getDirectoryList`))
            .then(res => res.json()) // { directory:, displayName: directory_displayName }
            .then(list => {
                list.forEach(row => {
                    directory_displayName[row.directory] = row.displayName;
                    const directory_element = createCategoryElement(row, directory_displayName[row.directory], directoryNameClickFunction(row.directory));
                    directory_element.subcategories = {};
                    directory_elements[row.directory] = directory_element;
                })
            })
            .then(arg => fetch(`${url.origin}/getDirectorySubCategoryList`))
            .then(res => res.json()) // { directory:, category:, subcategory:, displayName: directory_displayName }
            .then(list => {
                list.forEach(row => {
                    let directory_element = directory_elements[row.directory];
                    if (!directory_element.subcategories[row.subcategory]) {
                        const subcategory = createDirectorySubCategoryElement(row.directory, row.category, row.subcategory, subcategory_displayName[row.subcategory]);
                        directory_element.subcategories[row.subcategory] = subcategory;
                    }
                });
                // Do NOT append to WebGUI yet.
            })
            .catch(err => {
                console.error(err);
            })
            .then(arg => fetch(`${url.origin}/getPlaylistList`))
            .then(res => res.json()) // { playlist: }
            .then(list => {
                list.forEach(row => {
                    row.category = row.playlist; // Use playlist as category
                    if (!g_playlist_elements[row.playlist]) {
                        g_playlist_elements[row.playlist] =
                            createCategoryElement(row, row.playlist, playlistNameClickFunction(row.playlist));
                        g_playlist_elements[row.playlist].addEventListener(
                            'contextmenu',
                            playlistNameClickFunction(row.playlist));
                    }
                });
                // Do NOT append to WebGUI yet.
            })
            .catch(err => {
                console.error(err);
            })
            .then(() => {
                // Update interval
                setTimeout(getMenuList, 30 * 1000);
            });
    };
    // Initialize
    getMenuList()
        .then(() => {
            // Append to web page
            category_menu_mode.dispatchEvent(new Event('change'));
        })
        .catch(err => console.error(err));

    document.getElementById('playlist_buttons_save').addEventListener(
        'click',
        (e) => {
            e.stopPropagation();
            const nameElement = document.getElementById('playlist_buttons_name');
            const name = nameElement.value;
            nameElement.classList.remove('animate');
            if (name.length <= 0) {
                console.error('Any playlist name are NOT specified');
                setTimeout(() => { nameElement.classList.add('animate'); }, 100);
                return;
            }
            const playlist = {
                playlist: name,
                images: [],
            };
            const images = document.getElementById('images');
            let number = 0;
            for (let i = 0; i < images.children.length; ++i) {
                if (images.children[i].className === 'thumbnails') {
                    playlist.images.push({
                        playlist: playlist.playlist,
                        number: number,
                        filepath: images.children[i].originalFilePath, // thumbnail
                    });
                    number += 1;
                }
            }
            fetch(`/savePlaylistImageList`,
                {
                    method: 'POST',
                    body: JSON.stringify(playlist),
                })
                .then(res => res.json())
                .then(res => {
                    if (res.success) {
                        const button = document.getElementById('playlist_buttons_save');
                        // Set animation
                        button.classList.remove('animate');
                        setTimeout(
                            () => button.classList.add('animate'),
                            100);
                    } else {
                        console.error('Failed to save playlist.');
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        });

    window.addEventListener(
        'keydown',
        (e) => {
            e.stopPropagation();
            let key_processed = false;
            if (!!g_current_viewer) {
                if (e.key === 'ArrowLeft') {
                    if (!!g_current_viewer) {
                        key_processed = true;
                        g_current_viewer.changeImage('prev');
                    }
                } else if (e.key === 'ArrowRight') {
                    if (!!g_current_viewer) {
                        key_processed = true;
                        g_current_viewer.changeImage('next');
                    }
                } else if (e.key === 'Delete') {
                    if (!!g_current_viewer) {
                        key_processed = true;
                        g_current_viewer.removeImage();
                    }
                } else if (e.key === 'p') { // Play slideshow
                    if (!!g_current_viewer) {
                        key_processed = true;
                        const slideshow = () => {
                            if (!!g_current_viewer) {
                                g_current_viewer.changeImage('next');
                                setTimeout(
                                    slideshow,
                                    5000);
                            }
                        };
                        slideshow();
                    }
                } else if (e.key === 'r') {
                    if (!!g_current_viewer) {
                        key_processed = true;
                        g_current_viewer.rotateImage(1);
                    }
                }
            }
            if (key_processed) {
                e.preventDefault();
            }
        });
    window.addEventListener(
        'mousemove',
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            const now = new Date();
            if (!!g_dragging) {
                // Dragging
                moveDragImage(e);
            }
        });
    window.addEventListener(
        'mouseup',
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            const now = new Date();
            // Drag end
            if (!!g_dragging) {
                endDragImage(g_dragging);
            }
        });
}

function initVerticalSplitButton()
{
    const button = document.getElementById('vertical_split_button');

    button.addEventListener(
        'click',
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            g_vertical_split = !g_vertical_split;
            if (g_vertical_split) {
                const temporary = document.getElementById('tmp_images');
                temporary.style.width = '50%';
                const images = document.getElementById('playlist_images_wrapper');
                images.style.left = '50%';
                // Append insert empty box
                g_insertbox = createEmptyBox();
                document.getElementById('images').appendChild(g_insertbox);
            } else {
                // Remove insert empty box
                g_insertbox.remove();
                g_insertbox = null;
                const temporary = document.getElementById('tmp_images');
                temporary.style.width = '0%';
                const images = document.getElementById('playlist_images_wrapper');
                images.style.left = '0%';
            }
        });
}

function initClearImagesButton()
{
    const canvas = document.getElementById('clear_images_button');
    const style = canvas.getBoundingClientRect();
    const w = style.width;
    const h  = style.height;
    const r = Math.min(w, h) * 0.5;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgb(0,0,0)';
    ctx.beginPath();
    const angles = 8;
    for (let i = 0; i < angles; ++i) {
        const cos = Math.cos(2 * Math.PI * (i + 0.5) / angles);
        const sin = Math.sin(2 * Math.PI * (i + 0.5) / angles);
        ctx.moveTo(
            w * 0.5 + r * 0.65 * sin,
            h * 0.5 + r * 0.65 * cos);
        ctx.lineTo(
            w * 0.5 + r * 0.9 * sin,
            h * 0.5 + r * 0.9 * cos);
    }
    ctx.stroke();

    canvas.addEventListener('click', clearImages);
}

function initSearchBar()
{
    document.getElementById('search_input')
        .addEventListener('input', searchSearchInputString);
}

function searchSearchInputString()
{
    const input = document.getElementById('search_input')
        .value.toLowerCase();
    if (input.length == 0) {
        // Clear search result (show all elements)
        categories.childNodes.forEach((element) => {
            element.style.display = 'block';
            for (let key of Object.keys(element.subcategories)) {
                element.subcategories[key].style.opacity = '1.0';
            }
        });
    } else {
        // Search
        const categories = document.getElementById('categories');
        categories.childNodes.forEach((element) => {
            let found = false;
            if (element.className === 'category') {
                // Check directory if it is directory element
                if (!!element.directory &&
                    element.directory.toLowerCase().indexOf(input) >= 0)
                {
                    found = true;
                }
                // Check category
                if (element.category.toLowerCase().indexOf(input) >= 0)
                {
                    found = true;
                }
                // Check displayName
                if (element.displayName.toLowerCase().indexOf(input) >= 0)
                {
                    found = true;
                }
                // Check subcategories
                let found_sub = false;
                for (let key of Object.keys(element.subcategories)) {
                    if (found ||
                        element.subcategories[key].subcategory.toLowerCase().indexOf(input) >= 0)
                    {
                        element.subcategories[key].style.opacity = '1.0';
                        found_sub = true;
                    } else {
                        element.subcategories[key].style.opacity = '0.2';
                    }
                }
                // OR
                found = found || found_sub;
            }
            if (found) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    }
}


function createCategoryElement(data, displayName, nameClickFunction)
{
    const category_element = document.createElement('div');
    category_element.className = 'category';
    if (!!data.directory) {
        category_element.directory = data.directory;
    }
    category_element.category = data.category;
    category_element.displayName = displayName;
    category_element.opening = false;
    // Title
    const title = document.createElement('div');
    title.className = 'categoryTitle';
    category_element.appendChild(title);
    // Button
    category_element.buttonElement = createCategoryTitleButton();
    title.appendChild(category_element.buttonElement);
    // Name
    const name = document.createElement('div');
    name.className = 'categoryTitleName';
    name.innerText = displayName;
    name.addEventListener(
        'click',
        nameClickFunction);
    title.appendChild(name);
    // Init Subcategories
    category_element.subcategories = [];

    // Open/Close feature
    category_element.setOpenCloseButtonEventListener = () => {
        if (!!category_element.buttonElement.onclick) {
            return;
        }
        category_element.originalHeight = category_element.getBoundingClientRect().height;
        category_element.style.height = '20px';
        category_element.buttonElement.onclick = (e) => {
            category_element.opening = !category_element.opening;
            if (category_element.opening) {
                category_element.buttonElement.style.rotate = '90deg';
                category_element.style.height = `${category_element.originalHeight}px`;
            } else {
                category_element.buttonElement.style.rotate = '0deg';
                category_element.style.height = '20px';
            }
        };
    };

    return category_element;
}

function categoryNameClickFunction(category)
{
    return (e) => {
        e.preventDefault();
        e.stopPropagation();
        getImagesInCategory(category, []);
    };
}

function directoryNameClickFunction(directory)
{
    return (e) => {
        e.preventDefault();
        e.stopPropagation();
        getImagesInDirectory(directory, null, []);
    };
}

function playlistNameClickFunction(playlist)
{
    return (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.button === 0) { // Left Button
            const wrapper = document.getElementById('playlist_images_wrapper');
            wrapper.style.display = 'inline-block';
            const button = document.getElementById('playlist_buttons_name');
            if (button.value.length <= 0) {
                button.value = playlist;
            }
            getImagesInPlaylist(playlist);
        } else if (e.button === 2) { // Right button
            console.log('open contextmenu');
            openContextmenu(
                e,
                [
                    { name: 'delete', func: () => deletePlaylist(playlist) },
                ]);
        }
    };
}

function deletePlaylist(playlist)
{
    // Delete playlist element from list
    for (let key of Object.keys(g_playlist_elements)) {
        if (g_playlist_elements[key].displayName === playlist) {
            g_playlist_elements[key].remove();
            delete g_playlist_elements[key];
        }
    }
    // Send delete playlist command
    fetch(`/deletePlaylist?playlist=${encodeURIComponent(playlist)}`, { method: 'POST' })
        .then(res => res.json())
        .then(res => {
            if (!res.success) {
                console.error(`Failed to delete playlist ${playlist}.`);
            }
        })
        .catch(err => console.error(err));
}

function openContextmenu(ev, items)
{
    const element = ev.currentTarget;
    const bg = document.createElement('div');
    bg.className = 'clear_background';
    document.body.appendChild(bg);

    const menu = document.createElement('div');
    menu.className = 'contextmenu';
    menu.style.top = `${ev.clientY}px`;
    menu.style.left = `${ev.clientX}px`;
    bg.appendChild(menu);

    for (let item of items) {
        const itemElement = document.createElement('div');
        itemElement.className = 'contextmenu_item';
        itemElement.innerText = item.name;
        itemElement.addEventListener(
            'click',
            (e) => {
                e.stopPropagation();
                e.preventDefault();
                // Close BG and contextmenu
                bg.remove();
                // Call function
                item.func();
            });
        menu.appendChild(itemElement);
    }

    bg.addEventListener(
        'click',
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            bg.remove();
        });
    bg.addEventListener(
        'contextmenu',
        (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
}

function createCategoryTitleButton()
{
    const button = document.createElement('canvas');
    button.className = 'categoryTitleButton';
    button.width = 20;
    button.height = 20;
    button.style.rotate = '0deg';
    const ctx = button.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width * 0.3, ctx.canvas.height * 0.2);
    ctx.lineTo(ctx.canvas.width * 0.7, ctx.canvas.height * 0.5);
    ctx.lineTo(ctx.canvas.width * 0.3, ctx.canvas.height * 0.8);
    ctx.stroke();

    return button;
}

function createSubCategoryElement(data)
{
    const subcategory = document.createElement('div');
    subcategory.className = 'subcategory';
    subcategory.category = data.category;
    subcategory.subcategory = data.subcategory;
    subcategory.displayName = data.displayName;
    subcategory.innerText = `+ ${data.displayName}`;
    subcategory.addEventListener(
        'click',
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            getImagesInCategory(data.category, [ data.subcategory ]);
        });
    return subcategory;
}

function createDirectorySubCategoryElement(directory, category, subcategory, displayName)
{
    const element = document.createElement('div');
    element.className = 'subcategory';
    element.category = category;
    element.subcategory = subcategory;
    element.displayName = displayName;
    element.innerText = `+ ${displayName}`;
    element.addEventListener(
        'click',
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            getImagesInDirectory(directory, category, [ subcategory ]);
        });
    return element;
}

function setCategoryInCategories(category_elements)
{
    let category_elements_keys = Object.keys(category_elements);
    category_elements_keys.sort((a, b) =>
        category_elements[a].displayName.localeCompare(category_elements[b].displayName));
    for (let category of category_elements_keys) {
        const category_element = category_elements[category];
        const subcategoryKeys = Object.keys(category_element.subcategories);
        subcategoryKeys.sort((a, b) => {
                return category_element.subcategories[a].displayName.localeCompare(category_element.subcategories[b].displayName);
            });
        for (let key of subcategoryKeys) {
            category_element.appendChild(category_element.subcategories[key]);
        }
        // Append category list to page
        document.getElementById('categories').appendChild(category_element);
        if (subcategoryKeys.length > 0) {
            // Init button's event listener
            category_element.setOpenCloseButtonEventListener();
        } else {
            category_element.buttonElement.style.cursor = 'default';
            category_element.buttonElement.style.opacity = '0.5';
        }
    }
    // Apply search input
    searchSearchInputString(null);
}

function setNewerImagesInCategories()
{
    const limitCount = 100;
    for (let i = 0; i < 50; ++i) {
        const category_element = createCategoryElement(
            { category: '', },
            `${i * limitCount + 1} - ${(i + 1) * limitCount}`,
            () => { getNewerImages(limitCount, i * limitCount); });
        // Append category list to page
        document.getElementById('categories').appendChild(category_element);
        // Disable pulldown button
        category_element.buttonElement.style.cursor = 'default';
        category_element.buttonElement.style.opacity = '0.5';
    }
}

function getImagesInCategory(category, subcategories)
{
    let query = [];
    for (let subcategory of subcategories) {
        query.push(`subcategory=${encodeURIComponent(subcategory)}`);
    }
    fetch(`${url.origin}/getCategoryImageList?category=${encodeURIComponent(category)}${query.length > 0 ? '&' + query.join('&') : ''}`)
        .then(res => res.json())
        .then(list => {
            if (g_vertical_split) {
                // Clear all thumbnails in tmp_images
                const tmp_images = document.getElementById('tmp_images');
                while (tmp_images.childElementCount > 0) {
                    tmp_images.children[0].remove();
                }
            }
            list.forEach(item => {
                if (g_vertical_split) {
                    document.getElementById('tmp_images').appendChild(
                        createImageThumbnail_temporal(item.filepath, category, subcategories));
                } else {
                    document.getElementById('images').appendChild(
                        createImageThumbnail(item.filepath, category, subcategories));
                }
            });
        });
}

function getImagesInDirectory(directory, category, subcategories)
{
    let query = [];
    for (let subcategory of subcategories) {
        query.push(`subcategory=${encodeURIComponent(subcategory)}`);
    }
    fetch(`${url.origin}/getDirectoryImageList?directory=${encodeURIComponent(directory)}${!!category ? '&category=' + encodeURIComponent(category) : ''}${query.length > 0 ? '&' + query.join('&') : ''}`)
        .then(res => res.json())
        .then(list => {
            if (g_vertical_split) {
                // Clear all thumbnails in tmp_images
                const tmp_images = document.getElementById('tmp_images');
                while (tmp_images.childElementCount > 0) {
                    tmp_images.children[0].remove();
                }
            }
            list.forEach(item => {
                if (g_vertical_split) {
                    document.getElementById('tmp_images').appendChild(
                        createImageThumbnail_temporal(item.filepath, category, subcategories));
                } else {
                    document.getElementById('images').appendChild(
                        createImageThumbnail(item.filepath, category, subcategories));
                }
            });
        });
}

function getImagesInPlaylist(playlist)
{
    fetch(`${url.origin}/getPlaylistImageList?playlist=${encodeURIComponent(playlist)}`)
        .then(res => res.json())
        .then(list => {
            if (g_vertical_split) {
                // Clear all thumbnails in tmp_images
                const tmp_images = document.getElementById('tmp_images');
                while (tmp_images.childElementCount > 0) {
                    tmp_images.children[0].remove();
                }
            }
            list.forEach(item => {
                if (g_vertical_split) {
                    document.getElementById('tmp_images').appendChild(
                        createImageThumbnail_temporal(item.filepath, '', ''));
                } else {
                    document.getElementById('images').appendChild(
                        createImageThumbnail(item.filepath, '', ''));
                }
            });
        });
}

function getNewerImages(limit, offset)
{
    fetch(`${url.origin}/getNewerImageList?limit=${limit}&offset=${offset}`)
        .then(res => res.json())
        .then(list => {
            if (g_vertical_split) {
                // Clear all thumbnails in tmp_images
                const tmp_images = document.getElementById('tmp_images');
                while (tmp_images.childElementCount > 0) {
                    tmp_images.children[0].remove();
                }
            }
            list.forEach(item => {
                if (g_vertical_split) {
                    document.getElementById('tmp_images').appendChild(
                        createImageThumbnail_temporal(item.filepath, '', ''));
                } else {
                    document.getElementById('images').appendChild(
                        createImageThumbnail(item.filepath, '', ''));
                }
            });
        });
}

function createImageThumbnail_temporal(filepath, category, subcategories)
{
    const thumbnail = createImageThumbnailElement(filepath)
    thumbnail.addEventListener(
        'click',
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (g_insertbox) {
                // Click effect by filter-function blur()
                const transitionDuration = 300; // [msec]
                thumbnail.style.transitionDuration = `1ms`;
                thumbnail.style.filter = `blur(4px)`;
                setTimeout(() => {
                    thumbnail.style.transitionDuration = `${transitionDuration}ms`;
                    thumbnail.style.filter = 'blur(0px)';
                }, 60);
                // Create flying thumbnail effect
                const transition = createImageThumbnailElement(thumbnail.originalFilePath);
                transition.style.position = 'absolute';
                transition.style.opacity = '0.6';
                transition.style.zIndex = '95';
                // Set start position
                const style = thumbnail.getBoundingClientRect();
                transition.style.top = `${style.top}px`;
                transition.style.left = `${style.left}px`;
                document.body.appendChild(transition);
                // Set transition property
                transition.style.transitionProperty = 'top, left';
                transition.style.transitionDuration = `${transitionDuration}ms`;
                transition.style.transitionTimingFunction = 'cubic-bezier(0.5, 0.0, 0.9, 0.6)';
                // Set end position and Start transition
                const style_goal = g_insertbox.getBoundingClientRect();
                const borderWidth = parseInt(window.getComputedStyle(g_insertbox).borderWidth, 10);
                const scrollTop = parseInt(document.getElementById('images').scrollTop, 10);
                transition.style.top = `${style_goal.top + borderWidth + scrollTop}px`;
                transition.style.left = `${style_goal.left + borderWidth}px`;
                // Insert new image to "images" before g_insertbox
                // with opacity == 0.0 to hiding until flying thumbnail ends.
                const newImage = createImageThumbnail(filepath, category, subcategories);
                newImage.style.opacity = '0.0';
                document.getElementById('images').insertBefore(
                    newImage,
                    g_insertbox);
                setTimeout(
                    () => {
                        // Show new image just after flying thumbnail landed.
                        newImage.style.opacity = '1.0';
                        // Remove flying thumbnail
                        transition.remove();
                    },
                    transitionDuration);
            }
        });
    thumbnail.info = null;
    thumbnail.addEventListener(
        'mouseover',
        (e) => {
            if (!!thumbnail.info) {
                return;
            }
            thumbnail.info = document.createElement('div');
            thumbnail.info.className = 'image_info';
            const rect = thumbnail.getBoundingClientRect();
            thumbnail.info.style.top = `${rect.bottom - 40}px`;
            thumbnail.info.style.left = `${rect.right - 90}px`;
            let text = `category: ${category}\n`;
            for (let subcategory of subcategories) {
                text += `subcategory: ${subcategory}\n`;
            }
            text += `filepath: ${filepath}`;
            thumbnail.info.innerText = text;
            setTimeout(
                () => {
                    if (!!thumbnail.info) {
                        document.body.appendChild(thumbnail.info);
                    }
                },
                500);
        });
    thumbnail.addEventListener(
        'mouseout',
        (e) => {
            if (!!thumbnail.info) {
                thumbnail.info.remove();
            }
            thumbnail.info = null;
        });

    return thumbnail;
}

function createImageThumbnail(filepath, category, subcategories)
{
    const thumbnail = createImageThumbnailElement(filepath)
    thumbnail.filepath = filepath.replaceAll('\\', '/'); // Convert Win style path to UNIX style
    thumbnail.category = category;
    thumbnail.subcategories = subcategories;

    thumbnail.addEventListener(
        'mousedown',
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            g_mousedown_time = new Date();
            // Dragging
            startDragImage(thumbnail);
        });
    thumbnail.addEventListener(
        'click',
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            openImageViewer(thumbnail);
        });
    thumbnail.info = null;
    thumbnail.addEventListener(
        'mouseover',
        (e) => {
            if (!!thumbnail.info) {
                return;
            }
            thumbnail.info = document.createElement('div');
            thumbnail.info.className = 'image_info';
            const rect = thumbnail.getBoundingClientRect();
            //const root_rect = document.getElementById('images').getBoundingClientRect();
            //thumbnail.info.style.top = `${rect.bottom - root_rect.top - 40}px`;
            //thumbnail.info.style.left = `${rect.right - root_rect.left - 90}px`;
            thumbnail.info.style.top = `${rect.bottom - 40}px`;
            thumbnail.info.style.left = `${rect.right - 90}px`;
            let text = `category: ${category}\n`;
            for (let subcategory of subcategories) {
                text += `subcategory: ${subcategory}\n`;
            }
            text += `filepath: ${filepath}`;
            thumbnail.info.innerText = text;
            setTimeout(
                () => {
                    if (!!thumbnail.info) {
                        document.body.appendChild(thumbnail.info);
                    }
                },
                500);
        });
    thumbnail.addEventListener(
        'mouseout',
        (e) => {
            if (!!thumbnail.info) {
                thumbnail.info.remove();
            }
            thumbnail.info = null;
        });

    return thumbnail;
}

function createImageThumbnailElement(filepath)
{
    const thumbnail = document.createElement('img');
    thumbnail.className = 'thumbnails';
    thumbnail.imageRotation = 0;
    thumbnail.src = `/getThumbnailImage?filepath=${encodeURIComponent(filepath)}`;
    thumbnail.originalSourceURL = `/getImage?filepath=${encodeURIComponent(filepath)}`;
    thumbnail.originalFilePath = filepath;

    return thumbnail;
}

function createEmptyBox()
{
    const emptybox = document.createElement('div');
    emptybox.className = 'emptybox';

    emptybox.addEventListener(
        'mousedown',
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            g_mousedown_time = new Date();
            // Dragging
            startDragImage(emptybox);
        });

    return emptybox;
}

function openImageViewer(thumbnail)
{
    const viewer = document.createElement('div');
    viewer.className = 'fullscreen_viewer';
    document.body.appendChild(viewer);
    // Image element
    viewer.image = document.createElement('img');
    viewer.image.src = thumbnail.originalSourceURL;
    viewer.image.className = 'fullscreen_viewer_image';
    viewer.appendChild(viewer.image);
    // Title element
    viewer.titleElement = document.createElement('div');
    viewer.titleElement.className = 'fullscreen_viewer_title';
    viewer.titleElement.innerText = `${thumbnail.filepath}`;
    viewer.appendChild(viewer.titleElement);

    viewer.changeImage = (direction) => {
        const images = document.getElementById('images');
        const children = [];
        images.childNodes.forEach((element) => {
            if (element.className === 'thumbnails') {
                children.push(element);
            }
        });
        let ind = -1;
        if (children.length > 0) {
            for (let i = 0; i < children.length; ++i) {
                if (children[i] == thumbnail) {
                    ind = i;
                    break;
                }
            }
            if (direction === 'prev') {
                ind -= 1;
                if (ind < 0) {
                    ind += children.length;
                }
            } else if (direction === 'next') {
                ind += 1;
                ind = ind % children.length;
            }
        }
        // Update to new src
        if (ind >= 0) {
            thumbnail = children[ind];
            viewer.image.src = thumbnail.originalSourceURL;
            viewer.rotateImage(0);
            viewer.titleElement.innerText = `${thumbnail.filepath}`;
        }
    };
    viewer.removeImage = () => {
        const images = document.getElementById('images');
        let removeTarget = thumbnail;
        let ind = -1;
        const children = [];
        images.childNodes.forEach((element) => {
            if (element.className === 'thumbnails') {
                children.push(element);
            }
        });
        if (children.length > 0) {
            for (let i = 0; i < children.length; ++i) {
                if (children[i] == thumbnail) {
                    ind = i;
                    break;
                }
            }
            ind = (ind + 1) % children.length;
        }
        // Move to next image
        if (ind >= 0 &&
            children[ind] != thumbnail)
        {
            // Update to new src
            thumbnail = children[ind];
            viewer.image.src = thumbnail.originalSourceURL;
            viewer.rotateImage(0);
            viewer.titleElement.innerText = `${thumbnail.filepath}`;
        } else {
            viewer.remove();
        }
        // Remove thumbnail
        removeTarget.remove();
    };
    viewer.rotateImage = (rotate) => {
        thumbnail.imageRotation = (thumbnail.imageRotation + rotate) % 4;
        if (thumbnail.imageRotation == 0) {
            viewer.image.style.rotate = '0deg';
            viewer.image.style.top = '0px';
            viewer.image.style.left = '0px';
            viewer.image.style.width = '100%';
            viewer.image.style.height = '100%';
        } else if (thumbnail.imageRotation == 1) {
            viewer.image.style.rotate = '90deg';
            viewer.image.style.top = `${Math.floor((window.innerWidth - window.innerHeight) * -0.5)}px`;
            viewer.image.style.left = `${Math.floor((window.innerHeight - window.innerWidth) * -0.5)}px`;
            viewer.image.style.width = `${window.innerHeight + 1}px`;
            viewer.image.style.height = `${window.innerWidth + 1}px`;
        } else if (thumbnail.imageRotation == 2) {
            viewer.image.style.rotate = '180deg';
            viewer.image.style.top = '0px';
            viewer.image.style.left = '0px';
            viewer.image.style.width = '100%';
            viewer.image.style.height = '100%';
        } else if (thumbnail.imageRotation == 3) {
            viewer.image.style.rotate = '270deg';
            viewer.image.style.top = `${Math.floor((window.innerWidth - window.innerHeight) * -0.5)}px`;
            viewer.image.style.left = `${Math.floor((window.innerHeight - window.innerWidth) * -0.5)}px`;
            viewer.image.style.width = `${window.innerHeight + 1}px`;
            viewer.image.style.height = `${window.innerWidth + 1}px`;
        }
    };
    // Event Listeners
    viewer.addEventListener('click', (e) => {
        g_current_viewer = null;
        viewer.remove();
    });
    viewer.addEventListener('wheel', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY > 0) {
            viewer.changeImage('next');
        } else if (e.deltaY < 0) {
            viewer.changeImage('prev');
        }
    });
    let touches = [];
    let dx = 0;
    let dy = 0;
    viewer.addEventListener(
        'touchstart',
        (e) => {
            e.stopPropagation();
            touches = e.touches;
            dx = 0;
            dy = 0;
        });
    viewer.addEventListener(
        'touchmove',
        (e) => {
            e.stopPropagation();
            const w = window.innerWidth;
            const h = window.innerHeight;
            dx += e.touches[0].clientX - touches[0].clientX;
            dy += e.touches[0].clientY - touches[0].clientY;
            if (dx < -w * 0.1) {
                viewer.changeImage('prev');
                dx = 0;
            } else if (dx > w * 0.1) {
                viewer.changeImage('next');
                dx = 0;
            }
            if (dy < -h * 0.4) {
                viewer.removeImage();
                dy = 0;
            }
            touches = e.touches;
        });

    g_current_viewer = viewer;
    // Apply rotation
    viewer.rotateImage(0);
}

function startDragImage(image)
{
    if (!image) {
        return;
    }
    g_dragging = image;
    g_dragging.style.opacity = '0.5';
    g_dragging.style.outlineStyle = 'dashed';
}

function moveDragImage(e)
{
    const now = new Date();
    if (now - g_mousedown_time < click_max_interval) {
        // Do NOT move the image
        return;
    }
    const images = document.getElementById('images');
    let left_index = -1;
    let right_index = -1;
    for (let i = 0; i < images.children.length; ++i) {
        if (images.children[i] == g_dragging) {
            continue;
        }
        const rect = images.children[i].getBoundingClientRect();
        // Search nearest left or right element
        if (rect.top <= e.clientY && e.clientY <= rect.bottom) {
            const center = (rect.left + rect.right) * 0.5;
            if (center < e.clientX) {
                // Update nearer left element
                left_index = i;
            } else if (right_index < 0 && e.clientX < center) {
                // Set nearest right element
                right_index = i;
            }
        }
        if (rect.top > e.clientY) {
            break;
        }
    }
    // Move emptyBox
    if (right_index < 0 && left_index >= 0) {
        if (left_index + 1 < images.children.length) {
            right_index = left_index + 1;
        }
    }
    // There are no other images
    const right = right_index >= 0 ? images.children[right_index] : null;
    images.insertBefore(g_dragging, right);
}

function endDragImage(image)
{
    g_dragging.style.opacity = '1.0';
    g_dragging.style.outlineStyle = 'none';
    g_dragging = null;
}

function clearImages()
{
    const images = document.getElementById('images');
    let ind = 0;
    while (images.childElementCount > ind) {
        if (images.children[ind].className === 'thumbnails') {
            images.children[ind].remove();
        } else {
            ind += 1;
        }
    }
    // Clear playlist name
    document.getElementById('playlist_buttons_name').value = '';
}

