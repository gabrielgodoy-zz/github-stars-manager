import { $ } from '../../helpers';
import { HASH } from '../../constants';
import { StoredTagsMngr } from '../storageSync/StoredTagsMngr';
import {
  repoNameInModalHeader,
  modalContentCreateTag,
  modalContentListTags,
  openModal,
  closeModal,
  setExistingTagInRepo,
} from './uiModal';
import {
  deleteTag,
  resetFeedbackMessage,
  displayLoaderWithMessage,
  handleUnstarBtInStarPage,
} from './uiFooterTagsInRepo';
import {
  enterTagPage,
  leaveTagPage,
  cleanTag,
  getTagsAndRelatedRepos,
  tagLinkOnTagPageShowRepos,
} from './uiTagPage';

/**
 * Add click event listeners in DOM elements
 */
export function clickEventListener() {
  document.addEventListener('click', function(e) {
    let t = e.target;
    const eTarget = {
      isCreateTagBt: t.classList.contains('ghstarmngr-create-tag-bt'),
      isCreateTagBtChild: t.closest('.ghstarmngr-create-tag-bt'),
      isCleanTag: t.classList.contains('button-clean-tag'),
      isCleanTagChild: t.closest('.button-clean-tag'),
      isRepoFooterTagCell: t.classList.contains('ghstarmngr-tag-cell'),
      isRepoFooterTagChildren: t.closest('.ghstarmngr-tag-cell'),
      isModalCloseBtOrChild: t.closest('.ghstarmngr-close-button'),
      isModalAddTagBt: t.classList.contains('ghstarmngr-add-tag-bt'),
      isGhToggleStarBt: t.classList.contains('js-toggler-target'),
      isBtExistingTag: t.classList.contains('ghstarmngr-bt-existing-tag'),
      isBtExistingTagChild: t.closest('.ghstarmngr-bt-existing-tag'),
      isModalTagListItem: t.classList.contains('ghstarmngr-tag-item'),
      isBtExportBookmark: t.classList.contains('ghstarsmngr-export-bt-bookmarks'),
      isBtExportBookmarkChild: t.closest('.ghstarsmngr-export-bt-bookmarks'),
      isBtExportJson: t.classList.contains('ghstarsmngr-export-bt-json'),
      isBtExportJsonChild: t.closest('.ghstarsmngr-export-bt-json'),
      isTagLinkOnTagPage: t.classList.contains('ghstarsmngr-sidebar-tag-list-link'),
      isTagLinkOnTagPageChild: t.closest('.ghstarsmngr-sidebar-tag-list-link'),
    };

    switch (true) {
      case (eTarget.isCreateTagBt || eTarget.isCreateTagBtChild !== null): {
        t = eTarget.isCreateTagBt ? t : t.closest('.ghstarmngr-create-tag-bt');
        const repoFullName = t.closest('.width-full.py-4')
                              .querySelector('.d-inline-block a')
                              .getAttribute('href');
        const repoID = t.dataset.repo;
        openModal(modalContentCreateTag());
        repoNameInModalHeader(repoFullName, repoID);
        $('.input-new-tag').focus();
      }
        break;
      case (eTarget.isRepoFooterTagCell || eTarget.isRepoFooterTagChildren !== null): {
        let tag = eTarget.isRepoFooterTagCell ? t : eTarget.isRepoFooterTagChildren;
        deleteTag(tag);
      }
        break;
      case (eTarget.isGhToggleStarBt): {
        handleUnstarBtInStarPage(t);
      }
        break;
      case (eTarget.isCleanTag || eTarget.isCleanTagChild !== null): {
        e.preventDefault();
        cleanTag(t);
      }
        break;
      case (eTarget.isModalCloseBtOrChild !== null): {
        closeModal();
      }
        break;
      case (eTarget.isModalAddTagBt): {
        let newTagText = t.previousElementSibling.value;
        let repoID = t.closest('.ghstarmngr-modal-container')
                      .querySelector('.title-repo-name').dataset.repo;
        StoredTagsMngr.createTag(repoID, newTagText);
      }
        break;
      case (eTarget.isBtExistingTag || eTarget.isBtExistingTagChild !== null): {
        e.preventDefault();
        let repoID;
        if (eTarget.isBtExistingTag) {
          repoID = t.dataset.repo;
        } else {
          repoID = t.closest('.ghstarmngr-bt-existing-tag').dataset.repo;
        }
        StoredTagsMngr.getAllTagsInArray().then((tags) => {
          openModal(modalContentListTags(tags, repoID));
        });
      }
        break;
      case (eTarget.isModalTagListItem): {
        e.preventDefault();
        let repoID = t.closest('.ghstarmngr-modal-tag-list').dataset.repo;
        setExistingTagInRepo(repoID, { tagID: t.dataset.tag, tagName: t.innerText });
      }
        break;
      case (eTarget.isBtExportBookmark || eTarget.isBtExportBookmarkChild !== null): {
        e.preventDefault();
        let ghstarsmngrFeedbackExport = $('.ghstarsmngr-feedback-export');
        let loadMsg = 'Creating bookmarks...the more the ⭐ the more it takes';
        ghstarsmngrFeedbackExport.innerHTML = '&nbsp;';
        ghstarsmngrFeedbackExport.innerHTML = displayLoaderWithMessage(loadMsg);

        getTagsAndRelatedRepos().then((tagsFormattedForExport) => {
          chrome.runtime.sendMessage({
            createBookmark: tagsFormattedForExport,
          }, (response) => {
            $('.ghstarsmngr-feedback-export').innerHTML = response.bookmarkCreated;
            resetFeedbackMessage(3500);
          });
        });
      }
        break;
      case (eTarget.isBtExportJson || eTarget.isBtExportJsonChild !== null): {
        e.preventDefault();
        let ghstarsmngrFeedbackExport = $('.ghstarsmngr-feedback-export');
        ghstarsmngrFeedbackExport.innerHTML = '&nbsp;';
        let loadMsg = 'Creating json , a new tab will open soon...';
        ghstarsmngrFeedbackExport.innerHTML = displayLoaderWithMessage(loadMsg);

        getTagsAndRelatedRepos().then((tagsFormattedForExport) => {
          chrome.runtime.sendMessage({
            createJson: tagsFormattedForExport,
          }, (response) => {
            $('.ghstarsmngr-feedback-export').innerHTML = response.jsonCreated;
            resetFeedbackMessage(3500);
          });
        });
      }
        break;
      case (eTarget.isTagLinkOnTagPage || eTarget.isTagLinkOnTagPageChild !== null): {
        e.preventDefault();
        if (t.classList.contains('active-tag-link') ||
          t.closest('.ghstarsmngr-sidebar-tag-list-link').classList.contains('active-tag-link')) {
          return;
        }

        document.querySelectorAll('.ghstarsmngr-sidebar-tag-list-link').forEach((link) => {
          link.classList.remove('active-tag-link');
        });
        eTarget.isTagLinkOnTagPage ? t.classList.add('active-tag-link') : t.closest('.ghstarsmngr-sidebar-tag-list-link').classList.add('active-tag-link'); // eslint-disable-line
        let target = eTarget.isTagLinkOnTagPage ? t : t.closest('.ghstarsmngr-sidebar-tag-list-link'); // eslint-disable-line
        tagLinkOnTagPageShowRepos(target);
      }
        break;
    }
  }, false);
}

/**
 * Listen for hash changes in URL
 */
export function hashChangeEventListener() {
  window.addEventListener('hashchange', function(e) {
    if (window.location.hash.indexOf(HASH.HOME) > -1) {
      enterTagPage();
    } else {
      leaveTagPage();
    }
  });

  if (window.location.hash.indexOf(HASH.HOME) > -1) {
    enterTagPage();
  }
}

/**
 * Add submit event listeners in DOM elements
 */
export function submitEventListener() {
  document.addEventListener('submit', function(e) {
    let formCreateTag = $('.ghstarmngr-form-create-tag');
    if (e.target === formCreateTag) {
      e.preventDefault();
    }
  });
}

/**
 * Add keyup event listeners
 */
export function keyupEventListener() {
  document.addEventListener('keyup', function(e) {
    const isEscKey = e.keyCode === 27;
    const html = $('html');
    if (isEscKey) {
      if (html.classList.contains('--locked')) {
        $('.ghstarmngr-modal-mask').classList.add('hidden');
        $('.ghstarmngr-modal-container').classList.add('hidden');
        html.classList.remove('--locked');
      }
    }
  });
}
