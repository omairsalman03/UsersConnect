document.addEventListener('DOMContentLoaded', function() {
  const userId = document.querySelector('[data-userid]')?.dataset.userid;
  if (!userId) return;

  // ============================================
  // SECTION 1: Edit Name
  // ============================================
  const nameForm = document.getElementById('admin-edit-name-form');
  const nameMsg = document.getElementById('name-msg');

  if (nameForm) {
    nameForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      nameMsg.textContent = '';
      nameMsg.className = 'form-text ms-2';

      const name = document.getElementById('edit-name').value.trim();

      if (!name || name.length < 1) {
        nameMsg.textContent = 'Name cannot be empty.';
        nameMsg.classList.add('text-danger');
        return;
      }

      try {
        const res = await fetch(`/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        const result = await res.json();

        if (res.ok && result.success) {
          nameMsg.textContent = '✓ Name updated successfully!';
          nameMsg.classList.add('text-success');
          
          // Update the header display name
          const headerName = document.querySelector('.edit-profile-card h5');
          if (headerName) headerName.textContent = name;
        } else {
          nameMsg.textContent = result.message || 'Failed to update name.';
          nameMsg.classList.add('text-danger');
        }
      } catch (err) {
        nameMsg.textContent = 'Error updating name.';
        nameMsg.classList.add('text-danger');
      }
    });
  }

  // ============================================
  // SECTION 2: Edit Email
  // ============================================
  const emailForm = document.getElementById('admin-edit-email-form');
  const emailMsg = document.getElementById('email-msg');

  if (emailForm) {
    emailForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      emailMsg.textContent = '';
      emailMsg.className = 'form-text ms-2';

      const email = document.getElementById('edit-email').value.trim();

      if (!email) {
        emailMsg.textContent = 'Email cannot be empty.';
        emailMsg.classList.add('text-danger');
        return;
      }

      try {
        const res = await fetch(`/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const result = await res.json();

        if (res.ok && result.success) {
          emailMsg.textContent = '✓ Email updated! User must verify the new email address.';
          emailMsg.classList.add('text-success');
          
          // Reload to show changes
          setTimeout(() => location.reload(), 2000);
        } else {
          emailMsg.textContent = result.message || 'Failed to update email.';
          emailMsg.classList.add('text-danger');
        }
      } catch (err) {
        emailMsg.textContent = 'Error updating email.';
        emailMsg.classList.add('text-danger');
      }
    });
  }

  // ============================================
  // SECTION 3: Change Password
  // ============================================
  const passwordForm = document.getElementById('admin-edit-password-form');
  const passwordMsg = document.getElementById('password-msg');

  if (passwordForm) {
    passwordForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      passwordMsg.textContent = '';
      passwordMsg.className = 'form-text ms-2';

      const newPassword = document.getElementById('new-password').value;

      if (!newPassword) {
        passwordMsg.textContent = 'Please enter a new password.';
        passwordMsg.classList.add('text-danger');
        return;
      }

      if (newPassword.length < 6) {
        passwordMsg.textContent = 'Password must be at least 6 characters long.';
        passwordMsg.classList.add('text-danger');
        return;
      }

      try {
        const res = await fetch(`/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword })
        });
        const result = await res.json();

        if (res.ok && result.success) {
          passwordMsg.textContent = '✓ Password changed successfully!';
          passwordMsg.classList.add('text-success');
          
          // Clear the password field
          document.getElementById('new-password').value = '';
        } else {
          passwordMsg.textContent = result.message || 'Failed to change password.';
          passwordMsg.classList.add('text-danger');
        }
      } catch (err) {
        passwordMsg.textContent = 'Error changing password.';
        passwordMsg.classList.add('text-danger');
      }
    });
  }
});