(function () {
  'use strict';

  const form = document.getElementById('bmiForm');
  const errors = {
    name: document.getElementById('err-name'),
    age: document.getElementById('err-age'),
    sex: document.getElementById('err-sex'),
    weight: document.getElementById('err-weight'),
    height: document.getElementById('err-height')
  };

  const resultCard = document.getElementById('resultCard');
  const resultName = document.getElementById('resultName');
  const resultBmi = document.getElementById('resultBmi');
  const resultCategory = document.getElementById('resultCategory');
  const resultMessage = document.getElementById('resultMessage');

  // Ensure this URL is your most recent deployment URL
  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxjEO5DSSjCpuI0Wp-NHtSNeKDZQY4YG0mtAprhpR_ZNBY06zA2F7EDzrDO-gxb_V0I/exec';

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function clearErrors() { Object.values(errors).forEach(el => { el.textContent = ''; }); }

  function setError(fieldId, message) {
    if (errors[fieldId]) errors[fieldId].textContent = message;
    const el = document.getElementById(fieldId);
    if (el) el.setAttribute('aria-invalid', 'true');
  }

  function validateForm() {
    clearErrors();
    let valid = true;
    const data = {};

    const fields = [
      { id: 'name', val: document.getElementById('name').value.trim(), msg: 'Enter name.' },
      { id: 'age', val: parseInt(document.getElementById('age').value, 10), msg: 'Valid age (1-120).' },
      { id: 'sex', val: document.getElementById('sex').value, msg: 'Select sex.' },
      { id: 'weight', val: parseFloat(document.getElementById('weight').value), msg: 'Valid weight (kg).' },
      { id: 'height', val: parseFloat(document.getElementById('height').value), msg: 'Valid height (50-300 cm).' }
    ];

    // Basic validation logic
    if (!fields[0].val || fields[0].val.length > 100) { setError('name', fields[0].msg); valid = false; }
    if (Number.isNaN(fields[1].val) || fields[1].val < 1 || fields[1].val > 120) { setError('age', fields[1].msg); valid = false; }
    if (!fields[2].val) { setError('sex', fields[2].msg); valid = false; }
    if (Number.isNaN(fields[3].val) || fields[3].val <= 0 || fields[3].val > 635) { setError('weight', fields[3].msg); valid = false; }
    if (Number.isNaN(fields[4].val) || fields[4].val < 50 || fields[4].val > 300) { setError('height', fields[4].msg); valid = false; }

    if (valid) {
      data.name = fields[0].val; data.age = fields[1].val; data.sex = fields[2].val;
      data.weight = fields[3].val; data.heightCm = fields[4].val;
      return data;
    }
    return null;
  }

  function computeBmi(weight, heightCm) {
    const bmi = +(weight / ((heightCm / 100) ** 2)).toFixed(1);
    if (bmi < 18.5) return { bmi, category: 'Underweight', color: '#5DADE2', message: 'Consider a balanced diet.' };
    if (bmi < 25) return { bmi, category: 'Normal', color: '#58D68D', message: 'Great job!' };
    if (bmi < 30) return { bmi, category: 'Overweight', color: '#F5B041', message: 'Mindful eating.' };
    return { bmi, category: 'Obese', color: '#EC7063', message: 'Consult a provider.' };
  }

  async function recordSubmission(data, bmiInfo) {
    const params = new URLSearchParams({
      name: data.name,
      age: data.age,
      sex: data.sex,
      weight: data.weight,
      heightCm: data.heightCm,
      bmi: bmiInfo.bmi,
      category: bmiInfo.category,
      timestamp: new Date().toISOString()
    });

    try {
      await fetch(WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: params });
    } catch (err) { console.error('Submission failed', err); }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const data = validateForm();
    if (!data) return;

    const bmiInfo = computeBmi(data.weight, data.heightCm);
    resultCard.classList.remove('hidden');
    resultName.textContent = `Hello, ${escapeHtml(data.name)}`;
    resultBmi.textContent = bmiInfo.bmi;
    resultCategory.textContent = bmiInfo.category;
    resultCategory.style.backgroundColor = bmiInfo.color;
    resultMessage.textContent = bmiInfo.message;

    if (document.getElementById('recordOptIn').checked) {
      recordSubmission(data, bmiInfo);
    }
  });
})();