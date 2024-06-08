export interface SystemAttributes {
    PledgeFAQs: PledgeFAQ[];
    Sectors: string[];
    allowVideoUpload: boolean;
    privacyPolicy: any;
    termsOfUse: any;
    createPitchTermsAndConditions: any;
    marketingPreferences: any;
    riskWarningFooter: string;
}

export interface StudentSystemAttributes {
    PledgeFAQs: PledgeFAQ[];
    CourseSectors: string[];
    allowVideoUpload: boolean;
    privacyPolicy: any;
    termsOfUse: any;
    createPitchTermsAndConditions: any;
    studentMarketingPreferences: any;
    riskWarningFooter: string;
}

export interface PledgeFAQ {
    id: string;
    question: string;
    answer: string;
}