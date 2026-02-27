document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactSupportForm');
    const callBtn = document.getElementById('callUsBtn');

    callBtn?.addEventListener('click', () => {
        window.location.href = 'tel:+639554216789';
    });

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = document.getElementById('subject')?.value || '';
        const message = document.getElementById('message')?.value?.trim() || '';

        if (!subject) {
            Components.showToast('Please choose a subject.', 'warning');
            return;
        }
        if (message.length < 8) {
            Components.showToast('Please add a few more details so we can help.', 'warning');
            return;
        }

        Components.showToast('Message sent! We will reply shortly.', 'success');

        const preservedName = document.getElementById('name')?.value || '';
        const preservedEmail = document.getElementById('email')?.value || '';
        form.reset();
        if (preservedName) document.getElementById('name').value = preservedName;
        if (preservedEmail) document.getElementById('email').value = preservedEmail;
    });
});
