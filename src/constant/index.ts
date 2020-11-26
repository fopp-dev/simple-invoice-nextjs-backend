export const ERR_MESSAGES = {
  ERR_AUTH_PASSWORD_NOT_CORRECT: 'ERR_AUTH_PASSWORD_NOT_CORRECT',
  ERR_AUTH_ERR_USER_NOT_FOUND: 'ERR_AUTH_ERR_USER_NOT_FOUND',
  ERR_INTERNAL_SERVER_ERROR: 'ERR_INTERNAL_SERVER_ERROR',
  ERR_USER_NOT_FOUND: 'ERR_USER_NOT_FOUND',
  ERR_PARTNER_NOT_SELECTED: 'ERR_PARTNER_NOT_SELECTED',
  ERR_PARTNER_NOT_FOUND: 'ERR_PARTNER_NOT_FOUND',
  ERR_CUSTOMER_NOT_FOUND: 'ERR_CUSTOMER_NOT_FOUND',
  ERR_INVOICE_AMOUNT_NOT_CORRECT: 'ERR_INVOICE_AMOUNT_NOT_CORRECT',
  ERR_NO_ACCESS: 'ERR_NO_ACCESS',
  ERR_NEXT_PAYMENT_NOT_EXIST: 'ERR_NEXT_PAYMENT_NOT_EXIST',
  ERR_PAYMENT_INSTALLMENT_AMOUNT_INVALID: 'ERR_PAYMENT_INSTALLMENT_AMOUNT_INVALID',
  ERR_FILE_NOT_EXIST: 'ERR_FILE_NOT_EXIST',
};

export const ROLES = {
  CUSTOMER: 'customer',
  PARTNER: 'partner',
  MTAJI_LOCAL_ADMIN: 'mtaji local admin',
  MTAJI_LOCAL_CREDIT: 'mtaji local credit',
  MTAJI_GLOBAL_CREDIT: 'mtaji global credit',
};

export const CUSTOMER_REGISTRATION_STEPS = {
  '1_CREATE_CUSTOMER': '1_CREATE_CUSTOMER',
  '2_SUBMIT_APPLICATION': '2_SUBMIT_APPLICATION',
  '3_PARTNER_APPROVE_APPLICATION': '3_PARTNER_APPROVE_APPLICATION',
  '8_SIGN_LOAN_DOCUMENTS': '8_SIGN_LOAN_DOCUMENTS',
  '9_APPROVE_CREDIT': '9_APPROVE_CREDIT',
};

export const CUSTOMER_APPLICATION_STATUS = {
  STARTED: 'started',
  COMPLETED: 'completed',
};

export const CREDIT_CHANGE_TYPE = {
  CHANGE: 'change',
  CLOSE: 'close',
};

export const PARTNER_DOCUMENT_TYPES = {
  BANK_STATEMENT: 'BANK_STATEMENT',
}

export const UPLOADS_TEMP = 'uploads-temp';

export const uploadsCustomerApplication = (customerId) => {
  return `./uploads/customers/${customerId}/application/`;
}

export const uploadsCustomerApplicationField = (customerId) => {
  return `uploads/customers/${customerId}/application/`;
}

export const uploadsCustomerInvoices = (customerId) => {
  return `./uploads/customers/${customerId}/invoices/`;
}

export const uploadsCustomerInvoicesField = (customerId) => {
  return `uploads/customers/${customerId}/invoices/`;
}

export const uploadsPartnerBankStatement = (partnerId) => {
  return `./uploads/partners/${partnerId}/bankstatements/`;
}

export const uploadsPartnerBankStatementField = (partnerId) => {
  return `uploads/partners/${partnerId}/bankstatements/`;
}

export const closeCreditComment = 'Temporary close';