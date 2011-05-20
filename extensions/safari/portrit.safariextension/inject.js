 // Register for the contextmenu event.
document.addEventListener("contextmenu", handleContextMenu, false);
 
function handleContextMenu(event){
    // Pass the right-clicked element's tag name and the timestamp up to the global page.
    safari.self.tab.setContextMenuEventUserInfo(event, { "tagName": event.target.tagName, 'source_url': window.location.href, 'path': event.target.src});
}