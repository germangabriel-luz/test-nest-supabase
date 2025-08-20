export interface FormsLog {
  id: string; 
  form_id: number; 
  operation_type: 'INSERT' | 'UPDATE' | 'DELETE';
  performed_at: string; 
  performed_by: string;
  details: Record<string, any>; 
}