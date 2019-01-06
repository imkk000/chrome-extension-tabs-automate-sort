'use strict'

// global variable
let active = false

function extractHostname(url) {
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
    if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
      domain = splitArr[arrLen - 3] + '.' + domain
    }
  }
  return domain
}

function compare(a, b) {
  return a.localeCompare(b, 'en', { 'sensitivity': 'base' })
}

function sort(tabs) {
  if (!!!tabs) return []
  return tabs.sort((a, b) => {
    const ad = extractRootDomain(a.favIconUrl)
    const bd = extractRootDomain(b.favIconUrl)
    if (ad != bd)
      return compare(ad, bd)
    if (a.title != b.title)
      return compare(a.title, b.title)
    return compare(a.url, b.url)
  })
}

function sortTabsInCurrentWindow() {
  if (!active) return
  chrome.tabs.query({}, tabs => {
    const tabsPinned = sort(tabs.filter(tab => tab.pinned))
    const tabsUnpinned = sort(tabs.filter(tab => !tab.pinned))
    const newTabs = [].concat(tabsPinned, tabsUnpinned)
    newTabs.forEach((tab, index) => {
      chrome.tabs.move(tab.id, { index }, null)
    })
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
chrome.tabs.onRemoved.addListener(() => sortTabsInCurrentWindow())
chrome.tabs.onUpdated.addListener(() => sortTabsInCurrentWindow())
