'use strict';

// global variable
let active = false

function extractHostname(url) {
  let hostname;
  if (url.indexOf("//") > -1) {
    hostname = url.split('/')[2];
  }
  else {
    hostname = url.split('/')[0];
  }
  hostname = hostname.split(':')[0];
  hostname = hostname.split('?')[0];
  return hostname;
}

function extractRootDomain(url) {
  let domain = extractHostname(url),
    splitArr = domain.split('.'),
    arrLen = splitArr.length;
  if (arrLen > 2) {
    domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
    if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
      domain = splitArr[arrLen - 3] + '.' + domain;
    }
  }
  return domain;
}

function sortTabsInCurrentWindow() {
  if (!active) return

  
  chrome.tabs.query({}, function (tabs) {
    const tabSorted = tabs.sort((a, b) => {
      return extractRootDomain(a.favIconUrl).localeCompare(extractRootDomain(b.favIconUrl))
    })
    for (let i = 0; i < tabSorted.length; i++) {
      chrome.tabs.move(tabSorted[i].id, { index: i }, null)
    }
  })
}

function setIcon() {
  const activeIconFile = active ? 'active' : 'inactive'
  chrome.browserAction.setIcon({ path: 'icon/' + activeIconFile + '.png' })

  console.log('app', active ? "on" : "off")
}

function appIconOnClick(tab) {
  active = !active
  setIcon()
  if (active)
    sortTabsInCurrentWindow()
}

// onload app
setIcon()
chrome.browserAction.onClicked.addListener(appIconOnClick)
chrome.tabs.onCreated.addListener(tab => sortTabsInCurrentWindow())
chrome.tabs.onRemoved.addListener(tab => sortTabsInCurrentWindow())
chrome.tabs.onUpdated.addListener(tab => sortTabsInCurrentWindow())