const win = Ti.UI.createWindow({
	backgroundColor: 'gray',
	layout: 'vertical'
});
const btn_js = Ti.UI.createButton({
	title: 'JAVASCRIPT'
});
const btn_native = Ti.UI.createButton({
	title: 'NATIVE'
});

btn_js.addEventListener('click', (e) => {
	const object = {};
	console.log(object.test.crash);
});

btn_native.addEventListener('click', (e) => {
	Ti.Geolocation.accuracy = {};
});

win.add([ Ti.UI.createView({
	height: 80
}), btn_js, btn_native ]);
win.open();
