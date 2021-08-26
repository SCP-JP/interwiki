/* global wlBranches, scpBranches, requestStyleChange, addTranslations */
/* exported getQueryString, pullStyles, createInterwiki */

/**
 * Retrieves the value of the query parameter in the URL with the
 * given key, if provided, otherwise returns the empty string.
 *
 * @param {String} query - The URL query.
 * @param {String} name - The name of the parameter to get.
 */
function getQueryString(query, name) {
  // Get query parameters from the URL
  if (query.indexOf("?") === 0) query = query.substring(1);
  var parameters = query.split("&");
  // Iterate parameters in reverse so later values override earlier ones
  parameters.reverse();
  // Find the parameter whose key is the given name
  var matchingParameter = parameters.find(function (parameter) {
    return parameter.indexOf(name + "=") === 0;
  });
  if (matchingParameter == null) return "";
  // Return the part of the parameter following the "="
  return decodeURIComponent(matchingParameter.substring(name.length + 1));
}

/**
 * Finds styleFrames embedded in the parent page and pulls their style
 * change requests for the interwikiFrame to use.
 *
 * styleFrames will also attempt to push their styles to the
 * interwikiFrame. The two methods work in unison to ensure that the
 * interwikiFrame receives all styles regardless of what order the iframes
 * initialise in.
 *
 * This function is also called on window reload prompted by the
 * interwiki's click-to-refresh, at which point it is very likely that all
 * styleFrames will have finished initialising.
 */
function pullStyles() {
  // Find styleFrames in the parent that have initialised before this
  // interwikiFrame did, and pull their query parameters
  Array.prototype.slice.call(parent).forEach(function (frame) {
    try {
      if (frame.isStyleFrame) {
        requestStyleChange(frame.location.search);
      }
    } catch (error) {
      // styleFrames that have not finished initialising will push their
      // styles to the interwikiFrame when they are ready
    }
  });
}

/**
 * Main procedure for the interwiki. Prepare contextual data, apply CSS
 * styling, and add links to translations.
 *
 * @param {"scp" | "wl"} community - The community of the interwiki.
 * @param {String} pagename - The Wikidot fullname of the current page.
 * @param {String} currentBranchLang - The language code of the current branch
 * of the given community.
 */
function createInterwiki(community, pagename, currentBranchLang) {
  pagename = pagename.replace(/^_default:/, "");

  // Get the list of branches for the given community
  var branches = { wl: wlBranches, scp: scpBranches }[community] || {};

  pullStyles();
  addTranslations(branches, currentBranchLang);
}
