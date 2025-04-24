document.addEventListener('DOMContentLoaded', async () => {
    const topbarContainer = document.createElement('div');
    topbarContainer.id = 'topbar';
    document.body.prepend(topbarContainer);
  
    try {
      const response = await fetch('topbar.html');
      const topbarContent = await response.text();
      topbarContainer.innerHTML = topbarContent;
    } catch (error) {
      console.error('Error al cargar el top bar:', error);
    }
  });