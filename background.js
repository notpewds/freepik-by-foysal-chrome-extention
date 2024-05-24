/* 
 * Chrome Omnibox API 
 */

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
// see the note below on how to choose currentWindow or lastFocusedWindow
chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
  let url = tabs[0].url;
  // use `url` here inside the callback because it's asynchronous!
  console.log(url);
});
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    suggest([
      {
        content: text + " one", 
        description: "the first one"
      },
      {
        content: text + " number two", 
        description: "the second entry"
      }
    ]);
});

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    console.log('inputEntered: ' + text);
    alert('You just typed "' + text + '"');
});

/* 
 * Chrome Commands API
 */
chrome.commands.onCommand.addListener(function(command) {
  console.log('Command:', command);
});


console.log("ok")
