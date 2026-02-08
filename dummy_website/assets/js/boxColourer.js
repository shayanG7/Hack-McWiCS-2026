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

// Create a new group column from a provided title (used by modal confirm)
// holds data URL of selected photo while modal is open
let _selectedGroupImageData = null;

// Create a new group column from a provided title (used by modal confirm)
function createGroupFromTitle(groupTitle, imageDataUrl, saveToStorage = true, color = null, id = null, tags = '', prompt = '') {
    if (!groupTitle) return;
    const groupId = id || (Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36));
    
    const groupCard = document.createElement('div');
    groupCard.className = 'col-lg-3 col-md-6 align-self-center mb-30 trending-items adv';
    
    // attach id if provided (used for storage lookup)
    groupCard.dataset.groupId = groupId;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';

    const thumbnailDiv = document.createElement('div');
    thumbnailDiv.className = 'thumb thumb-color';
    
    if (imageDataUrl) {
        thumbnailDiv.style.backgroundImage = `url(${imageDataUrl})`;
        thumbnailDiv.style.backgroundSize = 'cover';
        thumbnailDiv.style.backgroundPosition = 'center';
    } else {
        if (color) thumbnailDiv.style.backgroundColor = color;
        else thumbnailDiv.style.backgroundColor = getRandomColor();
    }

    const downContent = document.createElement('div');
    downContent.className = 'down-content';

    const category = document.createElement('span');
    category.className = 'category'; //members
    category.innerHTML = '<i class="fa fa-person"></i> 1 members';

    const title = document.createElement('h4');
    title.textContent = groupTitle;

    //open button
    const linkButton = document.createElement('a');
    linkButton.href = `news-group.html?groupId=${encodeURIComponent(groupId)}`;
    linkButton.innerHTML = 'Open <i class="fa fa-arrow-right"></i>';

    // Leave button
    const leaveBtn = document.createElement('button');
    leaveBtn.type = 'button';
    leaveBtn.className = 'leave-group';
    leaveBtn.textContent = 'Leave';
    leaveBtn.addEventListener('click', function (ev) {
        ev.preventDefault();
        const col = leaveBtn.closest('.trending-items');
        if (!col) return;
        const gid = col.dataset.groupId || null;
        // move back to Discover More
        moveGroupToDiscover(col);
        if (gid) {
            const groups = getSavedGroups().filter(g => g.id !== gid);
            saveGroups(groups);
        }
    });

    //attatching everything to groupCard
    downContent.appendChild(category); //members
    downContent.appendChild(title);
    downContent.appendChild(linkButton);
    downContent.appendChild(leaveBtn);

    itemDiv.appendChild(thumbnailDiv);
    itemDiv.appendChild(downContent);

    groupCard.appendChild(itemDiv);

    // Find Your Groups
    const container = document.querySelector('.section.trending .container .your-groups');
    if (!container) return;

    //rows = row trending box (one entire row)
    let rows = container.querySelectorAll('.row.trending-box');
    if (rows.length === 0) {
        // create initial row if missing
        const newRow = document.createElement('div');
        newRow.className = 'row trending-box';
        container.appendChild(newRow); //container = Your Groups
        rows = container.querySelectorAll('.row.trending-box'); //make new row, reassign rows
    }

    let lastRow = rows[rows.length - 1];
    const cols = lastRow.querySelectorAll('.trending-items').length;

    // Bootstrap large screen: 4 columns per row (col-lg-3) -> create new row when full
    if (cols >= 4) {
        const newRow = document.createElement('div');
        newRow.className = 'row trending-box';
        container.appendChild(newRow);
        lastRow = newRow;
    }

    // Insert card immediately (no animations)
    lastRow.appendChild(groupCard);

    // Save to localStorage if requested
    if (saveToStorage) {
        const colorUsed = imageDataUrl ? null : thumbnailDiv.style.backgroundColor || color || null;
        const groups = getSavedGroups();
        groups.push({
            id: groupId,
            title: groupTitle,
            imageDataUrl: imageDataUrl || null,
            color: colorUsed,
            tags: tags || '',
            prompt: prompt || ''
        });
        saveGroups(groups);
    }
}

