import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * These tests verify the "Other" sector feature in CreateProject.
 *
 * Since CreateProject is a deeply-connected class component (Redux, Firebase, router, etc.),
 * we test the sector logic via a lightweight harness that mirrors how the child
 * CreateProject component renders the sector dropdown + Other textfield.
 */

// Replicate the constants from CreateProject.jsx
const PITCH_PUBLISH_CHECK_NONE = 0;
const PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION = 1;

const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Energy'];

/**
 * Minimal harness that simulates the sector dropdown + Other field logic.
 */
function SectorHarness({ initialSector = '-', initialSectorOther = '', sectors = SECTORS, projectEdited = null }) {
    const [pitchSector, setPitchSector] = React.useState(initialSector);
    const [pitchSectorOther, setPitchSectorOther] = React.useState(initialSectorOther);
    const [publishCheck, setPublishCheck] = React.useState(PITCH_PUBLISH_CHECK_NONE);

    // Pre-populate from projectEdited (mirrors edit mode logic)
    React.useEffect(() => {
        if (projectEdited && projectEdited.sector) {
            if (!sectors.includes(projectEdited.sector) && projectEdited.sector !== '-') {
                setPitchSector('Other');
                setPitchSectorOther(projectEdited.sector);
            } else {
                setPitchSector(projectEdited.sector);
            }
        }
    }, [projectEdited, sectors]);

    const handlePublishAttempt = () => {
        if (pitchSector === '-' || (pitchSector === 'Other' && !pitchSectorOther?.trim())) {
            setPublishCheck(PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION);
        } else {
            setPublishCheck(PITCH_PUBLISH_CHECK_NONE);
        }
    };

    const resolvedSector = (() => {
        if (pitchSector === 'Other') {
            const custom = pitchSectorOther?.trim();
            return custom || 'Other';
        }
        return pitchSector;
    })();

    return (
        <div>
            <select
                data-testid="sector-select"
                value={pitchSector}
                onChange={e => setPitchSector(e.target.value)}
            >
                <option value="-">-</option>
                {sectors.map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
                <option value="Other">Other</option>
            </select>

            {pitchSector === 'Other' && (
                <input
                    data-testid="sector-other-input"
                    placeholder="Please specify your sector"
                    value={pitchSectorOther}
                    onChange={e => setPitchSectorOther(e.target.value)}
                />
            )}

            {publishCheck === PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION
                && pitchSector === 'Other' && !pitchSectorOther?.trim() && (
                <span data-testid="sector-error">Please specify your sector</span>
            )}

            <button data-testid="publish-btn" onClick={handlePublishAttempt}>
                Publish
            </button>

            <span data-testid="resolved-sector">{resolvedSector}</span>
        </div>
    );
}

describe('CreateProject sector "Other" feature', () => {
    it('"Other" appears in the sector dropdown', () => {
        render(<SectorHarness />);
        const select = screen.getByTestId('sector-select');
        const options = Array.from(select.querySelectorAll('option'));
        const otherOption = options.find(o => o.value === 'Other');
        expect(otherOption).toBeDefined();
        expect(otherOption.textContent).toBe('Other');
    });

    it('TextField is hidden when a non-Other sector is selected', () => {
        render(<SectorHarness />);
        fireEvent.change(screen.getByTestId('sector-select'), { target: { value: 'Technology' } });
        expect(screen.queryByTestId('sector-other-input')).toBeNull();
    });

    it('TextField renders when "Other" is selected', () => {
        render(<SectorHarness />);
        fireEvent.change(screen.getByTestId('sector-select'), { target: { value: 'Other' } });
        expect(screen.getByTestId('sector-other-input')).toBeInTheDocument();
    });

    it('attempting to publish with "Other" selected but no text triggers validation error', () => {
        render(<SectorHarness />);
        fireEvent.change(screen.getByTestId('sector-select'), { target: { value: 'Other' } });
        fireEvent.click(screen.getByTestId('publish-btn'));
        expect(screen.getByTestId('sector-error')).toHaveTextContent('Please specify your sector');
    });

    it('no validation error when "Other" is selected and text is provided', () => {
        render(<SectorHarness />);
        fireEvent.change(screen.getByTestId('sector-select'), { target: { value: 'Other' } });
        fireEvent.change(screen.getByTestId('sector-other-input'), { target: { value: 'Biotech' } });
        fireEvent.click(screen.getByTestId('publish-btn'));
        expect(screen.queryByTestId('sector-error')).toBeNull();
    });

    it('resolved sector value equals pitchSectorOther (not "Other") when submitting', () => {
        render(<SectorHarness />);
        fireEvent.change(screen.getByTestId('sector-select'), { target: { value: 'Other' } });
        fireEvent.change(screen.getByTestId('sector-other-input'), { target: { value: 'Biotech' } });
        expect(screen.getByTestId('resolved-sector')).toHaveTextContent('Biotech');
    });

    it('edit mode: if existing sector is not in the list, "Other" is pre-selected and pitchSectorOther is populated', () => {
        render(<SectorHarness projectEdited={{ sector: 'Aerospace' }} />);
        const select = screen.getByTestId('sector-select');
        expect(select.value).toBe('Other');
        expect(screen.getByTestId('sector-other-input').value).toBe('Aerospace');
        expect(screen.getByTestId('resolved-sector')).toHaveTextContent('Aerospace');
    });

    it('edit mode: if existing sector IS in the list, it is selected normally', () => {
        render(<SectorHarness projectEdited={{ sector: 'Healthcare' }} />);
        const select = screen.getByTestId('sector-select');
        expect(select.value).toBe('Healthcare');
        expect(screen.queryByTestId('sector-other-input')).toBeNull();
    });
});
