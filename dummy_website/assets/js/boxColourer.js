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

        // insert after the last column to avoid accidental nesting issues
        const lastCol = lastRow.querySelector(':scope > [class*="col-"]:last-child');
        if (lastCol) {
            lastCol.insertAdjacentElement('afterend', groupCard);
        } else {
            lastRow.appendChild(groupCard);
        }
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
});
