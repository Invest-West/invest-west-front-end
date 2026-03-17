import { shouldAProjectBeEdited } from '../utils';
import * as DB_CONST from '../../firebase/databaseConsts';

const issuer = { type: DB_CONST.TYPE_ISSUER, id: 'user-1' };
const project = (status) => ({
    issuerID: 'user-1',
    status,
    Pitch: { status: DB_CONST.PITCH_STATUS_ON_GOING }
});

describe('shouldAProjectBeEdited — issuer', () => {
    it('returns true for DRAFT', () =>
        expect(shouldAProjectBeEdited(issuer, project(DB_CONST.PROJECT_STATUS_DRAFT))).toBe(true));
    it('returns true for BEING_CHECKED', () =>
        expect(shouldAProjectBeEdited(issuer, project(DB_CONST.PROJECT_STATUS_BEING_CHECKED))).toBe(true));
    it('returns true for REJECTED (the fix)', () =>
        expect(shouldAProjectBeEdited(issuer, project(DB_CONST.PROJECT_STATUS_REJECTED))).toBe(true));
    it('returns false for SUCCESSFUL', () =>
        expect(shouldAProjectBeEdited(issuer, project(DB_CONST.PROJECT_STATUS_SUCCESSFUL))).toBe(false));
    it('returns false for FAILED', () =>
        expect(shouldAProjectBeEdited(issuer, project(DB_CONST.PROJECT_STATUS_FAILED))).toBe(false));
    it('returns false when issuer does not own the project', () => {
        const other = { type: DB_CONST.TYPE_ISSUER, id: 'other-user' };
        expect(shouldAProjectBeEdited(other, project(DB_CONST.PROJECT_STATUS_REJECTED))).toBe(false);
    });
});
