import FormData from 'form-data';

// eslint-disable-next-line import/prefer-default-export
export function formDataFromObject(obj: Record<string, unknown>) {
  return Object.keys(obj).reduce((formData, curKey) => {
    formData.append(curKey, obj[curKey]);
    return formData;
  }, new FormData());
}
