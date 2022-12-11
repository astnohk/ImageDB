'use strict';


const url = new URL(window.location.href);
const click_max_interval = 300; // [msec]
var g_current_viewer = null;
var g_dragging = null;
var g_mousedown_time = new Date();


window.onload = () => {
    const category_displayName = {};
    const subcategory_displayName = {};
    const directory_displayName = {};
    const category_elements = {};
    const directory_elements = {};
    fetch(`${url.origin}/getCategoryList`)
        .then(res => res.json()) // { category:, displayName: category_displayName }
        .then(list => {
            list.forEach(row => {
                category_displayName[row.category] = row.displayName;
            });
        })
        .then(res => fetch(`${url.origin}/getSubCategoryList`))
        .then(res => res.json()) // { category:, subcategory:, displayName: subcategory_displayName }
        .then(list => {
            list.forEach(row => {
                subcategory_displayName[row.subcategory] = row.displayName;
            });
            list.forEach(row => {
                let category_element = null;
                if (!!category_elements[row.category]) {
                    category_element = category_elements[row.category];
                } else {
                    category_element = createCategoryElement(row, category_displayName[row.category], categoryNameClickFunction(row.category));
                    category_elements[row.category] = category_element;
                }
                const subcategory = createSubCategoryElement(row);
                category_element.subcategories.push(subcategory);
            });
            // Append to web page
            setCategoryInCategories(category_elements);
        })
        .catch(err => {
            console.error(err);
        })
        .then(arg => fetch(`${url.origin}/getDirectoryList`))
        .then(res => res.json()) // { directory:, displayName: directory_displayName }
        .then(list => {
            list.forEach(row => {
                directory_displayName[row.directory] = row.displayName;
            })
        })
        .then(arg => fetch(`${url.origin}/getDirectorySubCategoryList`))
        .then(res => res.json()) // { directory:, category:, subcategory:, displayName: directory_displayName }
        .then(list => {
            list.forEach(row => {
                let directory_element = null;
                if (!!directory_elements[row.directory]) {
                    directory_element = directory_elements[row.directory];
                } else {
                    directory_element = createCategoryElement(row, directory_displayName[row.directory], directoryNameClickFunction(row.directory));
                    directory_elements[row.directory] = directory_element;
                }
                const subcategory = createDirectorySubCategoryElement(row.directory, row.category, [ row.subcategory ], subcategory_displayName[row.subcategory]);
                directory_element.subcategories.push(subcategory);
            });
            // Do NOT append to list yet.
        })
        .catch(err => {
            console.error(err);
        });

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
            }
        });

    window.addEventListener(
        'keydown',
        (e) => {
            e.stopPropagation();
            let key_processed = false;
            if (!!g_current_viewer) {
                if (e.key === 'ArrowLeft') {
                    key_processed = true;
                    g_current_viewer.changeImage('prev');
                } else if (e.key === 'ArrowRight') {
                    key_processed = true;
                    g_current_viewer.changeImage('next');
                } else if (e.key === 'Delete') {
                    key_processed = true;
                    g_current_viewer.removeImage();
                } else if (e.key === 'r') {
                    key_processed = true;
                    g_current_viewer.rotateImage(1);
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

function createCategoryElement(data, displayName, nameClickFunction)
{
    const category_element = document.createElement('div');
    category_element.className = 'category';
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

function createDirectorySubCategoryElement(directory, category, subcategories, displayName)
{
    const subcategory = document.createElement('div');
    subcategory.className = 'subcategory';
    subcategory.displayName = displayName;
    subcategory.innerText = `+ ${displayName}`;
    subcategory.addEventListener(
        'click',
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            getImagesInDirectory(directory, category, subcategories);
        });
    return subcategory;
}

function setCategoryInCategories(category_elements)
{
    let category_elements_keys = Object.keys(category_elements);
    category_elements_keys.sort();
    for (let category of category_elements_keys) {
        const category_element = category_elements[category];
        category_element.subcategories.sort((a, b) => {
                return a.displayName.localeCompare(b.displayName);
                });
        for (let subcategory of category_element.subcategories) {
            category_element.appendChild(subcategory);
        }
        // Append category list to page
        document.getElementById('categories').appendChild(category_element);
        // Init button's event listener
        category_element.setOpenCloseButtonEventListener();
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
            list.forEach(item => {
                document.getElementById('images').appendChild(
                    createImageThumbnail(item.filepath, category, subcategories));
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
            list.forEach(item => {
                document.getElementById('images').appendChild(
                    createImageThumbnail(item.filepath, category, subcategories));
            });
        });
}

function createImageThumbnail(filepath, category, subcategories)
{
    const thumbnail = document.createElement('img');
    thumbnail.className = 'thumbnails';
    thumbnail.imageRotation = 0;
    thumbnail.src = `/getImage?filepath=${encodeURIComponent(filepath)}`;
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

function openImageViewer(thumbnail)
{
    const viewer = document.createElement('img');
    viewer.className = 'fullscreen_viewer';
    viewer.src = thumbnail.src;
    viewer.changeImage = (direction) => {
        const images = document.getElementById('images');
        let ind = -1;
        if (images.children.length > 0) {
            for (let i = 0; i < images.children.length; ++i) {
                if (images.children[i] == thumbnail) {
                    ind = i;
                    break;
                }
            }
            if (direction === 'prev') {
                ind -= 1;
                if (ind < 0) {
                    ind += images.children.length;
                }
            } else if (direction === 'next') {
                ind += 1;
                ind = ind % images.children.length;
            }
        }
        // Update to new src
        if (ind >= 0) {
            thumbnail = images.children[ind];
            viewer.src = thumbnail.src;
            viewer.rotateImage(0);
        }
    };
    viewer.removeImage = () => {
        const images = document.getElementById('images');
        let removeTarget = thumbnail;
        let ind = -1;
        if (images.children.length > 0) {
            for (let i = 0; i < images.children.length; ++i) {
                if (images.children[i] == thumbnail) {
                    ind = i;
                    break;
                }
            }
            ind = (ind + 1) % images.children.length;
        }
        // Move to next image
        if (ind >= 0 && images.children[ind] != thumbnail) {
            // Update to new src
            thumbnail = images.children[ind];
            viewer.src = thumbnail.src;
            viewer.rotateImage(0);
        } else {
            viewer.remove();
        }
        // Remove thumbnail
        removeTarget.remove();
    };
    viewer.rotateImage = (rotate) => {
        thumbnail.imageRotation = (thumbnail.imageRotation + rotate) % 4;
        if (thumbnail.imageRotation == 0) {
            viewer.style.rotate = '0deg';
            viewer.style.top = '0px';
            viewer.style.left = '0px';
            viewer.style.width = '100%';
            viewer.style.height = '100%';
        } else if (thumbnail.imageRotation == 1) {
            viewer.style.rotate = '90deg';
            viewer.style.top = `${Math.floor((window.innerWidth - window.innerHeight) * -0.5)}px`;
            viewer.style.left = `${Math.floor((window.innerHeight - window.innerWidth) * -0.5)}px`;
            viewer.style.width = `${window.innerHeight + 1}px`;
            viewer.style.height = `${window.innerWidth + 1}px`;
        } else if (thumbnail.imageRotation == 2) {
            viewer.style.rotate = '180deg';
            viewer.style.top = '0px';
            viewer.style.left = '0px';
            viewer.style.width = '100%';
            viewer.style.height = '100%';
        } else if (thumbnail.imageRotation == 3) {
            viewer.style.rotate = '270deg';
            viewer.style.top = `${Math.floor((window.innerWidth - window.innerHeight) * -0.5)}px`;
            viewer.style.left = `${Math.floor((window.innerHeight - window.innerWidth) * -0.5)}px`;
            viewer.style.width = `${window.innerHeight + 1}px`;
            viewer.style.height = `${window.innerWidth + 1}px`;
        }
    };
    // Event Listeners
    viewer.addEventListener('click', (e) => { viewer.remove(); });
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
    document.body.appendChild(viewer);
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

