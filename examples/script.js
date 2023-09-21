const heading = document.querySelector('h1');
let colorChangeInterval;

function changeColor() {
  const randomColor = getRandomColor();
  heading.style.color = randomColor;
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

window.onload = () => {
  colorChangeInterval = setInterval(changeColor, 1000);
};

setTimeout(() => {
  clearInterval(colorChangeInterval);
}, 10000);
