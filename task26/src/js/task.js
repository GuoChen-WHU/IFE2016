import { createCraft } from './craft.js';

var craft = createCraft();

document.getElementById( 'test-move' ).addEventListener( 'click', function () {
  craft.move();
});
document.getElementById( 'test-stop' ).addEventListener( 'click', function () {
  craft.stop();
});
