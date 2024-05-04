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

// Helper function to remove 'text-white' and 'text-custom' classes from all elements
function removeTextClasses() {
  const elements = document.querySelectorAll('.text-white, .text-custom');
  elements.forEach(element => {
    element.classList.remove('text-white', 'text-custom');
  });
}

// Event listener for the print preview link
printPreviewLink.addEventListener('click', function(event) {
  event.preventDefault();  // Prevent default link behavior

  const printContent = document.getElementById('printContent');
  clearElement(printContent);  // Clear existing content

  // Clone cards and append to printContent
  cloneAndAppend('.card', printContent);

  // Remove 'text-white' and 'text-custom' classes from all elements
  removeTextClasses();

  // Ensure DOM updates are visual before initiating print
  requestAnimationFrame(() => {
    window.print();  // Initiate print
  });
});
