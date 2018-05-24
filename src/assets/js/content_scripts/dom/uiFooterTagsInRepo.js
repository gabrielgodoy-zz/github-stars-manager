import { $ } from '../../helpers';
import { StoredTagsMngr } from '../storageSync/StoredTagsMngr';
import { StoredReposMngr } from '../storageSync/StoredReposMngr';
import { StoredGenericMngr } from '../storageSync/StoredGenericMngr';
import { getTagIcon, getTrashcan, getPlusIcon } from './uiSvgIcons';
import { createTagsInStarsPage } from '../main';

/**
 * Action when user click to delete a tag
 * @param {Object} tag
 */
export async function deleteTag(tag) {
  await StoredReposMngr.deleteTagFromRepo(tag.dataset.repo, tag.innerText);
  createTagsInStarsPage();
}

/**
 * Insert loading spinner with message
 * @param {String} message Messaage to appear next to loading icon
 */
export function insertLoader(message) {
  const repoList = getContainerDivRepo();
  if (repoList) {
    const repoListItems = repoList.querySelectorAll(
      '.d-block.width-full.py-4:not(.ghstarsmngr-hide)'
    );

    repoListItems.forEach((repo) => {
      if (repo.querySelector('.ghstarmngr-repo-footer-tags')) {
        repo.querySelector('.ghstarmngr-repo-footer-tags').remove();
      }
      repo.innerHTML += `
      <div class="ghstarmngr-loading-spinner-container">
      <div class="ghstarmngr-loading-spinner">
      </div>
      ${message}
      </div>`;
    });
  }
}

/**
 * @param {Object} actionBt
 */
export async function handleUnstarBtInStarPage(actionBt) {
  let actionType = actionBt.innerText.trim().toLowerCase();
  if (actionType === 'unstar') {
    let repoID = actionBt
      .closest('.js-toggler-container')
      .querySelector('.ghstarmngr-create-tag-bt').dataset.repo;
    await StoredGenericMngr.deleteKey('r', repoID);
    await StoredTagsMngr.checkForTagsNotBeingUsed();
    createTagsInStarsPage();
  }
}

/**
 *
 * @param {String} message
 * @return {String}
 */
export function displayLoaderWithMessage(message) {
  return `
    <div class="ghstarmngr-loading-spinner-container">
      <div class="ghstarmngr-loading-spinner">
      </div>
      ${message}
    </div>`;
}

/**
 *
 * @param {Number} delay
 */
export function resetFeedbackMessage(delay = 0) {
  setTimeout(function() {
    $('.ghstarsmngr-feedback-export').innerHTML = '&nbsp;';
  }, delay);
}

/**
 * Removes loading spinner
 */
export function removeLoader() {
  const repoList = getContainerDivRepo();

  if (repoList) {
    const repoListItems = repoList.querySelectorAll(
      '.d-block.width-full.py-4:not(.ghstarsmngr-hide)'
    );

    repoListItems.forEach((repo) => {
      let loadingSpinnerContainer = repo.querySelector('.ghstarmngr-loading-spinner-container');
      if (loadingSpinnerContainer) {
        repo.removeChild(loadingSpinnerContainer);
      }
    });
  }
}

/**
 * Insert button 'create tag' on each starred repository
 * @param {Object} starredRepos Starred Repos of the repo that the button
 * is inserted
 */
export function insertBtCreateTag(starredRepos) {
  if ($('.ghstarmngr-create-tag-bt')) {
    return;
  }

  loopThroughRepos((repo, repoName) => {
    starredRepos.forEach((starredRepo) => {
      const starBtContainer = repo.querySelector('.starring-container');
      if (starBtContainer) {
        if (starredRepo.full_name === repoName) {
          let repoID = starredRepo.id;
          starBtContainer.innerHTML += `
            <button class="btn btn-sm ghstarmngr-create-tag-bt" data-repo="${repoID}">
              ${getTagIcon({ width: 14, height: 13 })}
              New tag
            </button>`;
        }
      }
    });
  });
}

/**
 * Inserts footer with tags in each repo on stars page
 * @param {Object} starredRepos
 * @param {Object} reposInStorage
 * @param {Object} tagsInStorage
 */
export function insertFooterTags(starredRepos, reposInStorage, tagsInStorage) {
  if ($('.d-block.width-full.py-4:not(.ghstarsmngr-hide) .ghstarmngr-repo-footer-tags')) {
    return;
  }

  loopThroughRepos((repo, repoName) => {
    let tagContent = repo.innerHTML;
    let numberOfTags;

    if (!repo.querySelector('.ghstarmngr-create-tag-bt')) {
      return;
    }

    let repoID = repo.querySelector('.ghstarmngr-create-tag-bt').dataset.repo;
    if (repoID in reposInStorage) {
      numberOfTags = reposInStorage[repoID].length;
    } else {
      numberOfTags = 0;
    }
    tagContent += `
      <div class="ghstarmngr-repo-footer-tags">
        ${getTagIcon({ width: 14, height: 13 })}
        <p> ${numberOfTags} tag${numberOfTags === 1 ? '' : 's'}</p>`;

    starredRepos.forEach((starredRepo) => {
      if (starredRepo.full_name === repoName) {
        let repoID = starredRepo.id;

        if (repoID in reposInStorage) {
          reposInStorage[repoID].forEach((tag) => {
            let tagName = StoredTagsMngr.getTagNameByID(tagsInStorage, tag);
            tagContent += createDOMTagCell(repoID, tagName);
          });
        }
        tagContent += `
          <a href="#" class="ghstarmngr-bt-existing-tag" data-repo="${repoID}">
            ${getPlusIcon({ width: 12, height: 15 })}
            Add existing tag
          </a>`;
      }
    });
    repo.innerHTML = `
        ${tagContent}
      </div>`;
  });
}

/**
 *
 * @param {String|Number} repoID
 * @param {String} tagName
 * @return {string}
 */
export function createDOMTagCell(repoID, tagName) {
  return `
    <span class= "ghstarmngr-tag-cell" data-repo="${repoID}">
      <div class="ghstarmngr-delete-tag-icon">
        ${getTrashcan({ width: 16, height: 16 })} 
      </div>
      ${tagName}
    </span>`;
}

/**
 * Function that loops trough each repo being displayed on the User home
 * @param {Function} callback
 */
function loopThroughRepos(callback) {
  const repoList = getContainerDivRepo();

  if (repoList) {
    const repoListItems = repoList.querySelectorAll(
      '.d-block.width-full.py-4:not(.ghstarsmngr-hide)'
    );

    repoListItems.forEach((repo) => {
      let repoRef = repo
        .querySelector('.d-inline-block a')
        .getAttribute('href')
        .replace('/', '');

      callback(repo, repoRef);
    });
  }
}

/**
 * Depending of which page the user is in, the container of repos will change its class
 * @return {jQuery|HTMLElement}
 */
function getContainerDivRepo() {
  return (
    $('.ghstarsmngr-repo-list') ||
    $('.js-repo-filter') ||
    $('.repo-list') ||
    $('.user-profile-repo-filter')
  ); // eslint-disable-line
}
