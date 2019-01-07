'use strict'

// global variable
let active

function setAppStatus() {
  chrome.storage.sync.set({ appStatus: active }, null)
}

function getAppStatus() {
  chrome.storage.sync.get('appStatus', result => active = result.appStatus)
}

function extractHostname(url = '') {
  let hostname
  if (url.indexOf("//") > -1)
    hostname = url.split('/')[2]
  else
    hostname = url.split('/')[0]
  hostname = hostname.split(':')[0]
  hostname = hostname.split('?')[0]
  return hostname
}

function extractRootDomain(url) {
  let domain = extractHostname(url),
    splitArr = domain.split('.'),
    arrLen = splitArr.length
  if (arrLen > 2) {
    domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1]
    if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2)
      domain = splitArr[arrLen - 3] + '.' + domain
  }
  return domain
}

function compare(a, b) {
  return a.localeCompare(b, 'en', { 'sensitivity': 'base' })
}

function sort(tabs) {
  return tabs.sort((a, b) => {
    const axrd = extractRootDomain(a.favIconUrl)
    const bxrd = extractRootDomain(b.favIconUrl)
    if (axrd != bxrd) return compare(axrd, bxrd)
    if (a.title != b.title) return compare(a.title, b.title)
    return compare(a.url, b.url)
  })
}

function sortTabsInCurrentWindow() {
  if (!active) return
  chrome.tabs.query({}, tabs => {
    [].concat(
      sort(tabs.filter(tab => tab.pinned)),
      sort(tabs.filter(tab => !tab.pinned))
    )
      .forEach((tab, index) => {
        chrome.tabs.move(tab.id, { index }, null)
      })
  })
}

function setIcon() {
  const activeIconFile = active ? 'active' : 'inactive'
  chrome.browserAction.setIcon({ path: 'icons/button/' + activeIconFile + '.png' })
  console.log('app:', active ? "on" : "off")
}

function appIconOnClick() {
  getAppStatus()
  active = !active
  setAppStatus()
  setIcon()
  if (active) sortTabsInCurrentWindow()
}

// onload app
setIcon()
chrome.browserAction.onClicked.addListener(appIconOnClick)
chrome.tabs.onRemoved.addListener(sortTabsInCurrentWindow)
chrome.tabs.onUpdated.addListener(sortTabsInCurrentWindow)
