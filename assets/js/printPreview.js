document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('printPreviewLink').addEventListener('click', function(event) {
    event.preventDefault();  // Prevent default action of the link
    const printContent = document.getElementById('printContent');
    const cards = document.querySelectorAll('.card');
    printContent.innerHTML = '';  // Clear previous content
    cards.forEach(card => {
      printContent.appendChild(card.cloneNode(true));
    });
    window.print();
  });
});
