import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock realtimeDBUtils
jest.mock('../../../firebase/realtimeDBUtils', () => ({
    loadClubAttributes: jest.fn()
}));

// Mock utils.convertQuillDeltaToHTML to return HTML with various broken link types
jest.mock('../../../utils/utils', () => ({
    convertQuillDeltaToHTML: jest.fn()
}));

// Mock router routes
jest.mock('../../../router/routes', () => ({
    __esModule: true,
    default: {
        nonGroupContactUs: '/contact-us'
    }
}));

// Mock colors
jest.mock('../../../values/colors', () => ({
    primaryColor: '#000',
    gray_100: '#f5f5f5'
}));

// Mock redux
jest.mock('react-redux', () => ({
    connect: () => (component) => component
}));

// Mock SCSS
jest.mock('../SystemPublicPagesSharedCSS.scss', () => ({}));

import * as realtimeDBUtils from '../../../firebase/realtimeDBUtils';
import * as utils from '../../../utils/utils';
import PrivacyPolicyPage from '../PrivacyPolicyPage';

describe('PrivacyPolicyPage contact links', () => {
    const htmlWithBrokenLinks = `
        <p>For more information, <a href="mailto:info@example.com">contact us</a>.</p>
        <p>You can also <a href="#">contact us</a> for help.</p>
        <p>Or <a href="">contact us</a> here.</p>
        <p>Visit our <a href="https://example.com/about">about page</a> for details.</p>
    `;

    beforeEach(() => {
        realtimeDBUtils.loadClubAttributes.mockResolvedValue({
            privacyPolicy: { ops: [{ insert: 'test' }] }
        });
        utils.convertQuillDeltaToHTML.mockReturnValue(htmlWithBrokenLinks);
    });

    it('fixes mailto links to point to /contact-us', async () => {
        const { container } = render(<PrivacyPolicyPage />);
        await waitFor(() => {
            const links = container.querySelectorAll('a');
            expect(links.length).toBeGreaterThan(0);
        });

        const links = container.querySelectorAll('a');
        const contactLinks = Array.from(links).filter(l =>
            l.textContent.toLowerCase().includes('contact')
        );

        contactLinks.forEach(link => {
            expect(link.getAttribute('href')).toBe('/contact-us');
        });
    });

    it('does not modify non-contact links', async () => {
        const { container } = render(<PrivacyPolicyPage />);
        await waitFor(() => {
            const links = container.querySelectorAll('a');
            expect(links.length).toBeGreaterThan(0);
        });

        const aboutLink = Array.from(container.querySelectorAll('a')).find(l =>
            l.textContent.includes('about page')
        );
        expect(aboutLink.getAttribute('href')).toBe('https://example.com/about');
    });

    it('no broken mailto or empty href links remain for contact text', async () => {
        const { container } = render(<PrivacyPolicyPage />);
        await waitFor(() => {
            const links = container.querySelectorAll('a');
            expect(links.length).toBeGreaterThan(0);
        });

        const links = container.querySelectorAll('a');
        links.forEach(link => {
            const text = link.textContent.toLowerCase();
            if (text.includes('contact')) {
                const href = link.getAttribute('href');
                expect(href).not.toBe('');
                expect(href).not.toBe('#');
                expect(href).not.toMatch(/^mailto:/);
            }
        });
    });
});
