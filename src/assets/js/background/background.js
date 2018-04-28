import {upperCaseFirst} from '../helpers';
import KEYS from '../keys';

chrome.management.getSelf((self) => {
  if (self.installType !== 'development') {
    chrome.runtime.onInstalled.addListener(createAuthorizeTab);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.createJson) {
    let jsonTags = JSON.stringify(request.createJson, null, 2);
    let newTab = window.open();
    newTab.document.open();
    newTab.document.write(`<html><body><pre>${jsonTags}</pre></body></html>`);
    newTab.document.close();
    sendResponse({jsonCreated: 'JSON created successfully!'});
  } else if (request.createBookmark) {
    chrome.bookmarks.create({
      'parentId': '1',
      'title': 'Github Favorites',
    }, (newFolder) => {
      request.createBookmark.map((tagAndRelatedRepos) => {
        chrome.bookmarks.create({
          'parentId': newFolder.id,
          'title': tagAndRelatedRepos.tag ?
            upperCaseFirst(tagAndRelatedRepos.tag.tagName) :
            'Untagged',
        }, (newChildFolder) => {
          tagAndRelatedRepos.repos.map((tagAndRelatedRepo) => {
            let repoDesc = tagAndRelatedRepo.description;
            chrome.bookmarks.create({
              'parentId': newChildFolder.id,
              'title': `${tagAndRelatedRepo.name} ${repoDesc ? `| ${repoDesc }` : ''}`,
              'url': tagAndRelatedRepo.html_url,
            });
          });
        });
      });
    });
  }
  sendResponse({bookmarkCreated: 'Bookmarks created successfully!'});
});

/**
 * Create an authorization tab
 */
function createAuthorizeTab() {
  const scope = 'user:email,repo';
  const ghPrefix = 'https://github.com';
  const ghAuthPrefix = `${ghPrefix}/login/oauth/authorize`;
  const ghAuth = `${ghAuthPrefix}?client_id=${KEYS.ID}&redirect_uri=${ghPrefix}/&scope=${scope}`;
  chrome.tabs.create({url: ghAuth});
}
