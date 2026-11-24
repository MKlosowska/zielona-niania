
// Inicjalizacja lokalnej warstwy danych dataLayer (wejście dla GTM na Spotkaniu 3)
window.dataLayer = window.dataLayer || [];

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. SYGNAŁY KLIKNIĘCIA W CTA (cta_click) ---
  const ctaButtons = document.querySelectorAll('[data-cta-location]');
  ctaButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const locationName = btn.getAttribute('data-cta-location');
      window.dataLayer.push({
        event: 'cta_click',
        cta_location: locationName
      });
    });
  });

  // --- 2. OBSŁUGA FORMULARZA, WALIDACJA ORAZ SYGNAŁY form_start I lead_success ---
  const form = document.getElementById('lead-form');
  const submitBtn = document.getElementById('submit-btn');
  const successBox = document.getElementById('form-success');

  const emailInput = document.getElementById('client-email');
  const plantsInput = document.getElementById('plant-count');
  const topicSelect = document.getElementById('service-topic');

  const errorEmail = document.getElementById('error-email');
  const errorPlants = document.getElementById('error-plants');
  const errorTopic = document.getElementById('error-topic');

  let formStartSent = false;
  let leadSuccessSent = false;

  // Sygnał form_start: pierwsza zmiana wartości pola w tym wyświetleniu strony
  [emailInput, plantsInput, topicSelect].forEach((field) => {
    const handleFirstChange = () => {
      if (!formStartSent && !leadSuccessSent) {
        formStartSent = true;
        window.dataLayer.push({
          event: 'form_start',
          form_id: 'lead-form'
        });
      }
    };
    field.addEventListener('input', handleFirstChange);
    field.addEventListener('change', handleFirstChange);
  });

  function setFieldError(inputEl, errorEl, message) {
    if (message) {
      inputEl.classList.add('input-error');
      inputEl.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
    } else {
      inputEl.classList.remove('input-error');
      inputEl.removeAttribute('aria-invalid');
      errorEl.textContent = '';
    }
  }

  // Funkcja walidacji pól formularza
  function validateForm() {
    let isValid = true;

    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      setFieldError(emailInput, errorEmail, 'Podaj fikcyjny adres e-mail (np. test@example.com).');
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      setFieldError(emailInput, errorEmail, 'Wpisz poprawny format e-mail (np. test@example.com).');
      isValid = false;
    } else {
      setFieldError(emailInput, errorEmail, '');
    }

    const plantsVal = plantsInput.value.trim();
    const plantsNum = Number(plantsVal);
    if (!plantsVal) {
      setFieldError(plantsInput, errorPlants, 'Podaj liczbę roślin do opieki.');
      isValid = false;
    } else if (!Number.isInteger(plantsNum) || plantsNum < 1 || plantsNum > 200) {
      setFieldError(plantsInput, errorPlants, 'Wpisz liczbę całkowitą od 1 do 200.');
      isValid = false;
    } else {
      setFieldError(plantsInput, errorPlants, '');
    }

    if (!topicSelect.value) {
      setFieldError(topicSelect, errorTopic, 'Wybierz temat zainteresowania z listy.');
      isValid = false;
    } else {
      setFieldError(topicSelect, errorTopic, '');
    }

    return isValid;
  }

  // Obsługa wysłania formularza
  form.addEventListener('submit', (e) => {
    // Brak żądania do serwera i brak dopisywania pól do adresu URL
    e.preventDefault();

    // Blokada drugiego sukcesu w tym samym wyświetleniu strony
    if (leadSuccessSent) {
      return;
    }

    if (!validateForm()) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Potwierdzony sukces demonstracyjny (wykonywany maksymalnie raz)
    leadSuccessSent = true;
    submitBtn.disabled = true;
    emailInput.disabled = true;
    plantsInput.disabled = true;
    topicSelect.disabled = true;

    // Wysłanie sygnału sukcesu do dataLayer (bez treści pól formularza)
    window.dataLayer.push({
      event: 'lead_success',
      form_id: 'lead-form'
    });

    successBox.hidden = false;
    successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // --- 3. ZARZĄDZANIE ZGODAMI (przygotowanie pod Spotkanie 3) ---
  const consentModal = document.getElementById('consent-modal');
  const openConsentBtn = document.getElementById('open-consent-btn');
  const footerConsentBtn = document.getElementById('footer-consent-btn');
  const analyticsCheckbox = document.getElementById('consent-analytics');
  const marketingCheckbox = document.getElementById('consent-marketing');
  const btnRejectAll = document.getElementById('consent-reject-all');
  const btnSaveSelected = document.getElementById('consent-save-selected');
  const btnAcceptAll = document.getElementById('consent-accept-all');
  const CONSENT_STORAGE_KEY = 'zielona_niania_consent_v1';

  function saveConsent(state) {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    consentModal.hidden = true;
  }

  function openConsentModal() {
    const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      analyticsCheckbox.checked = Boolean(parsed.analytics);
      marketingCheckbox.checked = Boolean(parsed.marketing);
    }
    consentModal.hidden = false;
    btnRejectAll.focus();
  }

  openConsentBtn.addEventListener('click', openConsentModal);
  footerConsentBtn.addEventListener('click', openConsentModal);

  btnRejectAll.addEventListener('click', () => {
    analyticsCheckbox.checked = false;
    marketingCheckbox.checked = false;
    saveConsent({ analytics: false, marketing: false });
  });

  btnSaveSelected.addEventListener('click', () => {
    saveConsent({
      analytics: analyticsCheckbox.checked,
      marketing: marketingCheckbox.checked
    });
  });

  btnAcceptAll.addEventListener('click', () => {
    analyticsCheckbox.checked = true;
    marketingCheckbox.checked = true;
    saveConsent({ analytics: true, marketing: true });
  });
});
