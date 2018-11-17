function zoom(e) {
    let zoomer = e.currentTarget;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    x = offsetX / zoomer.offsetWidth * 100;
    y = offsetY / zoomer.offsetHeight * 100;
    zoomer.style.backgroundPosition = x + "% " + y + "%";
  }