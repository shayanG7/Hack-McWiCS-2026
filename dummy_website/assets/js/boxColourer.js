const colors = [
    '#F5E387', //yellow
    '#CBED79', //lime
    '#69A346', //green
    '#46A394', //teal
    '#4657A3', //blue
    '#5946A3', //purple
    '#A34671', //pink
    ]

const newGroupButton = document.querySelectorAll('.new-group');
newGroupButton.addEventListener("click", createNewGroup());

function getRandomColor() {
    const randomColor = colors[Math.floor(Math.random() * 7)];
    return randomColor;
}

function applyRandomColour() {
    const elements = document.querySelectorAll('.thumb-color');
    elements.forEach(element => {
        element.style.backgroundColor = getRandomColor();
    })
}

function createNewGroup() {
    
}
