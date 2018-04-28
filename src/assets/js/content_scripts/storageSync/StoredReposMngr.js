import { modalFeedbackMessage } from '../../constants';
import { StoredGenericMngr } from './StoredGenericMngr';
import { StoredTagsMngr } from './StoredTagsMngr';
import { showFeedbackInModal } from '../dom/uiModal';
import { getUserStarredRepos } from '../githubAPI';
import { getAccessTokenFromStorage } from '../storageSync/initStorageSync';

export const StoredReposMngr = (() => {
  /**
   * @param {Number} repoID
   * @param {Object} tag Details about the tag
   * @param {String} tag.tagID The id of the tag.
   * @param {String} tag.tagName The name of the tag
   */
  async function writeTagToRepo(repoID, tag) {
    let tagID = Number(tag.tagID);
    let tagName = tag.tagName;
    let storedRepos = await StoredGenericMngr.read('r');
    let hasRepoInStorage = repoID in storedRepos;
    if (hasRepoInStorage) {
      let hasTagInStoredRepo = storedRepos[repoID].indexOf(tagID) > -1;
      if (hasTagInStoredRepo) {
        showFeedbackInModal(modalFeedbackMessage(tagName).TAG_ALREADY_EXIST);
      } else {
        let limitOfTagsPerRepoExceeded = storedRepos[repoID].length >= 6;
        if (limitOfTagsPerRepoExceeded) {
          showFeedbackInModal(modalFeedbackMessage(tagName).TAG_LIMIT);
        } else {
          storedRepos[repoID].push(tagID);
          await StoredGenericMngr.createOrUpdate('r', storedRepos);
          showFeedbackInModal(modalFeedbackMessage(tagName).TAG_CREATED);
        }
      }
    } else {
      storedRepos[repoID] = [];
      storedRepos[repoID].push(tagID);
      await StoredGenericMngr.createOrUpdate('r', storedRepos);
      showFeedbackInModal(modalFeedbackMessage(tagName).TAG_CREATED);
    }
  }

  /**
   * @param {Object} storedRepos
   * @param {Object} repoID
   * @param {Object} tagID
   * @param {String} tagName
   */
  async function createRepoAndPushTag(storedRepos, repoID, tagID, tagName) {
    let newTagNormalized = StoredTagsMngr.normalizeTagName(tagName);
    storedRepos[repoID] = [];
    storedRepos[repoID].push(tagID);
    await StoredGenericMngr.createOrUpdate('r', storedRepos);
    showFeedbackInModal(modalFeedbackMessage(newTagNormalized).TAG_CREATED);
  }

  /**
   * @return {Array}
   */
  async function getTagsAndRelatedRepos() {
    let token = await getAccessTokenFromStorage();
    let starredRepos = await getUserStarredRepos(token);
    let storedTags = await StoredTagsMngr.getAllTagsInArray();
    let storedRepos = await StoredGenericMngr.read('r');
    return getStarredReposWithTags(starredRepos, storedRepos, storedTags);
  }

  /**
   * @param {Array|Object} starredRepos
   * @param {Object} storedRepos
   * @param {Object} storedTags
   * @return {Array}
   */
  function getStarredReposWithTags(starredRepos, storedRepos, storedTags) {
    let tagsAndRelatedRepos = [];
    storedTags.map((storedTag) => {
      tagsAndRelatedRepos.push({
        tag: storedTag,
        repos: starredRepos.filter((starredRepo) => {
          return starredRepo.id in storedRepos;
        }).filter((taggedRepo) => {
          return storedRepos[taggedRepo.id].indexOf(storedTag.tagID) > -1;
        }),
      });
    });
    tagsAndRelatedRepos.push(getUntaggedRepos(starredRepos, storedRepos));
    return tagsAndRelatedRepos;
  }

  /**
   * @param {Array} starredRepos
   * @param {Object} storedRepos
   * @return {Object}
   */
  function getUntaggedRepos(starredRepos, storedRepos) {
    return {
      tag: null,
      repos: starredRepos.filter((starredRepo) => {
        return !(starredRepo.id in storedRepos);
      }),
    };
  }

  /**
   * Check if a Repository exist
   * @param {Number} repoID
   * @return {Boolean}
   */
  async function hasRepoInStorage(repoID) {
    let storedRepos = await StoredGenericMngr.read('r');
    return repoID in storedRepos;
  }

  /**
   * Check if a Repository exist
   * @param {Number} repoID
   * @return {Object}
   */
  async function getRepoTagsByRepoID(repoID) {
    let storedRepos = await StoredGenericMngr.read('r');
    return storedRepos[repoID];
  }

  /**
   * Check if some tag reference still exist in a repo to see if it can be deleted entirely from
   * storage
   * @param {Object} storedRepos
   * @param {Number} tagID
   * @return {*} tagStillExist
   */
  function tagRefStillExistInARepo(storedRepos, tagID) {
    let tagStillExist = false;
    for (let repo in storedRepos) {
      if (storedRepos[repo].indexOf(tagID) > -1) {
        return repo;
      }
    }
    return tagStillExist;
  }

  /**
   * @param {String} tagID
   */
  async function deleteTagFromAllRepos(tagID) {
    let storedTags = await StoredGenericMngr.read('t');
    let storedRepos = await StoredGenericMngr.read('r');

    const hasRepoWithThisTag = tagRefStillExistInARepo(storedRepos, Number(tagID));
    const tagName = StoredTagsMngr.getTagNameByID(storedTags, tagID);

    if (hasRepoWithThisTag) {
      await deleteTagFromRepo(hasRepoWithThisTag, tagName);
      await deleteTagFromAllRepos(tagID);
    } else {
      await StoredGenericMngr.deleteKey('t', tagID);
    }
  }

  /**
   * @param {String} repoID
   * @param {String} tagName
   */
  async function deleteTagFromRepo(repoID, tagName) {
    let storedTags = await StoredGenericMngr.read('t');
    let storedRepos = await StoredGenericMngr.read('r');
    let tagID = await StoredTagsMngr.getTagIDByName(storedTags, tagName);
    storedRepos[repoID].splice(storedRepos[repoID].indexOf(tagID), 1);
    await StoredGenericMngr.createOrUpdate('r', storedRepos);
    if (!tagRefStillExistInARepo(storedRepos, tagID)) {
      await StoredGenericMngr.deleteKey('t', tagID);
    }
    const repoHasNoMoreTags = !storedRepos[repoID].length;
    if (repoHasNoMoreTags) {
      await StoredGenericMngr.deleteKey('r', repoID);
    }
  }

  return {
    createRepoAndPushTag,
    getTagsAndRelatedRepos,
    writeTagToRepo,
    getStarredReposWithTags,
    getUntaggedRepos,
    hasRepoInStorage,
    deleteTagFromRepo,
    deleteTagFromAllRepos,
    getRepoTagsByRepoID,
  };
})();
