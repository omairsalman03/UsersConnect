document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('[data-dismiss-notice]');
  if (!button) return;

  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const res = await fetch('/config/notice/dismissed', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: button.dataset.dismissNotice }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      button.closest('.alert').remove();
    } catch (err) {
      console.error('Failed to dismiss notice', err);
      button.disabled = false;
    }
  });
});