function getSavedGroups() {
    try {
        const raw = localStorage.getItem('notable_groups');
        if (!raw) return [];
        return JSON.parse(raw) || [];
    } catch (e) { return []; }
}

function saveGroups(arr) {
    try { localStorage.setItem('notable_groups', JSON.stringify(arr)); } catch (e) { /* ignore */ }
}

function addGroupToStorage(obj) {
    const groups = getSavedGroups();
    groups.push(obj);
    saveGroups(groups);
}

function loadSavedGroups() {
    const groups = getSavedGroups();
    if (!groups || !groups.length) return;
    groups.forEach(g => {
        // create DOM without re-saving; include stored id so leave can remove it
        createGroupFromTitle(
            g.title,
            g.imageDataUrl || null,
            false,
            g.color || null,
            g.id || null,
            g.tags || '',
            g.prompt || ''
        );
    });
}

// Show the create-group modal
function showCreateGroupModal() {
    const modal = document.getElementById('createGroupModal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    const input = document.getElementById('new-group-title');
    //making sure its not empty
    if (input) { input.value = ''; setTimeout(() => input.focus(), 0); }
    // clear photo selection and preview when opening
    const photoInput = document.getElementById('new-group-photo');
    const previewDiv = document.getElementById('new-group-preview');

    _selectedGroupImageData = null;
    if (photoInput) photoInput.value = '';
    if (previewDiv) { previewDiv.style.display = 'none'; previewDiv.style.backgroundImage = ''; }
}

// Hide the create-group modal
function hideCreateGroupModal() {
    const modal = document.getElementById('createGroupModal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    // clear any selected image when closing
    _selectedGroupImageData = null;
    const photoInput = document.getElementById('new-group-photo');
    const previewDiv = document.getElementById('new-group-preview');
    if (photoInput) photoInput.value = '';
    if (previewDiv) { previewDiv.style.display = 'none'; previewDiv.style.backgroundImage = ''; }
}

// Click handler attached to the + button — opens modal
function createNewGroup() {
    showCreateGroupModal();
}

function joinGroup(e) {
    // `e` is the event when used as an event handler; support both direct call and event callback
    //if its e.currentTarget, or if its a joinGroup button
    const btn = (e && e.currentTarget) ? e.currentTarget : (this && this.classList && this.classList.contains('join-group')) ? this : null;
    if (!btn) return;
    
    //box
    const card = btn.closest('.trending-items');
    if (!card) return;

    // Find your-groups container and ensure a row exists
    const container = document.querySelector('.section.trending .container .your-groups');
    if (!container) return;

    let rows = container.querySelectorAll('.row.trending-box');
    if (rows.length === 0) {
        const newRow = document.createElement('div');
        newRow.className = 'row trending-box'; //row trending-box is a row
        container.appendChild(newRow);
        rows = container.querySelectorAll('.row.trending-box');
    }

    let lastRow = rows[rows.length - 1];
    const cols = lastRow.querySelectorAll('.trending-items').length;

    
    if (cols >= 4) {
        const newRow = document.createElement('div');
        newRow.className = 'row trending-box';
        container.appendChild(newRow);
        lastRow = newRow;
    }

    // Extract title and thumbnail info from original card
    const titleText = card.querySelector('h4').textContent;
    const thumbEl = card.querySelector('.thumb');
    let imageDataUrl = null;
    let color = null;

    if (thumbEl) {
        const cs = window.getComputedStyle(thumbEl);
        const bg = cs.backgroundImage;
        if (bg && bg !== 'none') {
            const m = bg.match(/url\((?:"|')?(.*?)(?:"|')?\)/);
            if (m && m[1]) imageDataUrl = m[1];
        } else {
            color = cs.backgroundColor || null;
        }
    }

    const defaultTags = titleText ? `#${titleText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}` : '';
    const defaultPrompt = titleText ? `Share one thing you love about ${titleText}.` : 'Share one thing you love about this group.';

    // Create and save group entry (pass color if available)
    createGroupFromTitle(titleText, imageDataUrl || null, true, color, null, defaultTags, defaultPrompt);

    // Remove original card from Discover More
    card.remove();
}

// Move a group column element back into the Discover More rows
function moveGroupToDiscover(colElement) {
    if (!colElement) return;

    // extract title and thumbnail info
    const titleText = colElement.querySelector('h4').textContent;
    const thumbEl = colElement.querySelector('.thumb');
    let imageDataUrl = null;
    let color = null;

    if (thumbEl) {
        const cs = window.getComputedStyle(thumbEl);
        const bg = cs.backgroundImage;
        if (bg && bg !== 'none') {
            const m = bg.match(/url\((?:"|')?(.*?)(?:"|')?\)/);
            if (m && m[1]) imageDataUrl = m[1];
        } else {
            color = cs.backgroundColor || null;
        }
    }

    // Build a discover-card column (similar structure to original discover items)
    const discoverCol = document.createElement('div'); //discoverCol is the box
    discoverCol.className = 'col-lg-3 col-md-6 align-self-center mb-30 trending-items col-md-6 adv';

    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';

    const thumbnailDiv = document.createElement('div');
    thumbnailDiv.className = 'thumb thumb-color';
    
    if (imageDataUrl) {
        thumbnailDiv.style.backgroundImage = `url(${imageDataUrl})`;
        thumbnailDiv.style.backgroundSize = 'cover';
        thumbnailDiv.style.backgroundPosition = 'center';
    } else if (color) {
        thumbnailDiv.style.backgroundColor = color;
    } else {
        thumbnailDiv.style.backgroundColor = getRandomColor();
    }

    const downContent = document.createElement('div');
    downContent.className = 'down-content';

    const category = document.createElement('span'); //members
    category.className = 'category';
    category.innerHTML = '<i class="fa fa-person"></i> x members';

    const title = document.createElement('h4'); //title
    title.textContent = titleText;

    //join button
    const joinBtn = document.createElement('button');
    joinBtn.type = 'button';
    joinBtn.className = 'join-group';
    joinBtn.innerHTML = 'Join Group <i class="fa fa-shopping-bag"></i>';
    joinBtn.addEventListener('click', joinGroup);

    //add everythng to discoverCol (the box)
    downContent.appendChild(category);
    downContent.appendChild(title);
    downContent.appendChild(joinBtn);

    itemDiv.appendChild(thumbnailDiv);
    itemDiv.appendChild(downContent);
    discoverCol.appendChild(itemDiv);

    // append into the Discover More rows — find last discover row (not inside .your-groups)
    const container = document.querySelector('.section.trending .container .discover-more');
    if (!container) return;

    let discoverRows = container.querySelectorAll('.row.trending-box');
    // if (discoverRows.length === 0) {
    //     // create initial row if missing
    //     const newRow = document.createElement('div');
    //     newRow.className = 'row trending-box';
    //     container.appendChild(newRow); //container = Your Groups
    //     discoverRows = container.querySelectorAll('.row.trending-box'); //make new row, reassign rows
    // }

    // let appendRow = discoverRows[discoverRows.length - 1];
    // let cols = appendRow.querySelectorAll('.trending-items').length;

    // // // Bootstrap large screen: 4 columns per row (col-lg-3) -> create new row when full
    // if (cols >= 4) {
    //     const newRow = document.createElement('div');
    //     newRow.className = 'row trending-box';
    //     container.appendChild(newRow);
    //     appendRow = newRow;
    // }
    
    let appendRow = null;
    
    if (discoverRows.length > 0) {
        appendRow = discoverRows[discoverRows.length - 1]; //last row
        cols = appendRow.querySelectorAll('.trending-items').length;
        // if last discover row is full, create a new one after it
        if (cols >= 4) {
            const newRow = document.createElement('div');
            newRow.className = 'row trending-box';
            container.appendChild(newRow);
            // appendRow.parentNode.insertBefore(newRow, appendRow.nextSibling);
            appendRow = newRow;
        }
    } else {
        // no existing discover rows — create one at end of container
        appendRow = document.createElement('div');
        appendRow.className = 'row trending-box';
        container.appendChild(appendRow);
    }

    appendRow.appendChild(discoverCol);

    // remove the original card from Your Groups (if still present)
    if (colElement && colElement.parentNode) colElement.parentNode.removeChild(colElement);
}

document.addEventListener('DOMContentLoaded', function () {
    // Load persisted groups first
    loadSavedGroups();

    // color existing thumbnails (skip any header-level button areas or already-set covers)
    document.querySelectorAll('.thumb-color').forEach(el => {
        // don't recolor if it's a special button area (no down-content present)
        // also skip if an inline background-image or background-color is already set
        const hasInlineBgImage = el.style && el.style.backgroundImage && el.style.backgroundImage !== 'none';
        const hasInlineBgColor = el.style && el.style.backgroundColor && el.style.backgroundColor !== '';
        if (!el.closest('.create-new-group-btn') && !hasInlineBgImage && !hasInlineBgColor) {
            el.style.backgroundColor = getRandomColor();
        }
    });

    const btn = document.getElementById('create-new-group');
    if (btn) btn.addEventListener('click', createNewGroup);
    // wire up existing Join Group buttons
    document.querySelectorAll('.join-group').forEach(b => b.addEventListener('click', joinGroup));

    // Modal controls
    const modal = document.getElementById('createGroupModal');
    const confirmBtn = document.getElementById('confirm-create-group');
    const cancelBtn = document.getElementById('cancel-create-group');
    const titleInput = document.getElementById('new-group-title');
    const photoInput = document.getElementById('new-group-photo');
    const previewDiv = document.getElementById('new-group-preview');

    if (confirmBtn && titleInput) {
        confirmBtn.addEventListener('click', function () {
            const val = titleInput.value.trim();
            if (!val) { titleInput.focus(); return; }
            // use selected image data if present
            const tagsInput = document.getElementById('new-group-tags');
            const tagsValue = tagsInput ? tagsInput.value.trim() : '';
            const promptText = `Share a recent discovery with ${val}.`;
            createGroupFromTitle(val, _selectedGroupImageData, true, null, null, tagsValue, promptText);
            // clear selected image after creation
            _selectedGroupImageData = null;
            hideCreateGroupModal();
        });
        // allow Enter to confirm
        titleInput.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter') confirmBtn.click();
        });
    }
    // wire up photo input preview
    if (photoInput && previewDiv) {
        photoInput.addEventListener('change', function () {
            const f = photoInput.files && photoInput.files[0];
            if (!f) { _selectedGroupImageData = null; previewDiv.style.display = 'none'; previewDiv.style.backgroundImage = ''; return; }
            const reader = new FileReader();
            reader.onload = function (ev) {
                _selectedGroupImageData = ev.target.result;
                previewDiv.style.backgroundImage = `url(${_selectedGroupImageData})`;
                previewDiv.style.display = 'block';
            };
            reader.readAsDataURL(f);
        });
    }
    if (cancelBtn) cancelBtn.addEventListener('click', function () { _selectedGroupImageData = null; hideCreateGroupModal(); });
    if (modal) {
        const overlay = modal.querySelector('.cg-modal-overlay');
        if (overlay) overlay.addEventListener('click', hideCreateGroupModal);
    }
});
