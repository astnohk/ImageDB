'use strict';


const url = new URL(window.location.href);
const click_max_interval = 300; // [msec]
var g_current_viewer = null;
var g_dragging = null;
var g_mousedown_time = new Date();


window.onload = () => {
    const category_displayName = {};
    const category_elements = {};
    fetch(`${url.origin}/getCategoryList`)
        .then(res => res.json())
        .then(list => {
            list.forEach(row => {
                category_displayName[row.category] = row.displayName;
            });
        })
        .then(res => fetch(`${url.origin}/getSubCategoryList`))
        .then(res => res.json())
        .then(list => {
            list.forEach(data => {
                let category_element = null;
                if (!!category_elements[data.category]) {
                    category_element = category_elements[data.category];
                } else {
                    category_element = document.createElement('div');
                    category_element.className = 'category';
                    category_element.opening = false;
                    // Title
                    const title = document.createElement('div');
                    title.className = 'categoryTitle';
                    category_element.appendChild(title);
                    // Button
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
                    category_element.buttonElement = button;
                    title.appendChild(button);
                    // Name
                    const name = document.createElement('div');
                    name.className = 'categoryTitleName';
                    name.innerText = category_displayName[data.category];
                    title.appendChild(name);

                    category_element.subcategories = [];
                    category_elements[data.category] = category_element;
                }
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
                category_element.subcategories.push(subcategory);
            });
            // Append to web page
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
                // Append list to page
                document.getElementById('categories').appendChild(category_element);
                // Open/Close feature
                category_element.originalHeight = category_element.getBoundingClientRect().height;
                category_element.style.height = '20px';
                category_element.buttonElement.addEventListener(
                    'click',
                    (e) => {
                        category_element.opening = !category_element.opening;
                        if (category_element.opening) {
                            category_element.buttonElement.style.rotate = '90deg';
                            category_element.style.height = `${category_element.originalHeight}px`;
                        } else {
                            category_element.buttonElement.style.rotate = '0deg';
                            category_element.style.height = '20px';
                        }
                    });
            }
        })
        .catch(err => {
            console.error(err);
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

function getImagesInCategory(category, subcategories)
{
    let query = [];
    for (let subcategory of subcategories) {
        query.push(`subcategory=${subcategory}`);
    }
    fetch(`${url.origin}/getCategoryImageList?category=${category}&${query.join('&')}`)
        .then(res => res.json())
        .then(list => {
            list.forEach(item => {
                document.getElementById('images').appendChild(
                    createImageThumbnail(`${url.origin}/getImage?filepath=${encodeURIComponent(item.filepath)}`));
            });
        });
}

function createImageThumbnail(image_url)
{
    const thumbnail = document.createElement('img');
    thumbnail.className = 'thumbnails';
    thumbnail.src = image_url;
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

    return thumbnail;
}

function openImageViewer(thumbnail)
{
    const viewer = document.createElement('img');
    viewer.className = 'fullscreen_viewer';
    viewer.src = thumbnail.src;
    viewer.changeImage = (direction) => {
        const images = document.getElementById('images');
        let ind = 0;
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
        ind = Math.min(images.children.length - 1, Math.max(0, ind));
        // Update to new src
        if (ind >= 0) {
            thumbnail = images.children[ind];
            viewer.src = thumbnail.src;
        }
    };
    viewer.removeImage = () => {
        const images = document.getElementById('images');
        let ind = 0;
        for (let i = 0; i < images.children.length; ++i) {
            if (images.children[i] == thumbnail) {
                ind = i;
                break;
            }
        }
        ind = Math.min(images.children.length - 1, Math.max(0, ind));
        // Move to next image
        if (ind >= 0) {
            // Update to new src
            thumbnail = images.children[ind];
            viewer.src = thumbnail.src;
        } else {
            viewer.remove();
        }
        // Remove thumbnail
        thumbnail.remove();
    };
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
    g_current_viewer = viewer;
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

