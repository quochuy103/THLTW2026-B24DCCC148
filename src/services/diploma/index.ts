import { request } from '@umijs/max';
import type {
  DiplomaRegister,
  GraduationDecision,
  FormField,
  DiplomaInfo,
  DiplomaLookupRequest,
  DiplomaLookupResponse,
} from '@/models/diploma';

const API_PREFIX = '/api/diploma';

// ==================== Diploma Register Services ====================

export async function getDiplomaRegisters(params?: any) {
  return request<API.Response<DiplomaRegister[]>>(`${API_PREFIX}/registers`, {
    method: 'GET',
    params,
  });
}

export async function getDiplomaRegisterById(id: string) {
  return request<API.Response<DiplomaRegister>>(`${API_PREFIX}/registers/${id}`, {
    method: 'GET',
  });
}

export async function createDiplomaRegister(data: Partial<DiplomaRegister>) {
  return request<API.Response<DiplomaRegister>>(`${API_PREFIX}/registers`, {
    method: 'POST',
    data,
  });
}

export async function updateDiplomaRegister(id: string, data: Partial<DiplomaRegister>) {
  return request<API.Response<DiplomaRegister>>(`${API_PREFIX}/registers/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteDiplomaRegister(id: string) {
  return request<API.Response<void>>(`${API_PREFIX}/registers/${id}`, {
    method: 'DELETE',
  });
}

// ==================== Graduation Decision Services ====================

export async function getGraduationDecisions(params?: any) {
  return request<API.Response<GraduationDecision[]>>(`${API_PREFIX}/decisions`, {
    method: 'GET',
    params,
  });
}

export async function getGraduationDecisionById(id: string) {
  return request<API.Response<GraduationDecision>>(`${API_PREFIX}/decisions/${id}`, {
    method: 'GET',
  });
}

export async function createGraduationDecision(data: Partial<GraduationDecision>) {
  return request<API.Response<GraduationDecision>>(`${API_PREFIX}/decisions`, {
    method: 'POST',
    data,
  });
}

export async function updateGraduationDecision(id: string, data: Partial<GraduationDecision>) {
  return request<API.Response<GraduationDecision>>(`${API_PREFIX}/decisions/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteGraduationDecision(id: string) {
  return request<API.Response<void>>(`${API_PREFIX}/decisions/${id}`, {
    method: 'DELETE',
  });
}

// ==================== Form Field Configuration Services ====================

export async function getFormFields(params?: any) {
  return request<API.Response<FormField[]>>(`${API_PREFIX}/form-fields`, {
    method: 'GET',
    params,
  });
}

export async function getFormFieldById(id: string) {
  return request<API.Response<FormField>>(`${API_PREFIX}/form-fields/${id}`, {
    method: 'GET',
  });
}

export async function createFormField(data: Partial<FormField>) {
  return request<API.Response<FormField>>(`${API_PREFIX}/form-fields`, {
    method: 'POST',
    data,
  });
}

export async function updateFormField(id: string, data: Partial<FormField>) {
  return request<API.Response<FormField>>(`${API_PREFIX}/form-fields/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteFormField(id: string) {
  return request<API.Response<void>>(`${API_PREFIX}/form-fields/${id}`, {
    method: 'DELETE',
  });
}

// ==================== Diploma Info Services ====================

export async function getDiplomaInfos(params?: any) {
  return request<API.Response<DiplomaInfo[]>>(`${API_PREFIX}/infos`, {
    method: 'GET',
    params,
  });
}

export async function getDiplomaInfoById(id: string) {
  return request<API.Response<DiplomaInfo>>(`${API_PREFIX}/infos/${id}`, {
    method: 'GET',
  });
}

export async function createDiplomaInfo(data: any) {
  return request<API.Response<DiplomaInfo>>(`${API_PREFIX}/infos`, {
    method: 'POST',
    data,
  });
}

export async function updateDiplomaInfo(id: string, data: any) {
  return request<API.Response<DiplomaInfo>>(`${API_PREFIX}/infos/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteDiplomaInfo(id: string) {
  return request<API.Response<void>>(`${API_PREFIX}/infos/${id}`, {
    method: 'DELETE',
  });
}

export async function getDiplomaInfosByRegister(registerId: string) {
  return request<API.Response<DiplomaInfo[]>>(`${API_PREFIX}/infos/by-register/${registerId}`, {
    method: 'GET',
  });
}

export async function getDiplomaInfosByDecision(decisionId: string) {
  return request<API.Response<DiplomaInfo[]>>(`${API_PREFIX}/infos/by-decision/${decisionId}`, {
    method: 'GET',
  });
}

// ==================== Diploma Lookup Services ====================

export async function lookupDiploma(params: DiplomaLookupRequest) {
  // Kiểm tra ít nhất 2 tham số được nhập
  const filledParams = Object.entries(params).filter(([, value]) => value !== undefined && value !== '');
  if (filledParams.length < 2) {
    throw new Error('Vui lòng nhập ít nhất 2 tham số để tra cứu');
  }
  
  return request<API.Response<DiplomaLookupResponse[]>>(`${API_PREFIX}/lookup`, {
    method: 'GET',
    params,
  });
}

export async function getLookupStatistics(decisionId: string) {
  return request<API.Response<any>>(`${API_PREFIX}/lookup-stats/${decisionId}`, {
    method: 'GET',
  });
}

export async function recordLookup(diplomaId: string, decisionId: string) {
  return request<API.Response<void>>(`${API_PREFIX}/record-lookup`, {
    method: 'POST',
    data: { diplomaId, decisionId },
  });
}
