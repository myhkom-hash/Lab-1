// src/utils/validation.js
// Функції валідації для DTO

function validateRequired(value, fieldName, minLength = 1) {
  if (typeof value === 'string') {
    value = value.trim();
  }

  if (value === undefined || value === null || value === '' || (typeof value === 'string' && value.length < minLength)) {
    return { field: fieldName, message: `${fieldName} обов'язковий та має містити мінімум ${minLength} символів` };
  }
  return null;
}

function validateEnum(value, fieldName, allowedValues) {
  if (typeof value === 'string') {
    value = value.trim();
  }

  if (!allowedValues.includes(value)) {
    return { field: fieldName, message: `${fieldName} має бути однією з: ${allowedValues.join(', ')}` };
  }
  return null;
}

function validatePositiveInteger(value, fieldName, minValue = 1) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < minValue) {
    return { field: fieldName, message: `${fieldName} має бути цілим числом не менше ${minValue}` };
  }
  return null;
}

function validateMaxLength(value, fieldName, maxLength) {
  if (typeof value !== 'string') {
    return null;
  }
  if (value.trim().length > maxLength) {
    return { field: fieldName, message: `${fieldName} має містити не більше ${maxLength} символів` };
  }
  return null;
}

function collectErrors(validations) {
  return validations.filter(Boolean);
}

module.exports = { validateRequired, validateEnum, validatePositiveInteger, validateMaxLength, collectErrors };