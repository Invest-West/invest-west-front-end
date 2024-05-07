/**
 * Course properties interface
 */
export default interface CourseProperties {
    anid: string;
    dateAdded: number;
    description: string;
    displayName: string;
    displayNameLower: string;
    courseUserName: string;
    isInvestWest: boolean;
    status: number;
    website?: string;
    logoWithText?: CourseLogo[];
    plainLogo: CourseLogo[];
    settings: CourseSettings;
}

/**
 * This should always be returned when a course is queried by an unauthenticated user
 */
export interface PublicCourseProperties {
    description: string;
    displayName: string;
    courseUserName: string;
}

/**
 * Course settings interface
 */
export interface CourseSettings {
    primaryColor: string;
    secondaryColor: string;
    projectVisibility: number;
    makeInvestorsContactDetailsVisibleToIssuers: boolean;
    PledgeFAQs?: CoursePledgeFAQ[];
}

/**
 * Course logo interface
 */
export interface CourseLogo {
    storageID: number;
    url: string;
    removed?: boolean;
}

/**
 * Course pledge faq interface
 */
export interface CoursePledgeFAQ {
    id: string;
    question: string;
    answer: string;
}

export const getCourseLogo = (course: CourseProperties | null) => {
    if (!course) {
        return null;
    }
    if (course.plainLogo.length === 0) {
        return null;
    }
    return course.plainLogo[course.plainLogo.findIndex(logo => logo.removed === undefined)].url;
}