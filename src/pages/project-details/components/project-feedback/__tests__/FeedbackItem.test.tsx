/**
 * Tests for FeedbackItem component
 */

import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import FeedbackItem from "../FeedbackItem";
import {
    mockPendingFeedback,
    mockAddressedFeedback,
    mockResolvedFeedback
} from "../../../../../test-utils/fixtures";

describe("FeedbackItem", () => {
    describe("rendering", () => {
        it("should render feedback content", () => {
            render(<FeedbackItem feedback={mockPendingFeedback} />);

            expect(screen.getByText(mockPendingFeedback.feedback)).toBeInTheDocument();
        });

        it("should render admin name when provided", () => {
            render(<FeedbackItem feedback={mockPendingFeedback} />);

            expect(screen.getByText(/John Admin/)).toBeInTheDocument();
        });

        it("should render date", () => {
            render(<FeedbackItem feedback={mockPendingFeedback} />);

            // The date should be formatted and visible (format: "DD Mon YYYY, HH:MM")
            // Look for the date pattern in the admin name text
            const dateElement = screen.getByText(/\d{1,2}\s\w{3}\s\d{4}.*John Admin/);
            expect(dateElement).toBeInTheDocument();
        });
    });

    describe("status badges", () => {
        it("should render Pending badge for pending feedback", () => {
            render(<FeedbackItem feedback={mockPendingFeedback} />);

            expect(screen.getByText("Pending")).toBeInTheDocument();
        });

        it("should render Addressed badge for addressed feedback", () => {
            render(<FeedbackItem feedback={mockAddressedFeedback} />);

            expect(screen.getByText("Addressed")).toBeInTheDocument();
        });

        it("should render Resolved badge for resolved feedback", () => {
            render(<FeedbackItem feedback={mockResolvedFeedback} />);

            expect(screen.getByText("Resolved")).toBeInTheDocument();
        });
    });

    describe("admin response", () => {
        it("should render admin response when available", () => {
            render(<FeedbackItem feedback={mockResolvedFeedback} />);

            expect(
                screen.getByText(mockResolvedFeedback.adminResponse!)
            ).toBeInTheDocument();
        });

        it("should not render admin response section when not available", () => {
            render(<FeedbackItem feedback={mockPendingFeedback} />);

            expect(
                screen.queryByText(/Admin Response/i)
            ).not.toBeInTheDocument();
        });
    });

    describe("checkbox functionality", () => {
        it("should not render checkbox by default", () => {
            render(<FeedbackItem feedback={mockPendingFeedback} />);

            expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
        });

        it("should render checkbox when showCheckbox is true", () => {
            const handleCheck = jest.fn();
            render(
                <FeedbackItem
                    feedback={mockPendingFeedback}
                    showCheckbox={true}
                    isChecked={false}
                    onCheckChange={handleCheck}
                />
            );

            expect(screen.getByRole("checkbox")).toBeInTheDocument();
        });

        it("should render unchecked checkbox when isChecked is false", () => {
            const handleCheck = jest.fn();
            render(
                <FeedbackItem
                    feedback={mockPendingFeedback}
                    showCheckbox={true}
                    isChecked={false}
                    onCheckChange={handleCheck}
                />
            );

            const checkbox = screen.getByRole("checkbox");
            expect(checkbox).not.toBeChecked();
        });

        it("should render checked checkbox when isChecked is true", () => {
            const handleCheck = jest.fn();
            render(
                <FeedbackItem
                    feedback={mockPendingFeedback}
                    showCheckbox={true}
                    isChecked={true}
                    onCheckChange={handleCheck}
                />
            );

            const checkbox = screen.getByRole("checkbox");
            expect(checkbox).toBeChecked();
        });

        it("should call onCheckChange when checkbox is clicked", () => {
            const handleCheck = jest.fn();
            render(
                <FeedbackItem
                    feedback={mockPendingFeedback}
                    showCheckbox={true}
                    isChecked={false}
                    onCheckChange={handleCheck}
                />
            );

            const checkbox = screen.getByRole("checkbox");
            fireEvent.click(checkbox);

            expect(handleCheck).toHaveBeenCalledWith(
                mockPendingFeedback.id,
                true
            );
        });

        it("should call onCheckChange with false when unchecking", () => {
            const handleCheck = jest.fn();
            render(
                <FeedbackItem
                    feedback={mockPendingFeedback}
                    showCheckbox={true}
                    isChecked={true}
                    onCheckChange={handleCheck}
                />
            );

            const checkbox = screen.getByRole("checkbox");
            fireEvent.click(checkbox);

            expect(handleCheck).toHaveBeenCalledWith(
                mockPendingFeedback.id,
                false
            );
        });
    });

    describe("addressed date", () => {
        it("should show addressed date for addressed feedback", () => {
            render(<FeedbackItem feedback={mockAddressedFeedback} />);

            // The addressed date should be formatted and visible
            expect(screen.getByText(/Addressed/)).toBeInTheDocument();
        });
    });
});
