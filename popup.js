// copied from content.js
const PermissionEnum = {"OnlyVideos": 0, "OnlyImages": 1, "All": 2};   //only switch selected

run_on_init();


function run_on_init() {
	let button = document.getElementById("buttonOnOff");
	button.addEventListener("click", function() {
		toggle_on_off(function(isOn) {
			update_colors(isOn);
			update_button_text(isOn);
		});
		return true;
	});

	let button2 = document.getElementById("buttonPermissions");
	button2.addEventListener("click", function() {
		toggle_permissions(update_permission_button_text);
		return true;
	});

	get_on_off(function(isOn) {
		update_colors(isOn);
		update_button_text(isOn);
	});

	get_permission(update_permission_button_text);
}


function toggle_permissions(callback) {
	chrome.storage.sync.get('Permission', function(res) {
		let new_permission = PermissionEnum.All;
		if (res.Permission !== undefined) {
			// increment permission
			new_permission = (res.Permission + 1) % Object.keys(PermissionEnum).length;
		}
		callback(new_permission);
		chrome.storage.sync.set({Permission: new_permission}, function() {
			console.log('Permissions is set to ' + new_permission);
		});
	});
}


function update_permission_button_text(permission) {
	let button = document.getElementById("buttonPermissions");
	if (permission === PermissionEnum.OnlyImages) {
		button.innerHTML = "<span>Images Only </span>"
	}
	else if (permission === PermissionEnum.OnlyVideos) {
		button.innerHTML = "<span>Videos Only </span>"
	}
	else {
		button.innerHTML = "<span>Images and Videos </span>"
	}
}


function update_button_text(isOn) {
	let button = document.getElementById("buttonOnOff");
	button.innerHTML = isOn ? "<span>On </span>" : "<span>Off </span>";
}


function update_colors(isOn) {
	const arr = document.getElementsByClassName('button');
	if (isOn) {
		Array.prototype.forEach.call(arr, el => {
			el.style.setProperty("--check-primary", "#61afef");
			el.style.setProperty("--check-secondary", "#ef596f");
		});
	}
	else {
		Array.prototype.forEach.call(arr, el => {
			el.style.setProperty("--check-primary", "#ef596f");
			el.style.setProperty("--check-secondary", "#61afef");
		});
	}
}


function toggle_on_off(callback) {
	chrome.storage.sync.get('OnOffToggle', function(res) {
		console.log("res:",res);
		let OnOff = res.OnOffToggle ? false : true;
		console.log("OnOff:",OnOff);
		callback(OnOff);
		chrome.storage.sync.set({OnOffToggle: OnOff}, function() {
			console.log('OnOff is set to ' + OnOff);
		});
	});
}

function get_on_off(callback) {
	chrome.storage.sync.get('OnOffToggle', function(res) {
		callback(res.OnOffToggle);
		console.log('Value of OnOffToggle is ' + res.OnOffToggle);
	});
}

function get_permission(callback) {
	chrome.storage.sync.get('Permission', function(res) {
		callback(res.Permission);
		console.log('Value of Permission is ' + res.Permission);
	});
}