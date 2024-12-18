import {bindModelToTextContent} from './bind-text';

function getNestedValue(model:any, path:string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], model);
}

function setNestedValue(model:any, path:string, value:any) {
  const parts = path.split('.');
  let current = model;

  // Idziemy do ostatniego elementu w ścieżce
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];  // Przechodzimy po zagnieżdżonych obiektach
  }

  // Teraz aktualizujemy wartość właściwości w ostatnim obiekcie
  const lastKey = parts[parts.length - 1];
  if (current) {
    current[lastKey] = value;
    model[lastKey] = value;
  }

  bindModelToTextContent(model);
}

export {getNestedValue, setNestedValue};
