let gif_urls = ["rickroll1.gif", "rickroll2.gif", "rickroll3.gif", "rickroll4.gif", "rickroll5.gif"];
let img_urls = ["rickroll_4k.jpg"];
let vids_urls = ["rick_roll_480p.mp4"];

let gif_folder = "gifs/";
let img_folder = "img/";
let vids_folder = "vids/";
let chrome_extension_url_substring = "chrome-extension://"
const PermissionEnum = {"OnlyVideos": 0, "OnlyImages": 1, "All": 2};   //only switch selected



// check on or off, init if not set, same for permission
// potentially slow because of chrome.storage not local?
get_on_off(function(isOn) {
    if (init_on_off(isOn)) {
        get_permission(function(permission) {
            observe_change(init_permission(permission));
        });
    }
});

function observe_change(permission) {
    //initial swap of everything
    swap_images_and_videos(document, permission);

    let observer = new MutationObserver(mutations => {
        for (let mutation of mutations) {
            for (let addedNode of mutation.addedNodes) {
                console.log(addedNode.nodeName);
                // some sites do not directly have a video object, it is often hidden in a div
                if (addedNode.nodeName === "DIV") {
                    swap_images_and_videos(addedNode, permission);
                }
                else if (addedNode.nodeName === "VIDEO" && permission !== PermissionEnum.OnlyImages) {
                    attach_observer_to_element(addedNode, swap_video_source_for_video);
                }
                else if (addedNode.nodeName === "IMG" && permission !== PermissionEnum.OnlyVideos) {
                    attach_observer_to_element(addedNode, swap_image_source_for_gif);
                }
            }
        }
    });
    observer.observe(document, { childList: true, subtree: true });
}


function attach_observer_to_element(element, callback) {
    callback(element);
    let observer = new MutationObserver(() => {
        callback(element);
    });
    observer.observe(element, 
        {childList: false, subtree: false, attributes:true, attributeFilter: ["src"]});
}


function swap_images_and_videos(target, permission) {
    if (permission !== PermissionEnum.OnlyImages) {
        swap_elements(target, "video", swap_video_source_for_video);
    }
    if (permission !== PermissionEnum.OnlyVideos) {
        swap_elements(target, "img", swap_image_source_for_gif);
    }
}


function swap_elements(target, tagName, callback) {
    let elements = target.getElementsByTagName(tagName);
    for (let element of elements) {
        attach_observer_to_element(element, callback);
    }
}


function swap_video_source_for_video(video) {
    //check if source was already swapped
    if (video.src.includes(chrome_extension_url_substring)) {
        return;
    }
    let random_index = Math.floor(Math.random() * vids_urls.length);
    let new_url = chrome.runtime.getURL(vids_folder + vids_urls[random_index]);
    video.src = new_url;
    video.loop = true;
    video.load();
    //video.currentTime = 0;
    //is_video_playing(video) ? video.play() : video.pause();
}


function swap_image_source_for_gif(image) {
    if (image.src.includes(chrome_extension_url_substring)) {
        return;
    }
    let random_index = Math.floor(Math.random() * gif_urls.length);
    let new_url = chrome.runtime.getURL(gif_folder + gif_urls[random_index]);
    image.src = new_url;
}


function is_video_playing(video) {
    return !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
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


function init_permission(permission) {
    if (permission === undefined) {
        // by default will be set to all
        permission = PermissionEnum.All;
        chrome.storage.sync.set({Permission: permission}, function() {
            console.log('Permission is set to ' + permission);
        });
    }
    return permission;
}


function init_on_off(isOn) {
    if (isOn === undefined) {
        // by default will be set to on
        isOn = true;
        chrome.storage.sync.set({OnOffToggle: isOn}, function() {
			console.log('OnOff is set to ' + isOn);
		});
    }
    return isOn;
}