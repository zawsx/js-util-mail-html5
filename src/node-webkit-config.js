// remember node require function due to require.js
window.nodeRequire = window.require;

window.Worker = undefined;
window.nodeRequire('nw.gui').Window.get().showDevTools();