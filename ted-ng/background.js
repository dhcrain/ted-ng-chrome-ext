// https://revelry.co/writing-chrome-extension-toggle-github-waffle/
'use strict';

const local = '/local/';
const tedModule = '/ted/module/'

function sourceUrlToDestination(url) {
	if (!isLocal4200(url)) {
		return null;
	} else {
		if (url.indexOf(tedModule) > -1) {
			return url.replace(tedModule, local);
		} else if (url.indexOf(local) > -1) {
			return url.replace(local, tedModule);
		} else {
			return null;
		}
	}
}

function destinationUrlToIconPath(url) {
	if (url.indexOf(tedModule) > -1) {
		return "ted_ng.png"
	} else if (url.indexOf(local) > -1) {
		return "ted_plain.png";
	}
}

function isLocal4200(url) {
	return (url.indexOf("localhost:4200") > -1||
			url.indexOf("127.0.0.1:4200") > -1) ? true : false;
}

function withActiveTab(callback) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		callback(tabs[0]);
	});
}

function openInActiveTab() {
	withActiveTab(function(tab) {
		if (tab.id) chrome.tabs.update(tab.id, {url: sourceUrlToDestination(tab.url)});
	});
}

function openInNewTab() {
	withActiveTab(function(active_tab) {
		chrome.tabs.create({
			url: sourceUrlToDestination(active_tab.url),
			index: active_tab.index + 1
		});
	});
}

// The icon click toggle
chrome.pageAction.onClicked.addListener(openInActiveTab);

// The keyboard shortcuts
chrome.commands.onCommand.addListener(function(command) {
	switch (command) {
	case 'switch':
		openInActiveTab();
		break;
	case 'switch_new_tab':
		openInNewTab();
		break;
	}
});

function setPageActionDisplayForTab(tab) {
	if (tab && tab.url) {
		const url = sourceUrlToDestination(tab.url)
		if (url) {
			chrome.pageAction.setIcon({
				tabId: tab.id,
				path: destinationUrlToIconPath(url)
			});
			chrome.pageAction.show(tab.id)
		} else {
			chrome.pageAction.hide(tab.id)
		}
	}
}

function handleTabCreated(tabId, changeInfo, tab) {
	setPageActionDisplayForTab(tab);
}

function handleTabUpdated(tabId, changeInfo, tab) {
	handleTabCreated(tabId, changeInfo, tab);
}

chrome.tabs.onCreated.addListener(handleTabCreated);
chrome.tabs.onUpdated.addListener(handleTabUpdated);
