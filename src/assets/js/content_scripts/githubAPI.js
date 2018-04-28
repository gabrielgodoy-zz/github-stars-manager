import {GH} from '../constants';
import KEYS from '../keys';
import * as axios from 'axios';

// repoIDByName = 'https://api.github.com/repos/[USER]/[REPO]';
// repoAPIByID = 'https://api.github.com/repositories/[ID]';

/**
 * Get access Token
 * @param {String} code Authentication code
 * @return {String} accessToken
 */
export async function getAccessToken(code) {
  const accessTokenURL = 'https://github.com/login/oauth/access_token';
  let accessToken;
  try {
    accessToken = await axios.post(accessTokenURL, {
      client_id: KEYS.ID,
      client_secret: KEYS.SECRET,
      code: code,
    });
  } catch (error) {
    accessToken = 'Error';
  }
  return accessToken;
}

/**
 * Get code url parameter
 * @param {String} url current URL
 * @return {String|Boolean}
 */
export function getCodeFromURL(url) {
  let error = url.match(/[&?]error=([^&]+)/);
  if (error) {
    throw new Error(`Error getting authorization code: ${error[1]}`);
  }
  if (url.match(/[&?]code=([\w\/\-]+)/)) {
    return url.match(/[&?]code=([\w\/\-]+)/)[1];
  }
  return false;
}

/**
 * Get User details
 * @param {String} accessToken
 * @return {Promise} userDetails
 */
export async function getUserDetails(accessToken) {
  let userDetails;
  const apiUser = `${GH.API}user?access_token=${accessToken}`;

  try {
    userDetails = await axios.get(apiUser);
  } catch (error) {
    throw error;
  }
  return userDetails;
}

/**
 * Get user starred repositories
 * @param {String} accessToken
 * @return {Array} userDetails
 */
export async function getUserStarredRepos(accessToken) {
  const queries = `per_page=100&access_token=${accessToken}`;
  const apiStarredRepos = `${GH.API}user/starred?${queries}`;

  let page = 1;
  let allStars = [];
  let data;

  do {
    try {
      data = (await axios.get(`${apiStarredRepos}&page=${page}`)).data;
      allStars = allStars.concat(data);
    } catch (error) {
      throw error;
    }
    page++;
  } while (data.length);
  return allStars;
}
