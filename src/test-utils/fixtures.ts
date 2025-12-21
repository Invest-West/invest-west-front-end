/**
 * Test fixtures for unit and integration tests
 */

import {ProjectRejectFeedback, ProjectRejectFeedbackStatus} from "../models/project";

// ============================================================================
// Feedback Fixtures
// ============================================================================

export const mockPendingFeedback: ProjectRejectFeedback = {
    id: "feedback-1",
    projectID: "project-123",
    sentBy: "admin-user-1",
    date: Date.now() - 86400000, // 1 day ago
    feedback: "Please provide more details about your revenue projections for years 2-5.",
    status: "pending" as ProjectRejectFeedbackStatus,
    adminName: "John Admin"
};

export const mockAddressedFeedback: ProjectRejectFeedback = {
    id: "feedback-2",
    projectID: "project-123",
    sentBy: "admin-user-1",
    date: Date.now() - 172800000, // 2 days ago
    feedback: "The executive summary needs to be more concise.",
    status: "addressed" as ProjectRejectFeedbackStatus,
    addressedDate: Date.now() - 43200000, // 12 hours ago
    adminName: "John Admin"
};

export const mockResolvedFeedback: ProjectRejectFeedback = {
    id: "feedback-3",
    projectID: "project-123",
    sentBy: "admin-user-2",
    date: Date.now() - 604800000, // 7 days ago
    feedback: "Please update the team section with complete bios.",
    status: "resolved" as ProjectRejectFeedbackStatus,
    addressedDate: Date.now() - 518400000, // 6 days ago
    adminResponse: "Looks great now, thank you for the updates.",
    adminName: "Jane Admin"
};

export const mockFeedbacks: ProjectRejectFeedback[] = [
    mockPendingFeedback,
    mockAddressedFeedback,
    mockResolvedFeedback
];

export const mockEmptyFeedbacks: ProjectRejectFeedback[] = [];

export const mockAllPendingFeedbacks: ProjectRejectFeedback[] = [
    mockPendingFeedback,
    {
        ...mockPendingFeedback,
        id: "feedback-4",
        feedback: "Include market analysis data for the UK region."
    }
];

// ============================================================================
// User Fixtures
// ============================================================================

export const mockIssuerUser = {
    id: "issuer-user-1",
    email: "issuer@example.com",
    firstName: "Test",
    lastName: "Issuer",
    type: 2, // TYPE_ISSUER
    groupsOfMembership: ["group-1"]
};

export const mockInvestorUser = {
    id: "investor-user-1",
    email: "investor@example.com",
    firstName: "Test",
    lastName: "Investor",
    type: 1, // TYPE_INVESTOR
    groupsOfMembership: ["group-1"]
};

export const mockAdminUser = {
    id: "admin-user-1",
    email: "admin@example.com",
    firstName: "John",
    lastName: "Admin",
    type: 3, // TYPE_ADMIN
    groupsOfMembership: ["group-1"],
    superAdmin: false
};

export const mockSuperAdminUser = {
    id: "super-admin-user-1",
    email: "superadmin@example.com",
    firstName: "Super",
    lastName: "Admin",
    type: 3, // TYPE_ADMIN
    groupsOfMembership: [],
    superAdmin: true
};

// ============================================================================
// Project Fixtures
// ============================================================================

export const mockRejectedProject = {
    id: "project-123",
    projectName: "Test Startup",
    issuerID: "issuer-user-1",
    status: -1, // PROJECT_STATUS_REJECTED
    visibility: 2,
    anlesnetworkID: "group-1",
    sector: "Technology",
    description: "A test startup project.",
    createdDate: Date.now() - 2592000000 // 30 days ago
};

export const mockPendingProject = {
    id: "project-456",
    projectName: "Another Startup",
    issuerID: "issuer-user-1",
    status: 0, // PROJECT_STATUS_BEING_CHECKED
    visibility: 2,
    anlesnetworkID: "group-1",
    sector: "Healthcare",
    description: "Another test project under review.",
    createdDate: Date.now() - 604800000 // 7 days ago
};

export const mockApprovedProject = {
    id: "project-789",
    projectName: "Approved Startup",
    issuerID: "issuer-user-2",
    status: 4, // PROJECT_STATUS_PITCH_PHASE_LIVE
    visibility: 3,
    anlesnetworkID: "group-1",
    sector: "Finance",
    description: "An approved and live project.",
    createdDate: Date.now() - 5184000000 // 60 days ago
};

// ============================================================================
// Group Fixtures
// ============================================================================

export const mockGroup = {
    id: "group-1",
    displayName: "Test Angel Network",
    groupUserName: "test-network",
    logo: "https://example.com/logo.png",
    settings: {
        primaryColor: "#1976d2",
        secondaryColor: "#dc004e"
    }
};

// ============================================================================
// Redux State Fixtures
// ============================================================================

export const mockInitialFeedbackState = {
    feedbacks: [],
    isLoading: false,
    isLoaded: false,
    isResubmitting: false,
    isPanelExpanded: false,
    isResubmitDialogOpen: false,
    addressedFeedbackIds: [],
    fetchError: undefined,
    resubmitError: undefined
};

export const mockLoadedFeedbackState = {
    feedbacks: mockFeedbacks,
    isLoading: false,
    isLoaded: true,
    isResubmitting: false,
    isPanelExpanded: true,
    isResubmitDialogOpen: false,
    addressedFeedbackIds: [],
    fetchError: undefined,
    resubmitError: undefined
};

export const mockLoadingFeedbackState = {
    feedbacks: [],
    isLoading: true,
    isLoaded: false,
    isResubmitting: false,
    isPanelExpanded: false,
    isResubmitDialogOpen: false,
    addressedFeedbackIds: [],
    fetchError: undefined,
    resubmitError: undefined
};

export const mockResubmittingFeedbackState = {
    feedbacks: mockAllPendingFeedbacks,
    isLoading: false,
    isLoaded: true,
    isResubmitting: true,
    isPanelExpanded: true,
    isResubmitDialogOpen: true,
    addressedFeedbackIds: ["feedback-1", "feedback-4"],
    fetchError: undefined,
    resubmitError: undefined
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates a mock feedback with custom overrides
 */
export const createMockFeedback = (
    overrides: Partial<ProjectRejectFeedback> = {}
): ProjectRejectFeedback => ({
    id: `feedback-${Date.now()}`,
    projectID: "project-123",
    sentBy: "admin-user-1",
    date: Date.now(),
    feedback: "Default feedback message",
    status: "pending" as ProjectRejectFeedbackStatus,
    adminName: "Test Admin",
    ...overrides
});

/**
 * Creates multiple mock feedbacks
 */
export const createMockFeedbacks = (
    count: number,
    status: ProjectRejectFeedbackStatus = "pending"
): ProjectRejectFeedback[] => {
    return Array.from({length: count}, (_, index) =>
        createMockFeedback({
            id: `feedback-${index + 1}`,
            feedback: `Feedback item ${index + 1}`,
            status
        })
    );
};
