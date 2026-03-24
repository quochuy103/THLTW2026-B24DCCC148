export interface DiplomaRegistry {
  id: string; 
  year: number;
  currentRunningNumber: number; 
}

export interface GraduationDecision {
  decisionId: string;
  decisionNumber: string; 
  issueDate: string;
  summary: string;
  registryYear: number;
}

export interface DiplomaTemplateField {
  id: string;
  fieldName: string;
  dataType: 'String' | 'Number' | 'Date';
}

export interface DiplomaRecord {
  id: string;
  registryNumber: number; 
  diplomaNumber: string; 
  studentId: string;
  fullName: string;
  dateOfBirth: string;
  decisionId: string; 
  dynamicData: Record<string, any>;
}

export interface LookupCount {
  decisionId: string;
  count: number;
}

// LocalStorage helpers
const getObj = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setObj = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Registries
export const getRegistries = (): DiplomaRegistry[] => getObj('diploma_registries');
export const saveRegistries = (data: DiplomaRegistry[]) => setObj('diploma_registries', data);
export const addRegistry = (registry: DiplomaRegistry) => {
  const current = getRegistries();
  saveRegistries([...current, registry]);
};
export const getRegistryByYear = (year: number) => getRegistries().find(r => r.year === year);

// Decisions
export const getDecisions = (): GraduationDecision[] => getObj('graduation_decisions');
export const saveDecisions = (data: GraduationDecision[]) => setObj('graduation_decisions', data);
export const addDecision = (decision: GraduationDecision) => {
  const current = getDecisions();
  saveDecisions([...current, decision]);
};
export const updateDecision = (id: string, updated: GraduationDecision) => {
  saveDecisions(getDecisions().map(d => d.decisionId === id ? updated : d));
};
export const deleteDecision = (id: string) => {
  saveDecisions(getDecisions().filter(d => d.decisionId !== id));
};

// Template Fields
export const getTemplateFields = (): DiplomaTemplateField[] => getObj('diploma_template_fields');
export const saveTemplateFields = (data: DiplomaTemplateField[]) => setObj('diploma_template_fields', data);
export const addTemplateField = (field: DiplomaTemplateField) => {
  const current = getTemplateFields();
  saveTemplateFields([...current, field]);
};
export const updateTemplateField = (id: string, updated: DiplomaTemplateField) => {
  saveTemplateFields(getTemplateFields().map(f => f.id === id ? updated : f));
};
export const deleteTemplateField = (id: string) => {
  saveTemplateFields(getTemplateFields().filter(f => f.id !== id));
};

// Diplomas
export const getDiplomas = (): DiplomaRecord[] => getObj('diplomas');
export const saveDiplomas = (data: DiplomaRecord[]) => setObj('diplomas', data);
export const addDiploma = (baseData: Omit<DiplomaRecord, 'id' | 'registryNumber'>): DiplomaRecord => {
  const decisions = getDecisions();
  const decision = decisions.find(d => d.decisionId === baseData.decisionId);
  if (!decision) throw new Error('Decision not found');

  const registries = getRegistries();
  const registry = registries.find(r => r.year === decision.registryYear);
  if (!registry) throw new Error('Registry not found for the given decision. Please ensure a registry exists for the year ' + decision.registryYear);

  // Auto-increment
  registry.currentRunningNumber += 1;
  const newRegistryNumber = registry.currentRunningNumber;
  saveRegistries(registries); // persist the increment

  const newDiploma = {
    ...baseData,
    id: Date.now().toString(),
    registryNumber: newRegistryNumber
  };

  const current = getDiplomas();
  saveDiplomas([...current, newDiploma]);
  return newDiploma;
};
export const updateDiploma = (id: string, updated: Partial<DiplomaRecord>) => {
  saveDiplomas(getDiplomas().map(d => d.id === id ? { ...d, ...updated, registryNumber: d.registryNumber } : d));
};
export const deleteDiploma = (id: string) => {
  saveDiplomas(getDiplomas().filter(d => d.id !== id));
};

// Lookup & Tracking
export const getLookupCounts = (): LookupCount[] => getObj('diploma_lookup_counts');
export const incrementLookupCount = (decisionId: string) => {
  const counts = getLookupCounts();
  const existing = counts.find(c => c.decisionId === decisionId);
  if (existing) {
    existing.count += 1;
  } else {
    counts.push({ decisionId, count: 1 });
  }
  setObj('diploma_lookup_counts', counts);
};
