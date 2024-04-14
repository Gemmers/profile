// Helper function to clear children of a given element
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// Helper function to clone nodes and append to a target element
function cloneAndAppend(sourceSelector, targetElement) {
  const nodes = document.querySelectorAll(sourceSelector);
  console.log('Number of cards to append:', nodes.length);

  nodes.forEach(node => {
    targetElement.appendChild(node.cloneNode(true));
  });

  console.log('All cards appended');
}

// Event listener for the print preview link
printPreviewLink.addEventListener('click', function(event) {
  event.preventDefault();  // Prevent default link behavior

  const printContent = document.getElementById('printContent');
  clearElement(printContent);  // Clear existing content

  // Ensure DOM updates are visual before adding new nodes
  requestAnimationFrame(() => {
    cloneAndAppend('.card', printContent);  // Clone cards and append
    window.print();  // Initiate print
  });
});
