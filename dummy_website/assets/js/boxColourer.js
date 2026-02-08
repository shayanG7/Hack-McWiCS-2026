const colors = [
    '#F5E387', //yellow
    '#CBED79', //lime
    '#69A346', //green
    '#46A394', //teal
    '#4657A3', //blue
    '#5946A3', //purple
    '#A34671', //pink
];

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function createNewGroup() {
    const groupCard = document.createElement('div');
    groupCard.className = 'col-lg-3 col-md-6 align-self-center mb-30 trending-items adv';

    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';

    const thumbnailDiv = document.createElement('div');
    thumbnailDiv.className = 'thumb thumb-color';
    thumbnailDiv.style.backgroundColor = getRandomColor();

    const downContent = document.createElement('div');
    downContent.className = 'down-content';

    const category = document.createElement('span');
    category.className = 'category';
    category.innerHTML = '<i class="fa fa-person"></i> x members';

    const title = document.createElement('h4');
    title.textContent = 'Group Title';

    const linkButton = document.createElement('a');
    linkButton.href = 'product-details.html';
    linkButton.innerHTML = 'Open <i class="fa fa-arrow-right"></i>';

    downContent.appendChild(category);
    downContent.appendChild(title);
    downContent.appendChild(linkButton);

    itemDiv.appendChild(thumbnailDiv);
    itemDiv.appendChild(downContent);

    groupCard.appendChild(itemDiv);

    // Find container and the last trending row
    const container = document.querySelector('.section.trending .container .your-groups');
    if (!container) return;

    let rows = container.querySelectorAll('.row.trending-box');
    if (rows.length === 0) {
        // create initial row if missing
        const newRow = document.createElement('div');
        newRow.className = 'row trending-box';
        container.appendChild(newRow);
        rows = container.querySelectorAll('.row.trending-box');
    }

    let lastRow = rows[rows.length - 1];
        const cols = lastRow.querySelectorAll(':scope > [class*="col-"]').length;

    // Bootstrap large screen: 4 columns per row (col-lg-3) -> create new row when full
    if (cols >= 4) {
        const newRow = document.createElement('div');
        newRow.className = 'row trending-box';
        container.appendChild(newRow);
        lastRow = newRow;
    }

    // Insert card immediately (no animations)
    lastRow.appendChild(groupCard);
}

function joinGroup(e) {
    // `e` is the event when used as an event handler; support both direct call and event callback
    const btn = (e && e.currentTarget) ? e.currentTarget : (this && this.classList && this.classList.contains('join-group')) ? this : null;
    if (!btn) return;

    const card = btn.closest('.trending-items');
    if (!card) return;

    // Find your-groups container and ensure a row exists
    const container = document.querySelector('.section.trending .container .your-groups');
    if (!container) return;

    let rows = container.querySelectorAll('.row.trending-box');
    if (rows.length === 0) {
        const newRow = document.createElement('div');
        newRow.className = 'row trending-box';
        container.appendChild(newRow);
        rows = container.querySelectorAll('.row.trending-box');
    }

    let lastRow = rows[rows.length - 1];
    const cols = lastRow.querySelectorAll(':scope > [class*="col-"]').length;
    if (cols >= 4) {
        const newRow = document.createElement('div');
        newRow.className = 'row trending-box';
        container.appendChild(newRow);
        lastRow = newRow;
    }

    // Create a clean clone (preserve classes and inner HTML) to avoid layout issues
    const newCol = document.createElement('div');
    newCol.className = card.className;
    newCol.innerHTML = card.innerHTML;

    // Replace the Join button inside the clone with an Open link
    const joinBtnInClone = newCol.querySelector('.join-group');
    if (joinBtnInClone) {
        const openLink = document.createElement('a');
        openLink.href = 'product-details.html';
        openLink.innerHTML = 'Open <i class="fa fa-arrow-right"></i>';
        joinBtnInClone.replaceWith(openLink);
    }

    // Remove any inline animation styles from clone and original
    newCol.style.transition = '';
    newCol.style.transform = '';
    newCol.style.opacity = '';
    card.style.transition = '';
    card.style.transform = '';
    card.style.opacity = '';

    // Append the clone into Your Groups and remove the original from Discover More
    lastRow.appendChild(newCol);
    card.remove();
}

document.addEventListener('DOMContentLoaded', function () {
    // color existing thumbnails (skip any header-level button areas)
    document.querySelectorAll('.thumb-color').forEach(el => {
        // don't recolor if it's a special button area (no down-content present)
        if (!el.closest('.create-new-group-btn') ) {
            el.style.backgroundColor = getRandomColor();
        }
    });

    const btn = document.getElementById('create-new-group');
    if (btn) btn.addEventListener('click', createNewGroup);
    // wire up existing Join Group buttons
    document.querySelectorAll('.join-group').forEach(b => b.addEventListener('click', joinGroup));
});
